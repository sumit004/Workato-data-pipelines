import { Page } from '@playwright/test';
import { cfg } from '../../config/pipeline.config';

export class AssetsPage {
  constructor(private readonly page: Page) {}

  async goto() {
    await this.page.goto(`${cfg.uiUrl}/?fid=${cfg.folderId()}#assets`);
  }

  /** Create > Data pipeline, fill the dialog, click "Start building". */
  async createPipeline(name: string) {
    await this.page.getByRole('button', { name: /^create/i }).click();
    await this.page.getByText('Data pipeline', { exact: true }).click();
    const dialog = this.page.getByRole('dialog').filter({ hasText: 'New data pipeline' });
    await dialog.getByRole('textbox').first().fill(name);
    await dialog.getByRole('button', { name: 'Start building' }).click();
    await this.page.waitForURL(/data_pipelines\/\d+\/edit/);
  }
}
