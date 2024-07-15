const admin = require('firebase-admin');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

if (!admin.apps.length) {
  const serviceAccountPath = path.resolve(__dirname, 'config', process.env.FIREBASE_SERVICE_ACCOUNT);
  const serviceAccount = require(serviceAccountPath);

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  });
}

const bucket = admin.storage().bucket();

module.exports = { bucket };
