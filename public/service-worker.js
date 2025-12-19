// Service Worker para Push Notifications
const CACHE_NAME = 'rpa-cache-v2';

// Instalar Service Worker
self.addEventListener('install', (event) => {
    console.log('Service Worker instalado');
    self.skipWaiting();
});

// Ativar Service Worker
self.addEventListener('activate', (event) => {
    console.log('Service Worker ativado');
    event.waitUntil(clients.claim());
});

// Escutar notificações push
self.addEventListener('push', (event) => {
    console.log('Push recebido:', event);

    let notificationData = {
        title: 'Recupera Aqui',
        body: 'Você tem uma nova atualização',
        icon: '/rpa.png',
        badge: '/rpa.png',
        data: { url: '/' }
    };

    if (event.data) {
        try {
            notificationData = event.data.json();
        } catch (e) {
            notificationData.body = event.data.text();
        }
    }

    // Atualizar Badge do App (Badging API)
    if (navigator.setAppBadge) {
        navigator.setAppBadge().catch(e => console.log('Erro badge SW:', e));
    }

    const promiseChain = self.registration.showNotification(
        notificationData.title,
        {
            body: notificationData.body,
            icon: '/rpa-transparent.png',
            badge: '/rpa-transparent.png',
            vibrate: [200, 100, 200],
            data: notificationData.data || { url: '/' },
            actions: [
                { action: 'open', title: 'Ver Agora' },
                { action: 'close', title: 'Fechar' }
            ]
        }
    );

    event.waitUntil(promiseChain);
});

// Clique na notificação
self.addEventListener('notificationclick', (event) => {
    console.log('Notificação clicada:', event);
    event.notification.close();

    if (event.action === 'close') {
        return;
    }

    const urlToOpen = event.notification.data.url || '/';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then((clientList) => {
                // Se já tem uma janela aberta, foca nela
                for (const client of clientList) {
                    if (client.url === urlToOpen && 'focus' in client) {
                        return client.focus();
                    }
                }
                // Senão, abre nova janela
                if (clients.openWindow) {
                    return clients.openWindow(urlToOpen);
                }
            })
    );
});
