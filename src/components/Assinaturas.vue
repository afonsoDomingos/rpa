<template>
  <div class="container py-5">

    <!-- Dropdown usuário logado -->
    <li v-if="usuario" class="nav-item dropdown dropdown-hover mx-2 list-unstyled" style="margin-bottom: 30px;">
      <a
        role="button"
        class="nav-link ps-2 d-flex cursor-pointer align-items-center text-success"
        id="dropdownUser"
        data-bs-toggle="dropdown"
        aria-expanded="false"
      >
        <i class="material-icons opacity-6 me-2 text-success">person</i>
        {{ usuario.nome || 'Usuário' }}
      </a>

      <ul
        class="dropdown-menu dropdown-menu-end dropdown-menu-animation mt-0 p-2 border-radius-lg"
        aria-labelledby="dropdownUser"
        style="min-width: 140px;"
      >
        <li>
          <button class="dropdown-item border-radius-md text-danger" @click="logout">
            Sair
          </button>
        </li>
      </ul>
    </li>

    <!-- Componente lista de pagamentos -->
<!--<MeusPagamentos />-->

    <h2 class="text-center mb-5">Escolha o Seu Pacote de Assinatura</h2>

    <div class="row justify-content-center align-items-stretch">
      <div
        v-for="(pacote, index) in pacotes"
        :key="index"
        class="col-md-5 mx-3 mb-4 p-4 shadow-sm borda-destacada position-relative d-flex flex-column justify-content-between"
        :class="pacoteSelecionado === pacote.nome ? 'border-success' : ''"
        style="min-height: 420px;"
        @mouseenter="hoverIndex = index"
        @mouseleave="hoverIndex = null"
      >
        <span
          v-if="pacoteSelecionado === pacote.nome"
          class="badge badge-success position-absolute"
          style="top: 10px; right: 10px; background-color: #198754; color: white; padding: 5px 10px; border-radius: 5px;"
        >
          Selecionado
        </span>

        <div>
          <h4 class="text-center">{{ pacote.nome }}</h4>
          <h5 class="text-center text-primary">{{ pacote.preco }} MZN</h5>
          <p class="text-muted text-center">Pagamento {{ pacote.periodo }}</p>

          <ul class="list-unstyled mt-3">
            <li v-for="(beneficio, idx) in pacote.beneficios" :key="idx">
              ✅ {{ beneficio }}
            </li>
          </ul>
        </div>

        <button
          class="btn btn-outline-success w-100 mt-4 borda-destacada"
          @click="selecionarPacote(pacote.nome)"
          :disabled="loading || sucesso"
        >
          Selecionar {{ pacote.nome }}
        </button>
      </div>
    </div>

    <div v-if="pacoteSelecionado" class="mt-5 text-center">

      <h4 class="mb-3">Formas de Pagamento</h4>

      <div class="btn-group mb-4" role="group">
        <button
          v-for="forma in formasPagamento"
          :key="forma"
          class="btn borda-destacada me-2"
          :class="formaSelecionada === forma ? 'btn-primary' : 'btn-outline-primary'"
          @click="selecionarForma(forma)"
          :disabled="loading || sucesso"
        >
          {{ forma }}
        </button>
      </div>

      <div class="borda-destacada p-3 mx-auto" style="max-width: 400px; text-align: left;">

        <!-- Cartão -->
        <div v-if="formaSelecionada === 'Cartão'">
          <h6 class="mb-3">💳 Dados do Cartão</h6>
          <input
            v-model="cartao.numero"
            class="form-control mb-2 borda-destacada"
            placeholder="Número do Cartão"
            maxlength="19"
            :disabled="loading || sucesso"
            @input="formatarCartao"
          />
          <input
            v-model="cartao.nome"
            class="form-control mb-2 borda-destacada"
            placeholder="Nome no Cartão"
            :disabled="loading || sucesso"
          />
          <div class="d-flex gap-2 mb-2">
            <input
              v-model="cartao.validade"
              class="form-control borda-destacada"
              placeholder="MM/AA"
              maxlength="5"
              :disabled="loading || sucesso"
              @input="formatarValidade"
            />
            <input
              v-model="cartao.cvv"
              class="form-control borda-destacada"
              placeholder="CVV"
              maxlength="4"
              :disabled="loading || sucesso"
            />
          </div>
          <button
            class="btn btn-success mt-3 borda-destacada w-100"
            @click="pagar"
            :disabled="loading || sucesso || !validarCartao()"
          >
            <span v-if="loading">Processando...</span>
            <span v-else>Pagar {{ precoPacoteSelecionado }} MZN</span>
          </button>
        </div>

        <!-- M-Pesa -->
        <div v-else-if="formaSelecionada === 'M-Pesa'">
          <h6 class="mb-3">📱 M-Pesa</h6>
          <input
            v-model="numeroTelefoneMpesa"
            class="form-control mb-1 borda-destacada"
            placeholder="Número de telefone M-Pesa (ex: 25884XXXXXXX)"
            :disabled="loading || sucesso"
          />
          <small v-if="erroTelefone" class="text-danger mb-2">{{ erroTelefone }}</small>
          <button
            class="btn btn-success borda-destacada w-100"
            @click="pagar"
            :disabled="loading || sucesso || !validarTelefone('Mpesa')"
          >
            <span v-if="loading">Processando...</span>
            <span v-else>Pagar {{ precoPacoteSelecionado }} MZN com M-Pesa</span>
          </button>
          <small class="text-muted d-block mt-2">Prefixos válidos: 84, 85.</small>
        </div>

        <!-- Emola -->
        <div v-else-if="formaSelecionada === 'Emola'">
          <h6 class="mb-3">📲 Emola</h6>
          <input
            v-model="numeroTelefoneEmola"
            class="form-control mb-1 borda-destacada"
            placeholder="Número de telefone Emola (ex: 25886XXXXXXX)"
            :disabled="loading || sucesso"
          />
          <small v-if="erroTelefone" class="text-danger mb-2">{{ erroTelefone }}</small>
          <button
            class="btn btn-success borda-destacada w-100"
            @click="pagar"
            :disabled="loading || sucesso || !validarTelefone('Emola')"
          >
            <span v-if="loading">Processando...</span>
            <span v-else>Pagar {{ precoPacoteSelecionado }} MZN com Emola</span>
          </button>
          <small class="text-muted d-block mt-2">Prefixos válidos: 86, 87.</small>
        </div>

        <div v-else>
          <p class="text-muted">Selecione uma forma de pagamento para continuar.</p>
        </div>

      </div>

      <div v-if="mensagem" :class="['mt-3', sucesso ? 'text-success' : 'text-danger']" style="min-height: 24px;">
        {{ mensagem }}
      </div>

      <div v-if="sucesso" class="mt-4">
        <button class="btn btn-primary" @click="voltarHome">Voltar para Home</button>
      </div>

      <div
        class="mt-4 border rounded p-3 mx-auto"
        style="max-width: 400px;"
      >
        <h5>Resumo da Assinatura</h5>
        <p><strong>Pacote:</strong> {{ pacoteSelecionado }}</p>
        <p><strong>Preço:</strong> {{ precoPacoteSelecionado }} MZN</p>
        <p><strong>Pagamento:</strong> {{ formaSelecionada || '-' }}</p>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import api from "../api";
import MeusPagamentos from "./MeusPagamentos.vue";

const router = useRouter();

const usuario = ref(null);
const pacotes = [
  {
    nome: "Trimestral",
    preco: 200,
    periodo: "a cada 3 meses",
    beneficios: [
      "Acesso ilimitado à base de dados de documentos perdidos",
      "Notificações em tempo real sobre documentos encontrados",
      "Prioridade no suporte",
      "Perfil verificado na plataforma",
      "Possibilidade de guardar documentos pessoais",
    ],
  },
  {
    nome: "Anual",
    preco: 600,
    periodo: "a cada 12 meses",
    beneficios: [
      "Todos os benefícios do plano trimestral",
      "Desconto de 20% no valor anual",
      "Consultoria personalizada para recuperação",
      "Sorteios mensais exclusivos",
      "Geração automática de Currículo (CV)",
    ],
  },
];

const pacoteSelecionado = ref(null);
const formaSelecionada = ref(null);
const numeroTelefoneMpesa = ref("");
const numeroTelefoneEmola = ref("");
const mensagem = ref("");
const sucesso = ref(false);
const loading = ref(false);
const erroTelefone = ref("");

const cartao = ref({
  numero: "",
  nome: "",
  validade: "",
  cvv: "",
});

const formasPagamento = ["Cartão", "M-Pesa", "Emola"];
const hoverIndex = ref(null);

function selecionarPacote(nome) {
  pacoteSelecionado.value = nome;
  formaSelecionada.value = null;
  mensagem.value = "";
  erroTelefone.value = "";
  numeroTelefoneMpesa.value = "";
  numeroTelefoneEmola.value = "";
  cartao.value = { numero: "", nome: "", validade: "", cvv: "" };
  sucesso.value = false;
}

function selecionarForma(forma) {
  console.log("[selecionarForma] Forma selecionada:", forma);
  formaSelecionada.value = forma;
  mensagem.value = "";
  erroTelefone.value = "";
  if (forma === "M-Pesa") {
    numeroTelefoneEmola.value = "";
  }
  if (forma === "Emola") {
    numeroTelefoneMpesa.value = "";
  }
  cartao.value = { numero: "", nome: "", validade: "", cvv: "" };
  console.log("[selecionarForma] Estado após seleção:", {
    formaSelecionada: formaSelecionada.value,
    numeroTelefoneMpesa: numeroTelefoneMpesa.value,
    numeroTelefoneEmola: numeroTelefoneEmola.value,
    cartao: cartao.value
  });
}

const precoPacoteSelecionado = computed(() => {
  const pacote = pacotes.find((p) => p.nome === pacoteSelecionado.value);
  return pacote ? pacote.preco : 0;
});

function validarTelefone(tipo) {
  erroTelefone.value = "";
  let numero = "";
  if (tipo === "Mpesa") numero = numeroTelefoneMpesa.value;
  else if (tipo === "Emola") numero = numeroTelefoneEmola.value;
  else return false;

  if (!numero) {
    erroTelefone.value = "Por favor, insira o número de telefone.";
    return false;
  }
  const prefixosValidosMpesa = ["84", "85"];
  const prefixosValidosEmola = ["86", "87"];

  if (!numero.startsWith("258")) {
    erroTelefone.value = "Número deve começar com código do país 258.";
    return false;
  }

  const prefixo = numero.substring(3, 5);
  const numeroValido =
    tipo === "Mpesa"
      ? prefixosValidosMpesa.includes(prefixo)
      : prefixosValidosEmola.includes(prefixo);

  if (!numeroValido) {
    erroTelefone.value =
      tipo === "Mpesa"
        ? "Prefixo inválido para M-Pesa. Use 84 ou 85."
        : "Prefixo inválido para Emola. Use 86 ou 87.";
    return false;
  }

  if (numero.length !== 12) {
    erroTelefone.value = "Número deve conter 12 dígitos (ex: 25884XXXXXXX).";
    return false;
  }

  if (!/^\d{12}$/.test(numero)) {
    erroTelefone.value = "Número deve conter apenas dígitos.";
    return false;
  }

  erroTelefone.value = "";
  return true;
}

function validarCartao() {
  if (!cartao.value.numero || cartao.value.numero.replace(/\s/g, "").length < 13)
    return false;
  if (!cartao.value.nome || cartao.value.nome.length < 3) return false;
  if (!cartao.value.validade || !/^\d{2}\/\d{2}$/.test(cartao.value.validade))
    return false;
  if (!cartao.value.cvv || cartao.value.cvv.length < 3) return false;
  return true;
}

function formatarCartao() {
  let v = cartao.value.numero.replace(/\D/g, "");
  v = v.substring(0, 16);
  let partes = [];
  for (let i = 0; i < v.length; i += 4) partes.push(v.substring(i, i + 4));
  cartao.value.numero = partes.join(" ");
}

function formatarValidade() {
  let v = cartao.value.validade.replace(/\D/g, "");
  if (v.length >= 3) {
    v = v.substring(0, 2) + "/" + v.substring(2, 4);
  }
  cartao.value.validade = v;
}

async function buscarUsuario() {
  try {
    const emailLogado = localStorage.getItem("email");
    console.log("[buscarUsuario] emailLogado:", emailLogado);
    if (!emailLogado) {
      console.warn("[buscarUsuario] Nenhum email logado encontrado. Redirecionando para home.");
      router.push("/");
      return;
    }

    const res = await api.get("/auth/usuarios");
    console.log("[buscarUsuario] Resposta da API /auth/usuarios:", res.data);
    if (!Array.isArray(res.data)) return;
    usuario.value = res.data.find((u) => u.email === emailLogado);
    console.log("[buscarUsuario] Usuario encontrado:", usuario.value);
    if (!usuario.value) {
      console.warn("[buscarUsuario] Usuário não encontrado na resposta. Redirecionando para home.");
      router.push("/");
    }
  } catch (e) {
    console.error("[buscarUsuario] Erro ao buscar usuário:", e);
    router.push("/");
  }
}

async function pagar() {
  mensagem.value = "";
  sucesso.value = false;
  loading.value = true;

  try {
    const token = localStorage.getItem("token");
    console.log("[pagar] Token:", token);
    if (!token) throw new Error("Usuário não autenticado");

    const payload = {
      pacote: pacoteSelecionado.value,
      formaPagamento: formaSelecionada.value,
      preco: precoPacoteSelecionado.value,
      telefone: null,
      dadosCartao: null,
    };

    if (formaSelecionada.value === "Cartão") {
      payload.dadosCartao = {
        numero: cartao.value.numero.replace(/\s/g, ""),
        nomeTitular: cartao.value.nome,
        validade: cartao.value.validade,
        cvv: cartao.value.cvv,
      };
    } else if (formaSelecionada.value === "M-Pesa") {
      payload.telefone = numeroTelefoneMpesa.value;
    } else if (formaSelecionada.value === "Emola") {
      payload.telefone = numeroTelefoneEmola.value;
    }

    console.log("[pagar] Payload enviado:", payload);

    const response = await api.post("/pagamentos", payload, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("[pagar] Resposta da API /pagamentos:", response.data);
    sucesso.value = true;
    mensagem.value = response.data.mensagem || "Pagamento realizado com sucesso!";
  } catch (error) {
    sucesso.value = false;
    if (error.response?.data?.mensagem) {
      mensagem.value = error.response.data.mensagem;
    } else {
      mensagem.value = "Erro ao processar pagamento. Tente novamente.";
    }
    console.error("[pagar] Erro ao pagar:", error);
  } finally {
    loading.value = false;
    console.log("[pagar] loading finalizado:", loading.value);
  }
}

function voltarHome() {
  router.push("/home");
}

function logout() {
  console.log("[logout] Efetuando logout do usuário.");
  localStorage.removeItem("token");
  localStorage.removeItem("email");
  router.push("/");
}

onMounted(() => {
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
