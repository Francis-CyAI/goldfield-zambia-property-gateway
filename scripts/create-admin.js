/**
 * Node script to create or update a super admin account.
 *
 * Requirements:
 * - Set GOOGLE_APPLICATION_CREDENTIALS (or FIREBASE_SERVICE_ACCOUNT) to a Firebase service account JSON path.
 * - Optionally, set FIREBASE_PROJECT_ID if it cannot be inferred from the credentials file.
 *
 * Run with: node scripts/create-admin.js
 */
import fs from 'node:fs';
import readline from 'node:readline';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

const serviceAccountPath =
  process.env.GOOGLE_APPLICATION_CREDENTIALS || process.env.FIREBASE_SERVICE_ACCOUNT;
if (!serviceAccountPath || !fs.existsSync(serviceAccountPath)) {
  console.error(
    'Missing service account JSON. Set GOOGLE_APPLICATION_CREDENTIALS (or FIREBASE_SERVICE_ACCOUNT) to a valid path.'
  );
  process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
const projectId = process.env.FIREBASE_PROJECT_ID || serviceAccount.project_id;

if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount),
    projectId,
  });
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const ask = (question) =>
  new Promise((resolve) => {
    rl.question(question, (answer) => resolve(answer.trim()));
  });

const main = async () => {
  const email = await ask('Admin email: ');
  const password = await ask('Password (min 6 chars): ');
  const firstName = await ask('First name (optional): ');
  const lastName = await ask('Last name (optional): ');

  if (!email || !password) {
    console.error('Email and password are required.');
    process.exit(1);
  }

  const auth = getAuth();
  const db = getFirestore();

  // Create or fetch user
  let userRecord;
  try {
    userRecord = await auth.createUser({ email, password, displayName: `${firstName} ${lastName}`.trim() });
    console.log(`Created auth user ${userRecord.uid}`);
  } catch (err) {
    if (err.code === 'auth/email-already-exists') {
      userRecord = await auth.getUserByEmail(email);
      await auth.updateUser(userRecord.uid, { password });
      console.log(`User already exists. Updated password for ${userRecord.uid}`);
    } else {
      console.error('Failed to create/update user:', err);
      process.exit(1);
    }
  }

  // Set admin claim
  await auth.setCustomUserClaims(userRecord.uid, { isAdmin: true });

  // Upsert profile
  await db
    .collection('profiles')
    .doc(userRecord.uid)
    .set(
      {
        id: userRecord.uid,
        email,
        first_name: firstName || null,
        last_name: lastName || null,
        role: 'super_admin',
        updated_at: FieldValue.serverTimestamp(),
        created_at: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

  // Upsert admin record
  await db
    .collection('admin_users')
    .doc(userRecord.uid)
    .set(
      {
        user_id: userRecord.uid,
        admin_type: 'super_admin',
        is_active: true,
        permissions: ['manage_users', 'manage_properties', 'view_reports'],
        updated_at: FieldValue.serverTimestamp(),
        created_at: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

  console.log('✅ Admin account ready.');
  rl.close();
  process.exit(0);
};

main().catch((err) => {
  console.error(err);
  rl.close();
  process.exit(1);
});
