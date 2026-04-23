import { useEffect } from "react";
import firebase from "firebase/compat/app";
import "firebase/compat/messaging";
import api from "../libs/api";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const messaging = firebase.messaging();

export default function NotificationManager() {
  useEffect(() => {
    const requestPermission = async () => {
      try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          const token = await messaging.getToken({
            vapidKey: "BDuoDskRIk42_6ngg7kgXVa7abdq3UQioV2BJr17Dl6qVSKlyVWXmdVRQP_4rZfVWhjGFopA2-cWrHnckyO1MWQ" // Note: This needs to be your real VAPID key from Firebase console
          });
          
          if (token) {
            // Register token with backend
            await api.post("/admin/notifications/register-token", { token });
            console.log("🔔 Push notifications registered");
          }
        }
      } catch (err) {
        console.warn("Push notification registration failed:", err);
      }
    };

    requestPermission();
  }, []);

  return null;
}
