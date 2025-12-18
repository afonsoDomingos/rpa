import { ref, onMounted } from 'vue';

export function usePushNotifications() {
    const isSupported = ref(false);
    const isSubscribed = ref(false);
    const permission = ref('default');

    // Verifica se o navegador suporta notificações
    const checkSupport = () => {
        isSupported.value = 'Notification' in window && 'serviceWorker' in navigator;
        if (isSupported.value) {
            permission.value = Notification.permission;
        }
    };

    // Solicita permissão para notificações
    const requestPermission = async () => {
        if (!isSupported.value) {
            console.log('Push notifications não suportadas neste navegador');
            return false;
        }

        try {
            const result = await Notification.requestPermission();
            permission.value = result;

            if (result === 'granted') {
                await registerServiceWorker();
                return true;
            }
            return false;
        } catch (error) {
            console.error('Erro ao solicitar permissão:', error);
            return false;
        }
    };

    // Registra o Service Worker
    const registerServiceWorker = async () => {
        try {
            const registration = await navigator.serviceWorker.register('/sw.js');
            console.log('✅ Service Worker registrado:', registration);
            isSubscribed.value = true;
            return registration;
        } catch (error) {
            console.error('❌ Erro ao registrar Service Worker:', error);
            return null;
        }
    };

    // Envia notificação de teste
    const sendTestNotification = () => {
        if (permission.value === 'granted') {
            new Notification('🔔 Notificações Ativadas!', {
                body: 'Você receberá notificações de novos pagamentos',
                icon: '/logo.png',
                vibrate: [200, 100, 200]
            });
        }
    };

    // Mostra notificação de novo pagamento (Compatível com Mobile)
    const showPaymentNotification = async (paymentData) => {
        if (permission.value !== 'granted') return;

        const title = '💰 Novo Pagamento Recebido!';
        const options = {
            body: `${paymentData.valor} MZN - ${paymentData.pacote}\nCliente: ${paymentData.usuario}`,
            icon: '/rpa.png', // Ajustado para rpa.png que existe no public
            badge: '/rpa.png',
            vibrate: [200, 100, 200, 100, 200],
            tag: 'payment-notification',
            requireInteraction: true,
            data: paymentData,
            actions: [
                { action: 'view', title: 'Ver Detalhes' }
            ]
        };

        try {
            // Tenta usar o SW para mostrar a notificação (Melhor para Mobile/Android)
            const registration = await navigator.serviceWorker.ready;
            if (registration) {
                registration.showNotification(title, options);
            } else {
                // Fallback para Desktop clássico
                new Notification(title, options);
            }
        } catch (e) {
            console.error('Erro ao mostrar notificação via SW:', e);
            new Notification(title, options);
        }
    };

    onMounted(() => {
        checkSupport();
    });

    return {
        isSupported,
        isSubscribed,
        permission,
        requestPermission,
        sendTestNotification,
        showPaymentNotification
    };
}
