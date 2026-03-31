// Give the service worker access to Firebase Messaging.
// Note: This file MUST be in the public/ folder for it to be accessible at the root.

importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker by passing in the messagingSenderId.
firebase.initializeApp({
  apiKey: "AIzaSyAjm-b9NynSm-MzRdOJxILE5TjBmW0eEwo",
  authDomain: "queen-ecommerce-6ed50.firebaseapp.com",
  projectId: "queen-ecommerce-6ed50",
  storageBucket: "queen-ecommerce-6ed50.firebasestorage.app",
  messagingSenderId: "497154496795",
  appId: "1:497154496795:web:06ba9beaa7b6fde2151bbe",
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: payload.data.imageUrl || '/logo.png', // Fallback to logo
    data: payload.data,
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
