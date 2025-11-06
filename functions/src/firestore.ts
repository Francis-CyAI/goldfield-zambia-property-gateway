import { getFirestore, Timestamp, FieldValue } from "firebase-admin/firestore";

export const db = getFirestore();

export const serverTimestamp = Timestamp.now;

export const arrayUnion = FieldValue.arrayUnion;
export const arrayRemove = FieldValue.arrayRemove;
