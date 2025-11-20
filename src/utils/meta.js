// src/utils/meta.js
import api from '@/api'

let counter = 0
const genId = () => `mz_${Date.now()}_${++counter}_${Math.random().toString(36).substr(2, 6)}`

export const sendMetaEvent = async (eventName, params = {}, userData = {}) => {
  const eventId = genId()

  // 1. Pixel (browser) – já carregado no index.html
  if (window.fbq) {
    window.fbq('track', eventName, params, { eventID: eventId })
  }

  // 2. Conversions API (server-side) – O QUE SALVA TUDO
  try {
    await api.post('/facebook/conversion', {
      event_name: eventName,
      eventData: {
        ...params,
        url: window.location.href,
        ip: null,
        userAgent: navigator.userAgent
      },
      userData,
      event_id: eventId
    })
  } catch (err) {
    console.warn('CAPI falhou (Pixel já foi enviado)', err)
  }
}