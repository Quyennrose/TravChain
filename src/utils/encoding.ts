const brokenVietnamesePattern = new RegExp(['\\u00c3', '\\u00c4', '\\u00c2', '\\u00e2\\u20ac', '\\u00e1\\u00bb', '\\u00c6', '\\ufffd'].join('|'));

export function detectBrokenVietnamese(value: unknown): boolean {
  if (typeof value === 'string') return brokenVietnamesePattern.test(value);
  if (Array.isArray(value)) return value.some((item) => detectBrokenVietnamese(item));
  if (value && typeof value === 'object') return Object.values(value).some((item) => detectBrokenVietnamese(item));
  return false;
}

export function warnBrokenVietnamese(label: string, value: unknown) {
  if (import.meta.env.DEV && detectBrokenVietnamese(value)) {
    console.warn(`[encoding] Broken Vietnamese/mojibake detected in ${label}`);
  }
}
