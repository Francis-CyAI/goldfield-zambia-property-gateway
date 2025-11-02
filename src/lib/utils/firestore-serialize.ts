import {
  DocumentData,
  DocumentSnapshot,
  QuerySnapshot,
  Timestamp,
} from 'firebase/firestore';

const convertValue = (value: unknown): unknown => {
  if (value instanceof Timestamp) {
    return value.toDate().toISOString();
  }

  if (Array.isArray(value)) {
    return value.map(convertValue);
  }

  if (value && typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>).map(([key, nestedValue]) => [
      key,
      convertValue(nestedValue),
    ]);
    return Object.fromEntries(entries);
  }

  return value;
};

export const serializeDoc = <T = DocumentData>(
  snapshot: DocumentSnapshot<DocumentData>,
): (T & { id: string }) => {
  const raw = snapshot.data() ?? {};
  const converted = convertValue(raw) as T;
  return {
    id: snapshot.id,
    ...converted,
  };
};

export const serializeDocs = <T = DocumentData>(
  snapshot: QuerySnapshot<DocumentData>,
): Array<T & { id: string }> => snapshot.docs.map((docSnapshot) => serializeDoc<T>(docSnapshot));

