import { test, expect } from '../../fixtures/pipeline';
import { cfg, destinations } from '../../config/pipeline.config';

// One full-load test per configured destination (Snowflake, BigQuery, Databricks...).
for (const dest of destinations()) {
  test.describe(`ODP2 full load -> ${dest.appLabel}`, () => {
    const name = `QA_AUTO_ODP2_FULL_${dest.key}_${Date.now()}`;
    let created = false;

    test(`creates, starts and completes a full load into ${dest.appLabel}`, async ({
      page, assets, builder, pipeline,
    }) => {
      test.setTimeout(cfg.loadTimeoutMs + 5 * 60_000);

      await test.step('create the pipeline', async () => {
        await assets.goto();
        await assets.createPipeline(name);
        created = true;
      });

      await test.step('configure source (SAP OData, full load)', async () => {
        await builder.configureSource({ connection: cfg.source.connection(), everyMinutes: cfg.everyMinutes });
        await builder.addObject(cfg.source.search(), cfg.source.object());
      });

      await test.step(`configure destination (${dest.appLabel})`, async () => {
        await builder.configureDestination(dest);
        await builder.save();
        await builder.exit();
      });

      await test.step('start the pipeline', async () => {
        await pipeline.start();
      });

      await test.step('object appears on the Objects tab', async () => {
        await pipeline.tab('Objects').click();
        await expect(page.getByText(cfg.source.object().split(' [')[0]).first()).toBeVisible();
      });

      await test.step('first run finishes and extracted == loaded', async () => {
        const run = await pipeline.waitForFirstRun(cfg.loadTimeoutMs);
        expect(run.failed, 'first run failed').toBe(false);
        expect(run.rowsExtracted, 'rows extracted').toBeGreaterThan(0);
        expect(run.rowsLoaded, 'rows loaded').toBe(run.rowsExtracted);
      });
    });

    // Cleanup so test pipelines do not pile up or keep syncing.
    test.afterEach(async ({ pipeline }) => {
      if (!created || cfg.keepPipeline) return;
      await pipeline.stop().catch(() => undefined);
      await pipeline.delete().catch(() => undefined);
    });
  });
}
