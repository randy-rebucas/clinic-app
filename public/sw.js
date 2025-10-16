// Basic service worker for time tracker notifications
console.log('Time Tracker Service Worker loaded');

// Handle install event
self.addEventListener('install', function(event) {
  console.log('Service Worker installing...');
  self.skipWaiting();
});

// Handle activate event
self.addEventListener('activate', function(event) {
  console.log('Service Worker activating...');
  event.waitUntil(self.clients.claim());
});

// Handle push events (for future push notification support)
self.addEventListener('push', function(event) {
  console.log('Push message received:', event);
  
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body || 'You have a new notification',
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: 'time-tracker-notification',
      data: data.data || {}
    };

    event.waitUntil(
      self.registration.showNotification(data.title || 'Time Tracker', options)
    );
  }
});

// Handle notification click
self.addEventListener('notificationclick', function(event) {
  console.log('Notification clicked:', event);
  event.notification.close();
  
  // Focus or open the app
  event.waitUntil(
    self.clients.matchAll().then(function(clientList) {
      if (clientList.length > 0) {
        return clientList[0].focus();
      }
      return self.clients.openWindow('/');
    })
  );
});
