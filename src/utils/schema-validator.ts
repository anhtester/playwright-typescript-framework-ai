import fs from 'node:fs';
import path from 'node:path';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

const SCHEMA_DIR = path.resolve(__dirname, '../../test-data/schemas');

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);

// Nạp toàn bộ schema theo $id (= tên file) → schema này $ref được sang schema khác, vd "book.schema.json"
for (const file of fs.readdirSync(SCHEMA_DIR).filter((name) => name.endsWith('.schema.json'))) {
  ajv.addSchema(JSON.parse(fs.readFileSync(path.join(SCHEMA_DIR, file), 'utf8')));
}

/** Trả về danh sách lỗi — mảng rỗng nghĩa là data khớp schema */
export function validateSchema(schemaName: string, data: unknown): string[] {
  const validate = ajv.getSchema(`${schemaName}.schema.json`);
  if (!validate) {
    throw new Error(`Không tìm thấy schema "${schemaName}" trong test-data/schemas/`);
  }
  if (validate(data)) {
    return [];
  }
  return (validate.errors ?? []).map((error) => `${error.instancePath || '(gốc)'} ${error.message ?? ''}`.trim());
}

/** Custom matcher cho expect: `expect(body).toMatchSchema('login-response')` */
export const schemaMatchers = {
  toMatchSchema(received: unknown, schemaName: string) {
    const errors = validateSchema(schemaName, received);
    const pass = errors.length === 0;
    return {
      pass,
      name: 'toMatchSchema',
      message: () =>
        pass
          ? `Response body khớp schema "${schemaName}" (không mong đợi khớp)`
          : `Response body KHÔNG khớp schema "${schemaName}":\n- ${errors.join('\n- ')}`,
    };
  },
};
