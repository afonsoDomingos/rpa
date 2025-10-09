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

    <div class="noticias-container bg-white shadow-lg rounded p-3">
      <!-- Cabeçalho -->
      <div class="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <h2 class="text-purple fw-bold titulo-pagina m-0 text-center flex-grow-1">
          Gestão de Notícias
        </h2>
        <button class="btn btn-purple btn-sm px-3 py-1 fw-bold sombra-suave" @click="abrirModal()">+ Nova</button>
      </div>

      <!-- Feedbacks -->
      <div v-if="mensagem.text" :class="['alert', mensagem.tipo === 'erro' ? 'alert-danger' : 'alert-success']">
        {{ mensagem.text }}
      </div>

      <!-- Lista de notícias -->
      <div v-if="noticias.length > 0" class="noticias-grid-admin">
        <div
          v-for="noticia in noticias"
          :key="noticia._id"
          class="card-admin sombra-suave borda-destacada"
        >
          <div class="card-image">
            <img
              v-if="noticia.imagem"
              :src="API_BASE + noticia.imagem"
              alt="Imagem da Notícia"
              class="img-fluid"
            />
            <div v-else class="placeholder-image"></div>
          </div>
          <div class="card-overlay-admin">
            <p class="card-resumo-admin">{{ noticia.resumo }}</p>
            <div class="card-footer-admin">
              <button class="btn-edit" @click="abrirModal(noticia)">✏️</button>
              <button class="btn-delete" @click="removerNoticia(noticia._id)">🗑</button>
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
          <h5 class="mb-3 text-center text-purple fw-bold">
            {{ noticiaSelecionada?._id ? 'Editar Notícia' : 'Nova Notícia' }}
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
              <button type="submit" class="btn btn-purple btn-sm me-2 borda-destacada">💾 Salvar</button>
              <button type="button" class="btn btn-secondary btn-sm borda-destacada" @click="fecharModal">❌ Cancelar</button>
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
const mensagem = ref({ text: '', tipo: 'sucesso' })

// Mostrar mensagem temporária
const mostrarMensagem = (texto, tipo = 'sucesso') => {
  mensagem.value = { text: texto, tipo }
  setTimeout(() => { mensagem.value.text = '' }, 4000)
}

// Fetch notícias
const fetchNoticias = async () => {
  try {
    const res = await axios.get(API_URL)
    noticias.value = res.data
  } catch (err) {
    console.error('[ERRO] Falha ao carregar notícias:', err.message)
    mostrarMensagem('Falha ao carregar notícias', 'erro')
  }
}

// Abrir modal
const abrirModal = (noticia = null) => {
  noticiaSelecionada.value = noticia ? noticia : null
  noticiaForm.value = noticia ? { ...noticia } : { titulo: '', resumo: '', conteudo: '', data: '' }
  imagemArquivo.value = null
  modalAberto.value = true
}

// Fechar modal
const fecharModal = () => (modalAberto.value = false)

// Upload de imagem
const handleFileUpload = (event) => {
  imagemArquivo.value = event.target.files[0]
}

// Salvar notícia
const salvarNoticia = async () => {
  try {
    const formData = new FormData()
    for (const campo in noticiaForm.value) formData.append(campo, noticiaForm.value[campo] || '')
    if (imagemArquivo.value) formData.append('imagem', imagemArquivo.value)

    if (noticiaSelecionada.value?._id) {
      const res = await axios.put(`${API_URL}/${noticiaSelecionada.value._id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      const index = noticias.value.findIndex(n => n._id === noticiaSelecionada.value._id)
      noticias.value[index] = res.data
      mostrarMensagem('Notícia atualizada com sucesso')
    } else {
      const res = await axios.post(API_URL, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      noticias.value.push(res.data)
      mostrarMensagem('Notícia criada com sucesso')
    }
    fecharModal()
  } catch (err) {
    console.error('[ERRO] Falha ao salvar notícia:', err.message)
    mostrarMensagem('Falha ao salvar notícia', 'erro')
  }
}

// Remover notícia
const removerNoticia = async (_id) => {
  if (!confirm('Tem certeza que deseja remover esta notícia?')) return
  try {
    await axios.delete(`${API_URL}/${_id}`)
    noticias.value = noticias.value.filter(n => n._id !== _id)
    mostrarMensagem('Notícia removida com sucesso')
  } catch (err) {
    console.error('[ERRO] Falha ao remover notícia:', err.message)
    mostrarMensagem('Falha ao remover notícia', 'erro')
  }
}

onMounted(fetchNoticias)
</script>

<style scoped>
.noticias-container { max-width: 95%; margin: auto; border-radius: 8px; }
.titulo-pagina { font-size: 1.3rem; color: #6B46C1; }

/* Grid de cards pequenos */
.noticias-grid-admin {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: center;
}

/* Card pequeno */
.card-admin {
  flex: 0 0 180px;
  aspect-ratio: 1/1;
  border-radius: 12px;
  overflow: hidden;
  position: relative;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  transition: all 0.3s ease;
}
.card-admin:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(107,70,193,0.2);
}

/* Imagem */
.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 12px;
  cursor: pointer;
  transition: transform 0.3s ease;
}
.card-image img:hover { transform: scale(1.03); }

.placeholder-image {
  width: 100%;
  height: 100%;
  background: #e0e0e0;
  border-radius: 12px;
}

/* Overlay do card */
.card-overlay-admin {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0,0,0,0.55);
  padding: 6px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  color: #fff;
}

.card-resumo-admin {
  font-size: 0.65rem;
  line-height: 1.2;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 5;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-footer-admin {
  display: flex;
  justify-content: space-between;
  margin-top: 4px;
}

/* Botões editar/deletar */
.btn-edit, .btn-delete {
  font-size: 0.75rem;
  padding: 3px 6px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
}
.btn-edit { background: #6B46C1; color: #fff; }
.btn-edit:hover { background: #553C9A; }
.btn-delete { background: #e53e3e; color: #fff; }
.btn-delete:hover { background: #c53030; }

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.45);
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

/* Feedbacks */
.alert { padding: 8px 12px; border-radius: 6px; margin-bottom: 10px; font-size: 0.85rem; text-align: center; }
.alert-success { background-color: #6B46C1; color: #fff; }
.alert-danger { background-color: #e53e3e; color: #fff; }
</style>
