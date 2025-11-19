// src/plugins/metaPageView.js
export default {
  install: (app) => {
    const router = app.config.globalProperties.$router;
    if (!router || !window.fbq) {
      console.warn('Meta Pixel ou Router não encontrado');
      return;
    }

    const sendPageView = (to) => {
      window.fbq('track', 'PageView');

      const path = to.path.toLowerCase();
      let category = 'geral';
      if (path.includes('anuncie') || path.includes('anuncio')) category = 'anunciantes';
      if (path.includes('assinatur') || path.includes('pagamento')) category = 'assinaturas';

      window.fbq('track', 'ViewContent', {
        content_name: to.name || to.path,
        content_category: category,
        content_type: 'page'
      });
    };

    // Primeira carga
    sendPageView(router.currentRoute.value);

    // Toda mudança de rota (SPA)
    router.afterEach((to) => {
      setTimeout(() => sendPageView(to), 300);
    });
  }
}