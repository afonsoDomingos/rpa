// src/plugins/metaPixel.js
export default {
  install: (app) => {
    const pixelId = '1265895278678340'  // ← COLOQUE SEU PIXEL ID REAL AQUI

    // Script oficial do Meta Pixel
    !function(f,b,e,v,n,t,s)
    {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
    n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t,s)}(window, document,'script',
    'https://connect.facebook.net/en_US/fbevents.js');

    // Inicializa o Pixel
    window.fbq('init', pixelId);
    window.fbq('track', 'PageView');

    // Deixa disponível globalmente (opcional)
    app.config.globalProperties.$fbq = window.fbq;
  }
}