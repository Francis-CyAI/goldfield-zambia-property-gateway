self.addEventListener('install', () => {
  // Skip waiting so updates activate immediately.
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

importScripts('https://www.gstatic.com/firebasejs/10.13.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.13.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyD-LVLmryPuwKQKa5K0M59B6luwS8U_4Ew",
  authDomain: "goldfield-8180d.firebaseapp.com",
  projectId: "goldfield-8180d",
  storageBucket: "goldfield-8180d.firebasestorage.app",
  messagingSenderId: "540459811508",
  appId: "1:540459811508:web:f1b1878b9611ab970bcde1",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title || 'New notification';
  const options = {
    body: payload.notification?.body || payload.data?.message || '',
    icon: '/icons/notification.png',
    data: payload.data,
  };

  self.registration.showNotification(title, options);
});
