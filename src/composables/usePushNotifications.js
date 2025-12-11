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

    // Mostra notificação de novo pagamento
    const showPaymentNotification = (paymentData) => {
        if (permission.value !== 'granted') return;

        const title = '💰 Novo Pagamento Recebido!';
        const options = {
            body: `${paymentData.valor} MZN - ${paymentData.pacote}\nCliente: ${paymentData.usuario}`,
            icon: '/logo.png',
            badge: '/badge.png',
            vibrate: [200, 100, 200, 100, 200],
            tag: 'payment-notification',
            requireInteraction: true,
            data: paymentData
        };

        new Notification(title, options);
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
