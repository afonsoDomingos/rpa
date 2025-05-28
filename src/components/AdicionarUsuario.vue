<template>
  <div class="card mb-4">
    <div class="card-body">
      <h5 class="card-title">Criar Novo Usuário</h5>

      <form @submit.prevent="criarUsuario" novalidate>
        <div class="mb-3">
          <label class="form-label">Nome</label>
          <input type="text" class="form-control borda-destacada" :class="{ 'is-invalid': erro.nome }" v-model="novoUsuario.nome" />
          <div class="invalid-feedback">Nome é obrigatório.</div>
        </div>

        <div class="mb-3">
          <label class="form-label">Email</label>
          <input type="email" class="form-control borda-destacada" :class="{ 'is-invalid': erro.email }" v-model="novoUsuario.email" />
          <div class="invalid-feedback">Email válido é obrigatório.</div>
        </div>

        <div class="mb-3 position-relative">
          <label class="form-label">Senha</label>
          <input :type="senhaVisivel ? 'text' : 'password'" class="form-control borda-destacada" :class="{ 'is-invalid': erro.senha }" v-model="novoUsuario.senha" />
          <i class="bi" :class="senhaVisivel ? 'bi-eye-slash' : 'bi-eye'" @click="senhaVisivel = !senhaVisivel"
             style="position: absolute; right: 10px; top: 38px; cursor: pointer"></i>
          <div class="invalid-feedback">Senha é obrigatória.</div>
        </div>

        <div class="mb-3">
          <label class="form-label">Perfil</label>
          <select class="form-select" v-model="novoUsuario.role">
            <option value="cliente">Cliente</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <button class="btn btn-primary" type="submit">Criar Usuário</button>
      </form>

      <!-- Mensagem de sucesso -->
      <transition name="fade">
        <div v-if="mensagemSucesso" class="mensagem-sucesso mt-3">
          {{ mensagemSucesso }}
        </div>
      </transition>

      <!-- Mensagem de erro -->
      <transition name="fade">
        <div v-if="mensagemErro" class="mensagem-erro mt-3">
          {{ mensagemErro }}
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import api from '../api'

const emit = defineEmits(['usuario-criado'])

const senhaVisivel = ref(false)
const erro = ref({ nome: false, email: false, senha: false })

const mensagemSucesso = ref('')
const mensagemErro = ref('')

const novoUsuario = ref({
  nome: '',
  email: '',
  senha: '',
  role: 'cliente'
})

const validarEmail = (email) => /\S+@\S+\.\S+/.test(email)

const criarUsuario = async () => {
  erro.value.nome = !novoUsuario.value.nome
  erro.value.email = !validarEmail(novoUsuario.value.email)
  erro.value.senha = !novoUsuario.value.senha

  mensagemErro.value = ''
  mensagemSucesso.value = ''

  if (erro.value.nome || erro.value.email || erro.value.senha) return

  try {
    const res = await api.post('/auth/register', novoUsuario.value)
    mensagemSucesso.value = res.data.msg || 'Usuário criado com sucesso!'
    emit('usuario-criado')
    novoUsuario.value = { nome: '', email: '', senha: '', role: 'cliente' }
    erro.value = { nome: false, email: false, senha: false }
  } catch (err) {
    mensagemErro.value = err.response?.data?.msg || 'Erro ao criar usuário'
    console.error('Erro ao criar usuário:', err)
  }
}
</script>

<style scoped>
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

.mensagem-sucesso {
  background-color: #d1e7dd;
  color: #0f5132;
  border: 1px solid #badbcc;
  padding: 12px 20px;
  border-radius: 5px;
  font-weight: 500;
}

.mensagem-erro {
  background-color: #f8d7da;
  color: #842029;
  border: 1px solid #f5c2c7;
  padding: 12px 20px;
  border-radius: 5px;
  font-weight: 500;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.4s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
