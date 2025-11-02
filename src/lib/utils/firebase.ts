import {
  addDoc,
  deleteDoc,
  doc,
  DocumentReference,
  getDoc,
  getDocs,
  Query,
  query,
  QueryConstraint,
  runTransaction,
  setDoc,
  Transaction,
  writeBatch,
  WriteBatch,
} from "firebase/firestore";
import type { CollectionKey, CollectionRecord, CollectionRecordMap } from "@/lib/models";
import { db, getCollectionRef } from "@/lib/constants/firebase";
import { removeUndefined } from "@/lib/utils/remove-undfined";

export interface FirestoreResult<T> {
  data: T | null;
  error: Error | null;
}

const handleFirestoreError = (error: unknown, context: string): Error => {
  if (error instanceof Error) {
    console.error(`[firestore:${context}]`, error.message);
    return error;
  }

  const wrapped = new Error(`Unknown Firestore error in ${context}`);
  console.error(`[firestore:${context}]`, error);
  return wrapped;
};

const toResult = <T>(data: T | null, error: Error | null = null): FirestoreResult<T> => ({
  data,
  error,
});

export const getDocument = async <K extends CollectionKey>(
  collectionKey: K,
  id: string,
): Promise<FirestoreResult<CollectionRecord<K>>> => {
  try {
    const ref = doc(getCollectionRef(collectionKey), id) as DocumentReference<CollectionRecord<K>>;
    const snapshot = await getDoc(ref);
    if (!snapshot.exists()) {
      return toResult<CollectionRecord<K>>(null, null);
    }
    return toResult(snapshot.data(), null);
  } catch (error) {
    return toResult(null, handleFirestoreError(error, `getDocument:${collectionKey}`));
  }
};

export const setDocument = async <K extends CollectionKey>(
  collectionKey: K,
  id: string,
  value: Partial<CollectionRecord<K>>,
  options: { merge?: boolean } = { merge: true },
): Promise<FirestoreResult<void>> => {
  try {
    const ref = doc(getCollectionRef(collectionKey), id) as DocumentReference<CollectionRecord<K>>;
    await setDoc(ref, removeUndefined(value), { merge: options.merge ?? true });
    return toResult(undefined, null);
  } catch (error) {
    return toResult(undefined, handleFirestoreError(error, `setDocument:${collectionKey}`));
  }
};

export const addDocument = async <K extends CollectionKey>(
  collectionKey: K,
  value: Omit<CollectionRecord<K>, "id">,
): Promise<FirestoreResult<CollectionRecord<K>>> => {
  try {
    const ref = await addDoc(getCollectionRef(collectionKey), removeUndefined(value));
    const snapshot = await getDoc(ref);
    return toResult(snapshot.data() ?? null, null);
  } catch (error) {
    return toResult(null, handleFirestoreError(error, `addDocument:${collectionKey}`));
  }
};

export const deleteDocument = async <K extends CollectionKey>(
  collectionKey: K,
  id: string,
): Promise<FirestoreResult<void>> => {
  try {
    const ref = doc(getCollectionRef(collectionKey), id);
    await deleteDoc(ref);
    return toResult(undefined, null);
  } catch (error) {
    return toResult(undefined, handleFirestoreError(error, `deleteDocument:${collectionKey}`));
  }
};

export const listDocuments = async <K extends CollectionKey>(
  collectionKey: K,
  constraints: QueryConstraint[] = [],
): Promise<FirestoreResult<CollectionRecordMap[K][]>> => {
  try {
    const baseQuery = query(getCollectionRef(collectionKey), ...constraints) as Query<CollectionRecordMap[K]>;
    const snapshot = await getDocs(baseQuery);
    const data = snapshot.docs.map((document) => document.data());
    return toResult(data, null);
  } catch (error) {
    return toResult([], handleFirestoreError(error, `listDocuments:${collectionKey}`));
  }
};

export const runFirestoreTransaction = async <T>(
  executor: (transaction: Transaction) => Promise<T>,
): Promise<FirestoreResult<T>> => {
  try {
    const data = await runTransaction(db, executor);
    return toResult(data, null);
  } catch (error) {
    return toResult(null, handleFirestoreError(error, "transaction"));
  }
};

export const runFirestoreBatch = async (
  executor: (batch: WriteBatch) => Promise<void>,
): Promise<FirestoreResult<void>> => {
  try {
    const batch = writeBatch(db);
    await executor(batch);
    await batch.commit();
    return toResult(undefined, null);
  } catch (error) {
    return toResult(undefined, handleFirestoreError(error, "batch"));
  }
};

