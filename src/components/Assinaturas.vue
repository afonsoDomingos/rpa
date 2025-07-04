<template>
  <div class="container py-5">
    <!-- Usuário Logado -->
    <div v-if="usuario" class="mb-4 text-end">
      <div class="dropdown">
        <a class="btn btn-outline-success dropdown-toggle" data-bs-toggle="dropdown">
          {{ usuario.nome || 'Usuário' }}
        </a>
        <ul class="dropdown-menu">
          <li><button class="dropdown-item text-danger" @click="logout">Sair</button></li>
        </ul>
      </div>
    </div>

    <h2 class="text-center mb-5">Escolha o Seu Pacote</h2>

    <!-- Lista de pacotes -->
    <div class="row justify-content-center">
      <div
        v-for="pacote in pacotes"
        :key="pacote.nome"
        class="col-md-5 mx-2 mb-4 p-4 shadow-sm rounded border"
        :class="{ 'border-success': pacoteSelecionado === pacote.nome }"
      >
        <div class="text-end" v-if="pacoteSelecionado === pacote.nome">
          <span class="badge bg-success">Selecionado</span>
        </div>

        <h4 class="text-center">{{ pacote.nome }}</h4>
        <h5 class="text-center text-primary">{{ pacote.preco }} MZN</h5>
        <p class="text-center text-muted">{{ pacote.periodo }}</p>

        <ul class="mt-3">
          <li v-for="(beneficio, idx) in pacote.beneficios" :key="idx">✅ {{ beneficio }}</li>
        </ul>

        <button class="btn btn-outline-success mt-4 w-100" @click="selecionarPacote(pacote.nome)" :disabled="loading || sucesso">
          Selecionar
        </button>
      </div>
    </div>

    <!-- Pagamento -->
    <div v-if="pacoteSelecionado" class="mt-5">
      <h4 class="text-center mb-3">Formas de Pagamento</h4>

      <div class="text-center mb-3">
        <button
          v-for="forma in formasPagamento"
          :key="forma"
          class="btn mx-1"
          :class="formaSelecionada === forma ? 'btn-primary' : 'btn-outline-primary'"
          @click="selecionarForma(forma)"
          :disabled="loading || sucesso"
        >
          {{ forma }}
        </button>
      </div>

      <div class="card mx-auto p-3" style="max-width: 400px;">
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
      <div class="card mx-auto p-3 mt-4" style="max-width: 400px;">
        <h5>Resumo da Assinatura</h5>
        <p><strong>Pacote:</strong> {{ pacoteSelecionado }}</p>
        <p><strong>Preço:</strong> {{ precoSelecionado }} MZN</p>
        <p><strong>Pagamento:</strong> {{ formaSelecionada || '-' }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import api from "../api";

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
    nome: "Trimestral",
    preco: 200,
    periodo: "a cada 3 meses",
    beneficios: ["Acesso ilimitado", "Notificações", "Suporte prioritário"],
  },
  {
    nome: "Anual",
    preco: 600,
    periodo: "a cada 12 meses",
    beneficios: ["Todos do Trimestral", "Desconto 20%", "CV automático"],
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
.container {
  max-width: 960px;
}

.border-success {
  border: 2px solid #198754 !important;
}

.btn-group .btn {
  min-width: 120px;
}

.borda-destacada {
  border: 1px solid #66bb6a;
  border-radius: 5px;
  padding: 10px;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s, transform 0.3s ease;
  background-color: #fff;
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

/* Responsividade */
@media (max-width: 576px) {
  .container {
    padding: 15px;
  }

  .btn-outline-success {
    font-size: 0.9rem;
    padding: 5px 15px;
  }

  h2 {
    font-size: 1.6rem;
  }
}
</style>
