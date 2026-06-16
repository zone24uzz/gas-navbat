self.addEventListener('push', event => {
  const data = event.data ? event.data.json() : {};
  event.waitUntil(
    self.registration.showNotification(data.title || 'GazQueue', {
      body: data.body || 'Навигация очередь пришла ✅',
      icon: data.icon || '/favicon.svg',
      badge: '/favicon.svg',
      vibrate: [200, 100, 200],
      requireInteraction: true,
      tag: 'gazqueue-turn'
    })
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(clients.openWindow('/'));
});
