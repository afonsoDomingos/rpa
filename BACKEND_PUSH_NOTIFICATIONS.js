// Backend Integration - Sistema de Push Notifications
// Este código vai no BACKEND (Node.js/Express)

const webpush = require('web-push');

// ==================== CONFIGURAÇÃO ====================
// Gerar chaves VAPID: npx web-push generate-vapid-keys

const VAPID_PUBLIC_KEY = 'SUA_CHAVE_PUBLICA_AQUI';
const VAPID_PRIVATE_KEY = 'SUA_CHAVE_PRIVADA_AQUI';

webpush.setVapidDetails(
    'mailto:admin@recuperaaqui.co.mz',
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY
);

// ==================== MODELO DE SUBSCRIPTION ====================
// Quando admin ativa notificações, salvar isso no DB

const subscriptionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
    endpoint: String,
    keys: {
        p256dh: String,
        auth: String
    },
    createdAt: { type: Date, default: Date.now }
});

const PushSubscription = mongoose.model('PushSubscription', subscriptionSchema);

// ==================== ENDPOINT: SALVAR SUBSCRIPTION ====================
router.post('/push/subscribe', async (req, res) => {
    try {
        const { endpoint, keys } = req.body;
        const userId = req.user._id; // Do middleware de autenticação

        // Salvar ou atualizar subscription
        await PushSubscription.findOneAndUpdate(
            { userId },
            { userId, endpoint, keys },
            { upsert: true, new: true }
        );

        res.json({ success: true, message: 'Subscription salva!' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ==================== FUNÇÃO: NOTIFICAR ADMIN ====================
async function notificarAdmin(titulo, mensagem, url = '/admin/assinaturas') {
    try {
        // Buscar todas as subscriptions do admin
        const admins = await Usuario.find({ role: 'admin' });
        const adminIds = admins.map(a => a._id);

        const subscriptions = await PushSubscription.find({
            userId: { $in: adminIds }
        });

        console.log(`📤 Enviando notificação para ${subscriptions.length} admin(s)`);

        const notificationPayload = JSON.stringify({
            title: titulo,
            body: mensagem,
            icon: '/logo.png',
            badge: '/logo.png',
            data: { url }
        });

        // Enviar para todos
        const promises = subscriptions.map(sub => {
            const pushSubscription = {
                endpoint: sub.endpoint,
                keys: {
                    p256dh: sub.keys.p256dh,
                    auth: sub.keys.auth
                }
            };

            return webpush.sendNotification(pushSubscription, notificationPayload)
                .catch(error => {
                    console.error('❌ Erro ao enviar push:', error);
                    // Se subscription inválida, remover do DB
                    if (error.statusCode === 410) {
                        PushSubscription.findByIdAndDelete(sub._id);
                    }
                });
        });

        await Promise.all(promises);
        console.log('✅ Notificações enviadas!');

    } catch (error) {
        console.error('❌ Erro ao notificar admin:', error);
    }
}

// ==================== USAR NAS ROTAS ====================

// Quando novo pagamento
router.post('/pagamentos/processar', async (req, res) => {
    try {
        // ... lógica de pagamento ...

        const pagamento = await Pagamento.create({
            usuario: req.user._id,
            pacote: req.body.pacote,
            valor: req.body.amount
        });

        // 🔔 NOTIFICAR ADMIN
        await notificarAdmin(
            '💰 Novo Pagamento!',
            `${req.user.nome} pagou ${req.body.amount} MZN - ${req.body.pacote}`,
            '/admin/assinaturas'
        );

        res.json({ sucesso: true, pagamento });
    } catch (error) {
        res.status(500).json({ sucesso: false, erro: error.message });
    }
});

// Quando assinatura próxima de expirar
async function verificarAssinaturasExpirando() {
    const tresdias = new Date();
    tresdias.setDate(tresdias.getDate() + 3);

    const expirandoEm3Dias = await Pagamento.find({
        validade: { $lte: tresdias, $gte: new Date() },
        status: 'pago'
    }).populate('usuario');

    for (const pag of expirandoEm3Dias) {
        await notificarAdmin(
            '⏰ Assinatura Expirando',
            `${pag.usuario.nome} - Expira em 3 dias`,
            '/admin/assinaturas'
        );
    }
}

// Rodar a cada hora
setInterval(verificarAssinaturasExpirando, 3600000);

// ==================== EXPORTAR ====================
module.exports = {
    notificarAdmin,
    PushSubscription
};

/* 
  ==================== COMO TESTAR ====================
  
  1. Instalar dependência:
     npm install web-push
  
  2. Gerar chaves VAPID:
     npx web-push generate-vapid-keys
  
  3. Copiar as chaves para as constantes acima
  
  4. No frontend, quando admin ativa notificações:
     - Frontend envia subscription para /push/subscribe
     - Backend salva no MongoDB
  
  5. Quando houver evento (novo pagamento):
     - Backend chama notificarAdmin()
     - Service Worker recebe e mostra notificação
     - FUNCIONA MESMO COM BROWSER FECHADO!
*/
