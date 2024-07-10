// server/firebaseConfig.js
const admin = require('firebase-admin');
const firebase = require('firebase/app');
require('firebase/storage');

// Update this path to the actual path of your service account key JSON file
const serviceAccount = require('./config/goodcontent-428917-firebase-adminsdk-yxnqd-9c03f0283a.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "goodcontent-428917.appspot.com"
});

const bucket = admin.storage().bucket();

module.exports = { bucket };
