<template>
  <div>
    <!-- Navbar fixo -->
    <div class="container-fluid position-sticky z-index-sticky top-0 px-0">
      <div class="row gx-0">
        <div class="col-12">
          <NavbarDefault :sticky="true" />
        </div>
      </div>
    </div>

    <br/><br/><br/>

    <!-- Conteúdo principal -->
    <div class="container-fluid pag-container-fluid py-4 my-4 bg-white shadow-sm rounded borda-destacada pag-container-responsive">
      <h2 class="mb-4 text-center text-success fw-bold">Gestão de Notícias</h2>

      <!-- Botão para criar nova notícia -->
      <div class="text-end mb-3">
        <button class="btn btn-success" @click="abrirModal()">+ Nova Notícia</button>
      </div>

      <!-- Lista de notícias -->
      <div v-if="noticias.length > 0">
        <div
          v-for="noticia in noticias"
          :key="noticia.id"
          class="card shadow-sm mb-3 borda-destacada"
        >
          <div class="card-body">
            <h5 class="fw-bold">{{ noticia.titulo }}</h5>
            <p class="text-muted small mb-1">{{ noticia.data }}</p>
            <p>{{ noticia.resumo }}</p>
            <div v-if="noticia.imagem" class="mb-2 text-center">
              <!-- Corrigido: monta URL completa do backend -->
              <img 
                :src="API_BASE + noticia.imagem" 
                alt="Imagem da Notícia" 
                class="img-fluid rounded" 
                style="max-height: 200px;"
              >
            </div>
            <div class="d-flex gap-2 mt-2">
              <button class="btn btn-outline-primary btn-sm" @click="abrirModal(noticia)">
                ✏️ Editar
              </button>
              <button class="btn btn-outline-danger btn-sm" @click="removerNoticia(noticia.id)">
                🗑 Remover
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="text-center text-muted">
        Nenhuma notícia publicada ainda.
      </div>

      <!-- Modal para adicionar/editar notícia -->
      <div v-if="modalAberto" class="modal-overlay" @click.self="fecharModal">
        <div class="modal-content p-4 shadow-lg rounded bg-white" style="max-width: 700px; margin: auto;">
          <h4 class="mb-3 text-center">
            {{ noticiaSelecionada?.id ? 'Editar Notícia' : 'Nova Notícia' }}
          </h4>
          <form @submit.prevent="salvarNoticia">
            <div class="mb-3">
              <label class="form-label">Título</label>
              <input v-model="noticiaForm.titulo" type="text" class="form-control borda-destacadanome" required />
            </div>
            <div class="mb-3">
              <label class="form-label">Resumo</label>
              <textarea v-model="noticiaForm.resumo" class="form-control borda-destacada" rows="2" required></textarea>
            </div>
            <div class="mb-3">
              <label class="form-label">Conteúdo Completo</label>
              <textarea v-model="noticiaForm.conteudo" class="form-control borda-destacada" rows="5" required></textarea>
            </div>
            <div class="mb-3">
              <label class="form-label">Data (opcional)</label>
              <input v-model="noticiaForm.data" type="date" class="form-control borda-destacada" />
            </div>
            <div class="mb-3">
              <label class="form-label">Imagem (opcional)</label>
              <input type="file" class="form-control borda-destacada" @change="handleFileUpload" />
            </div>
            <div class="text-end">
              <button type="submit" class="btn btn-success me-2">💾 Salvar</button>
              <button type="button" class="btn btn-secondary" @click="fecharModal">❌ Cancelar</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import NavbarDefault from "../examples/navbars/NavbarDefault.vue"

// Detecta ambiente: dev ou produção
const isDev = window.location.hostname === 'localhost'

// Base URL do backend
const API_BASE = isDev 
  ? 'http://localhost:5000' 
  : 'https://apirpa.onrender.com'

// Endpoint das notícias
const API_URL = `${API_BASE}/api/noticias`

const noticias = ref([])
const modalAberto = ref(false)
const noticiaSelecionada = ref(null)
const noticiaForm = ref({
  titulo: '',
  resumo: '',
  conteudo: '',
  data: ''
})
const imagemArquivo = ref(null)

// Carregar notícias
const fetchNoticias = async () => {
  try {
    const res = await axios.get(API_URL)
    noticias.value = res.data
  } catch (err) {
    console.error('Erro ao carregar notícias:', err.message)
    if (err.response) {
      console.error('Status:', err.response.status)
      console.error('Resposta:', err.response.data)
    }
  }
}

// Abrir modal
const abrirModal = (noticia = null) => {
  if (noticia) {
    noticiaSelecionada.value = noticia
    noticiaForm.value = { ...noticia }
  } else {
    noticiaSelecionada.value = null
    noticiaForm.value = { titulo: '', resumo: '', conteudo: '', data: '' }
  }
  imagemArquivo.value = null
  modalAberto.value = true
}

const fecharModal = () => {
  modalAberto.value = false
}

// Captura o arquivo
const handleFileUpload = (event) => {
  imagemArquivo.value = event.target.files[0]
}

// Salvar notícia (com imagem)
const salvarNoticia = async () => {
  try {
    const formData = new FormData()
    formData.append('titulo', noticiaForm.value.titulo)
    formData.append('resumo', noticiaForm.value.resumo)
    formData.append('conteudo', noticiaForm.value.conteudo)
    formData.append('data', noticiaForm.value.data || '')

    if (imagemArquivo.value) {
      formData.append('imagem', imagemArquivo.value)
    }

    if (noticiaSelecionada.value?.id) {
      const res = await axios.put(`${API_URL}/${noticiaSelecionada.value.id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      const index = noticias.value.findIndex(n => n.id === noticiaSelecionada.value.id)
      noticias.value[index] = res.data
    } else {
      const res = await axios.post(API_URL, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      noticias.value.push(res.data)
    }
    fecharModal()
  } catch (err) {
    console.error('Erro ao salvar notícia:', err.message)
    if (err.response) {
      console.error('Status:', err.response.status)
      console.error('Resposta:', err.response.data)
    }
  }
}

// Remover notícia
const removerNoticia = async (id) => {
  if (!confirm('Tem certeza que deseja remover esta notícia?')) return
  try {
    await axios.delete(`${API_URL}/${id}`)
    noticias.value = noticias.value.filter(n => n.id !== id)
  } catch (err) {
    console.error('Erro ao remover notícia:', err.message)
    if (err.response) {
      console.error('Status:', err.response.status)
      console.error('Resposta:', err.response.data)
    }
  }
}

onMounted(() => {
  fetchNoticias()
})
</script>

<style scoped>
.pag-container-fluid {
  max-width: 900px;
  margin: auto;
}
.borda-destacadanome {
  border: 2px solid #66bb6a;
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
  box-shadow: 0 0 0 0.2rem rgba(102, 16, 242, 0.25);
}
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
}
.modal-content {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  max-height: 90vh;
  overflow-y: auto;
}
</style>
