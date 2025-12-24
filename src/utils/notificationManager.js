import api from '../api';

// ⚠️ SUBSTUA PELA SUA CHAVE PÚBLICA VAPID DO BACKEND SE MUDAR
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

// Notification Manager - Sistema de Push Notifications
export class NotificationManager {
    constructor() {
        this.permission = Notification.permission;
        this.registration = null;
    }

    // Verificar se o browser suporta notificações
    static isSupported() {
        return 'Notification' in window && 'serviceWorker' in navigator;
    }

    // Registrar Service Worker
    async registerServiceWorker() {
        if (!('serviceWorker' in navigator)) {
            console.log('Service Worker não suportado');
            return false;
        }

        try {
            this.registration = await navigator.serviceWorker.register('/service-worker.js');
            console.log('✅ Service Worker registrado:', this.registration);

            // Tentar subscrever ao Push Service
            await this.subscribeToPush();

            return true;
        } catch (error) {
            console.error('❌ Erro ao registrar Service Worker:', error);
            return false;
        }
    }

    // Pedir permissão para notificações
    async requestPermission() {
        if (!NotificationManager.isSupported()) {
            return { granted: false, reason: 'not-supported' };
        }

        // Se já concedeu permissão
        if (this.permission === 'granted') {
            return { granted: true, reason: 'already-granted' };
        }

        // Se negou permanentemente
        if (this.permission === 'denied') {
            return { granted: false, reason: 'denied' };
        }

        try {
            this.permission = await Notification.requestPermission();

            if (this.permission === 'granted') {
                await this.registerServiceWorker();
                return { granted: true, reason: 'newly-granted' };
            }

            return { granted: false, reason: 'user-declined' };
        } catch (error) {
            console.error('Erro ao pedir permissão:', error);
            return { granted: false, reason: 'error' };
        }
    }

    // Subscrever ao Push Service
    async subscribeToPush() {
        if (!this.registration) return;

        try {
            const subscription = await this.registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
            });

            console.log('📡 Subscrição Push Gerada:', subscription);
            await this.sendSubscriptionToBackend(subscription);
        } catch (error) {
            console.error('❌ Erro ao subscrever ao Push:', error);
        }
    }

    // Enviar subscrição para o backend
    async sendSubscriptionToBackend(subscription) {
        try {
            await api.post('/notifications/subscribe', subscription);
            console.log('💾 Subscrição salva no backend!');
        } catch (error) {
            console.error('❌ Erro ao enviar subscrição para o backend:', error);
        }
    }

    // Enviar notificação local (sem server)
    async sendLocalNotification(options) {
        if (this.permission !== 'granted') {
            console.log('Permissão não concedida');
            return false;
        }

        const defaultOptions = {
            body: 'Você tem uma nova atualização',
            icon: '/logo.png',
            badge: '/logo.png',
            vibrate: [200, 100, 200],
            tag: 'rpa-notification',
            requireInteraction: false,
            data: { url: '/' }
        };

        const notificationOptions = { ...defaultOptions, ...options };

        try {
            if (this.registration && this.registration.showNotification) {
                // Usar Service Worker (melhor opção)
                await this.registration.showNotification(
                    options.title || 'Recupera Aqui',
                    notificationOptions
                );
            } else {
                // Fallback: notificação simples
                new Notification(options.title || 'Recupera Aqui', notificationOptions);
            }
            return true;
        } catch (error) {
            console.error('Erro ao enviar notificação:', error);
            return false;
        }
    }

    // Notificações pré-definidas
    async notifyDocumentoEncontrado(nomeDocumento) {
        return this.sendLocalNotification({
            title: '🎉 Documento Encontrado!',
            body: `Encontramos seu ${nomeDocumento}! Clique para ver.`,
            icon: '/logo.png',
            tag: 'documento-encontrado',
            requireInteraction: true,
            data: { url: '/documentos' },
            vibrate: [300, 100, 300, 100, 300]
        });
    }

    async notifyAssinaturaAtivada(plano) {
        return this.sendLocalNotification({
            title: '✅ Assinatura Ativada',
            body: `Seu plano ${plano} está ativo!`,
            icon: '/logo.png',
            tag: 'assinatura',
            data: { url: '/meus-pagamentos' }
        });
    }

    async notifyAssinaturaExpirando(diasRestantes) {
        return this.sendLocalNotification({
            title: '⏰ Assinatura Expirando',
            body: `Sua assinatura expira em ${diasRestantes} dia${diasRestantes > 1 ? 's' : ''}. Renove agora!`,
            icon: '/logo.png',
            tag: 'expiracao',
            requireInteraction: true,
            data: { url: '/assinaturas' }
        });
    }

    async notifyNovoReporte(provincia) {
        return this.sendLocalNotification({
            title: '📍 Novo Documento Reportado',
            body: `Um documento foi encontrado em ${provincia}`,
            icon: '/logo.png',
            tag: 'novo-reporte',
            data: { url: '/documentos' }
        });
    }
}

// Exportar instância singleton
export const notificationManager = new NotificationManager();
