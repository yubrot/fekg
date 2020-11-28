import admin from 'firebase-admin';

export function getApp(): admin.app.App {
  if (admin.apps.length) return admin.app();

  const credential = process.env.FIREBASE_ADMIN_CREDENTIAL;
  const databaseURL = process.env.FIREBASE_ADMIN_DATABASE_URL;
  const storageBucket = process.env.FIREBASE_ADMIN_STORAGE_BUCKET;
  if (!credential || !databaseURL || !storageBucket) {
    throw 'Firebase credential unspecified';
  }

  const app = admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(credential)),
    databaseURL,
    storageBucket,
  });

  return app;
}

export function getAuth(): admin.auth.Auth {
  return getApp().auth();
}

export function getStorage(): admin.storage.Storage {
  return getApp().storage();
}

export function getFirestore(): admin.firestore.Firestore {
  return getApp().firestore();
}
