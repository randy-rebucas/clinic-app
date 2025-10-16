// Import Firebase scripts
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Initialize Firebase in the service worker
// Note: These values should match your Firebase project configuration
// You can get these from your Firebase project settings
firebase.initializeApp({
  apiKey: "AIzaSyBEg5Am28BsJ95j5Mzoujk0Tw-l0Lth9uY",
  authDomain: "lingkod-ph-snphs.firebaseapp.com",
  projectId: "lingkod-ph-snphs",
  storageBucket: "lingkod-ph-snphs.firebasestorage.app",
  messagingSenderId: "34924082188",
  appId: "1:34924082188:web:c6aa43d7ef5fbc019daa29"
});

// Retrieve an instance of Firebase Messaging so that it can handle background messages
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage(function(payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: 'time-tracker-notification'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
