# 🔔 PROMPT PARA IA - IMPLEMENTAR PUSH NOTIFICATIONS NO BACKEND

Copie e cole este prompt completo para a IA que vai trabalhar no backend:

---

## CONTEXTO

Estou a desenvolver uma plataforma web (Recupera Aqui - RPA) e preciso implementar um sistema de **Push Notifications** no backend Node.js/Express com MongoDB.

O objetivo é que **administradores recebam notificações nativas do sistema operativo** (como WhatsApp, Gmail) quando há eventos importantes, **MESMO com o browser fechado**.

---

## REQUISITOS TÉCNICOS

- **Backend:** Node.js + Express + MongoDB (Mongoose)
- **Autenticação:** JWT (já implementada)
- **Usuários:** Têm role (admin/user)
- **Stack atual:** API REST já funcional

---

## O QUE PRECISO QUE IMPLEMENTES

### 1️⃣ **Instalar Dependência**

```bash
npm install web-push
```

### 2️⃣ **Gerar Chaves VAPID**

Executa este comando no terminal e guarda as chaves geradas:

```bash
npx web-push generate-vapid-keys
```

Vai gerar algo como:
```
Public Key: BOxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
Private Key: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**IMPORTANTE:** Guarda estas chaves num ficheiro `.env`:

```env
VAPID_PUBLIC_KEY=BOxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
VAPID_PRIVATE_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
VAPID_EMAIL=mailto:admin@recuperaaqui.co.mz
```

### 3️⃣ **Criar Modelo de Subscription**

Cria um novo ficheiro: `models/PushSubscription.js`

```javascript
const mongoose = require('mongoose');

const pushSubscriptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
  },
  endpoint: {
    type: String,
    required: true
  },
  keys: {
    p256dh: {
      type: String,
      required: true
    },
    auth: {
      type: String,
      required: true
    }
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 7776000 // Expira em 90 dias se não for usado
  }
});

// Índice único para não duplicar subscriptions
pushSubscriptionSchema.index({ userId: 1, endpoint: 1 }, { unique: true });

module.exports = mongoose.model('PushSubscription', pushSubscriptionSchema);
```

### 4️⃣ **Criar Rotas de Push**

Cria um novo ficheiro: `routes/push.js`

```javascript
const express = require('express');
const router = express.Router();
const PushSubscription = require('../models/PushSubscription');
const { authMiddleware } = require('../middleware/auth'); // Ajustar para o teu middleware

// POST /api/push/subscribe - Salvar subscription
router.post('/subscribe', authMiddleware, async (req, res) => {
  try {
    const { endpoint, keys } = req.body;
    const userId = req.user._id;

    // Validar
    if (!endpoint || !keys || !keys.p256dh || !keys.auth) {
      return res.status(400).json({ 
        success: false, 
        message: 'Dados incompletos' 
      });
    }

    // Salvar ou atualizar
    const subscription = await PushSubscription.findOneAndUpdate(
      { userId, endpoint },
      { userId, endpoint, keys },
      { upsert: true, new: true }
    );

    console.log(`✅ Subscription salva para usuário ${userId}`);

    res.json({ 
      success: true, 
      message: 'Subscription salva com sucesso!',
      data: subscription 
    });

  } catch (error) {
    console.error('Erro ao salvar subscription:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao salvar subscription',
      error: error.message 
    });
  }
});

// GET /api/push/subscriptions - Ver minhas subscriptions (debug)
router.get('/subscriptions', authMiddleware, async (req, res) => {
  try {
    const subscriptions = await PushSubscription.find({ userId: req.user._id });
    res.json({ success: true, data: subscriptions });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/push/unsubscribe - Remover subscription
router.delete('/unsubscribe', authMiddleware, async (req, res) => {
  try {
    const { endpoint } = req.body;
    await PushSubscription.findOneAndDelete({ 
      userId: req.user._id, 
      endpoint 
    });
    res.json({ success: true, message: 'Subscription removida' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
```

### 5️⃣ **Criar Serviço de Notificações**

Cria um novo ficheiro: `services/pushNotificationService.js`

```javascript
const webpush = require('web-push');
const PushSubscription = require('../models/PushSubscription');
const Usuario = require('../models/Usuario'); // Ajustar para o teu modelo

// Configurar VAPID
webpush.setVapidDetails(
  process.env.VAPID_EMAIL || 'mailto:admin@recuperaaqui.co.mz',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

/**
 * Envia notificação push para admin(s)
 * @param {string} title - Título da notificação
 * @param {string} body - Corpo da mensagem
 * @param {string} url - URL para redirecionar ao clicar
 */
async function notificarAdmin(title, body, url = '/admin/assinaturas') {
  try {
    // Buscar todos os admins
    const admins = await Usuario.find({ role: 'admin' }); // Ajustar campo 'role'
    const adminIds = admins.map(a => a._id);

    // Buscar todas as subscriptions dos admins
    const subscriptions = await PushSubscription.find({ 
      userId: { $in: adminIds } 
    });

    if (subscriptions.length === 0) {
      console.log('⚠️ Nenhum admin com notificações ativadas');
      return;
    }

    console.log(`📤 Enviando notificação para ${subscriptions.length} admin(s)...`);

    // Payload da notificação
    const notificationPayload = JSON.stringify({
      title,
      body,
      icon: '/logo.png',
      badge: '/logo.png',
      vibrate: [200, 100, 200],
      data: { url },
      tag: 'admin-notification',
      requireInteraction: true
    });

    // Enviar para todos
    const promises = subscriptions.map(async (sub) => {
      try {
        const pushSubscription = {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.keys.p256dh,
            auth: sub.keys.auth
          }
        };

        await webpush.sendNotification(pushSubscription, notificationPayload);
        console.log(`✅ Notificação enviada para ${sub.userId}`);

      } catch (error) {
        console.error(`❌ Erro ao enviar para ${sub.userId}:`, error.message);
        
        // Se subscription inválida/expirada, remover
        if (error.statusCode === 404 || error.statusCode === 410) {
          await PushSubscription.findByIdAndDelete(sub._id);
          console.log(`🗑️ Subscription inválida removida: ${sub._id}`);
        }
      }
    });

    await Promise.all(promises);
    console.log('✅ Processo de notificação concluído!');

  } catch (error) {
    console.error('❌ Erro ao notificar admin:', error);
  }
}

/**
 * Envia notificação para um usuário específico
 */
async function notificarUsuario(userId, title, body, url = '/') {
  try {
    const subscriptions = await PushSubscription.find({ userId });
    
    if (subscriptions.length === 0) {
      console.log(`⚠️ Usuário ${userId} não tem notificações ativadas`);
      return;
    }

    const notificationPayload = JSON.stringify({
      title,
      body,
      icon: '/logo.png',
      badge: '/logo.png',
      data: { url }
    });

    for (const sub of subscriptions) {
      try {
        await webpush.sendNotification({
          endpoint: sub.endpoint,
          keys: sub.keys
        }, notificationPayload);
      } catch (error) {
        if (error.statusCode === 404 || error.statusCode === 410) {
          await PushSubscription.findByIdAndDelete(sub._id);
        }
      }
    }

  } catch (error) {
    console.error('Erro ao notificar usuário:', error);
  }
}

module.exports = {
  notificarAdmin,
  notificarUsuario
};
```

### 6️⃣ **Integrar nas Rotas Existentes**

No ficheiro onde processas pagamentos (ex: `routes/pagamentos.js`), adiciona:

```javascript
const { notificarAdmin } = require('../services/pushNotificationService');

// No endpoint POST /api/pagamentos/processar
router.post('/processar', authMiddleware, async (req, res) => {
  try {
    // ... tua lógica de pagamento ...
    
    const pagamento = await Pagamento.create({
      usuario: req.user._id,
      pacote: req.body.pacote,
      valor: req.body.amount,
      metodoPagamento: req.body.method
      // ... outros campos
    });

    // 🔔 ENVIAR NOTIFICAÇÃO PARA ADMIN
    await notificarAdmin(
      '💰 Novo Pagamento!',
      `${req.user.nome} pagou ${req.body.amount} MZN - Pacote ${req.body.pacote}`,
      '/admin/assinaturas'
    );

    res.json({ sucesso: true, pagamento });

  } catch (error) {
    res.status(500).json({ sucesso: false, erro: error.message });
  }
});
```

### 7️⃣ **Registrar Rotas no App Principal**

No `server.js` ou `app.js`:

```javascript
const pushRoutes = require('./routes/push');

// Depois das outras rotas
app.use('/api/push', pushRoutes);
```

### 8️⃣ **ENVIAR CHAVE PÚBLICA PARA O FRONTEND**

Adiciona um endpoint para o frontend buscar a chave pública:

```javascript
// Em routes/push.js
router.get('/vapid-key', (req, res) => {
  res.json({ 
    success: true, 
    publicKey: process.env.VAPID_PUBLIC_KEY 
  });
});
```

---

## TESTES

### Testar se está a funcionar:

1. **Registar subscription:**
```bash
curl -X POST http://localhost:3000/api/push/subscribe \
  -H "Authorization: Bearer SEU_TOKEN_JWT" \
  -H "Content-Type: application/json" \
  -d '{
    "endpoint": "https://fcm.googleapis.com/fcm/send/...",
    "keys": {
      "p256dh": "...",
      "auth": "..."
    }
  }'
```

2. **Testar notificação manualmente:**
```javascript
// Criar um endpoint de teste
router.post('/test', authMiddleware, async (req, res) => {
  await notificarAdmin(
    'Teste',
    'Esta é uma notificação de teste!',
    '/'
  );
  res.json({ success: true, message: 'Notificação enviada!' });
});
```

---

## IMPORTANTE - SEGURANÇA

- ✅ Nunca expor `VAPID_PRIVATE_KEY` no frontend
- ✅ Usar HTTPS em produção (push não funciona em HTTP)
- ✅ Validar autorizações (só admin pode receber notificações admin)
- ✅ Rate limiting nas rotas de push

---

## RESUMO DO QUE IMPLEMENTAR

1. [ ] Instalar `web-push`
2. [ ] Gerar chaves VAPID e guardar no `.env`
3. [ ] Criar modelo `PushSubscription`
4. [ ] Criar rotas `/api/push/*`
5. [ ] Criar service `pushNotificationService.js`
6. [ ] Integrar `notificarAdmin()` nas rotas de pagamento
7. [ ] Expor endpoint `/api/push/vapid-key`
8. [ ] Testar!

---

Implementa tudo isso e depois confirma que está funcional. O frontend já está pronto e vai conectar automaticamente assim que o backend estiver ativo.
