import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID || process.env.VITE_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID || process.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Cloud Messaging and get a reference to the service
const messaging = getMessaging(app);

export const generateFCMToken = async () => {
  try {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      let swRegistration = null;
      try {
        if ('serviceWorker' in navigator) {
          const queryParams = new URLSearchParams({
            apiKey: firebaseConfig.apiKey || "",
            authDomain: firebaseConfig.authDomain || "",
            projectId: firebaseConfig.projectId || "",
            storageBucket: firebaseConfig.storageBucket || "",
            messagingSenderId: firebaseConfig.messagingSenderId || "",
            appId: firebaseConfig.appId || ""
          }).toString();
          
          swRegistration = await navigator.serviceWorker.register(`/firebase-messaging-sw.js?${queryParams}`);
        }
      } catch (swError) {
        console.error("CRITICAL: Failed to load Service Worker. Your React server might be stopped, or an adblocker is active.", swError);
        alert("Unable to subscribe. Please ensure the React server is running and disable adblockers.");
        return null;
      }

      const vapidKey = process.env.REACT_APP_VAPID_KEY || process.env.VITE_FIREBASE_VAPID_KEY;
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
  return onMessage(messaging, (payload) => {
    console.log("Message received. ", payload);
    callback(payload);
  });
};

export default app;

