import { test as uiTest } from './ui.fixture';
import { CmsDashboardPage } from '../pages/cms/cms-dashboard.page';
import { CmsLoginPage } from '../pages/cms/cms-login.page';

export interface CmsFixtures {
  cmsLoginPage: CmsLoginPage;
  cmsDashboardPage: CmsDashboardPage;
}

/** Fixture Active eCommerce CMS — kế thừa fixture UI để có ảnh cuối test + TC ID ở Parameters */
export const test = uiTest.extend<CmsFixtures>({
  cmsLoginPage: async ({ page }, use) => {
    await use(new CmsLoginPage(page));
  },

  cmsDashboardPage: async ({ page }, use) => {
    await use(new CmsDashboardPage(page));
  },
});

export { expect } from './ui.fixture';
