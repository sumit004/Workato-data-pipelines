import { test as base } from '@playwright/test';
import { AssetsPage } from '../pages/workato/AssetsPage';
import { PipelineBuilderPage } from '../pages/workato/PipelineBuilderPage';
import { PipelinePage } from '../pages/workato/PipelinePage';

type Fixtures = {
  assets: AssetsPage;
  builder: PipelineBuilderPage;
  pipeline: PipelinePage;
};

export const test = base.extend<Fixtures>({
  assets: async ({ page }, use) => use(new AssetsPage(page)),
  builder: async ({ page }, use) => use(new PipelineBuilderPage(page)),
  pipeline: async ({ page }, use) => use(new PipelinePage(page)),
});

export { expect } from '@playwright/test';
