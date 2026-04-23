// firebase-messaging-sw.js
importScripts("https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js");
importScripts("https://www.gstatic.com/firebasejs/8.10.0/firebase-messaging.js");

firebase.initializeApp({
  apiKey: "AIzaSyAjm-b9NynSm-MzRdOJxILE5TjBmW0eEwo",
  authDomain: "queen-ecommerce-6ed50.firebaseapp.com",
  projectId: "queen-ecommerce-6ed50",
  storageBucket: "queen-ecommerce-6ed50.firebasestorage.app",
  messagingSenderId: "497154496795",
  appId: "1:497154496795:web:06ba9beaa7b6fde2151bbe"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log("[firebase-messaging-sw.js] Received background message ", payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: "/logo2.png",
    data: payload.data
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
