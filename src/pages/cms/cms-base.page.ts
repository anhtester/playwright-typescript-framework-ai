import { env } from '../../utils/env.config';
import { BasePage } from '../base.page';

/** Gốc cho mọi trang của Active eCommerce CMS — URL tuyệt đối tính theo CMS_URL thay vì BASE_URL */
export abstract class CmsBasePage extends BasePage {
  protected override get origin(): string {
    return env.cmsURL;
  }
}
