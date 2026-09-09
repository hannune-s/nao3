self.addEventListener('push', function (event) {
  let data = { title: '할인 알림', body: '새로운 특가가 등록되었습니다.' };
  
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: '/icon.jpg',
    badge: '/icon.jpg',
    vibrate: [300, 100, 300, 100, 300],
    data: { url: data.url || '/' },
    requireInteraction: true,
    tag: 'nao3-push',
    renotify: true
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
});
