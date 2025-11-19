// src/plugins/facebookTracking.js
export const useFacebookTracking = () => {
  const track = (eventName, data = {}) => {
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', eventName, data)
    }
  }

  const generateEventId = () => {
    return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  return { track, generateEventId }
}