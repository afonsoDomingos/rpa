import { ref, onMounted } from 'vue';
import api from '../api'; // Assumindo que tens o axios configurado aqui

// ⚠️ A CHAVE PÚBLICA VAPID SERÁ BUSCADA DINAMICAMENTE DO BACKEND
const VAPID_PUBLIC_KEY = ref('');

const fetchVapidKey = async () => {
    try {
        const response = await api.get('/push/key');
        VAPID_PUBLIC_KEY.value = response.data.publicKey;
        console.log('🔑 Chave VAPID carregada');
    } catch (error) {
        console.error('❌ Erro ao buscar chave VAPID:', error);
    }
};

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
            const registration = await navigator.serviceWorker.register('/service-worker.js');
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
                applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY.value)
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
            // Ajustado para o endpoint das instruções
            await api.post('/push/subscribe', { subscription });
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
                    // Tenta subscrever ao VAPID
                    if (!VAPID_PUBLIC_KEY.value) {
                        await fetchVapidKey();
                    }

                    if (VAPID_PUBLIC_KEY.value) {
                        await subscribeUserToPush(registration);
                    } else {
                        console.warn('⚠️ Chave VAPID não disponível. Push real não funcionará.');
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
            icon: '/rpa-transparent.png',
            badge: '/rpa-transparent.png',
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
        if (isSupported.value) {
            fetchVapidKey();
        }
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
