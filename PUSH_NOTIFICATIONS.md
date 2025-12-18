# Sistema de Push Notifications - Guia de Uso

## 📱 Como Usar Push Notifications no RPA

### 1️⃣ **Adicionar o Popup ao App Principal**

No arquivo `App.vue` ou componente raiz:

```vue
<template>
  <div id="app">
    <!-- Seu conteúdo -->
    <NotificationPermissionPopup @permission-result="onPermissionResult" />
  </div>
</template>

<script setup>
import NotificationPermissionPopup from '@/components/NotificationPermissionPopup.vue';

const onPermissionResult = (result) => {
  if (result.granted) {
    console.log('✅ Usuário ativou notificações!');
  } else {
    console.log('❌ Usuário recusou notificações');
  }
};
</script>
```

---

### 2️⃣ **Enviar Notificações em Qualquer Componente**

#### Exemplo: Quando documento for encontrado

```vue
<script setup>
import { notificationManager } from '@/utils/notificationManager';

const notificarDocumentoEncontrado = async () => {
  await notificationManager.notifyDocumentoEncontrado('Bilhete de Identidade');
};
</script>
```

#### Exemplo: Quando assinatura for ativada

```vue
<script setup>
import { notificationManager } from '@/utils/notificationManager';

const ativarAssinatura = async (plano) => {
  // ... lógica de ativação ...
  
  // Notificar!
  await notificationManager.notifyAssinaturaAtivada(plan);
};
</script>
```

---

### 3️⃣ **Notificações Disponíveis**

```javascript
// Documento encontrado
await notificationManager.notifyDocumentoEncontrado('Bilhete de Identidade');

// Assinatura ativada
await notificationManager.notifyAssinaturaAtivada('Plano Mensal');

// Assinatura expirando
await notificationManager.notifyAssinaturaExpirando(3); // 3 dias

// Novo documento reportado
await notificationManager.notifyNovoReporte('Maputo Cidade');

// Notificação personalizada
await notificationManager.sendLocalNotification({
  title: '🎉 Título Customizado',
  body: 'Mensagem personalizada aqui',
  data: { url: '/pagina-destino' },
  vibrate: [200, 100, 200]
});
```

---

### 4️⃣ **Integração com Backend (Futuro)**

Para enviar notificações do servidor (quando o usuário não está online):

```javascript
// Backend (Node.js + Firebase)
const admin = require('firebase-admin');

admin.messaging().send({
  token: userDeviceToken,
  notification: {
    title: 'Documento Encontrado!',
    body: 'Seu BI foi encontrado em Maputo'
  },
  webpush: {
    fcmOptions: {
      link: 'https://recuperaaqui.co.mz/documentos'
    }
  }
});
```

---

### 5️⃣ **Exemplo Completo: Verdocumentos.vue**

```vue
<script setup>
import { onMounted } from 'vue';
import { notificationManager } from '@/utils/notificationManager';

onMounted(async () => {
  // Registrar Service Worker
  await notificationManager.registerServiceWorker();
});

const buscarDocumento = async () => {
  const resultado = await api.get('/documentos/buscar');
  
  if (resultado.encontrado) {
    // Enviar notificação!
    await notificationManager.notifyDocumentoEncontrado(
      resultado.tipoDocumento
    );
  }
};
</script>
```

---

### 6️⃣ **Verificar Permissão Atual**

```javascript
console.log('Permissão:', notificationManager.permission);
// 'granted' | 'denied' | 'default'

if (notificationManager.permission !== 'granted') {
  const result = await notificationManager.requestPermission();
  console.log('Resultado:', result);
}
```

---

### 7️⃣ **Testar Localmente**

1. Abrir o site em `http://localhost:5173`
2. Aceitar permissão quando o popup aparecer
3. No console, testar:

```javascript
import { notificationManager } from '@/utils/notificationManager';

// Testar notificação
notificationManager.sendLocalNotification({
  title: 'Teste',
  body: 'Funcionando! 🎉'
});
```

---

## 🎨 **Customização do Popup**

Editar `NotificationPermissionPopup.vue`:

```vue
<template>
  <!-- Mudar texto -->
  <p class="popup-text">
    Seu texto personalizado aqui
  </p>
  
  <!-- Mudar ícone -->
  <div class="popup-icon">
    <img src="/seu-icone.png" alt="icon" />
  </div>
</template>
```

---

## 🚀 **Deploy em Produção**

1. Certificar que o `service-worker.js` está em `/public/`
2. O site DEVE ser **HTTPS** (push não funciona em HTTP)
3. Testar em diferentes browsers:
   - ✅ Chrome/Edge (Desktop + Mobile)
   - ✅ Firefox (Desktop + Mobile)
   - ✅ Safari (só iOS 16.4+)

---

## 📊 **Estatísticas de Uso**

Rastrear quantos usuários ativaram notificações:

```javascript
const onPermissionResult = (result) => {
  // Enviar para analytics
  if (result.granted) {
    sendMetaEvent('NotificationEnabled');
    // OU
    gtag('event', 'notification_permission_granted');
  }
};
```

---

**Pronto para usar! 🎉**
