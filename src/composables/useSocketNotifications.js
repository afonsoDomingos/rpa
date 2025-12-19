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
    const socketError = ref(null);
    const lastPayload = ref(null); // DEBUG

    const connectSocket = () => {
        socket.value = io('https://apirpa.onrender.com', {
            transports: ['polling', 'websocket'],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 10,
            autoConnect: true,
            withCredentials: false
        });

        socket.value.on('connect', () => {
            console.log('✅ Socket conectado! ID:', socket.value.id);
            connected.value = true;
            socketError.value = null;
        });

        socket.value.on('connect_error', (err) => {
            console.error('⚠️ Erro de conexão socket:', err.message);
            connected.value = false;
            socketError.value = err.message;
        });

        socket.value.on('admin:new-payment', (data) => {
            console.log('💰 Novo pagamento recebido!', data);
            lastPayload.value = JSON.stringify(data, null, 2); // DEBUG

            // Tratamento robusto dos dados recebidos (Deep Search)
            // Tenta encontrar o objeto de dados principal
            const payload = data.data || data.pagamento || data.payment || data;

            // Tenta extrair valores com diferentes chaves
            const valor = payload.valor || payload.amount || payload.price || payload.total || 0;
            const pacote = payload.pacote || payload.package || payload.plan || payload.plan_name || payload.plano || 'Assinatura';

            // Tenta extrair usuário (Busca de Campos Comuns)
            let usuarioNome = '';

            // Função interna para encontrar um nome em campos conhecidos
            const findName = (obj) => {
                if (!obj || typeof obj !== 'object') return null;
                // Ordem de preferência
                const fields = ['nome', 'name', 'cliente', 'customer_name', 'username', 'displayName'];
                for (const f of fields) {
                    if (obj[f] && typeof obj[f] === 'string' && obj[f].length > 2) return obj[f];
                }
                return null;
            };

            // 1. Tenta extrair diretamente se for string
            if (payload.usuario && typeof payload.usuario === 'string') {
                usuarioNome = payload.usuario;
            } else if (payload.user && typeof payload.user === 'string') {
                usuarioNome = payload.user;
            } else if (payload.nome && typeof payload.nome === 'string') {
                usuarioNome = payload.nome;
            } else {
                // 2. Tenta nos objetos aninhados (lógica anterior de busca)
                usuarioNome = findName(payload.usuario) || findName(payload.user) || findName(payload.customer) || findName(payload.cliente_obj);
            }

            // 3. Se ainda não encontrou, tenta no nível raiz do payload
            if (!usuarioNome) {
                usuarioNome = findName(payload);
            }

            // 4. Fallback para email
            if (!usuarioNome && payload.email) {
                usuarioNome = payload.email.split('@')[0];
            } else if (!usuarioNome && payload.usuario?.email) {
                usuarioNome = payload.usuario.email.split('@')[0];
            }

            // 5. Default final
            usuarioNome = usuarioNome || 'Cliente';

            const notification = {
                id: Date.now(),
                message: `Novo pagamento de ${valor} MZN - ${pacote} (Cliente: ${usuarioNome})`,
                timestamp: new Date(),
                data: payload,
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

    onMounted(() => {
        loadNotifications();
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
        clearAll,
        connected,
        socketError,
        lastPayload
    };
}
