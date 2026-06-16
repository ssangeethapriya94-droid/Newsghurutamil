const { initializeApp, cert } = require("firebase-admin/app");
const { getMessaging } = require("firebase-admin/messaging");
const path = require("path");
const fs = require("fs");

let messaging = null;

try {
  const serviceAccountPath = path.join(__dirname, "ServiceAccount.json");
  
  if (fs.existsSync(serviceAccountPath)) {
    const serviceAccount = require("./ServiceAccount.json");
    const app = initializeApp({
      credential: cert(serviceAccount)
    });
    messaging = getMessaging(app);
    console.log("✅ Firebase Admin SDK initialized successfully");
  } else {
    console.log("⚠️ Firebase Admin SDK skipped: ServiceAccount.json not found in config folder");
  }
} catch (error) {
  console.error("❌ Firebase Admin Initialization Error:", error);
}

module.exports = messaging;
