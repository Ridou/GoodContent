const admin = require('firebase-admin');
const path = require('path');
require('dotenv').config();

if (!admin.apps.length) {
  const serviceAccountPath = path.resolve(__dirname, 'config', 'goodcontent-428917-firebase-adminsdk-yxnqd-0041e990ed.json');
  const serviceAccount = require(serviceAccountPath);

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  });
}

const bucket = admin.storage().bucket();

module.exports = { bucket };
