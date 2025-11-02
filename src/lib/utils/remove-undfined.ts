// firebaseUtils.ts

/**
 * Recursively removes all `undefined` fields from an object before upload.
 * Keeps `null`, `0`, `false`, and empty strings.
 */
export function removeUndefined<T extends Record<string, any>>(data: T): T {
    if (Array.isArray(data)) {
      return data
        .map(item => removeUndefined(item)) // clean each item in array
        .filter(item => item !== undefined) as unknown as T;
    }
  
    if (typeof data === 'object' && data !== null) {
      const cleaned: Record<string, any> = {};
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined) {
          cleaned[key] = removeUndefined(value);
        }
      });
      return cleaned as T;
    }
  
    return data;
  }
  