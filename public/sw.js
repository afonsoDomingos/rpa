// Service Worker para Push Notifications
self.addEventListener('push', function (event) {
    const data = event.data ? event.data.json() : {};

    const title = data.title || '💰 Novo Pagamento!';
    const options = {
        body: data.body || 'Você recebeu um novo pagamento',
        icon: '/logo.png',
        badge: '/badge.png',
        vibrate: [200, 100, 200],
        data: data.data || {},
        actions: [
            { action: 'view', title: 'Ver Detalhes' },
            { action: 'close', title: 'Fechar' }
        ]
    };

    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});

self.addEventListener('notificationclick', function (event) {
    event.notification.close();

    if (event.action === 'view') {
        event.waitUntil(
            clients.openWindow('/admin/assinaturas')
        );
    }
});
