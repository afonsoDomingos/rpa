<template>
   <div class="container position-sticky z-index-sticky top-0">
    <div class="row">
      <div class="col-12">
        <NavbarDefault :sticky="true" />
      </div>
    </div>
  </div>
<br/><br/>
  <div class="container py-5 d-flex flex-column align-items-center justify-content-center" style="min-height: 80vh; overflow-y: auto;">

    <!-- Título aprimorado em box clean, largura igual aos pacotes -->
    <div class="titulo-pacotes-box mb-5">
      <h2 class="titulo-pacotes text-center m-0">
        Escolha o Seu Pacote Ideal
      </h2>
    </div>

    <!-- Lista de pacotes -->
    <div v-if="!pacoteSelecionado" class="row justify-content-center w-100 align-items-stretch">
      <div
        v-for="pacote in pacotes"
        :key="pacote.nome"
        class="col-12 col-md-5 mx-2 mb-4 d-flex align-items-stretch"
      >
        <div class="p-4 shadow-sm rounded border borda-destacada d-flex flex-column align-items-center w-100 pacote-card"
          :class="{ 'border-success': pacoteSelecionado === pacote.nome }"
        >
          <h4 class="text-center">{{ pacote.nome }}</h4>
          <h5 class="text-center text-primary">{{ pacote.preco }} MZN</h5>
          <p class="text-center text-muted">{{ pacote.periodo }}</p>

          <ul class="mt-3 w-100">
            <li v-for="(beneficio, idx) in pacote.beneficios" :key="idx" class="borda-destacada mb-2 text-center">✅ {{ beneficio }}</li>
          </ul>

          <div class="d-flex justify-content-center w-100 mt-auto">
            <button
              class="selecionar-pacote-btn w-100"
              @click="selecionarPacote(pacote.nome)"
              :disabled="loading || sucesso"
            >
              <span class="selecionar-icone me-2">&#10003;</span>
              <span>Selecionar</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Pagamento -->
    <div v-if="pacoteSelecionado" class="mt-5">
      <div class="d-flex justify-content-center mb-4">
        <button class="btn voltar-pacotes-btn px-4 py-2 fw-bold" @click="pacoteSelecionado = null; formaSelecionada = null; mensagem = ''; erroTelefone = ''; cartao = { numero: '', nome: '', validade: '', cvv: '' }; sucesso = false; telefone = ''">
          <span style="font-size:1.3em; margin-right:8px; vertical-align:middle;">&#8592;</span> Voltar aos Pacotes
        </button>
      </div>
      <h4 class="text-center mb-3">Formas de Pagamento</h4>

      <div class="payment-options d-flex flex-wrap justify-content-center gap-3 mb-4">
        <button
          v-for="forma in formasPagamento"
          :key="forma"
          class="payment-btn btn"
          :class="formaSelecionada === forma ? 'active' : ''"
          @click="selecionarForma(forma)"
          :disabled="loading || sucesso"
        >
          <span v-if='forma === "Cartão"'>
            <i class="bi bi-credit-card-2-front-fill me-2"></i>
          </span>
          <span v-else-if='forma === "M-Pesa"'>
            <img src="@/assets/img/Mpesa.png" alt="M-Pesa" style="height: 20px; margin-right: 8px; vertical-align: middle;" />
          </span>
          <span v-else-if='forma === "Emola"'>
            <img src="@/assets/img/Emola.png" alt="Emola" style="height: 20px; margin-right: 8px; vertical-align: middle;" />
          </span>
          {{ forma }}
        </button>
      </div>

      <div class="card mx-auto p-3 borda-destacada" style="max-width: 400px;">
        <div v-if="formaSelecionada === 'Cartão'">
          <input v-model="cartao.numero" class="form-control mb-2" placeholder="Número do Cartão" @input="formatarCartao" maxlength="19" />
          <input v-model="cartao.nome" class="form-control mb-2" placeholder="Nome no Cartão" />
          <div class="d-flex gap-2 mb-2">
            <input v-model="cartao.validade" class="form-control" placeholder="MM/AA" @input="formatarValidade" maxlength="5" />
            <input v-model="cartao.cvv" class="form-control" placeholder="CVV" maxlength="4" />
          </div>
        </div>

        <div v-else-if="formaSelecionada === 'M-Pesa' || formaSelecionada === 'Emola'">
          <input
            v-model="telefone"
            class="form-control mb-2"
            :placeholder="`Número de telefone (${formaSelecionada})`"
          />
          <small v-if="erroTelefone" class="text-danger">{{ erroTelefone }}</small>
        </div>

        <button class="btn btn-success mt-3 w-100" @click="pagar" :disabled="loading || sucesso || !podePagar">
          <span v-if="loading">Processando...</span>
          <span v-else>Pagar {{ precoSelecionado }} MZN</span>
        </button>
      </div>

      <!-- Mensagem -->
      <div class="text-center mt-3">
        <p :class="sucesso ? 'text-success' : 'text-danger'">{{ mensagem }}</p>
        <button v-if="sucesso" class="btn btn-primary mt-2" @click="voltarHome">Voltar à Home</button>
      </div>

      <!-- Resumo -->
      <div class="card mx-auto p-3 mt-4 borda-destacada" style="max-width: 400px;">
        <h5>Resumo da Assinatura</h5>
        <p><strong>Pacote:</strong> {{ pacoteSelecionado }}</p>
        <p><strong>Preço:</strong> {{ precoSelecionado }} MZN</p>
        <p><strong>Pagamento:</strong> {{ formaSelecionada || '-' }}</p>
      </div>
    </div>
  </div>
  <!-- Componente para exibir o rodapé padrão -->
  <FooterDefault />
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import api from "../api";

import NavbarDefault from "../examples/navbars/NavbarDefault.vue";
import FooterDefault from "../examples/footers/FooterDefault.vue";



const router = useRouter();

const usuario = ref(null);
const pacoteSelecionado = ref(null);
const formaSelecionada = ref(null);
const telefone = ref("");
const erroTelefone = ref("");
const mensagem = ref("");
const sucesso = ref(false);
const loading = ref(false);

const cartao = ref({ numero: "", nome: "", validade: "", cvv: "" });

const pacotes = [
  {
    nome: "Mensal",
    preco: 150,
    periodo: "a cada 1 mês",
    beneficios: [
      "Solicitação Ilimitada",
      "Notificações",
      "Suporte Prioritário",
      "Guardar Documento",
      "Geração de 3 CVs"
    ],
  },
  {
    nome: "Anual",
    preco: 650,
    periodo: "a cada 12 meses",
    beneficios: [
      "Tudo do Mensal",
      "Geração de CV Ilimitada",
      "Suporte VIP",
      "Consultoria personalizada",
      "Acesso  a novos recursos"
    ],
  },
];

const formasPagamento = ["Cartão", "M-Pesa", "Emola"];

const precoSelecionado = computed(() => {
  return pacotes.find((p) => p.nome === pacoteSelecionado.value)?.preco || 0;
});

const podePagar = computed(() => {
  if (formaSelecionada.value === "Cartão") return validarCartao();
  if (["M-Pesa", "Emola"].includes(formaSelecionada.value)) return validarTelefone();
  return false;
});

function selecionarPacote(nome) {
  console.log('[selecionarPacote] Pacote selecionado:', nome);
  pacoteSelecionado.value = nome;
  formaSelecionada.value = null;
  resetarCampos();
}

function selecionarForma(forma) {
  console.log('[selecionarForma] Forma selecionada:', forma);
  formaSelecionada.value = forma;
  mensagem.value = "";
  erroTelefone.value = "";
  telefone.value = "";
  cartao.value = { numero: "", nome: "", validade: "", cvv: "" };
}

function validarCartao() {
  const c = cartao.value;
  return c.numero.replace(/\s/g, "").length >= 13 && c.nome.length > 2 && /^\d{2}\/\d{2}$/.test(c.validade) && c.cvv.length >= 3;
}

function validarTelefone() {
  erroTelefone.value = "";
  const num = telefone.value;
  if (!/^258(84|85|86|87)\d{7}$/.test(num)) {
    erroTelefone.value = "Número inválido. Use formato 2588XXXXXXX.";
    return false;
  }
  return true;
}

function formatarCartao() {
  let num = cartao.value.numero.replace(/\D/g, "").slice(0, 16);
  cartao.value.numero = num.replace(/(.{4})/g, "$1 ").trim();
  console.log('[formatarCartao] Cartão formatado:', cartao.value.numero);
}

function formatarValidade() {
  let val = cartao.value.validade.replace(/\D/g, "").slice(0, 4);
  cartao.value.validade = val.length > 2 ? val.slice(0, 2) + "/" + val.slice(2) : val;
  console.log('[formatarValidade] Validade formatada:', cartao.value.validade);
}

async function buscarUsuario() {
  try {
    const email = localStorage.getItem("email");
    console.log('[buscarUsuario] Email logado:', email);
    if (!email) return router.push("/");
    const res = await api.get("/auth/usuarios");
    console.log('[buscarUsuario] Resposta da API:', res.data);
    usuario.value = res.data.find(u => u.email === email);
    console.log('[buscarUsuario] Usuário encontrado:', usuario.value);
    if (!usuario.value) router.push("/");
  } catch (e) {
    console.error('[buscarUsuario] Erro:', e);
    router.push("/");
  }
}

async function pagar() {
  loading.value = true;
  mensagem.value = "";
  sucesso.value = false;
  console.log('[pagar] Iniciando pagamento...');
  try {
    const token = localStorage.getItem("token");
    console.log('[pagar] Token:', token);
    if (!token) throw new Error("Não autenticado");

    const payload = {
      pacote: pacoteSelecionado.value,
      formaPagamento: formaSelecionada.value,
      preco: precoSelecionado.value,
      telefone: ["M-Pesa", "Emola"].includes(formaSelecionada.value) ? telefone.value : null,
      dadosCartao: formaSelecionada.value === "Cartão" ? {
        numero: cartao.value.numero.replace(/\s/g, ""),
        nomeTitular: cartao.value.nome,
        validade: cartao.value.validade,
        cvv: cartao.value.cvv,
      } : null,
    };
    console.log('[pagar] Payload:', payload);

    const res = await api.post("/pagamentos", payload, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('[pagar] Resposta da API:', res.data);

    mensagem.value = res.data.mensagem || "Pagamento realizado com sucesso!";
    sucesso.value = true;
  } catch (e) {
    console.error('[pagar] Erro:', e);
    mensagem.value = e.response?.data?.mensagem || "Erro no pagamento";
  } finally {
    loading.value = false;
    console.log('[pagar] loading finalizado:', loading.value);
  }
}

function logout() {
  console.log('[logout] Efetuando logout do usuário.');
  localStorage.removeItem("email");
  localStorage.removeItem("token");
  router.push("/");
}

function voltarHome() {
  console.log('[voltarHome] Redirecionando para home.');
  router.push("/home");
}

function resetarCampos() {
  telefone.value = "";
  mensagem.value = "";
  erroTelefone.value = "";
  cartao.value = { numero: "", nome: "", validade: "", cvv: "" };
  sucesso.value = false;
  console.log('[resetarCampos] Campos resetados.');
}

onMounted(() => {
  console.log('[onMounted] Componente montado. Buscando usuário...');
  buscarUsuario();
});
</script>


<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@800&display=swap');

.titulo-pacotes-box {
  background: #fff;
  border-radius: 1.2rem;
  box-shadow: 0 2px 12px rgba(60,60,60,0.07);
  padding: 1.1rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 2.5rem;
  border: 2px solid #66bb6a;
  max-width: 420px;
  width: 100%;
  margin-left: auto;
  margin-right: auto;
}
.titulo-pacotes {
  font-family: 'Montserrat', Arial, Helvetica, sans-serif;
  font-size: 1.7rem;
  font-weight: 800;
  color: #198754;
  letter-spacing: 0.5px;
  text-shadow: 0 2px 8px rgba(102,187,106,0.07);
  line-height: 1.1;
  margin: 0;
}
@media (max-width: 576px) {
  .titulo-pacotes-box {
    padding: 0.7rem 0.7rem;
    max-width: 98vw;
    margin-bottom: 4.5rem;
  }
  .titulo-pacotes {
    font-size: 1.1rem;
  }
}
.payment-options {
  gap: 1rem;
}
/* Cores padrão herdadas de .borda-destacada */
/* Botão de seleção de forma de pagamento - visual padrão limpo */
.payment-btn {
  min-width: 120px;
  padding: 0.75rem 1.5rem;
  font-size: 1.1rem;
  border-radius: 2rem;
  border: 1.5px solid #66bb6a;
  background: #fff;
  color: #198754;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(102, 187, 106, 0.08);
  transition: border-color 0.2s, box-shadow 0.2s, transform 0.3s, background 0.2s, color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  outline: none;
  letter-spacing: 0.5px;
}
.payment-btn.active, .payment-btn:hover, .payment-btn:focus {
  background: #fff;
  color: #800080;
  border-color: #800080;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  transform: scale(1.03);
  cursor: pointer;
}
@media (max-width: 576px) {
  .payment-btn {
    min-width: 90px;
    font-size: 0.95rem;
    padding: 0.5rem 0.7rem;
  }
}
.container {
  max-width: 960px;
}

.container.py-5 {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.row.justify-content-center {
  width: 100%;
}

.col-md-5 {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.border-success {
  border: 2px solid #198754 !important;
}

.btn-group .btn {
  min-width: 120px;
}

/* Botão Voltar aos Pacotes: visual limpo, destaque só no box-shadow */
.voltar-pacotes-btn {
  background: #fff;
  color: #198754 !important;
  border: 1.5px solid #66bb6a;
  border-radius: 2rem;
  font-size: 1.1rem;
  box-shadow: 0 2px 8px rgba(102, 187, 106, 0.10), 0 4px 16px rgba(128, 0, 128, 0.10);
  transition: box-shadow 0.2s, transform 0.2s, border-color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}
.voltar-pacotes-btn:hover, .voltar-pacotes-btn:focus {
  background: #fff;
  color: #800080 !important;
  border-color: #800080;
  transform: scale(1.05);
  box-shadow: 0 8px 24px rgba(128, 0, 128, 0.18), 0 2px 8px rgba(102, 187, 106, 0.10);
}
/* Botão Selecionar Pacote - visual padrão limpo */
.selecionar-pacote-btn {
  background: #fff;
  color: #198754 !important;
  border: 1.5px solid #66bb6a;
  border-radius: 2rem;
  font-size: 1.08rem;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(102, 187, 106, 0.10);
  transition: box-shadow 0.2s, transform 0.2s, border-color 0.2s, color 0.2s, background 0.2s;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  outline: none;
  gap: 0.5em;
  position: relative;
  overflow: hidden;
  padding: 0.95rem 2.2rem;
}
.selecionar-pacote-btn .selecionar-icone {
  font-size: 1.15em;
  color: #198754;
  background: rgba(102,187,106,0.10);
  border-radius: 50%;
  margin-right: 6px;
  box-shadow: none;
  transition: color 0.2s, background 0.2s;
  padding: 0.1em 0.3em;
}
.selecionar-pacote-btn:hover, .selecionar-pacote-btn:focus {
  background: #fff;
  color: #800080 !important;
  border-color: #800080;
  transform: scale(1.045);
  box-shadow: 0 8px 24px rgba(128, 0, 128, 0.13), 0 2px 8px rgba(102, 187, 106, 0.10);
  cursor: pointer;
}
.selecionar-pacote-btn:hover .selecionar-icone,
.selecionar-pacote-btn:focus .selecionar-icone {
  color: #800080;
  background: rgba(128,0,128,0.10);
}
/* Borda destacada padrão */
.borda-destacada {
  border: 1px solid #66bb6a;
  border-radius: 5px;
  padding: 10px;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s, transform 0.3s ease;
  background-color: #fff;
  /* box-shadow removido para visual mais limpo */
}

.borda-destacada:hover {
  border-color: #800080;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  transform: scale(1.03);
  cursor: pointer;
}

.badge {
  font-weight: 600;
  font-size: 0.85rem;
  user-select: none;
}

/* Estilo do dropdown usuário */
.nav-link {
  font-weight: 600;
  font-size: 1rem;
}

.material-icons {
  font-size: 20px;
  color: #198754;
}

/* Centralização e alinhamento dos cards de pacotes */
.pacote-card {
  min-height: 410px;
  max-width: 370px;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
}

@media (max-width: 576px) {
  .pacote-card {
    min-height: 350px;
    max-width: 98vw;
    padding: 1.2rem 0.5rem;
  }
}
</style>

