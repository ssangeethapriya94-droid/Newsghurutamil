import { initializeApp } from "firebase/app";
import { getMessaging, getToken } from "firebase/messaging";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || process.env.VITE_FIREBASE_API_KEY || "AIzaSyCkpy-nLDStT7oI8phWPxv0qGKGWb239UY",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || process.env.VITE_FIREBASE_AUTH_DOMAIN || "newsghuru-notification.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID || "newsghuru-notification",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || process.env.VITE_FIREBASE_STORAGE_BUCKET || "newsghuru-notification.firebasestorage.app",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "473545042099",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || process.env.VITE_FIREBASE_APP_ID || "1:473545042099:web:7d3b0180885d8eaad5a8c6",
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID || process.env.VITE_FIREBASE_MEASUREMENT_ID || "G-VRGS4YXX37"
};

let app = null;
let messaging = null;

if (firebaseConfig.projectId && firebaseConfig.apiKey) {
  try {
    app = initializeApp(firebaseConfig);
    messaging = getMessaging(app);
  } catch (err) {
    console.error("Firebase initialization failed in Admin:", err);
  }
}

export const generateFCMToken = async () => {
  if (!messaging) {
    console.warn("Firebase messaging not initialized in Admin. Skipping token generation.");
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
        console.error("Failed to load service worker in Admin Dashboard:", swError);
        return null;
      }

      const vapidKey = process.env.REACT_APP_VAPID_KEY || process.env.VITE_FIREBASE_VAPID_KEY || "BEAu-2p8M9gZ_XDVJyULFFrSvFn9QGQZOhyh0tIr3m9tA6gG8OFN0J0vyi5UI80zqQS7AflHIWf1l2d9r-OlXbU";
      let currentToken;
      try {
        currentToken = await getToken(messaging, {
          vapidKey: vapidKey,
          serviceWorkerRegistration: swRegistration || undefined
        });
      } catch (tokenError) {
        console.warn("FCM getToken failed, attempting to reset service worker registration in Admin...", tokenError);
        if (swRegistration) {
          try {
            const subscription = await swRegistration.pushManager.getSubscription();
            if (subscription) {
              await subscription.unsubscribe();
            }
            await swRegistration.unregister();
            // Re-register and retry
            await navigator.serviceWorker.register(`/firebase-messaging-sw.js`);
            const newReady = await navigator.serviceWorker.ready;
            currentToken = await getToken(messaging, {
              vapidKey: vapidKey,
              serviceWorkerRegistration: newReady || undefined
            });
          } catch (retryError) {
            console.error("FCM token generation retry failed in Admin:", retryError);
            throw tokenError;
          }
        } else {
          throw tokenError;
        }
      }
      return currentToken;
    } else {
      console.log("Notification permission not granted in Admin dashboard");
      return null;
    }
  } catch (error) {
    console.error("An error occurred while requesting permission for Admin notifications:", error);
    return null;
  }
};

export default app;
