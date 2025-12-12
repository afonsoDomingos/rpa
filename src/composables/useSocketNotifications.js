import { ref, onMounted, onUnmounted, watch } from 'vue';
import { io } from 'socket.io-client';
import { usePushNotifications } from './usePushNotifications';

const STORAGE_KEY = 'admin_notifications';

export function useSocketNotifications() {
    const socket = ref(null);
    const notifications = ref([]);
    const unreadCount = ref(0);

    // Push Notifications
    const { permission, showPaymentNotification } = usePushNotifications();

    // Carregar notificações do localStorage
    const loadNotifications = () => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                notifications.value = parsed.map(n => ({
                    ...n,
                    timestamp: new Date(n.timestamp)
                }));
                unreadCount.value = notifications.value.filter(n => !n.read).length;
            }
        } catch (e) {
            console.error('Erro ao carregar notificações:', e);
        }
    };

    // Salvar notificações no localStorage
    const saveNotifications = () => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications.value));
        } catch (e) {
            console.error('Erro ao salvar notificações:', e);
        }
    };

    // Watch para salvar automaticamente quando houver mudanças
    watch(notifications, () => {
        saveNotifications();
    }, { deep: true });

    const playNotificationSound = () => {
        try {
            const audio = new Audio('/notification.mp3');
            audio.play().catch(e => console.log('Som desabilitado:', e));
        } catch (e) {
            console.log('Erro ao tocar som:', e);
        }
    };

    const connectSocket = () => {
        socket.value = io('https://apirpa.onrender.com', {
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 5
        });

        socket.value.on('connect', () => {
            console.log('✅ Socket conectado!');
        });

        socket.value.on('admin:new-payment', (data) => {
            console.log('💰 Novo pagamento recebido!', data);

            const notification = {
                id: Date.now(),
                message: `Novo pagamento de ${data.data.valor} MZN - ${data.data.pacote}`,
                timestamp: new Date(),
                data: data.data,
                read: false
            };

            notifications.value.unshift(notification);
            unreadCount.value++;

            playNotificationSound();

            // Mostra Push Notification (funciona mesmo com app fechado)
            if (permission.value === 'granted') {
                showPaymentNotification({
                    valor: data.data.valor,
                    pacote: data.data.pacote,
                    usuario: data.data.usuario?.nome || 'Cliente'
                });
            }
        });

        socket.value.on('disconnect', () => {
            console.log('❌ Socket desconectado');
        });
    };

    const markAsRead = (id) => {
        const notif = notifications.value.find(n => n.id === id);
        if (notif && !notif.read) {
            notif.read = true;
            unreadCount.value = Math.max(0, unreadCount.value - 1);
        }
    };

    const clearAll = () => {
        notifications.value = [];
        unreadCount.value = 0;
        localStorage.removeItem(STORAGE_KEY);
    };

    onMounted(() => {
        loadNotifications(); // Carregar notificações salvas
        connectSocket();
    });

    onUnmounted(() => {
        if (socket.value) {
            socket.value.disconnect();
        }
    });

    return {
        notifications,
        unreadCount,
        markAsRead,
        clearAll
    };
}
