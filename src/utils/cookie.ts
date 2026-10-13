export interface SetCookie {
  name: string;
  value: string;
  /** Thuộc tính theo tên viết thường — cờ không có giá trị (HttpOnly, Secure) mang `true` */
  attributes: Record<string, string | true>;
}

/** `refetchToken=abc; Path=/; HttpOnly; SameSite=Strict` → { name, value, attributes } */
export function parseSetCookie(header: string): SetCookie {
  const [pair, ...parts] = header.split(';').map((part) => part.trim());
  const separator = pair.indexOf('=');
  const attributes: Record<string, string | true> = {};
  for (const part of parts.filter(Boolean)) {
    const equals = part.indexOf('=');
    if (equals === -1) {
      attributes[part.toLowerCase()] = true;
    } else {
      attributes[part.slice(0, equals).trim().toLowerCase()] = part.slice(equals + 1).trim();
    }
  }
  return { name: pair.slice(0, separator), value: pair.slice(separator + 1), attributes };
}

/** Mọi cookie có tên `name` trong danh sách Set-Cookie của một response */
export function cookiesNamed(setCookies: string[], name: string): SetCookie[] {
  return setCookies.map(parseSetCookie).filter((cookie) => cookie.name === name);
}
