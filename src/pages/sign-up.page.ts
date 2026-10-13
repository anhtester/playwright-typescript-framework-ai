import type { Locator } from '@playwright/test';
import { BasePage } from './base.page';

export interface SignUpForm {
  name: string;
  email: string;
  password: string;
  passwordConfirmation: string;
  phone?: string;
}

/**
 * Trang Đăng ký — /sign-up (Material UI).
 * Locator đã verify trên DOM thật: label có dấu "*" nên dùng getByRole + tên accessible (không gồm "*"),
 * id input do React sinh động (_r_3_) nên KHÔNG dùng.
 */
export class SignUpPage extends BasePage {
  protected readonly path = '/sign-up';

  readonly heading = this.page.getByRole('heading', { name: 'Sign up' });
  readonly nameInput = this.page.getByRole('textbox', { name: 'Name', exact: true });
  readonly phoneInput = this.page.getByRole('textbox', { name: 'Phone', exact: true });
  readonly emailInput = this.page.getByRole('textbox', { name: 'Email', exact: true });
  readonly passwordInput = this.page.getByRole('textbox', { name: 'Password', exact: true });
  readonly passwordConfirmationInput = this.page.getByRole('textbox', { name: 'Password Confirmation', exact: true });
  readonly registerButton = this.page.getByRole('button', { name: 'Register' });

  protected async waitUntilLoaded(): Promise<void> {
    // Nút chỉ có tên "Register" sau khi React hydrate xong
    await this.registerButton.waitFor();
  }

  /** Thông báo lỗi validation dưới field (MUI helper text) */
  fieldError(message: string): Locator {
    return this.page.getByText(message, { exact: true });
  }

  async fillForm(form: SignUpForm): Promise<void> {
    await this.fillField(this.nameInput, form.name, 'Name');
    if (form.phone) {
      await this.fillField(this.phoneInput, form.phone, 'Phone');
    }
    await this.fillField(this.emailInput, form.email, 'Email');
    await this.fillField(this.passwordInput, form.password, 'Password', { secret: true });
    await this.fillField(this.passwordConfirmationInput, form.passwordConfirmation, 'Password Confirmation', { secret: true });
  }

  async submit(): Promise<void> {
    await this.clickOn(this.registerButton, 'nút Register');
  }

  async register(form: SignUpForm): Promise<void> {
    await this.fillForm(form);
    await this.submit();
  }
}
