import type { Attachment, StepResult } from 'allure-js-commons';
import type { LifecycleListener } from 'allure-js-commons/sdk/reporter';

/**
 * Attachment chứa nguyên giá trị điền vào form — kể cả MẬT KHẨU:
 * - trace: log tham số của mọi lệnh fill
 * - error-context: ARIA snapshot của trang lúc fail, ghi cả giá trị ô password
 * Hai file này vẫn còn trong Playwright HTML report (reports/html) để debug nội bộ,
 * nhưng bị gỡ khỏi Allure — report dùng để gửi PM / khách hàng.
 */
const INTERNAL_ONLY_ATTACHMENTS = new Set(['trace', 'error-context']);

function isEmptyInternalStep(step: StepResult): boolean {
  return INTERNAL_ONLY_ATTACHMENTS.has(step.name ?? '') && step.attachments.length === 0 && step.steps.length === 0;
}

function stripFrom(node: { attachments: Attachment[]; steps: StepResult[] }): void {
  node.attachments = node.attachments.filter((attachment) => !INTERNAL_ONLY_ATTACHMENTS.has(attachment.name));
  node.steps.forEach(stripFrom);
  // allure-playwright bọc mỗi attachment trong 1 step cùng tên — gỡ attachment xong thì bỏ luôn step rỗng
  node.steps = node.steps.filter((step) => !isEmptyInternalStep(step));
}

export const stripInternalAttachments: LifecycleListener = {
  beforeTestResultWrite: (result) => stripFrom(result),
};
