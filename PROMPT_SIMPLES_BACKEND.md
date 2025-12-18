# PROMPT PARA IA - Adicionar Push Notifications ao Backend Existente

---

Tenho um backend Node.js + Express + MongoDB já funcional. Preciso adicionar **Push Notifications** para que administradores recebam notificações nativas do sistema (como WhatsApp) quando há novos pagamentos, **mesmo com o browser fechado**.

## O QUE PRECISO

### 1. Instalar dependência
```bash
npm install web-push
```

### 2. Gerar chaves VAPID
```bash
npx web-push generate-vapid-keys
```
Guardar as chaves geradas no `.env`:
```env
VAPID_PUBLIC_KEY=...
VAPID_PRIVATE_KEY=...
VAPID_EMAIL=mailto:admin@recuperaaqui.co.mz
```

### 3. Criar modelo `PushSubscription`
Preciso de um modelo MongoDB que guarde as subscriptions dos usuários:
- `userId` (ref para Usuario)
- `endpoint` (String)
- `keys.p256dh` (String)
- `keys.auth` (String)
- `createdAt` (Date, expires em 90 dias)

### 4. Criar rotas `/api/push`
- `POST /api/push/subscribe` - Salvar subscription do frontend
- `GET /api/push/vapid-key` - Retornar chave pública para o frontend
- `DELETE /api/push/unsubscribe` - Remover subscription

### 5. Criar função `notificarAdmin(title, body, url)`
Uma função helper que:
- Busca todos os usuários com `role: 'admin'`
- Busca suas subscriptions
- Envia notificação push para todos usando `web-push`
- Remove subscriptions inválidas (erro 404/410)

### 6. Integrar na rota de pagamentos
No endpoint que processa pagamentos, depois de criar o pagamento com sucesso, chamar:
```javascript
await notificarAdmin(
  '💰 Novo Pagamento!',
  `${usuario.nome} pagou ${valor} MZN - ${pacote}`,
  '/admin/assinaturas'
);
```

## CONFIGURAÇÃO WEB-PUSH

```javascript
const webpush = require('web-push');

webpush.setVapidDetails(
  process.env.VAPID_EMAIL,
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);
```

## PAYLOAD DA NOTIFICAÇÃO

```javascript
{
  title: 'Título',
  body: 'Mensagem',
  icon: '/logo.png',
  badge: '/logo.png',
  data: { url: '/pagina' },
  requireInteraction: true
}
```

## IMPORTANTE
- Endpoint deve ter autenticação JWT
- Só admins devem receber notificações admin
- Backend deve estar em HTTPS em produção
- Expor a `VAPID_PUBLIC_KEY` via endpoint `/api/push/vapid-key`

---

Implementa isso no meu backend Node.js + Express + MongoDB existente. Usa as convenções e estrutura que já tenho (middleware de auth, modelos Mongoose, etc).
