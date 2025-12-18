// ==================== GUIA: COMO FUNCIONA SERVICE WORKER ====================

/*
  SERVICE WORKER é um script JavaScript que roda em BACKGROUND,
  independentemente da página estar aberta ou não.
  
  É como um "robô" que fica sempre ativo escutando eventos.
*/

// ==================== ANALOGIA ====================

/*
  Imagine que você contratou um PORTEIRO para sua casa:
  
  1. Você (Frontend) dá instruções ao porteiro (Service Worker)
  2. Porteiro fica na porta 24/7, MESMO quando você está dormindo
  3. Quando chega uma encomenda (Notificação), o porteiro:
     - Bate na sua porta (Mostra notificação no sistema)
     - Entrega a encomenda quando você atende
     
  Assim funciona o Service Worker!
*/

// ==================== CICLO DE VIDA ====================

/*
  1. INSTALAÇÃO
     - Service Worker é registrado pela primeira vez
     - Browser baixa o arquivo service-worker.js
     
  2. ATIVAÇÃO
     - Service Worker assume o controle
     - Começa a interceptar eventos
     
  3. ESCUTA (Background)
     - Escuta eventos: push, notification click, sync, etc
     - Roda MESMO com browser fechado
     
  4. NOTIFICAÇÃO
     - Recebe mensagem do servidor
     - Mostra notificação nativa do SO
*/

// ==================== EXEMPLO PRÁTICO ====================

// --- NO FRONTEND (Vue/React) ---
async function registrarServiceWorker() {
    if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.register('/service-worker.js');
        console.log('✅ Service Worker registrado!');
        return registration;
    }
}

// --- NO SERVICE WORKER (service-worker.js) ---
self.addEventListener('push', (event) => {
    // Esse código roda MESMO com browser fechado!
    const data = event.data.json();

    self.registration.showNotification(data.title, {
        body: data.body,
        icon: '/logo.png',
        badge: '/badge.png'
    });
});

// --- NO BACKEND (Node.js) ---
// Envia notificação para TODOS os dispositivos do admin
function notificarAdmin(mensagem) {
    // Firebase Cloud Messaging ou Web Push Protocol
    webpush.sendNotification(adminSubscription, JSON.stringify({
        title: '💰 Novo Pagamento!',
        body: mensagem
    }));
}

// ==================== DIFERENÇA ====================

/*
  SEM Service Worker:
  - Notificações só funcionam com site aberto ❌
  - Quando fecha o browser, para tudo ❌
  
  COM Service Worker:
  - Notificações funcionam com site fechado ✅
  - Como WhatsApp Web, Gmail, Slack ✅
  - Notificação aparece no centro de notificações do SO ✅
*/

// ==================== REQUISITOS ====================

/*
  ✅ HTTPS obrigatório (ou localhost para testes)
  ✅ Browser moderno (Chrome, Firefox, Edge, Safari 16.4+)
  ✅ Permissão do usuário
  ✅ Service Worker registrado
  ✅ Backend com Web Push ou Firebase
*/

// ==================== EXEMPLO REAL ====================

/*
  GMAIL:
  1. Você fecha o Gmail
  2. Alguém te envia um email
  3. Service Worker do Gmail recebe o push
  4. 🔔 Notificação aparece: "Novo email de João"
  5. Você clica → Gmail abre direto no email
  
  NOSSO RPA:
  1. Admin fecha o site
  2. Usuário faz um pagamento
  3. Backend envia push → Service Worker
  4. 🔔 "Novo pagamento: MZN 150 de Maria"
  5. Admin clica → Abre direto na página de assinaturas
*/

// ==================== LIMITAÇÕES ====================

/*
  ❌ iOS Safari: Só funciona desde iOS 16.4+ e com o site adicionado ao Home Screen
  ✅ Android Chrome: Funciona perfeitamente
  ✅ Desktop (Windows/Mac/Linux): Funciona em todos browsers modernos
*/

export default {
    message: "Service Worker é o que permite notificações REAIS como apps nativos!"
};
