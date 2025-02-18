
// const admin = require("firebase-admin");

// admin.initializeApp({
//   credential: admin.credential.cert({
//     project_id: process.env.FIREBASE_PROJECT_ID,
//     private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
//     private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
//     client_email: process.env.FIREBASE_CLIENT_EMAIL,
//   }),
//   storageBucket: 'd2v-architech.firebasestorage.app',

// });

// const db = admin.firestore();
// const storage = admin.storage(); 

// function checkFirebaseConnection() {
//     return db.listCollections().then(() => {
//       console.log("Database connected successfully");
//     }).catch((error) => {
//       console.error("Failed to connect to database:", error.message);
//     });
//   }
  
  

// module.exports = { admin, db ,storage, checkFirebaseConnection};


// const admin = require("firebase-admin");
// admin.initializeApp({
//   credential: admin.credential.cert({
//     project_id: process.env.FIREBASE_PROJECT_ID,
//     private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
//     private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
//     client_email: process.env.FIREBASE_CLIENT_EMAIL,
//   }),
//   storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
// });
// const bucket = admin.storage().bucket(); // Initialize storage bucket
// console.log("Using Firebase bucket:", process.env.FIREBASE_STORAGE_BUCKET);
// // Test if the bucket exists
// bucket.getFiles().then(([files]) => {
//   console.log('Files in bucket:');
// }).catch((error) => {
//   console.error('Error accessing bucket:', error.message);
// });
// // Verify bucket
// if (!bucket) {
//   console.error("Firebase bucket is undefined. Check Firebase configuration.");
// } else {
//   console.log("Firebase bucket initialized successfully.");
// }
// const db = admin.firestore();
// function checkFirebaseConnection() {
//     return db.listCollections().then(() => {
//       console.log("Database connected successfully");
//     }).catch((error) => {
//       console.error("Failed to connect to database:", error.message);
//     });
//   }
// const firestore = admin.firestore();
// firestore.settings({
//   ignoreUndefinedProperties: true,
// });
// module.exports = { admin, db , checkFirebaseConnection,bucket};

/// config file of firebase production
const admin = require("firebase-admin");
require('dotenv').config(); // Load the environment variables from the .env file




admin.initializeApp({
  credential: admin.credential.cert({
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'), // Handling multiline private key
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
  }),
  storageBucket: "gs://d2v-interiors.firebasestorage.app", // Firebase Storage Bucket URL
});

const storage = admin.storage(); // Access Firebase Storage
const db = admin.firestore(); // Access Firestore
const bucket = storage.bucket(); // Get the default storage bucket

console.log("Firebase initialized successfully");

// Check if the Firebase bucket is accessible
bucket.getFiles()
  .then(([files]) => {
    console.log('Files in bucket:');
  })
  .catch((error) => {
    console.error('Error accessing bucket:', error.message);
  });

if (!bucket) {
  console.error("Firebase bucket is undefined. Check Firebase configuration.");
} else {
  console.log("Firebase bucket initialized successfully.");
}

// Function to check Firestore connection
function checkFirebaseConnection() {
  return db.listCollections()
    .then(() => {
      console.log("Database connected successfully");
    })
    .catch((error) => {
      console.error("Failed to connect to Firestore:", error.message);
    });
}

// Firestore settings to ignore undefined properties
const firestore = admin.firestore();
firestore.settings({
  ignoreUndefinedProperties: true,
});

// Export Firebase admin SDK, Firestore database, bucket, and connection check
module.exports = { admin, db, checkFirebaseConnection, bucket };