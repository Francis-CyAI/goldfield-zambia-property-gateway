// Import the functions you need from the SDKs you need
import { initializeApp, type FirebaseOptions } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore, collection, CollectionReference, DocumentData, FirestoreDataConverter } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import {
  type BaseDocument,
  type CollectionKey,
  type CollectionRecordMap,
  type Course,
  type CourseMaterial,
  type Institution,
  type LearningApplication,
  type Notification,
  type Profile,
  type StudentEnrollment,
} from "@/lib/models";

const requireEnv = (value: string | undefined, key: string): string => {
  if (value == null || value === "") {
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value;
};

const firebaseConfig: FirebaseOptions = {
  apiKey: requireEnv(import.meta.env.VITE_FIREBASE_API_KEY, "VITE_FIREBASE_API_KEY"),
  authDomain: requireEnv(import.meta.env.VITE_FIREBASE_AUTH_DOMAIN, "VITE_FIREBASE_AUTH_DOMAIN"),
  projectId: requireEnv(import.meta.env.VITE_FIREBASE_PROJECT_ID, "VITE_FIREBASE_PROJECT_ID"),
  storageBucket: requireEnv(import.meta.env.VITE_FIREBASE_STORAGE_BUCKET, "VITE_FIREBASE_STORAGE_BUCKET"),
  messagingSenderId: requireEnv(import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID, "VITE_FIREBASE_MESSAGING_SENDER_ID"),
  appId: requireEnv(import.meta.env.VITE_FIREBASE_APP_ID, "VITE_FIREBASE_APP_ID"),
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);
export const analytics = typeof window !== "undefined" ? getAnalytics(app) : undefined;
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export const collections: Record<CollectionKey, string> = {
  profiles: "profiles",
  institutions: "institutions",
  courses: "courses",
  studentEnrollments: "student_enrollments",
  courseMaterials: "course_materials",
  applications: "applications",
  notifications: "notifications",
};

const createConverter = <T extends BaseDocument>(): FirestoreDataConverter<T> => ({
  toFirestore: (value) => {
    const { id, ...rest } = value;
    return rest as DocumentData;
  },
  fromFirestore: (snapshot, options) => {
    const data = snapshot.data(options) as Omit<T, "id">;
    return { id: snapshot.id, ...data } as T;
  },
});

const converters: { [K in CollectionKey]: FirestoreDataConverter<CollectionRecordMap[K]> } = {
  profiles: createConverter<Profile>(),
  institutions: createConverter<Institution>(),
  courses: createConverter<Course>(),
  studentEnrollments: createConverter<StudentEnrollment>(),
  courseMaterials: createConverter<CourseMaterial>(),
  applications: createConverter<LearningApplication>(),
  notifications: createConverter<Notification>(),
};

type TypedCollectionMap = {
  [K in CollectionKey]: CollectionReference<CollectionRecordMap[K]>;
};

export const collectionRefs: TypedCollectionMap = {
  profiles: collection(db, collections.profiles).withConverter(converters.profiles),
  institutions: collection(db, collections.institutions).withConverter(converters.institutions),
  courses: collection(db, collections.courses).withConverter(converters.courses),
  studentEnrollments: collection(db, collections.studentEnrollments).withConverter(converters.studentEnrollments),
  courseMaterials: collection(db, collections.courseMaterials).withConverter(converters.courseMaterials),
  applications: collection(db, collections.applications).withConverter(converters.applications),
  notifications: collection(db, collections.notifications).withConverter(converters.notifications),
};

export const getCollectionRef = <K extends CollectionKey>(key: K): CollectionReference<CollectionRecordMap[K]> =>
  collectionRefs[key];
