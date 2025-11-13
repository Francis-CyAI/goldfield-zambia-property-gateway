// firebaseUtils.ts

/**
 * Recursively removes all `undefined` fields from an object before upload.
 * Keeps `null`, `0`, `false`, and empty strings.
 */
const isPlainObject = (value: unknown): value is Record<string, unknown> => {
  if (value === null || typeof value !== "object") {
    return false;
  }

  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
};

export function removeUndefined<T extends Record<string, unknown>>(data: T): T {
  if (Array.isArray(data)) {
    return data
      .map((item) => removeUndefined(item as Record<string, unknown>))
      .filter((item) => item !== undefined) as unknown as T;
  }

  if (isPlainObject(data)) {
    const cleaned: Record<string, unknown> = {};
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        cleaned[key] =
          isPlainObject(value) || Array.isArray(value)
            ? removeUndefined(value as Record<string, unknown>)
            : value;
      }
    });
    return cleaned as T;
  }

  return data;
}
  
