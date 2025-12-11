<template>
  <div>
    <input
      v-model="filtro"
      type="text"
      placeholder="🔍 Filtrar por nome ou email"
      class="form-control borda-destacada mb-3"
    />

    <div class="table-container">
      <table class="custom-table">
        <thead>
          <tr>
            <th>Nome</th>
            <th>Email</th>
            <th>Role</th>
            <th>Senha</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="usuario in usuariosFiltradosPaginados" :key="usuario.id">
            <td>
              <input
                v-if="editandoId === usuario.id"
                v-model="usuarioEditando.nome"
                type="text"
                class="form-control borda-destacada"
                required
              />
              <span v-else>{{ usuario.nome }}</span>
            </td>
            <td>
              <input
                v-if="editandoId === usuario.id"
                v-model="usuarioEditando.email"
                type="email"
                class="form-control borda-destacada"
                required
              />
              <span v-else>{{ usuario.email }}</span>
            </td>
            <td>
              <select
                v-if="editandoId === usuario.id"
                v-model="usuarioEditando.role"
                class="form-select borda-destacada"
              >
                <option value="cliente">Cliente</option>
                <option value="admin">Admin</option>
              </select>
              <span v-else>{{ usuario.role }}</span>
            </td>
            <td>
              <div v-if="editandoId === usuario.id">
                <input
                  :type="senhaVisivel ? 'text' : 'password'"
                  v-model="usuarioEditando.senha"
                  class="form-control borda-destacada"
                  placeholder="Nova senha"
                />
                <button
                  type="button"
                  class="btn btn-sm btn-outline-secondary mt-1"
                  @click="senhaVisivel = !senhaVisivel"
                >
                  {{ senhaVisivel ? "Ocultar" : "Mostrar" }}
                </button>
              </div>
              <span v-else>••••••••</span>
            </td>
            <td>
              <div class="d-flex gap-2 flex-wrap">
                <template v-if="editandoId === usuario.id">
                  <button class="btn btn-success btn-sm" @click="salvarEdicao">
                    💾 Salvar
                  </button>
                  <button
                    class="btn btn-warning btn-sm"
                    @click="cancelarEdicao"
                  >
                    ❌ Cancelar
                  </button>
                </template>
                <template v-else>
                  <button
                    class="btn btn-outline-primary btn-sm"
                    @click="editarUsuario(usuario)"
                  >
                    ✏️ Editar
                  </button>
                  <button
                    class="btn btn-outline-danger btn-sm"
                    @click="excluirUsuario(usuario.id)"
                  >
                    🗑️ Excluir
                  </button>
                </template>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <!-- Coloque logo abaixo do input -->
    <transition name="contador-animado" mode="out-in">
      <div
        key="count-{{ usuariosFiltrados.length }}"
        class="contador-usuarios mb-3"
      >
        <span>Usuários encontrados:</span>
        <strong>{{ usuariosFiltrados.length }}</strong>
      </div>
    </transition>

    <div class="d-flex justify-content-between align-items-center mt-3">
      <button
        class="btn btn-secondary btn-sm"
        @click="paginaAtual--"
        :disabled="paginaAtual === 1"
      >
        ◀ Anterior
      </button>
      <span class="fw-bold"
        >Página {{ paginaAtual }} de {{ totalPaginas }}</span
      >
      <button
        class="btn btn-secondary btn-sm"
        @click="paginaAtual++"
        :disabled="paginaAtual === totalPaginas"
      >
        Próxima ▶
      </button>
    </div>

    <!-- Mensagens de feedback -->
    <transition name="fade">
      <div
        v-if="mensagem"
        :class="[
          'alert',
          tipoMensagem === 'sucesso' ? 'alert-success' : 'alert-danger',
        ]"
        class="mt-3"
        role="alert"
      >
        {{ mensagem }}
      </div>
    </transition>
  </div>
</template>
<script setup>
import { ref, computed, onMounted, watch } from "vue";
import api from "../api";

const props = defineProps(["atualizar"]);

const usuarios = ref([]);
const filtro = ref("");
const paginaAtual = ref(1);
const porPagina = 5;

const editandoId = ref(null);
const usuarioEditando = ref({
  nome: "",
  email: "",
  role: "",
  senha: "",
});
const senhaVisivel = ref(false);

// Notificações
const mensagem = ref("");
const tipoMensagem = ref(""); // 'sucesso' ou 'erro'
const mostrarMensagem = (msg, tipo = "sucesso") => {
  mensagem.value = msg;
  tipoMensagem.value = tipo;
  setTimeout(() => {
    mensagem.value = "";
  }, 4000);
};

const buscarUsuarios = async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      mostrarMensagem("Token não encontrado. Faça login novamente.", "erro");
      return;
    }

    const { data } = await api.get("/auth/usuarios", {
      headers: { Authorization: `Bearer ${token}` },
    });

    // Mapeia cada usuário, adicionando o id baseado no _id do Mongo
    usuarios.value = data.map((usuario) => ({
      ...usuario,
      id: usuario.id,
    }));

    console.log("Usuários recebidos e mapeados:", usuarios.value);
  } catch (err) {
    console.error(
      "Erro ao buscar usuários:",
      err.response?.data || err.message
    );
    mostrarMensagem(
      "Erro ao buscar usuários: " + (err.response?.data?.msg || err.message),
      "erro"
    );
  }
};

const editarUsuario = (usuario) => {
  editandoId.value = usuario.id;
  usuarioEditando.value = {
    nome: usuario.nome,
    email: usuario.email,
    role: usuario.role,
    senha: "",
  };
  senhaVisivel.value = false;
};

const cancelarEdicao = () => {
  editandoId.value = null;
  usuarioEditando.value = { nome: "", email: "", role: "", senha: "" };
  senhaVisivel.value = false;
};

const salvarEdicao = async () => {
  if (!editandoId.value) {
    mostrarMensagem("ID do usuário não definido.", "erro");
    return;
  }

  try {
    const token = localStorage.getItem("token");
    if (!token) {
      mostrarMensagem("Token não encontrado. Faça login novamente.", "erro");
      return;
    }

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

    mostrarMensagem("Usuário atualizado com sucesso.", "sucesso");
    cancelarEdicao();
    buscarUsuarios();
  } catch (error) {
    console.error(
      "Erro ao salvar edição:",
      error.response?.data || error.message
    );
    mostrarMensagem(
      "Falha ao salvar usuário: " +
        (error.response?.data?.msg || error.message),
      "erro"
    );
  }
};

const excluirUsuario = async (id) => {
  if (confirm(`Tem certeza que deseja excluir o usuário com ID: ${id}?`)) {
    const token = localStorage.getItem("token");
    if (!token) {
      mostrarMensagem("Token não encontrado. Faça login novamente.", "erro");
      return;
    }

    try {
      await api.delete(`/auth/usuarios/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      mostrarMensagem("Usuário excluído com sucesso.", "sucesso");
      buscarUsuarios();
    } catch (error) {
      console.error(
        "Erro ao excluir usuário:",
        error.response?.data || error.message
      );
      mostrarMensagem(
        "Erro ao excluir usuário: " +
          (error.response?.data?.msg || "Erro desconhecido"),
        "erro"
      );
    }
  }
};

const usuariosFiltrados = computed(() =>
  usuarios.value.filter(
    (u) =>
      u.nome.toLowerCase().includes(filtro.value.toLowerCase()) ||
      u.email.toLowerCase().includes(filtro.value.toLowerCase())
  )
);

const totalPaginas = computed(() =>
  Math.ceil(usuariosFiltrados.value.length / porPagina)
);

const usuariosFiltradosPaginados = computed(() => {
  const inicio = (paginaAtual.value - 1) * porPagina;
  return usuariosFiltrados.value.slice(inicio, inicio + porPagina);
});

watch(filtro, () => {
  paginaAtual.value = 1;
});

watch(totalPaginas, (novo) => {
  paginaAtual.value = Math.min(paginaAtual.value, novo || 1);
});

onMounted(buscarUsuarios);
watch(() => props.atualizar, buscarUsuarios);
</script>
<style scoped>
/* Estilo base da borda */
.borda-destacada {
  border: 1px solid #66bb6a;
  border-radius: 5px;
  padding: 10px;
  outline: none;
}
.borda-destacada:focus {
  border-color: #800080;
  box-shadow: 0 0 0 0.2rem rgba(102, 16, 242, 0.25);
}

/* Tabela estilizada */
.table-container {
  overflow-x: auto;
  border: 1px solid #ddd;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.custom-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  background: #fff;
}
.custom-table thead {
  background-color: #66bb6a;
  color: white;
}
.custom-table th,
.custom-table td {
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid #e0e0e0;
}
.custom-table tr:last-child td {
  border-bottom: none;
}
.custom-table tbody tr:hover {
  background-color: #f9f9f9;
}

/* Alertas bonitos */
.alert {
  transition: opacity 0.5s ease;
  padding: 12px 18px;
  border-radius: 6px;
  font-size: 14px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
}
.alert-success {
  background-color: #e0f7e9;
  color: #2e7d32;
  border: 1px solid #a5d6a7;
}
.alert-danger {
  background-color: #fdecea;
  color: #c62828;
  border: 1px solid #ef9a9a;
}

/* Animação */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Outros */
.gap-2 {
  gap: 0.5rem;
}

/* Estilo responsivo para tabela */
@media (max-width: 768px) {
  .custom-table thead {
    display: none;
  }

  .custom-table,
  .custom-table tbody,
  .custom-table tr,
  .custom-table td {
    display: block;
    width: 100%;
  }

  .custom-table tr {
    margin-bottom: 1rem;
    border: 1px solid #ddd;
    border-radius: 8px;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
    padding: 10px;
    background: #fff;
  }

  .custom-table td {
    padding: 10px;
    position: relative;
    text-align: left;
    border-bottom: none;
  }

  .custom-table td::before {
    content: attr(data-label);
    font-weight: bold;
    color: #555;
    display: block;
    margin-bottom: 4px;
  }

  .d-flex {
    flex-direction: column !important;
    align-items: flex-start !important;
  }
}

.contador-usuarios {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #e0f7e9; /* verde clarinho */
  color: #2e7d32; /* verde escuro */
  font-weight: 600;
  padding: 8px 14px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(46, 125, 50, 0.2);
  font-size: 1.1rem;
  user-select: none;
  transition: background-color 0.3s ease;
}

.contador-usuarios strong {
  font-size: 1.4rem;
  color: #145214;
}

/* Animação fade + scale */
.contador-animado-enter-active,
.contador-animado-leave-active {
  transition: all 0.4s ease;
  position: relative;
  display: inline-block;
}
.contador-animado-enter-from,
.contador-animado-leave-to {
  opacity: 0;
  transform: scale(0.8);
}
.contador-animado-enter-to,
.contador-animado-leave-from {
  opacity: 1;
  transform: scale(1);
}
</style>
