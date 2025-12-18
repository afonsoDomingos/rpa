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

    const connected = ref(false);

    const connectSocket = () => {
        socket.value = io('https://apirpa.onrender.com', {
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 5,
            // Adicional para debug e estabilidade
            autoConnect: true,
            withCredentials: false // Tentar desabilitar para evitar problemas de CORS se o server permitir *
        });

        socket.value.on('connect', () => {
            console.log('✅ Socket conectado! ID:', socket.value.id);
            connected.value = true;
        });

        socket.value.on('connect_error', (err) => {
            console.error('⚠️ Erro de conexão socket:', err.message);
            connected.value = false;
        });

        socket.value.on('admin:new-payment', (data) => {
            console.log('💰 Novo pagamento recebido!', data);

            // Tratamento robusto dos dados recebidos
            const valor = data.data?.valor || data.valor || 0;
            const pacote = data.data?.pacote || data.pacote || 'Desconhecido';
            const usuarioNome = data.data?.usuario?.nome || 'Cliente';

            const notification = {
                id: Date.now(),
                message: `Novo pagamento de ${valor} MZN - ${pacote}`,
                timestamp: new Date(),
                data: data.data || data,
                read: false
            };

            notifications.value.unshift(notification);
            unreadCount.value++;

            playNotificationSound();

            if (permission.value === 'granted') {
                showPaymentNotification({
                    valor: valor,
                    pacote: pacote,
                    usuario: usuarioNome
                });
            }
        });

        socket.value.on('disconnect', (reason) => {
            console.log('❌ Socket desconectado:', reason);
            connected.value = false;
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

    return {
        notifications,
        unreadCount,
        markAsRead,
        clearAll,
        connected // EXPORTAR
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
