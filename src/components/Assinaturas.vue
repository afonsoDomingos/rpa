<template>
  <div class="container-fluid position-sticky z-index-sticky top-0 px-0">
    <div class="row gx-0">
      <div class="col-12">
        <NavbarDefault :sticky="true" />
      </div>
    </div>
  </div>

  <div class="subscription-container pt-5">
    <header class="header">
      <div class="container d-flex flex-column align-items-start">
        <button @click="goBack" class="back-button mb-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
          Voltar
        </button>
        <h1 class="title">Escolha seu Plano</h1>
      </div>
    </header>

    <div class="content-wrapper">
      <main class="main-content">
        <!-- Passo 1: Pacotes -->
        <div v-if="currentStep === 1" class="packages-grid">
          <div
            v-for="pkg in packages"
            :key="pkg.id"
            :class="[
              'package-card',
              {
                selected: selectedPackage?.id === pkg.id,
                recommended: pkg.recommended,
                popular: pkg.id === 'mensal',
                'trial-card': pkg.id === 'teste'
              },
            ]"
            @click="selectPackage(pkg)"
          >
            <div v-if="pkg.recommended" class="recommended-badge">
              Recomendado
            </div>
            <div v-if="pkg.id === 'mensal'" class="popular-badge">
              Mais Popular
            </div>
            <h3 class="package-name">{{ pkg.name }}</h3>
            <div class="package-price">
              <span v-if="pkg.price > 0" class="currency">MZN</span>
              <span class="amount">{{
                pkg.price > 0 ? pkg.price.toLocaleString("pt-MZ") : "Gratuito"
              }}</span>
              <span v-if="pkg.price > 0" class="period">{{ pkg.period }}</span>
              <span v-else class="period">/ 5 dias</span>
            </div>
            <ul class="benefits-list">
              <li
                v-for="(benefit, index) in pkg.benefits"
                :key="index"
                class="benefit-item"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="check-icon"
                >
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                {{ benefit }}
              </li>
            </ul>
            <button
              :class="[
                'select-button',
                { selected: selectedPackage?.id === pkg.id },
              ]"
              @click.stop="selectPackage(pkg)"
            >
              {{
                selectedPackage?.id === pkg.id ? "Selecionado" : (pkg.id === 'teste' ? "Começar Grátis" : "Selecionar")
              }}
            </button>
          </div>
        </div>

        <!-- Rodapé de Confiança -->
        <div v-if="currentStep === 1" class="trust-footer mt-5 text-center animate-fade-in">
          <p class="text-muted small mb-3"><i class="bi bi-shield-lock-fill me-2"></i> Pagamento 100% Seguro & Encriptado</p>
          <div class="d-flex justify-content-center align-items-center gap-4 opacity-75">
            <img :src="mpesaIcon" alt="M-Pesa" height="25" />
            <img :src="emolaIcon" alt="Emola" height="25" />
            <div class="d-flex gap-2 text-white fs-4">
              <i class="bi bi-credit-card-2-front"></i>
              <i class="bi bi-visa"></i>
              <i class="bi bi-mastercard"></i>
            </div>
          </div>
        </div>

        <!-- Secção FAQ -->
        <section class="faq-section mt-6 pb-5 px-3 px-lg-0">
          <div class="container maxWidth-md mx-auto">
            <h2 class="section-title text-center mb-5 mt-5">Dúvidas Frequentes</h2>
            <div class="accordion" id="accordionFAQ">
              <div v-for="(item, index) in faqItems" :key="index" class="accordion-item bg-transparent border-0 mb-3">
                <h2 class="accordion-header">
                  <button 
                    class="accordion-button collapsed rounded-4 shadow-sm" 
                    type="button" 
                    data-bs-toggle="collapse" 
                    :data-bs-target="'#faq' + index" 
                    aria-expanded="false"
                  >
                    {{ item.pergunta }}
                  </button>
                </h2>
                <div :id="'faq' + index" class="accordion-collapse collapse" data-bs-parent="#accordionFAQ">
                  <div class="accordion-body text-light opacity-8 ps-4 border-start border-purple-light ms-3 mt-2">
                    {{ item.resposta }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Passo 2: Pagamento -->
        <div v-if="currentStep === 2" class="payment-methods">
          <h2 class="section-title">Escolha o Método de Pagamento</h2>
          <div class="payment-methods-grid">
            <button
              v-for="method in paymentMethods"
              :key="method.id"
              :class="[
                'payment-method-card',
                { selected: selectedPaymentMethod === method.id },
              ]"
              @click="selectPaymentMethod(method.id)"
            >
              <img
                v-if="method.img"
                :src="method.img"
                class="payment-method-icon-img"
              />
              <i
                v-else
                :class="method.iconClass"
                class="payment-method-icon"
              ></i>
              <span class="payment-method-name">{{ method.name }}</span>
            </button>
          </div>

          <form
            v-if="selectedPaymentMethod"
            @submit.prevent="handleSubmit"
            class="form"
          >
            <!-- M-Pesa / Emola -->
            <div
              v-if="['mpesa', 'emola'].includes(selectedPaymentMethod)"
              class="form-group phone-input-group"
            >
              <label class="form-label"
                >Número
                {{
                  selectedPaymentMethod === "mpesa" ? "M-Pesa" : "Emola"
                }}</label
              >
              <input
                ref="phoneInput"
                v-model="mobileDetails.phone"
                type="tel"
                inputmode="numeric"
                autocomplete="tel"
                :placeholder="
                  selectedPaymentMethod === 'mpesa'
                    ? '84 123 4567'
                    : '86 123 4567'
                "
                required
                class="form-input"
                @focus="onInputFocus"
                @blur="onInputBlur"
                @input="debouncedNormalize"
              />
            </div>

            <!-- CARTÃO — VERSÃO 100% GARANTIDA -->
            <div
              v-if="selectedPaymentMethod === 'card'"
              class="stripe-container"
            >
              <!-- Este div tem que estar vazio e visível -->
              <div id="payment-element" style="min-height: 380px"></div>

              <!-- Mensagem de erro do Stripe -->
              <div
                id="payment-message"
                class="error-message"
                v-show="stripeError"
              >
                {{ stripeError }}
              </div>
            </div>

            <p class="form-hint">
              {{
                selectedPaymentMethod === "card"
                  ? "Preencha os dados do cartão acima."
                  : "Você receberá uma notificação no seu telefone."
              }}
            </p>

            <button type="submit" :disabled="loading" class="submit-button">
              <span v-if="loading" class="spinner"></span>
              {{ loading ? "Processando..." : "Enviar Pedido" }}
            </button>
          </form>

          <!-- Erro geral -->
          <div v-if="errorMessage" class="error-message">
            {{ errorMessage }}
            <div class="error-actions">
              <button @click="retryPayment" class="retry-button">
                Tentar Novamente
              </button>
              <button @click="contactSupport" class="support-button">
                Contactar Suporte
              </button>
            </div>
          </div>
        </div>

        <!-- Sucesso -->
        <div v-if="showSuccess" class="success-message">
          <div class="success-icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <path d="m9 11 3 3L22 4" />
            </svg>
          </div>
          <h2 class="success-title">Ativado!</h2>
          <p class="success-text">
            {{
              selectedPackage?.id === "teste"
                ? "Seu período de teste de 5 dias foi ativado!"
                : "Sua assinatura foi ativada com sucesso."
            }}
          </p>
          <button @click="goToHome" class="home-button">
            Voltar à Página Inicial
          </button>
        </div>
      </main>

      <!-- RESUMO DESKTOP -->
      <aside
        class="order-summary-desktop"
        v-if="selectedPackage && currentStep < 3"
      >
        <h3 class="summary-title">Resumo do Pedido</h3>
        <div class="summary-section">
          <div class="summary-label">Plano Selecionado</div>
          <div class="summary-value">{{ selectedPackage.name }}</div>
        </div>
        <div v-if="selectedPaymentMethod" class="summary-section">
          <div class="summary-label">Método de Pagamento</div>
          <div class="summary-value">
            {{
              paymentMethods.find((m) => m.id === selectedPaymentMethod)?.name
            }}
          </div>
        </div>
        <div class="summary-divider"></div>
        <div class="summary-total">
          <span class="total-label">Total</span>
          <span class="total-amount"
            >MZN {{ selectedPackage.price.toLocaleString("pt-MZ") }}</span
          >
        </div>
        <button
          v-if="currentStep === 1"
          @click="nextStep"
          class="continue-button"
        >
          Continuar
        </button>
        <button
          v-if="currentStep === 2"
          @click="previousStep"
          class="back-step-button"
        >
          Voltar
        </button>
      </aside>
    </div>

    <!-- RESUMO MOBILE -->
    <aside
      class="order-summary-mobile"
      v-if="selectedPackage && !inputFocused && currentStep < 3 && isMobile"
    >
      <div class="summary-content">
        <div class="summary-row">
          <span class="summary-label">Plano</span>
          <span class="summary-value">{{ selectedPackage.name }}</span>
        </div>
        <div v-if="selectedPaymentMethod" class="summary-row">
          <span class="summary-label">Pagamento</span>
          <span class="summary-value">{{
            paymentMethods.find((m) => m.id === selectedPaymentMethod)?.name
          }}</span>
        </div>
        <div class="summary-total">
          <span class="total-label">Total</span>
          <span class="total-amount"
            >MZN {{ selectedPackage.price.toLocaleString("pt-MZ") }}</span
          >
        </div>
      </div>
      <div class="summary-actions">
        <button
          v-if="currentStep === 1"
          @click="nextStep"
          class="continue-button"
        >
          Continuar
        </button>
        <button
          v-if="currentStep === 2"
          @click="previousStep"
          class="back-step-button"
        >
          Voltar
        </button>
      </div>
    </aside>
  </div>
  <FooterDefault />
</template>

<script setup>
import { ref, reactive, nextTick, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import NavbarDefault from "../examples/navbars/NavbarDefault.vue";
import FooterDefault from "../examples/footers/FooterDefault.vue";
import api from "@/api";
import mpesaIcon from "@/assets/img/Mpesa.png";
import emolaIcon from "@/assets/img/Emola.png";
import { sendMetaEvent } from "@/utils/meta";

const router = useRouter();

// ==================== ESTADO GERAL ====================
const currentStep = ref(1);
const selectedPackage = ref(null);
const selectedPaymentMethod = ref(null);
const loading = ref(false);
const showSuccess = ref(false);
const errorMessage = ref("");
const stripeError = ref("");

const phoneInput = ref(null);
const inputFocused = ref(false);
const isMobile = ref(false);

// ==================== STRIPE (variáveis globais) ====================
let stripe = null;
let elements = null;
let paymentElement = null; // agora guardamos a referência

// ==================== DADOS ====================
const packages = [
  {
    id: "teste",
    name: "Teste",
    price: 0,
    period: "/ 5 dias",
    benefits: [
      "Busca de documentos ilimitada",
      "Registar achados (sempre grátis)",
      "Guia de Documentos (resumo)",
      "Ver anúncios da comunidade"
    ],
    recommended: false,
  },
  {
    id: "mensal",
    name: "Mensal",
    price: 150,
    period: "/mês",
    benefits: [
      "Alertas via SMS/Push em tempo real",
      "Gerador de CV Profissional (Ilimitado)",
      "Cofre Digital Seguro (3 GB)",
      "Guia Completo + Chat de Apoio",
      "Prioridade em pedidos de documentos"
    ],
    recommended: true,
  },
  {
    id: "anual",
    name: "Anual",
    price: 1500,
    period: "/ano",
    benefits: [
      "Tudo do Plano Premium",
      "Assistência Pessoal na Recuperação",
      "Cofre Digital Seguro (10 GB)",
      "Anúncios com Destaque Máximo",
      "Suporte VIP 24/7 (WhatsApp)"
    ],
    recommended: false,
  },
];

const paymentMethods = [
  { id: "mpesa", name: "M-Pesa", img: mpesaIcon },
  { id: "emola", name: "Emola", img: emolaIcon },
  { id: "card", name: "Cartão", iconClass: "bi bi-credit-card" },
];

const mobileDetails = reactive({ phone: "" });

const faqItems = [
  {
    pergunta: "Como funciona a ativação do plano?",
    resposta: "A ativação é automática e instantânea no momento em que o pagamento é confirmado. Para M-Pesa e e-Mola, receberá um pedido de PIN no seu telemóvel."
  },
  {
    pergunta: "Posso cancelar a minha subscrição?",
    resposta: "Sim, pode cancelar a renovação automática a qualquer momento nas configurações da sua conta, sem taxas adicionais."
  },
  {
    pergunta: "O que é o Cofre Digital?",
    resposta: "É um espaço seguro e encriptado onde pode guardar cópias digitais dos seus documentos importantes, acessíveis apenas por si a qualquer momento."
  },
  {
    pergunta: "O pagamento é seguro?",
    resposta: "Sim, utilizamos protocolos de segurança bancária e não armazenamos os seus dados sensíveis. Todo o processamento é feito por entidades certificadas (GAPI, MOZAL, Stripe)."
  }
];

// ==================== FUNÇÕES AUXILIARES ====================
const normalizePhone = (raw) => {
  const cleaned = raw.replace(/[\s\-\(\)\+]/g, "");
  if (/^(84|85|86|87)\d{7}$/.test(cleaned)) return "258" + cleaned;
  if (/^258\d{9}$/.test(cleaned)) return cleaned;
  return null;
};

let debounceTimer;
const debouncedNormalize = () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    if (mobileDetails.phone) {
      const norm = normalizePhone(mobileDetails.phone);
      if (norm) mobileDetails.phone = norm.slice(3);
    }
  }, 600);
};

const onInputFocus = async () => {
  if (isMobile.value) {
    inputFocused.value = true;
    await nextTick();
    const input = phoneInput.value;
    if (input) input.scrollIntoView({ behavior: "smooth", block: "center" });
  }
};
const onInputBlur = () => {
  inputFocused.value = false;
};

const selectPackage = (pkg) => {
  selectedPackage.value = pkg;
  errorMessage.value = "";
  stripeError.value = "";
};

const selectPaymentMethod = (id) => {
  selectedPaymentMethod.value = id;
  errorMessage.value = "";
  stripeError.value = "";
};

const goToHome = () => router.push("/home");
const retryPayment = () => {
  errorMessage.value = "";
  stripeError.value = "";
  loading.value = false;
};
const contactSupport = () => (window.location.href = "tel:258847877405");

const nextStep = async () => {
  if (!selectedPackage.value) {
    errorMessage.value = "Selecione um pacote.";
    return;
  }

  await sendMetaEvent("InitiateCheckout", {
    value: selectedPackage.value.price,
    currency: "MZN",
    num_items: 1,
    content_ids: [selectedPackage.value.id],
    content_name: selectedPackage.value.name,
  });

  if (selectedPackage.value.id === "teste") {
    await ativarPlanoTeste();
    return;
  }
  currentStep.value = 2;
};

const previousStep = () => {
  currentStep.value = 1;
  selectedPaymentMethod.value = null;
};

const goBack = () => {
  if (currentStep.value === 2) previousStep();
  else window.history.back();
};

// ==================== PLANO DE TESTE ====================
const ativarPlanoTeste = async () => {
  loading.value = true;
  try {
    const res = await api.post(
      "/pagamentos/processar",
      {
        pacote: "teste",
        method: "teste",
        amount: 0,
        type: "assinatura",
      },
      { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
    );

    if (res.data.sucesso) {
      await sendMetaEvent("Subscribe", {
        value: 0,
        currency: "MZN",
        content_ids: ["teste"],
        content_name: "Plano de Teste",
      });
      
      // Redireciona para página de sucesso
      await router.push({
        name: 'PagamentoSucesso',
        query: {
          plano: 'Plano de Teste',
          valor: 0,
          metodo: 'Teste Grátis',
          msg: 'Seu período de teste de 5 dias foi ativado!'
        },
        replace: true
      });
    } else {
      errorMessage.value = res.data.mensagem || "Erro ao ativar teste.";
    }
  } catch (err) {
    errorMessage.value = "Erro de conexão.";
  } finally {
    loading.value = false;
  }
};

// ==================== STRIPE – VERSÃO QUE NUNCA FALHA ====================
const loadStripe = async () => {
  if (stripe && paymentElement) return;

  await nextTick();
  const container = document.getElementById("payment-element");
  if (!container) {
    stripeError.value = "Erro: formulário não encontrado.";
    return;
  }

  try {
    // Carrega Stripe.js se ainda não estiver
    if (!window.Stripe) {
      await new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = "https://js.stripe.com/v3/";
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
    }

    // Cria PaymentIntent
    const { data } = await api.post(
      "/stripe/create-payment-intent",
      {
        amount: selectedPackage.value.price,
        pacote: selectedPackage.value.id,
        type: "assinatura",
      },
      {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      }
    );

    stripe = window.Stripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
    elements = stripe.elements({ clientSecret: data.clientSecret });

    paymentElement = elements.create("payment", {
      layout: "tabs",
      defaultValues: { billingDetails: { name: "Cliente RPA" } },
    });

    paymentElement.mount(container);
    console.log("FORMULÁRIO STRIPE MONTADO COM SUCESSO!");
  } catch (err) {
    console.error("Erro fatal no Stripe:", err);
    stripeError.value = "Falha ao carregar cartão. Tente novamente.";
  }
};

// Watch 100% confiável
watch(selectedPaymentMethod, async (newVal) => {
  if (newVal === "card") {
    await loadStripe();
  } else {
    // Limpa tudo se trocar de método
    if (paymentElement) paymentElement.unmount();
    if (elements) elements = null;
    stripe = null;
    paymentElement = null;
    const el = document.getElementById("payment-element");
    if (el) el.innerHTML = "";
  }
});

// ==================== SUBMISSÃO FINAL ====================
const handleSubmit = async () => {
  errorMessage.value = "";
  stripeError.value = "";

  if (!selectedPackage.value || !selectedPaymentMethod.value) {
    errorMessage.value = "Selecione pacote e método.";
    return;
  }

  loading.value = true;

  if (selectedPaymentMethod.value === "card") {
    if (!stripe || !elements || !paymentElement) {
      errorMessage.value = "Formulário de cartão não carregou.";
      loading.value = false;
      return;
    }

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/assinaturas?sucesso=cartao`,
      },
    });

    if (error) {
      stripeError.value = error.message || "Pagamento recusado.";
      errorMessage.value = error.message || "Pagamento recusado.";
    }
    loading.value = false;
    return;
  }

  // M-Pesa / Emola (igual)
  let finalPhone = null;
  if (["mpesa", "emola"].includes(selectedPaymentMethod.value)) {
    finalPhone = normalizePhone(mobileDetails.phone);
    if (!finalPhone) {
      errorMessage.value = "Número de telefone inválido.";
      loading.value = false;
      return;
    }
  }

  try {
    const payload = {
      pacote: selectedPackage.value.id,
      method: selectedPaymentMethod.value,
      phone: finalPhone,
      amount: selectedPackage.value.price,
      type: "assinatura",
    };

    const res = await api.post("/pagamentos/processar", payload, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });

    if (res.data.sucesso) {
      await sendMetaEvent("Subscribe", {
        value: selectedPackage.value.price,
        currency: "MZN",
      });
      
      // Redireciona para página de sucesso
      const metodoNome = paymentMethods.find(m => m.id === selectedPaymentMethod.value)?.name || selectedPaymentMethod.value;
      await router.push({
        name: 'PagamentoSucesso',
        query: {
          plano: selectedPackage.value.name,
          valor: selectedPackage.value.price,
          metodo: metodoNome,
          msg: 'Sua assinatura foi ativada com sucesso!'
        },
        replace: true
      });
    } else {
      errorMessage.value = res.data.mensagem || "Pagamento não concluído.";
    }
  } catch (err) {
    errorMessage.value = "Erro de conexão. Tente novamente.";
  } finally {
    loading.value = false;
  }
};

// ==================== ON MOUNTED ====================
onMounted(() => {
  isMobile.value = window.innerWidth <= 1024;
  window.addEventListener("resize", () => {
    isMobile.value = window.innerWidth <= 1024;
  });

  const params = new URLSearchParams(window.location.search);
  if (params.get("sucesso") === "cartao") {
    // Redireciona para página de sucesso após retorno do Stripe
    router.replace({
      name: 'PagamentoSucesso',
      query: {
        plano: selectedPackage.value?.name || 'Assinatura',
        valor: selectedPackage.value?.price || 0,
        metodo: 'Cartão de Crédito',
        msg: 'Pagamento com cartão confirmado!'
      }
    });
  }
});
</script>

<style scoped>
@import "bootstrap-icons/font/bootstrap-icons.css";
@import "@fontsource/poppins/500.css";
@import "@fontsource/poppins/600.css";
@import "@fontsource/poppins/700.css";

.payment-method-icon-img {
  width: 48px;
  height: auto;
}
.payment-method-icon {
  font-size: 2.5rem;
  color: #ffffff;
}
.title,
.package-name,
.summary-title,
.section-title,
.success-title {
  font-family: "Poppins", sans-serif !important;
}

* {
  box-sizing: border-box;
}

.subscription-container {
  min-height: 100vh;
  background: linear-gradient(to bottom, #0a0a0a, #1a1a1a);
  color: #ffffff;
  font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI",
    sans-serif;
  scroll-padding-bottom: 300px;
  padding-bottom: env(safe-area-inset-bottom);
}

.header {
  padding: 1.5rem 2rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}
.back-button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: transparent;
  border: none;
  color: #a0a0a0;
  cursor: pointer;
  font-size: 0.875rem;
  padding: 0.5rem 0;
  transition: color 0.2s;
}
.back-button:hover {
  color: #ffffff;
}

.title {
  font-size: 2rem;
  font-weight: 700;
  margin: 1rem 0 0 0;
  background: linear-gradient(to right, #ffffff, #a0a0a0);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.content-wrapper {
  display: flex;
  gap: 2rem;
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
  padding-bottom: calc(140px + env(safe-area-inset-bottom));
}

.main-content {
  flex: 1;
  min-width: 0;
}

.packages-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.package-card {
  position: relative;
  background: #1a1a1a;
  border: 2px solid transparent;
  border-radius: 1rem;
  padding: 2rem;
  cursor: pointer;
  transition: all 0.3s ease;
}
.package-card:hover {
  border-color: #800080;
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(128, 0, 128, 0.2);
}
.package-card.selected {
  border-color: #800080;
  background: linear-gradient(
    135deg,
    rgba(128, 0, 128, 0.1),
    rgba(128, 0, 128, 0.05)
  );
}
.package-card.recommended {
  border-color: #14b8a6;
}

.recommended-badge {
  position: absolute;
  top: -12px;
  right: 1rem;
  background: linear-gradient(135deg, #14b8a6, #0d9488);
  color: #ffffff;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.package-name {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 1rem 0;
  color: #ffffff;
}
.package-price {
  display: flex;
  align-items: baseline;
  gap: 0.25rem;
  margin-bottom: 1.5rem;
}
.currency,
.period {
  font-size: 1rem;
  color: #a0a0a0;
}
.amount {
  font-size: 2.5rem;
  font-weight: 700;
  color: #ffffff;
}

.benefits-list {
  list-style: none;
  padding: 0;
  margin: 0 0 2rem 0;
}
.benefit-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0;
  color: #d0d0d0;
  font-size: 0.875rem;
}
.check-icon {
  color: #14b8a6;
  flex-shrink: 0;
}

.select-button {
  width: 100%;
  padding: 0.875rem;
  background: #800080;
  color: #ffffff;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.select-button:hover {
  background: #9900cc;
  transform: scale(1.02);
}
.select-button.selected {
  background: #14b8a6;
}

.payment-methods {
  max-width: 600px;
}
.section-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 1.5rem 0;
  color: #ffffff;
}
.payment-methods-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.payment-method-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 1.5rem;
  background: #1a1a1a;
  border: 2px solid transparent;
  border-radius: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
}
.payment-method-card:hover {
  border-color: #800080;
}
.payment-method-card.selected {
  border-color: #800080;
  background: rgba(128, 0, 128, 0.1);
}

.payment-method-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: #ffffff;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}
.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}
.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.form-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #d0d0d0;
}

.form-input {
  padding: 0.875rem;
  background: #0a0a0a;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  color: #ffffff;
  font-size: 1.1rem;
  transition: all 0.2s;
  margin-bottom: 1rem;
}
.form-input:focus {
  outline: none;
  border-color: #800080;
  box-shadow: 0 0 0 3px rgba(128, 0, 128, 0.1);
}

.form-hint {
  font-size: 0.875rem;
  color: #a0a0a0;
  margin: 0;
}

.submit-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem;
  background: #800080;
  color: #ffffff;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
}
.submit-button:hover:not(:disabled) {
  background: #9900cc;
  transform: scale(1.02);
}
.submit-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #ffffff;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.success-message {
  text-align: center;
  padding: 3rem;
}
.success-icon {
  display: inline-flex;
  padding: 1.5rem;
  background: rgba(20, 184, 166, 0.1);
  border-radius: 50%;
  margin-bottom: 1.5rem;
}
.success-icon svg {
  color: #14b8a6;
}
.success-title {
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  color: #ffffff;
}
.success-text {
  font-size: 1.125rem;
  color: #a0a0a0;
  margin: 0 0 1.5rem 0;
}

.home-button {
  padding: 0.875rem 2rem;
  background: #14b8a6;
  color: #ffffff;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
}
.home-button:hover {
  background: #0d9488;
  transform: scale(1.02);
}

.error-message {
  padding: 1rem;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 0.5rem;
  color: #ef4444;
  margin-top: 1rem;
  font-size: 0.875rem;
}
.error-actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 1rem;
}
.retry-button,
.support-button {
  flex: 1;
  padding: 0.75rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.retry-button {
  background: #800080;
  color: #ffffff;
  border: none;
}
.retry-button:hover {
  background: #9900cc;
}
.support-button {
  background: transparent;
  color: #ef4444;
  border: 1px solid #ef4444;
}
.support-button:hover {
  background: rgba(239, 68, 68, 0.1);
}

/* RESUMO DESKTOP */
.order-summary-desktop {
  width: 350px;
  background: #1a1a1a;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 1rem;
  padding: 2rem;
  height: fit-content;
  position: sticky;
  top: 2rem;
  flex-shrink: 0;
}
.summary-title {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0 0 1.5rem 0;
  color: #ffffff;
}
.summary-section {
  margin-bottom: 1.5rem;
}
.summary-label {
  font-size: 0.875rem;
  color: #a0a0a0;
  margin-bottom: 0.25rem;
}
.summary-value {
  font-size: 1rem;
  font-weight: 600;
  color: #ffffff;
}
.summary-divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.1);
  margin: 1.5rem 0;
}
.summary-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}
.total-label {
  font-size: 1rem;
  font-weight: 600;
  color: #d0d0d0;
}
.total-amount {
  font-size: 1.5rem;
  font-weight: 700;
  color: #ffffff;
}

.order-summary-mobile {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #1a1a1a;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding: 1rem;
  padding-bottom: calc(1rem + env(safe-area-inset-bottom));
  z-index: 1000;
  box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.3);
  transition: transform 0.3s ease;
}

.summary-content {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}
.summary-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
}
.summary-row .summary-label {
  color: #a0a0a0;
}
.summary-row .summary-value {
  color: #ffffff;
  font-weight: 600;
}
.summary-total {
  display: flex;
  justify-content: space-between;
  font-weight: 600;
  font-size: 1.125rem;
  margin-top: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}
.summary-actions {
  display: flex;
  gap: 0.5rem;
}
.summary-actions button {
  flex: 1;
  padding: 0.875rem;
  border-radius: 0.5rem;
  font-weight: 600;
  font-size: 0.875rem;
}

.continue-button {
  background: #800080;
  color: #ffffff;
  border: none;
}
.continue-button:hover {
  background: #9900cc;
  transform: scale(1.02);
}
.back-step-button {
  background: transparent;
  color: #a0a0a0;
  border: 1px solid rgba(255, 255, 255, 0.1);
}
.back-step-button:hover {
  color: #ffffff;
  border-color: rgba(255, 255, 255, 0.3);
}

@media (max-width: 1024px) {
  .content-wrapper {
    flex-direction: column;
    padding: 1.5rem;
    padding-bottom: 300px;
  }
  .order-summary-desktop {
    display: none;
  }
}

@media (max-width: 640px) {
  .content-wrapper {
    padding: 1rem;
    padding-bottom: 320px;
  }
  .packages-grid,
  .payment-methods-grid,
  .form-row {
    grid-template-columns: 1fr;
  }
  .title {
    font-size: 1.5rem;
  }
  .package-card {
    padding: 1.5rem;
  }
  .form-input {
    font-size: 1.2rem;
  }
}

/* Novos Estilos Premium */
.popular-badge {
  position: absolute;
  top: -12px;
  right: 1rem;
  background: linear-gradient(135deg, #800080, #bf00bf);
  color: white;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: 0 4px 12px rgba(128, 0, 128, 0.4);
  z-index: 2;
}

.package-card.popular {
  border-color: rgba(128, 0, 128, 0.5);
  transform: scale(1.02);
  z-index: 1;
}

.package-card.popular:hover {
  border-color: #800080;
}

.trial-card {
  border: 2px dashed rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.03);
}

.trial-card:hover {
  border-style: solid;
}

.trust-footer {
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  padding-top: 2rem;
}

.animate-fade-in {
  animation: fadeIn 0.6s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.btn-whatsapp { background-color: #25d366; color: white; }
.btn-facebook { background-color: #1877f2; color: white; }
.btn-share { background-color: #6c757d; color: white; }

/* FAQ Section Styles */
.faq-section {
  animation: fadeIn 1s ease-out 0.6s both;
}

.accordion-button {
  background: rgba(255, 255, 255, 0.05) !important;
  color: #fff !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  padding: 1.25rem;
  transition: all 0.3s ease;
}

.accordion-button:not(.collapsed) {
  background: rgba(128, 0, 128, 0.15) !important;
  border-color: rgba(128, 0, 128, 0.4) !important;
  box-shadow: none;
}

.accordion-button::after {
  filter: brightness(0) invert(1);
}

.border-purple-light {
  border-width: 2px !important;
  border-color: rgba(128, 0, 128, 0.3) !important;
}

.maxWidth-md {
  max-width: 800px;
}
</style>
