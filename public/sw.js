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
    // icon: '/icon-192x192.png', // 실제 운영 시에는 로고 이미지 지정 필요
    vibrate: [300, 100, 300, 100, 300], // 강하게 진동(띠링- 띠링-)
    data: { url: data.url || '/' },
    requireInteraction: true, // 사용자가 확인하기 전까지 화면 상단에서 사라지지 않게 유지
    tag: 'nao3-push', // 중복 알림 방지
    renotify: true // 동일한 태그여도 소리와 진동을 다시 울리게 함
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
