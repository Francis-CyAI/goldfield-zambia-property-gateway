import { getFirestore, Timestamp, FieldValue } from "firebase-admin/firestore";
import { app } from "./firebaseApp.js";

export const db = getFirestore(app);

export const serverTimestamp = Timestamp.now;

export const arrayUnion = FieldValue.arrayUnion;
export const arrayRemove = FieldValue.arrayRemove;
