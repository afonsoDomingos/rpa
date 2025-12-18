<template>
  <transition name="notification-popup">
    <div v-if="show" class="notification-permission-popup">
      <div class="popup-content">
        <div class="popup-icon">🔔</div>
        <h3 class="popup-title">Ativar Notificações?</h3>
        <p class="popup-text">
          Receba alertas quando encontrarmos seu documento ou quando sua assinatura estiver expirando.
        </p>
        <div class="popup-actions">
          <button @click="allow" class="btn-allow">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 6 9 17l-5-5"/>
            </svg>
            Permitir
          </button>
          <button @click="deny" class="btn-deny">
            Agora não
          </button>
        </div>
        <small class="popup-note">Pode alterar nas configurações depois</small>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { notificationManager } from '@/utils/notificationManager';

const show = ref(false);
const emit = defineEmits(['permission-result']);

// Verificar se já pediu antes
const hasAskedBefore = () => {
  return localStorage.getItem('notification-asked') === 'true';
};

// Marcar que já pediu
const markAsAsked = () => {
  localStorage.setItem('notification-asked', 'true');
};

// Mostrar popup automaticamente se ainda não pediu
onMounted(async () => {
  // Esperar 3 segundos para não ser intrusivo
  setTimeout(() => {
    if (!hasAskedBefore() && notificationManager.permission === 'default') {
      show.value = true;
    }
  }, 3000);
});

// Permitir notificações
const allow = async () => {
  show.value = false;
  markAsAsked();
  
  const result = await notificationManager.requestPermission();
  emit('permission-result', result);
  
  if (result.granted) {
    // Enviar notificação de boas-vindas
    setTimeout(() => {
      notificationManager.sendLocalNotification({
        title: '🎉 Notificações Ativadas!',
        body: 'Você será notificado sobre documentos encontrados.',
        data: { url: '/' }
      });
    }, 1000);
  }
};

// Negar notificações
const deny = () => {
  show.value = false;
  markAsAsked();
  emit('permission-result', { granted: false, reason: 'user-declined' });
};

// Expor método para mostrar manualmente
defineExpose({ show: () => { show.value = true; } });
</script>

<style scoped>
.notification-permission-popup {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 10000;
  max-width: 350px;
  animation: slideInRight 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

@keyframes slideInRight {
  from {
    transform: translateX(400px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.popup-content {
  background: linear-gradient(135deg, #ffffff, #f8f8f8);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 12px 40px rgba(128, 0, 128, 0.2), 0 0 0 1px rgba(128, 0, 128, 0.1);
  border: 2px solid rgba(128, 0, 128, 0.15);
}

.popup-icon {
  font-size: 48px;
  text-align: center;
  margin-bottom: 12px;
  animation: bounce 1s ease infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.popup-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #800080;
  margin: 0 0 8px 0;
  text-align: center;
}

.popup-text {
  font-size: 0.9rem;
  color: #555;
  line-height: 1.5;
  margin: 0 0 20px 0;
  text-align: center;
}

.popup-actions {
  display: flex;
  gap: 10px;
  margin-bottom: 12px;
}

.btn-allow,
.btn-deny {
  flex: 1;
  padding: 12px 20px;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 0.9rem;
}

.btn-allow {
  background: linear-gradient(135deg, #800080, #6a006a);
  color: white;
  box-shadow: 0 4px 12px rgba(128, 0, 128, 0.3);
}

.btn-allow:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(128, 0, 128, 0.4);
}

.btn-allow:active {
  transform: translateY(0);
}

.btn-deny {
  background: #f0f0f0;
  color: #555;
}

.btn-deny:hover {
  background: #e0e0e0;
}

.popup-note {
  text-align: center;
  color: #999;
  font-size: 0.75rem;
  display: block;
}

/* Mobile */
@media (max-width: 576px) {
  .notification-permission-popup {
    top: auto;
    bottom: 20px;
    right: 10px;
    left: 10px;
    max-width: none;
  }

  .popup-content {
    padding: 20px;
  }

  .popup-actions {
    flex-direction: column;
  }
}

/* Animações de transição */
.notification-popup-enter-active,
.notification-popup-leave-active {
  transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.notification-popup-enter-from {
  transform: translateX(400px);
  opacity: 0;
}

.notification-popup-leave-to {
  transform: translateY(-100px);
  opacity: 0;
  scale: 0.8;
}
</style>
