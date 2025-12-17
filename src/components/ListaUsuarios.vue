<template>
  <div class="lista-usuarios-container">
    <!-- Barra de Filtro e Contador -->
    <div class="row align-items-center mb-4 g-3">
      <div class="col-md-8">
        <div class="search-bar position-relative">
          <i class="bi bi-search search-icon"></i>
          <input
            v-model="filtro"
            type="text"
            placeholder="Pesquisar por nome ou email..."
            class="form-control form-control-lg ps-5 shadow-sm border-0"
          />
        </div>
      </div>
      <div class="col-md-4 d-flex justify-content-md-end">
        <transition name="scale" mode="out-in">
          <div :key="'count-' + usuariosFiltrados.length" class="counter-badge">
            <span class="text-uppercase">Total</span>
            <span class="h4 mb-0 ms-2">{{ usuariosFiltrados.length }}</span>
          </div>
        </transition>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="carregando" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Carregando...</span>
      </div>
      <p class="mt-2 text-muted">Carregando usuários...</p>
    </div>

    <!-- Tabela de Usuários -->
    <div v-else class="table-responsive shadow-sm rounded-4 bg-white mb-4">
      <table class="table mb-0 align-middle custom-table">
        <thead class="bg-light">
          <tr>
            <th class="py-3 ps-4 border-0">Usuário</th>
            <th class="py-3 border-0">Email</th>
            <th class="py-3 border-0">Perfil</th>
            <th class="py-3 border-0">Senha</th>
            <th class="py-3 pe-4 text-end border-0">Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="usuariosFiltradosPaginados.length === 0">
            <td colspan="5" class="text-center py-5 text-muted">
              Nenhum usuário encontrado.
            </td>
          </tr>
          <tr
            v-for="usuario in usuariosFiltradosPaginados"
            :key="usuario.id"
            class="hover-row transition-all"
          >
            <!-- Nome -->
            <td class="ps-4" data-label="Nome" data-icon="person-circle">
              <div v-if="editandoId === usuario.id" class="animate-fade-in">
                <input
                  v-model="usuarioEditando.nome"
                  type="text"
                  class="form-control form-control-sm"
                  placeholder="Nome do usuário"
                />
              </div>
              <div v-else class="d-flex align-items-center gap-2">
                <div class="avatar-circle" :style="{ backgroundColor: getAvatarColor(usuario.nome) }">
                  {{ usuario.nome.charAt(0).toUpperCase() }}
                </div>
                <span class="fw-semibold text-dark">{{ usuario.nome }}</span>
              </div>
            </td>

            <!-- Email -->
            <td data-label="Email" data-icon="envelope-fill">
              <div v-if="editandoId === usuario.id" class="animate-fade-in">
                <input
                  v-model="usuarioEditando.email"
                  type="email"
                  class="form-control form-control-sm"
                />
              </div>
              <span v-else class="text-secondary">{{ usuario.email }}</span>
            </td>

            <!-- Role -->
            <td data-label="Perfil" data-icon="shield-fill-check">
              <div v-if="editandoId === usuario.id" class="animate-fade-in">
                <select v-model="usuarioEditando.role" class="form-select form-select-sm">
                  <option value="cliente">Cliente</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <span
                v-else
                class="badge rounded-pill px-3 py-2"
                :class="usuario.role === 'admin' ? 'bg-primary-subtle text-primary' : 'bg-success-subtle text-success'"
              >
                <i class="bi" :class="usuario.role === 'admin' ? 'bi-star-fill' : 'bi-person-fill'"></i>
                {{ usuario.role.toUpperCase() }}
              </span>
            </td>

            <!-- Senha -->
            <td data-label="Senha" data-icon="key-fill">
              <div v-if="editandoId === usuario.id" class="d-flex align-items-center gap-2 animate-fade-in">
                <input
                  :type="senhaVisivel ? 'text' : 'password'"
                  v-model="usuarioEditando.senha"
                  class="form-control form-control-sm"
                  placeholder="Nova senha (opcional)"
                />
                <button
                  type="button"
                  class="btn btn-link p-0 text-decoration-none text-muted"
                  @click="senhaVisivel = !senhaVisivel"
                >
                  <i class="bi" :class="senhaVisivel ? 'bi-eye-slash-fill' : 'bi-eye-fill'"></i>
                </button>
              </div>
              <span v-else class="text-muted tracking-widest">••••••••</span>
            </td>

            <!-- Ações -->
            <td class="pe-4 text-end" data-label="Ações" data-icon="tools">
              <div class="d-flex justify-content-end gap-2 flex-wrap">
                <template v-if="editandoId === usuario.id">
                  <button
                    class="btn btn-success btn-sm d-flex align-items-center gap-1 shadow-sm"
                    @click="salvarEdicao"
                    title="Salvar"
                  >
                    <i class="bi bi-check-lg"></i>
                    <span class="d-none d-md-inline">Salvar</span>
                  </button>
                  <button
                    class="btn btn-secondary btn-sm d-flex align-items-center gap-1 shadow-sm"
                    @click="cancelarEdicao"
                    title="Cancelar"
                  >
                    <i class="bi bi-x-lg"></i>
                    <span class="d-none d-md-inline">Cancelar</span>
                  </button>
                </template>
                <template v-else>
                  <button
                    class="btn btn-outline-primary btn-sm border-0 bg-primary-subtle text-primary hover-scale"
                    @click="editarUsuario(usuario)"
                    title="Editar"
                  >
                    <i class="bi bi-pencil-fill"></i>
                  </button>
                  <button
                    class="btn btn-outline-danger btn-sm border-0 bg-danger-subtle text-danger hover-scale"
                    @click="excluirUsuario(usuario.id)"
                    title="Excluir"
                  >
                    <i class="bi bi-trash-fill"></i>
                  </button>
                </template>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Paginação (dentro do card) -->
      <div class="d-flex justify-content-end align-items-center p-3 border-top">
         <div class="pagination-container d-flex align-items-center gap-2">
          <button
            class="btn btn-light rounded-circle shadow-sm p-2 d-flex align-items-center justify-content-center"
            style="width: 36px; height: 36px"
            @click="paginaAtual--"
            :disabled="paginaAtual === 1"
          >
            <i class="bi bi-chevron-left small"></i>
          </button>
          <span class="fw-semibold text-muted font-monospace small px-2">
            Pág. {{ paginaAtual }} / {{ totalPaginas || 1 }}
          </span>
          <button
            class="btn btn-light rounded-circle shadow-sm p-2 d-flex align-items-center justify-content-center"
            style="width: 36px; height: 36px"
            @click="paginaAtual++"
            :disabled="paginaAtual === totalPaginas || totalPaginas === 0"
          >
            <i class="bi bi-chevron-right small"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Gráfico de Crescimento -->
    <GraficoUsuarios :total="usuarios.length" />

    <!-- Mensagens de feedback (Toast) -->
    <transition name="toast">
      <div v-if="mensagem" class="custom-toast" :class="tipoMensagem">
        <i class="bi" :class="tipoMensagem === 'sucesso' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'"></i>
        <span>{{ mensagem }}</span>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import api from "../api";
import GraficoUsuarios from "./GraficoUsuarios.vue";
import Swal from "sweetalert2";

const props = defineProps(["atualizar"]);

// Estados
const usuarios = ref([]);
const filtro = ref("");
const paginaAtual = ref(1);
const porPagina = 5;
const carregando = ref(false);

const editandoId = ref(null);
const usuarioEditando = ref({ nome: "", email: "", role: "", senha: "" });
const senhaVisivel = ref(false);

// Notificações
const mensagem = ref("");
const tipoMensagem = ref(""); // 'sucesso' ou 'erro'

const mostrarMensagem = (msg, tipo = "sucesso") => {
  mensagem.value = msg;
  tipoMensagem.value = tipo;
  setTimeout(() => (mensagem.value = ""), 4000);
};

// Função para gerar cores de avatar baseadas no nome
const getAvatarColor = (nome) => {
  const colors = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
    'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    'linear-gradient(135deg, #ff9a56 0%, #ff6a88 100%)',
  ];
  const index = nome.charCodeAt(0) % colors.length;
  return colors[index];
};

// Ações
const buscarUsuarios = async () => {
  carregando.value = true;
  try {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Token não encontrado.");

    const { data } = await api.get("/auth/usuarios", {
      headers: { Authorization: `Bearer ${token}` },
    });

    usuarios.value = data.map((u) => ({ ...u, id: u.id }));
  } catch (err) {
    mostrarMensagem(err.response?.data?.msg || err.message, "erro");
  } finally {
    carregando.value = false;
  }
};

const editarUsuario = (usuario) => {
  editandoId.value = usuario.id;
  usuarioEditando.value = { ...usuario, senha: "" };
  senhaVisivel.value = false;
};

const cancelarEdicao = () => {
  editandoId.value = null;
  usuarioEditando.value = { nome: "", email: "", role: "", senha: "" };
};

const salvarEdicao = async () => {
  try {
    const token = localStorage.getItem("token");
    const payload = {
      nome: usuarioEditando.value.nome,
      email: usuarioEditando.value.email,
      role: usuarioEditando.value.role,
    };
    if (usuarioEditando.value.senha?.trim()) {
      payload.senha = usuarioEditando.value.senha;
    }

    await api.patch(`/auth/usuarios/${editandoId.value}`, payload, {
      headers: { Authorization: `Bearer ${token}` },
    });

    mostrarMensagem("Usuário atualizado!", "sucesso");
    cancelarEdicao();
    buscarUsuarios();
  } catch (error) {
    mostrarMensagem("Erro ao atualizar: " + (error.response?.data?.msg || error.message), "erro");
  }
};

const excluirUsuario = async (id) => {
  const result = await Swal.fire({
      title: 'Tem certeza?',
      text: "Tem certeza que deseja excluir este usuário?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sim, excluir!',
      cancelButtonText: 'Cancelar'
  });

  if (!result.isConfirmed) return;
  
  try {
    const token = localStorage.getItem("token");
    await api.delete(`/auth/usuarios/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    mostrarMensagem("Usuário removido.", "sucesso");
    buscarUsuarios();
  } catch (error) {
    mostrarMensagem("Erro ao excluir: " + (error.response?.data?.msg || "Erro desconhecido"), "erro");
  }
};

// Lógica Computada
const usuariosFiltrados = computed(() =>
  usuarios.value.filter(
    (u) =>
      u.nome.toLowerCase().includes(filtro.value.toLowerCase()) ||
      u.email.toLowerCase().includes(filtro.value.toLowerCase())
  )
);

const totalPaginas = computed(() => Math.ceil(usuariosFiltrados.value.length / porPagina));

const usuariosFiltradosPaginados = computed(() => {
  const inicio = (paginaAtual.value - 1) * porPagina;
  return usuariosFiltrados.value.slice(inicio, inicio + porPagina);
});

// Watchers
watch(filtro, () => (paginaAtual.value = 1));
watch(() => props.atualizar, buscarUsuarios);

onMounted(buscarUsuarios);
</script>

<style scoped>
@import url("https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css");
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700;900&display=swap');

/* Container Geral - Remove constraints, let parent control */
.lista-usuarios-container {
  width: 100%;
  font-family: 'Poppins', sans-serif;
  background-color: transparent; /* Tema branco */
}

/* Pesquisa */
.search-icon {
  position: absolute;
  left: 20px;
  top: 50%;
  transform: translateY(-50%);
  color: #adb5bd;
}

.search-bar input {
  font-family: 'Poppins', sans-serif;
  font-weight: 600;
  transition: all 0.3s ease;
  background-color: #ffffff;
  border: 1px solid #e0e0e0;
}

.search-bar input:focus {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(128, 0, 128, 0.15) !important;
  border-color: #800080; /* Roxo */
}

/* Tabela */
.custom-table {
  background-color: #ffffff; /* Branco */
}

.custom-table th {
  font-family: 'Poppins', sans-serif;
  font-weight: 900; /* Black */
  text-transform: uppercase;
  font-size: 0.85rem;
  color: #6c757d;
  letter-spacing: 0.5px;
  background-color: #f8f9fa !important;
}

.custom-table td {
  vertical-align: middle;
  font-family: 'Poppins', sans-serif;
  background-color: #ffffff; 
}

.avatar-circle {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
  font-size: 1rem;
  box-shadow: 0 4px 8px rgba(0,0,0,0.15);
  transition: transform 0.3s ease;
  flex-shrink: 0; /* Previne que o avatar encolha */
}

.avatar-circle:hover {
  transform: scale(1.1);
}

/* Truncamento de textos longos - Desktop */
.custom-table td[data-label="Nome"] .fw-semibold {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.custom-table td[data-label="Email"] .text-secondary {
  max-width: 250px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: inline-block;
}

.hover-row {
  transition: all 0.3s ease;
}

.hover-row:hover {
  background-color: #f8f9fa !important;
  transform: translateX(4px);
}

.hover-scale {
  transition: transform 0.2s;
}
.hover-scale:hover {
  transform: scale(1.15);
}

/* Badge Contador com tema roxo */
.counter-badge {
  background: linear-gradient(135deg, #800080 0%, #6a006a 100%); /* Roxo */
  color: white;
  padding: 10px 24px;
  border-radius: 12px;
  display: inline-flex;
  align-items: center;
  box-shadow: 0 4px 12px rgba(128, 0, 128, 0.25);
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.counter-badge:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(128, 0, 128, 0.35);
}

.counter-badge span:first-child {
  font-family: 'Poppins', sans-serif;
  font-weight: 700;
  font-size: 0.75rem;
  opacity: 0.9;
  letter-spacing: 1px;
}

.counter-badge .h4 {
  font-family: 'Poppins', sans-serif;
  font-weight: 900;
  color: white !important;
  font-size: 1.5rem;
}

/* Badges de perfil com tema roxo */
.badge {
  font-family: 'Poppins', sans-serif;
  font-weight: 600;
  letter-spacing: 0.5px;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}

.bg-primary-subtle {
  background-color: rgba(128, 0, 128, 0.1) !important; /* Roxo claro */
  color: #800080 !important; /* Roxo */
}

/* Toasts */
.custom-toast {
  position: fixed;
  bottom: 24px;
  right: 24px;
  padding: 12px 24px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 12px;
  color: white;
  font-weight: 500;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  z-index: 1100;
}
.sucesso { background-color: #2e7d32; }
.erro { background-color: #d32f2f; }

/* Animações */
.toast-enter-active, .toast-leave-active { transition: all 0.5s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateY(20px); }

/* Responsividade Mobile - Design Criativo e Moderno */
@media (max-width: 768px) {
  .lista-usuarios-container {
    padding: 0.5rem;
  }

  .custom-table thead { 
    display: none; 
  }
  
  .custom-table,
  .custom-table tbody {
    display: block;
    width: 100%;
  }
  
  .custom-table tr {
    display: block;
    margin-bottom: 1.25rem;
    border: none;
    border-radius: 16px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.08);
    background: white;
    padding: 0;
    overflow: hidden;
    position: relative;
    animation: slideInUp 0.4s ease-out;
    transition: all 0.3s ease;
  }

  .custom-table tr:hover {
    box-shadow: 0 6px 16px rgba(0,0,0,0.12);
    transform: translateY(-2px);
  }

  /* Gradiente decorativo no topo do card */
  .custom-table tr::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  }

  .custom-table td {
    display: flex;
    align-items: center;
    width: 100%;
    padding: 1rem 1.25rem;
    border: none;
    text-align: left !important;
    position: relative;
    min-height: auto;
    gap: 0.75rem;
  }

  /* Ícones contextuais antes de cada campo */
  .custom-table td::before {
    content: '';
    font-family: 'bootstrap-icons';
    font-size: 1.1rem;
    color: #667eea;
    min-width: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .custom-table td[data-icon="person-circle"]::before {
    content: '\f4da'; /* person-circle */
  }

  .custom-table td[data-icon="envelope-fill"]::before {
    content: '\f32f'; /* envelope-fill */
  }

  .custom-table td[data-icon="shield-fill-check"]::before {
    content: '\f565'; /* shield-fill-check */
  }

  .custom-table td[data-icon="key-fill"]::before {
    content: '\f424'; /* key-fill */
  }

  .custom-table td[data-icon="tools"]::before {
    content: '\f698'; /* tools */
  }

  /* Wrapper para conteúdo */
  .custom-table td > * {
    flex: 1;
  }

  /* Primeira linha com destaque (nome) */
  .custom-table td[data-label="Nome"] {
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    font-weight: 600;
    font-size: 1.05rem;
    padding: 1.25rem;
    border-bottom: 2px solid #e0e0e0;
  }

  .custom-table td[data-label="Nome"] .d-flex {
    margin: 0;
    max-width: 100%;
  }

  .custom-table td[data-label="Nome"] .fw-semibold {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: calc(100% - 60px); /* Espaço para o avatar */
  }

  .custom-table td[data-label="Email"] {
    border-bottom: 1px solid #f0f0f0;
    font-size: 0.9rem;
    color: #6c757d;
  }

  .custom-table td[data-label="Email"] .text-secondary,
  .custom-table td[data-label="Email"] input {
    word-break: break-all;
    overflow-wrap: break-word;
    max-width: 100%;
  }

  .custom-table td[data-label="Perfil"] {
    border-bottom: 1px solid #f0f0f0;
  }

  .custom-table td[data-label="Perfil"] .badge {
    display: inline-flex;
    font-size: 0.85rem;
    padding: 0.5rem 1rem;
  }

  .custom-table td[data-label="Senha"] {
    border-bottom: 1px solid #f0f0f0;
  }

  .custom-table td[data-label="Ações"] {
    background-color: #fafbfc;
    padding: 1rem 1.25rem;
    justify-content: center;
  }

  .custom-table td[data-label="Ações"] .d-flex {
    justify-content: center !important;
    gap: 0.75rem;
    width: 100%;
  }

  .custom-table td[data-label="Ações"] .btn {
    flex: 1;
    max-width: 120px;
    padding: 0.5rem 1rem;
    font-weight: 600;
  }

  /* Remove padding extra no mobile */
  .custom-table td.ps-4 { 
    padding-left: 1.25rem !important; 
  }
  
  .custom-table td.pe-4 { 
    padding-right: 1.25rem !important; 
  }

  /* Avatar maior e mais bonito no mobile */
  .avatar-circle {
    width: 48px;
    height: 48px;
    font-size: 1.25rem;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  }

  /* Ajusta inputs e selects no modo de edição mobile */
  .custom-table td input.form-control-sm,
  .custom-table td select.form-select-sm {
    width: 100%;
    padding: 0.5rem;
    border-radius: 8px;
  }

  /* Contador badge responsivo */
  .counter-badge {
    font-size: 0.85rem;
    padding: 8px 16px;
    width: 100%;
    justify-content: center;
  }

  .counter-badge .h4 {
    font-size: 1.25rem;
  }

  /* Search bar mobile */
  .search-bar input {
    font-size: 0.95rem;
    padding: 0.75rem 1rem 0.75rem 3rem;
  }

  /* Animação de entrada dos cards */
  @keyframes slideInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  /* Paginação mobile */
  .pagination-container {
    width: 100%;
    justify-content: center !important;
  }

  .pagination-container button {
    width: 40px !important;
    height: 40px !important;
  }

  .pagination-container span {
    font-size: 0.85rem;
    padding: 0 1rem;
  }
}

/* Tablet - Ajustes intermediários */
@media (min-width: 769px) and (max-width: 991px) {
  .custom-table th,
  .custom-table td {
    font-size: 0.9rem;
    padding: 0.75rem !important;
  }

  .avatar-circle {
    width: 36px;
    height: 36px;
    font-size: 0.95rem;
  }
}

/* Animação scale para contador */
.scale-enter-active,
.scale-leave-active {
  transition: all 0.3s ease;
}

.scale-enter-from,
.scale-leave-to {
  opacity: 0;
  transform: scale(0.8);
}

.scale-enter-to,
.scale-leave-from {
  opacity: 1;
  transform: scale(1);
}
</style>
