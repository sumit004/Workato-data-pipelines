import { Page, expect } from '@playwright/test';
import { Destination } from '../../config/pipeline.config';

/** Data Pipeline Builder: trigger (source) step, action (destination) step, objects. */
export class PipelineBuilderPage {
  constructor(private readonly page: Page) {}

  private panel = () => this.page.locator('body');

  async configureSource(opts: { connection: string; everyMinutes: number }) {
    await this.page.getByText('Extract new/updated records').first().click();
    await this.pickConnection(opts.connection);

    // Setup step: frequency. Leave "pick up records from" blank => full load.
    const every = this.page.getByLabel(/trigger every/i);
    await every.fill(String(opts.everyMinutes));
  }

  async configureDestination(dest: Destination) {
    await this.page.getByText(/Load data to target table/i).first().click();
    // App picker (skipped by Workato if already chosen)
    const appSearch = this.page.getByPlaceholder(/search/i).first();
    if (await this.page.getByText(dest.appLabel, { exact: true }).first().isVisible().catch(() => false)) {
      await this.page.getByText(dest.appLabel, { exact: true }).first().click();
    } else if (await appSearch.isVisible().catch(() => false)) {
      await appSearch.fill(dest.appLabel);
      await this.page.getByText(dest.appLabel, { exact: true }).first().click();
    }
    await this.pickConnection(dest.connection);
  }

  /** Search the connection picker and select a connection by name. */
  private async pickConnection(name: string) {
    const search = this.page.getByPlaceholder(/search/i).first();
    if (await search.isVisible().catch(() => false)) await search.fill(name);
    await this.page.getByText(name, { exact: false }).first().click();
  }

  async addObject(searchText: string, objectLabel: string) {
    await this.page.getByRole('button', { name: /add object/i }).click();
    const dialog = this.page.getByRole('dialog').filter({ hasText: 'Add new objects' });
    await dialog.getByPlaceholder('Search by name').fill(searchText);
    const row = dialog.locator('label, [role="row"], li').filter({ hasText: objectLabel }).first();
    await row.getByRole('checkbox').check();
    await dialog.getByRole('button', { name: 'Add', exact: true }).click();
    await expect(dialog).toBeHidden();
  }

  async save() {
    await this.page.getByRole('button', { name: 'Save', exact: true }).click();
    await expect(this.page.getByText(/successfully saved/i)).toBeVisible();
  }

  async exit() {
    await this.page.getByRole('button', { name: /^exit/i }).click();
  }
}
