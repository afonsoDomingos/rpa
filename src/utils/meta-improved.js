// src/utils/meta.js - VERSÃO MELHORADA
import api from "@/api";

let counter = 0;
const genId = () =>
    `mz_${Date.now()}_${++counter}_${Math.random().toString(36).substr(2, 6)}`;

/**
 * Envia evento para Meta Pixel (browser) e Conversions API (servidor)
 * @param {string} eventName - Nome do evento (ex: 'Purchase', 'Lead', etc)
 * @param {object} params - Parâmetros do evento (ex: value, currency, content_name)
 * @param {object} userData - Dados do usuário (ex: email, phone, nome)
 */
export const sendMetaEvent = async (eventName, params = {}, userData = {}) => {
    const eventId = genId();

    // 1. Pixel (browser) – já carregado no index.html
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

    if (window.fbq && !isLocalhost) {
        window.fbq("track", eventName, params, { eventID: eventId });
        console.log(`[Meta Pixel] ${eventName}`, params);
    } else if (isLocalhost) {
        console.log(`[Meta Pixel] Ignorado em localhost: ${eventName}`);
    } else {
        console.warn("[Meta Pixel] fbq não está disponível");
    }

    // 2. Conversions API (server-side) – O QUE SALVA TUDO
    try {
        await api.post("/facebook/conversion", {
            event_name: eventName,
            eventData: {
                ...params,
                url: window.location.href,
                ip: null, // Será capturado no backend
                userAgent: navigator.userAgent,
            },
            userData,
            event_id: eventId,
        });
        console.log(`[CAPI] ${eventName} enviado com sucesso`);
    } catch (err) {
        console.warn(`[CAPI] Falhou para ${eventName} (Pixel já foi enviado)`, err);
    }
};

/**
 * Eventos pré-configurados para facilitar o uso
 */
export const MetaEvents = {
    // Quando usuário visualiza conteúdo
    viewContent: (contentName, contentCategory, value = 0) =>
        sendMetaEvent("ViewContent", {
            content_name: contentName,
            content_category: contentCategory,
            value,
            currency: "MZN",
        }),

    // Quando usuário adiciona ao carrinho
    addToCart: (contentName, value, quantity = 1) =>
        sendMetaEvent("AddToCart", {
            content_name: contentName,
            value,
            currency: "MZN",
            quantity,
        }),

    // Quando usuário inicia checkout
    initiateCheckout: (value, contentName) =>
        sendMetaEvent("InitiateCheckout", {
            value,
            currency: "MZN",
            content_name: contentName,
        }),

    // Quando usuário completa compra
    purchase: (value, contentName, transactionId) =>
        sendMetaEvent("Purchase", {
            value,
            currency: "MZN",
            content_name: contentName,
            transaction_id: transactionId,
        }),

    // Quando usuário se inscreve
    subscribe: (value, planName) =>
        sendMetaEvent("Subscribe", {
            value,
            currency: "MZN",
            predicted_ltv: value * 12, // Valor vitalício estimado
            content_name: planName,
        }),

    // Quando usuário gera lead
    lead: (contentName, userData = {}) =>
        sendMetaEvent("Lead", {
            content_name: contentName,
        }, userData),

    // Quando usuário completa cadastro
    completeRegistration: (method = "email") =>
        sendMetaEvent("CompleteRegistration", {
            registration_method: method,
        }),

    // Quando usuário faz busca
    search: (searchString, contentCategory = "") =>
        sendMetaEvent("Search", {
            search_string: searchString,
            content_category: contentCategory,
        }),

    // Quando usuário entra em contato
    contact: (method = "form") =>
        sendMetaEvent("Contact", {
            contact_method: method,
        }),
};

export default sendMetaEvent;
