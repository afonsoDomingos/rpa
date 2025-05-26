<!-- src/components/ListaUsuarios.vue -->
<template>
  <div>

    <input v-model="filtro" type="text" placeholder="Filtrar por nome ou email" class="form-control borda-destacada  mb-3 " />

    <div class="table-responsive">
      <table class="table table-striped table-bordered">
        <thead class="table-light">
          <tr>
            <th>Nome</th>
            <th>Email</th>
            <th>Role</th>
            <th>Senha</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="usuario in usuariosFiltradosPaginados" :key="usuario._id">
            <td>
              <input
                v-if="editandoId === usuario._id"
                v-model="usuarioEditando.nome"
                type="text"
                class="form-control"
                required
              />
              <span v-else>{{ usuario.nome }}</span>
            </td>
            <td>
              <input
                v-if="editandoId === usuario._id"
                v-model="usuarioEditando.email"
                type="email"
                class="form-control"
                required
              />
              <span v-else>{{ usuario.email }}</span>
            </td>
            <td>
              <select
                v-if="editandoId === usuario._id"
                v-model="usuarioEditando.role"
                class="form-select"
              >
                <option value="cliente">Cliente</option>
                <option value="admin">Admin</option>
              </select>
              <span v-else>{{ usuario.role }}</span>
            </td>
            <td>
              <input
                v-if="editandoId === usuario._id"
                :type="senhaVisivel ? 'text' : 'password'"
                v-model="usuarioEditando.senha"
                class="form-control"
                placeholder="Nova senha"
              />
              <button
                v-if="editandoId === usuario._id"
                type="button"
                class="btn btn-sm btn-outline-secondary mt-1"
                @click="senhaVisivel = !senhaVisivel"
              >
                {{ senhaVisivel ? 'Ocultar' : 'Mostrar' }}
              </button>
              <span v-else>••••••••</span>
            </td>
            <td>
              <template v-if="editandoId === usuario._id">
                <button
                  class="btn btn-sm btn-success me-2"
                  @click="salvarEdicao"
                >
                  Salvar
                </button>
                <button
                  class="btn btn-sm btn-warning"
                  @click="cancelarEdicao"
                >
                  Cancelar
                </button>
              </template>
              <template v-else>
                <button
                  class="btn btn-sm btn-outline-primary me-2"
                  @click="editarUsuario(usuario)"
                >
                  Editar
                </button>
                <button
                  class="btn btn-sm btn-outline-danger"
                  @click="excluirUsuario(usuario._id)"
                >
                  Excluir
                </button>
              </template>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="d-flex justify-content-between align-items-center mt-3">
      <button
        class="btn btn-secondary btn-sm"
        @click="paginaAtual--"
        :disabled="paginaAtual === 1"
      >
        Anterior
      </button>
      <span>Página {{ paginaAtual }} de {{ totalPaginas }}</span>
      <button
        class="btn btn-secondary btn-sm"
        @click="paginaAtual++"
        :disabled="paginaAtual === totalPaginas"
      >
        Próxima
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import api from '../api'

const props = defineProps(['atualizar'])

const usuarios = ref([])
const filtro = ref('')
const paginaAtual = ref(1)
const porPagina = 5

const editandoId = ref(null)
const usuarioEditando = ref({
  nome: '',
  email: '',
  role: '',
  senha: ''
})
const senhaVisivel = ref(false)

const buscarUsuarios = async () => {
  const { data } = await api.get('/auth/usuarios')
  usuarios.value = data
}

const editarUsuario = (usuario) => {
  editandoId.value = usuario._id
  // Clonar objeto para edição
  usuarioEditando.value = {
    nome: usuario.nome,
    email: usuario.email,
    role: usuario.role,
    senha: '' // senha começa vazia para não exibir senha atual
  }
  senhaVisivel.value = false
}

const cancelarEdicao = () => {
  editandoId.value = null
  usuarioEditando.value = { nome: '', email: '', role: '', senha: '' }
  senhaVisivel.value = false
}

const salvarEdicao = async () => {
  try {
    const payload = {
      nome: usuarioEditando.value.nome,
      email: usuarioEditando.value.email,
      role: usuarioEditando.value.role
    }
    // Só envia a senha se foi digitada alguma coisa
    if (usuarioEditando.value.senha && usuarioEditando.value.senha.trim() !== '') {
      payload.senha = usuarioEditando.value.senha
    }
    await api.put(`/auth/usuarios/${editandoId.value}`, payload)
    editandoId.value = null
    usuarioEditando.value = { nome: '', email: '', role: '', senha: '' }
    senhaVisivel.value = false
    buscarUsuarios()
  } catch (error) {
    console.error('Erro ao salvar edição:', error)
    alert('Falha ao salvar usuário.')
  }
}

const excluirUsuario = async (id) => {
  if (confirm('Tem certeza que deseja excluir este usuário?')) {
    await api.delete(`/auth/usuarios/${id}`)
    if (editandoId.value === id) {
      cancelarEdicao()
    }
    buscarUsuarios()
  }
}

const usuariosFiltrados = computed(() =>
  usuarios.value.filter(
    (u) =>
      u.nome.toLowerCase().includes(filtro.value.toLowerCase()) ||
      u.email.toLowerCase().includes(filtro.value.toLowerCase())
  )
)

const totalPaginas = computed(() =>
  Math.ceil(usuariosFiltrados.value.length / porPagina)
)

const usuariosFiltradosPaginados = computed(() => {
  const inicio = (paginaAtual.value - 1) * porPagina
  return usuariosFiltrados.value.slice(inicio, inicio + porPagina)
})

watch(filtro, () => {
  paginaAtual.value = 1
})
watch(totalPaginas, (novo) => {
  paginaAtual.value = Math.min(paginaAtual.value, novo || 1)
})
onMounted(buscarUsuarios)
watch(() => props.atualizar, buscarUsuarios)
</script>

<style scoped>

.borda-destacadatxt {
  border: 1px solid #707070;
  border-radius: 5px;
  padding: 10px;
  outline: none;
}

.borda-destacada {
  border: 1px solid #66bb6a;
  border-radius: 5px;
  padding: 10px;
  outline: none;
}

.borda-destacada:focus {
  border-color: #800080;
  /* Roxo */
  box-shadow: 0 0 0 0.2rem rgba(102, 16, 242, 0.25);
}
</style>


