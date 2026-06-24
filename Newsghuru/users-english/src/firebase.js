import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || process.env.VITE_FIREBASE_API_KEY || "AIzaSyCkpy-nLDStT7oI8phWPxv0qGKGWb239UY",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || process.env.VITE_FIREBASE_AUTH_DOMAIN || "newsghuru-notification.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID || "newsghuru-notification",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || process.env.VITE_FIREBASE_STORAGE_BUCKET || "newsghuru-notification.firebasestorage.app",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "473545042099",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || process.env.VITE_FIREBASE_APP_ID || "1:473545042099:web:7d3b0180885d8eaad5a8c6",
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID || process.env.VITE_FIREBASE_MEASUREMENT_ID || "G-VRGS4YXX37"
};

// Initialize Firebase only if credentials are provided
let app = null;
let messaging = null;

if (firebaseConfig.projectId && firebaseConfig.apiKey) {
  try {
    app = initializeApp(firebaseConfig);
    messaging = getMessaging(app);
  } catch (err) {
    console.error("Firebase initialization failed:", err);
  }
} else {
  console.warn("⚠️ Firebase environment variables are missing. Push notifications are disabled.");
}

export const generateFCMToken = async () => {
  if (!messaging) {
    console.warn("Firebase messaging not initialized. Skipping token generation.");
    return null;
  }
  try {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      let swRegistration = null;
      try {
        if ('serviceWorker' in navigator) {
          await navigator.serviceWorker.register(`/firebase-messaging-sw.js`);
          swRegistration = await navigator.serviceWorker.ready;
        }
      } catch (swError) {
        console.error("CRITICAL: Failed to load Service Worker. Your React server might be stopped, or an adblocker is active.", swError);
        alert("Unable to subscribe. Please ensure the React server is running and disable adblockers.");
        return null;
      }

      const vapidKey = process.env.REACT_APP_VAPID_KEY || process.env.VITE_FIREBASE_VAPID_KEY || "BEAu-2p8M9gZ_XDVJyULFFrSvFn9QGQZOhyh0tIr3m9tA6gG8OFN0J0vyi5UI80zqQS7AflHIWf1l2d9r-OlXbU";
      const currentToken = await getToken(messaging, {
        vapidKey: vapidKey,
        serviceWorkerRegistration: swRegistration || undefined
      });
      if (currentToken) {
        console.log("FCM Token Generated Successfully:", currentToken);
        return currentToken;
      } else {
        console.log("FCM Token is null or empty. Request permission to generate one.");
        return null;
      }
    } else {
      console.log("Notification permission denied");
      return null;
    }
  } catch (error) {
    console.error("An error occurred while requesting permission. ", error);
    return null;
  }
};

export const onMessageListener = (callback) => {
  if (!messaging) return () => {};
  return onMessage(messaging, (payload) => {
    console.log("Message received. ", payload);
    callback(payload);
  });
};

export default app;

