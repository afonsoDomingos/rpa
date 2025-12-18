import { ref, onMounted } from 'vue';
import api from '../api'; // Assumindo que tens o axios configurado aqui

// ⚠️ SUBSTUA PELA SUA CHAVE PÚBLICA VAPID DO BACKEND
const VAPID_PUBLIC_KEY = 'BGf3f6anck8PlGCHDcM6eThytG0ACCMk5owfTfND60revsBBvyRwCCovY5ZnYLCMeiP9HvAVUCzEsf4EcgyPdNM';

function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/-/g, '+')
        .replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

export function usePushNotifications() {
    const isSupported = ref(false);
    const isSubscribed = ref(false);
    const permission = ref('default');

    const checkSupport = () => {
        isSupported.value = 'Notification' in window && 'serviceWorker' in navigator;
        if (isSupported.value) {
            permission.value = Notification.permission;
        }
    };

    const registerServiceWorker = async () => {
        try {
            const registration = await navigator.serviceWorker.register('/sw.js');
            console.log('✅ Service Worker registrado:', registration);
            return registration;
        } catch (error) {
            console.error('❌ Erro ao registrar Service Worker:', error);
            return null;
        }
    };

    const subscribeUserToPush = async (registration) => {
        try {
            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
            });

            console.log('📡 Subscrição Push Gerada:', subscription);
            await sendSubscriptionToBackend(subscription);
            isSubscribed.value = true;
        } catch (error) {
            console.error('❌ Erro ao subscrever ao Push:', error);
        }
    };

    const sendSubscriptionToBackend = async (subscription) => {
        try {
            // Ajuste a rota conforma o seu backend
            await api.post('/notifications/subscribe', subscription);
            console.log('💾 Subscrição salva no backend!');
        } catch (error) {
            console.error('❌ Erro ao enviar subscrição para o backend:', error);
        }
    };

    const requestPermission = async () => {
        if (!isSupported.value) return false;

        try {
            const result = await Notification.requestPermission();
            permission.value = result;

            if (result === 'granted') {
                const registration = await registerServiceWorker();
                if (registration) {
                    // Tenta subscrever ao VAPID se tivermos a chave
                    if (VAPID_PUBLIC_KEY && VAPID_PUBLIC_KEY !== 'SUA_CHAVE_PUBLICA_VAPID_AQUI') {
                        await subscribeUserToPush(registration);
                    } else {
                        console.warn('⚠️ Chave VAPID não configurada no Frontend. Push real não funcionará.');
                    }
                }
                return true;
            }
            return false;
        } catch (error) {
            console.error('Erro permissão:', error);
            return false;
        }
    };

    // Mostra notificação local (Fallback ou Socket)
    const showPaymentNotification = async (paymentData) => {
        if (permission.value !== 'granted') return;

        const title = '💰 Novo Pagamento Recebido!';
        const options = {
            body: `${paymentData.valor} MZN - ${paymentData.pacote}\nCliente: ${paymentData.usuario}`,
            icon: '/rpa.png',
            badge: '/rpa.png',
            vibrate: [200, 100, 200],
            tag: 'payment-notification',
            data: paymentData
        };

        try {
            const registration = await navigator.serviceWorker.ready;
            if (registration) {
                registration.showNotification(title, options);
            } else {
                new Notification(title, options);
            }
        } catch (e) {
            new Notification(title, options);
        }
    };

    // Teste simples
    const sendTestNotification = () => {
        showPaymentNotification({
            valor: '1000',
            pacote: 'Teste',
            usuario: 'Admin'
        });
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
