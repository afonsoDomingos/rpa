<template>
  <div>
    <!-- Navbar fixa -->
    <div class="container-fluid position-sticky z-index-sticky top-0 px-0">
      <div class="row gx-0">
        <div class="col-12">
          <NavbarDefault :sticky="true" />
        </div>
      </div>
    </div>

    <br /><br /><br />
<br /><br /><br />
    <!-- Container principal -->
    <div class="noticias-container bg-white shadow-lg rounded p-3">
      <!-- Cabeçalho -->
      <div class="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <h2 class="text-success fw-bold titulo-pagina m-0 text-center flex-grow-1">
          Gestão de Notícias
        </h2>
        <button class="btn btn-success btn-lg px-4 py-2 fw-bold sombra-suave" @click="abrirModal()">+ Nova</button>
      </div>

      <!-- Lista de notícias -->
      <div v-if="noticias.length > 0" class="noticias-grid">
        <div
          v-for="noticia in noticias"
          :key="noticia.id"
          class="card shadow-sm borda-destacada"
        >
          <div class="card-body">
            <h6 class="fw-bold card-titulo">{{ noticia.titulo }}</h6>
            <p class="text-muted small mb-1">{{ noticia.data }}</p>
            <p class="resumo">{{ noticia.resumo }}</p>

            <div v-if="noticia.imagem" class="mb-2 text-center">
              <img
                :src="API_BASE + noticia.imagem"
                alt="Imagem da Notícia"
                class="img-fluid rounded"
              />
            </div>

            <div class="card-footer">
              <button class="btn btn-outline-primary btn-sm borda-destacada" @click="abrirModal(noticia)">✏️</button>
              <button class="btn btn-outline-danger btn-sm borda-destacada" @click="removerNoticia(noticia.id)">🗑</button>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="text-center text-muted small py-3">
        Nenhuma notícia publicada ainda.
      </div>

      <!-- Modal -->
      <div v-if="modalAberto" class="modal-overlay" @click.self="fecharModal">
        <div class="modal-content conteudo-modal">
          <h5 class="mb-3 text-center text-success fw-bold">
            {{ noticiaSelecionada?.id ? 'Editar Notícia' : 'Nova Notícia' }}
          </h5>
          <form @submit.prevent="salvarNoticia">
            <div class="mb-2">
              <label class="form-label small">Título</label>
              <input v-model="noticiaForm.titulo" type="text" class="form-control form-control-sm borda-destacada" required />
            </div>
            <div class="mb-2">
              <label class="form-label small">Resumo</label>
              <textarea v-model="noticiaForm.resumo" class="form-control form-control-sm borda-destacada" rows="2" required></textarea>
            </div>
            <div class="mb-2">
              <label class="form-label small">Conteúdo</label>
              <textarea v-model="noticiaForm.conteudo" class="form-control form-control-sm borda-destacada" rows="4" required></textarea>
            </div>
            <div class="mb-2">
              <label class="form-label small">Data</label>
              <input v-model="noticiaForm.data" type="date" class="form-control form-control-sm borda-destacada" />
            </div>
            <div class="mb-2">
              <label class="form-label small">Imagem</label>
              <input type="file" class="form-control form-control-sm borda-destacada" @change="handleFileUpload" />
            </div>
            <div class="text-end">
              <button type="submit" class="btn btn-success btn-sm me-2 borda-destacada">💾</button>
              <button type="button" class="btn btn-secondary btn-sm borda-destacada" @click="fecharModal">❌</button>
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

const API_BASE = 'https://apirpa.onrender.com'
const API_URL = `${API_BASE}/api/noticias`

const noticias = ref([])
const modalAberto = ref(false)
const noticiaSelecionada = ref(null)
const noticiaForm = ref({ titulo: '', resumo: '', conteudo: '', data: '' })
const imagemArquivo = ref(null)

const fetchNoticias = async () => {
  try {
    const res = await axios.get(API_URL)
    noticias.value = res.data
  } catch (err) {
    console.error('[ERRO] Falha ao carregar notícias:', err.message)
  }
}

const abrirModal = (noticia = null) => {
  noticiaSelecionada.value = noticia ? noticia : null
  noticiaForm.value = noticia ? { ...noticia } : { titulo: '', resumo: '', conteudo: '', data: '' }
  imagemArquivo.value = null
  modalAberto.value = true
}

const fecharModal = () => (modalAberto.value = false)

const handleFileUpload = (event) => {
  imagemArquivo.value = event.target.files[0]
}

const salvarNoticia = async () => {
  try {
    const formData = new FormData()
    for (const campo in noticiaForm.value) formData.append(campo, noticiaForm.value[campo] || '')
    if (imagemArquivo.value) formData.append('imagem', imagemArquivo.value)

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
    console.error('[ERRO] Falha ao salvar notícia:', err.message)
  }
}

const removerNoticia = async (id) => {
  if (!confirm('Tem certeza que deseja remover esta notícia?')) return
  try {
    await axios.delete(`${API_URL}/${id}`)
    noticias.value = noticias.value.filter(n => n.id !== id)
  } catch (err) {
    console.error('[ERRO] Falha ao remover notícia:', err.message)
  }
}

onMounted(fetchNoticias)
</script>

<style scoped>
.noticias-container {
  max-width: 95%;
  margin: auto;
  border-radius: 8px;
}

.titulo-pagina {
  font-size: 1.3rem;
}

.noticias-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: center;
}

.card {
  flex: 1 1 240px;
  max-width: 300px;
  border-radius: 10px;
  border: 1px solid #e0e0e0;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}
.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
.card-body {
  padding: 10px;
  text-align: center;
}
.card-titulo {
  font-size: 1rem;
  margin-bottom: 6px;
}
.resumo {
  font-size: 0.85rem;
  color: #555;
}
.card-footer {
  display: flex;
  justify-content: center;
  gap: 6px;
  padding: 6px 0;
}

img.img-fluid {
  max-height: 130px;
  object-fit: cover;
  border-radius: 6px;
}

.borda-destacada {
  border: 1px solid #66bb6a;
  border-radius: 5px;
}

.sombra-suave {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
}
.conteudo-modal {
  max-width: 400px;
  background: white;
  padding: 16px;
  border-radius: 8px;
  overflow-y: auto;
}
</style>
