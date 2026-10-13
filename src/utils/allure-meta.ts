import type { TestDetailsAnnotation, TestInfo } from '@playwright/test';

export type Severity = 'blocker' | 'critical' | 'normal' | 'minor' | 'trivial';

export interface TestCaseMeta {
  /** Mã manual TC — khoá nối sang RTM và execution report, KHÔNG đổi khi sửa test */
  testId: string;
  severity: Severity;
  /** 1–2 câu: test kiểm tra gì, điều kiện gì, kỳ vọng gì */
  description: string;
  /** Nhóm nghiệp vụ lớn — tab Behaviors của Allure */
  feature: string;
  /** Chức năng cụ thể trong feature */
  story: string;
  /** Hệ thống được test — mặc định Book Management */
  epic?: string;
}

const EPIC = 'Book Management';
const TEST_ID_ANNOTATION = 'allure.label.testId';

/** Đọc TC ID đã khai bằng tcMeta() — undefined nếu test chưa khai */
export function tcIdOf(testInfo: TestInfo): string | undefined {
  return testInfo.annotations.find((annotation) => annotation.type === TEST_ID_ANNOTATION)?.description;
}

/**
 * Metadata Allure khai TĨNH trong test details: allure-playwright đọc annotation type
 * `allure.label.<tên>` thành label và type `description` thành Description.
 * Khai tĩnh thay vì gọi runtime API → report vẫn đủ metadata kể cả khi test chết ngay dòng đầu.
 *
 * @example test('Tên test Tiếng Việt', { tag: ['@smoke'], annotation: tcMeta({...}) }, async () => {...})
 */
export function tcMeta(meta: TestCaseMeta): TestDetailsAnnotation[] {
  return [
    { type: TEST_ID_ANNOTATION, description: meta.testId },
    { type: 'allure.label.severity', description: meta.severity },
    { type: 'allure.label.epic', description: meta.epic ?? EPIC },
    { type: 'allure.label.feature', description: meta.feature },
    { type: 'allure.label.story', description: meta.story },
    { type: 'description', description: meta.description },
  ];
}
