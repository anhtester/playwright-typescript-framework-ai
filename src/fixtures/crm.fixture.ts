import { test as uiTest } from './ui.fixture';
import { CrmClientLoginPage } from '../pages/crm/crm-client-login.page';
import { CrmDashboardPage } from '../pages/crm/crm-dashboard.page';
import { CrmLoginPage } from '../pages/crm/crm-login.page';

export interface CrmFixtures {
  crmLoginPage: CrmLoginPage;
  crmDashboardPage: CrmDashboardPage;
  crmClientLoginPage: CrmClientLoginPage;
}

/** Fixture Perfex CRM — kế thừa fixture UI để có ảnh cuối test + TC ID ở Parameters */
export const test = uiTest.extend<CrmFixtures>({
  crmLoginPage: async ({ page }, use) => {
    await use(new CrmLoginPage(page));
  },

  crmDashboardPage: async ({ page }, use) => {
    await use(new CrmDashboardPage(page));
  },

  crmClientLoginPage: async ({ page }, use) => {
    await use(new CrmClientLoginPage(page));
  },
});

export { expect } from './ui.fixture';
