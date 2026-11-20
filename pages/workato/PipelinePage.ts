import { Page, expect } from '@playwright/test';

export interface RunRow {
  object: string;
  rowsExtracted: number | null;
  rowsLoaded: number | null;
  failed: boolean;
}

/** Pipeline detail screen: Data pipeline / Objects / Runs / Connections / Settings tabs. */
export class PipelinePage {
  constructor(private readonly page: Page) {}

  tab(name: 'Data pipeline' | 'Objects' | 'Runs' | 'Connections' | 'Settings') {
    return this.page.getByRole('tab', { name }).or(this.page.getByText(name, { exact: true })).first();
  }

  async start() {
    // After save+exit the button reads "Start pipeline"; while active it reads "Stop pipeline".
    await this.page.getByRole('button', { name: 'Start pipeline' }).click();
    await expect(this.page.getByRole('button', { name: 'Stop pipeline' })).toBeVisible({ timeout: 60_000 });
  }

  async stop() {
    const stop = this.page.getByRole('button', { name: 'Stop pipeline' });
    if (await stop.isVisible().catch(() => false)) {
      await stop.click();
      const confirm = this.page.getByRole('button', { name: /^(stop|confirm|yes)/i }).last();
      if (await confirm.isVisible().catch(() => false)) await confirm.click();
      await expect(this.page.getByRole('button', { name: 'Start pipeline' })).toBeVisible({ timeout: 60_000 });
    }
  }

  async delete() {
    await this.page.getByRole('button', { name: /delete/i }).first().click();
    const confirm = this.page.getByRole('dialog').getByRole('button', { name: /delete|confirm|yes/i }).last();
    if (await confirm.isVisible().catch(() => false)) await confirm.click();
  }

  async objectsListed(): Promise<string[]> {
    await this.tab('Objects').click();
    return this.page.locator('[role="row"], tr').allTextContents();
  }

  /** Reads the Runs tab table: Start time | Object | Rows extracted | Rows loaded | Duration. */
  async runs(): Promise<RunRow[]> {
    await this.tab('Runs').click();
    const rows = this.page.locator('[role="row"], tr').filter({ hasNotText: 'Rows extracted' });
    const out: RunRow[] = [];
    for (const row of await rows.all()) {
      const cells = (await row.locator('[role="cell"], td').allInnerTexts()).map((s) => s.trim());
      if (cells.length < 4) continue;
      const num = (s: string) => (/^\d[\d,]*$/.test(s) ? Number(s.replace(/,/g, '')) : null);
      const html = await row.innerHTML();
      out.push({
        object: cells[1],
        rowsExtracted: num(cells[2]),
        rowsLoaded: num(cells[3]),
        failed: /error|fail|danger|red/i.test(html) && num(cells[3]) === null,
      });
    }
    return out;
  }

  /**
   * Polls the Runs tab until the first run has finished (rows loaded present) or fails.
   * Reloads the page between polls since Workato's note says to refresh for latest data.
   */
  async waitForFirstRun(timeoutMs: number): Promise<RunRow> {
    let last: RunRow | undefined;
    await expect
      .poll(
        async () => {
          await this.page.reload();
          const rows = await this.runs();
          last = rows.find((r) => r.rowsLoaded !== null) ?? rows.find((r) => r.failed);
          return last ? (last.failed ? 'failed' : 'done') : 'pending';
        },
        { timeout: timeoutMs, intervals: [10_000, 15_000, 20_000], message: 'waiting for first pipeline run' },
      )
      .not.toBe('pending');
    return last!;
  }
}
