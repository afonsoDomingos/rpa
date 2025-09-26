
<template>
  <div class="noticias-container">
    <!-- Campo de busca -->
    <div class="busca-container mb-4">
      <input
        v-model="termoBusca"
        type="text"
        class="borda-destacada search-input"
        placeholder="Pesquisar notícias..."
        aria-label="Pesquisar notícias"
      />
    </div>

    <!-- Lista de notícias -->
    <div
      v-if="noticiasFiltradas.length > 0"
      class="noticias-grid"
      ref="noticiasGrid"
      @mouseenter="pausarAutoScroll"
      @mouseleave="retomarAutoScroll"
    >
      <div
        v-for="(noticia, index) in noticiasFiltradas"
        :key="noticia.id"
        class="card shadow-sm"
      >
        <div class="card-body">
          <h5 class="fw-bold text-success mb-2 borda-destacada">{{ noticia.titulo }}</h5>
          <p class="text-muted small mb-2">{{ formatarData(noticia.data) }}</p>
          <p class="resumo">{{ noticia.resumo }}</p>

          <div v-if="noticia.imagem" class="mb-3 text-center">
            <img
              :src="API_BASE + noticia.imagem"
              alt="Imagem da Notícia"
              class="img-fluid rounded"
              style="max-height: 180px; cursor: pointer;"
              @click="abrirImagem(noticia)"
            />
          </div>

          <div class="card-footer">
            <button
              class="borda-destacada btn-ler-mais"
              @click="abrirModalConteudo(noticia)"
              aria-label="Ler mais sobre a notícia"
            >
              Ler mais
            </button>
            <p class="text-muted small visualizacoes">
              <span class="icon">👁️</span> {{ noticia.visualizacoes || 0 }}
            </p>
          </div>
        </div>
      </div>
      <!-- Botão Próximo acima da última notícia -->
      <button
        v-if="noticiasFiltradas.length > 0"
        class="btn borda-destacada btn-proximo"
        @click="proximaNoticia"
        aria-label="Avançar para a próxima notícia"
      >
        <span class="arrow-icon">▶</span>
      </button>
      <!-- Botão para a primeira notícia -->
      <button
        v-if="noticiasFiltradas.length > 0"
        class="btn borda-destacada btn-primeira"
        @click="irParaPrimeiraNoticia"
        aria-label="Voltar para a primeira notícia"
      >
        <span class="arrow-icon">⏮</span>
      </button>
      <!-- Botão para a última notícia -->
      <button
        v-if="noticiasFiltradas.length > 0"
        class="btn borda-destacada btn-ultima"
        @click="irParaUltimaNoticia"
        aria-label="Ir para a última notícia"
      >
        <span class="arrow-icon">⏭</span>
      </button>
    </div>

    <!-- Mensagem se não houver notícias -->
    <div v-if="noticiasFiltradas.length === 0" class="text-center text-muted mt-3">
      Nenhuma notícia encontrada.
    </div>

    <!-- Modal para imagem ampliada -->
    <div v-if="imagemAmpliada" class="modal" @click="fecharImagem">
      <div class="modal-content imagem-modal">
        <span class="fechar-modal" @click="fecharImagem">&times;</span>
        <img :src="API_BASE + imagemAmpliada" alt="Imagem Ampliada" class="img-fluid" />
      </div>
    </div>

    <!-- Modal para conteúdo da notícia -->
    <div v-if="conteudoModal" class="modal" @click="fecharModalConteudo">
      <div class="modal-content conteudo-modal">
        <span class="fechar-modal" @click="fecharModalConteudo">&times;</span>
        <p class="conteudo">{{ conteudoModal }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import axios from 'axios'

const isDev = window.location.hostname === 'localhost'
const API_BASE = isDev ? 'http://localhost:5000' : 'https://apirpa.onrender.com'
const API_URL = `${API_BASE}/api/noticias`

const noticias = ref([])
const termoBusca = ref('')
const imagemAmpliada = ref(null)
const conteudoModal = ref(null)
const noticiasGrid = ref(null)
let autoScrollInterval = null

const noticiasFiltradas = computed(() => {
  if (!termoBusca.value) return noticias.value
  return noticias.value.filter(noticia =>
    noticia.titulo.toLowerCase().includes(termoBusca.value.toLowerCase()) ||
    noticia.resumo.toLowerCase().includes(termoBusca.value.toLowerCase()) ||
    noticia.conteudo.toLowerCase().includes(termoBusca.value.toLowerCase())
  )
})

const proximaNoticia = () => {
  if (noticiasGrid.value) {
    const cardWidth = 350 + 20 // Largura do card + gap
    const maxScroll = noticiasGrid.value.scrollWidth - noticiasGrid.value.clientWidth
    if (noticiasGrid.value.scrollLeft >= maxScroll - 1) {
      // Volta ao início quando atinge o final
      noticiasGrid.value.scrollTo({ left: 0, behavior: 'smooth' })
    } else {
      noticiasGrid.value.scrollBy({ left: cardWidth, behavior: 'smooth' })
    }
  }
}

const irParaPrimeiraNoticia = () => {
  if (noticiasGrid.value) {
    noticiasGrid.value.scrollTo({ left: 0, behavior: 'smooth' })
  }
}

const irParaUltimaNoticia = () => {
  if (noticiasGrid.value) {
    const maxScroll = noticiasGrid.value.scrollWidth - noticiasGrid.value.clientWidth
    noticiasGrid.value.scrollTo({ left: maxScroll, behavior: 'smooth' })
  }
}

const iniciarAutoScroll = () => {
  autoScrollInterval = setInterval(() => {
    proximaNoticia()
  }, 3000) // 3 segundos
}

const pausarAutoScroll = () => {
  if (autoScrollInterval) {
    clearInterval(autoScrollInterval)
    autoScrollInterval = null
  }
}

const retomarAutoScroll = () => {
  if (!autoScrollInterval) {
    iniciarAutoScroll()
  }
}

onMounted(() => {
  fetchNoticias()
  iniciarAutoScroll()
})

onUnmounted(() => {
  pausarAutoScroll()
})

const abrirImagem = async (noticia) => {
  imagemAmpliada.value = noticia.imagem
  // Incrementar visualizações localmente
  noticia.visualizacoes = (noticia.visualizacoes || 0) + 1
  // Enviar atualização para a API
  try {
    await axios.patch(`${API_URL}/${noticia.id}`, { visualizacoes: noticia.visualizacoes })
  } catch (err) {
    console.error('Erro ao atualizar visualizações', err)
  }
}

const fecharImagem = () => {
  imagemAmpliada.value = null
}

const abrirModalConteudo = async (noticia) => {
  conteudoModal.value = noticia.conteudo
  // Incrementar visualizações localmente
  noticia.visualizacoes = (noticia.visualizacoes || 0) + 1
  // Enviar atualização para a API
  try {
    await axios.patch(`${API_URL}/${noticia.id}`, { visualizacoes: noticia.visualizacoes })
  } catch (err) {
    console.error('Erro ao atualizar visualizações', err)
  }
}

const fecharModalConteudo = () => {
  conteudoModal.value = null
}

const fetchNoticias = async () => {
  try {
    const res = await axios.get(API_URL)
    noticias.value = res.data
  } catch (err) {
    console.error('Erro ao carregar notícias', err)
  }
}

const formatarData = (data) => {
  if (!data) return ''
  const d = new Date(data)
  return d.toLocaleDateString('pt-PT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}
</script>

<style scoped>
.noticias-container {
  max-width: 1200px;
  margin: auto;
  padding: 20px;
}

.busca-container {
  max-width: 600px;
  margin: 0 auto;
  display: flex;
  justify-content: center;
}

.search-input {
  padding: 12px;
  font-size: 1rem;
  color: #333;
  width: 100%;
}

.noticias-grid {
  display: flex;
  overflow-x: auto;
  gap: 20px;
  padding-bottom: 15px;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
  justify-content: flex-start;
  flex-wrap: nowrap;
  position: relative;
}

.noticias-grid::-webkit-scrollbar {
  height: 8px;
}

.noticias-grid::-webkit-scrollbar-thumb {
  background-color: #66bb6a;
  border-radius: 4px;
}

.noticias-grid::-webkit-scrollbar-track {
  background-color: #f1f1f1;
}

.card {
  flex: 0 0 350px;
  border-radius: 14px;
  border: 1px solid #ddd;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  scroll-snap-align: center;
  background-color: #fff;
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  background-color: #f8fafc;
}

.card-body {
  padding: 20px;
  text-align: center;
}

.resumo {
  font-size: 1rem;
  line-height: 1.6;
  color: #444;
  margin-bottom: 15px;
}

.conteudo {
  font-size: 0.95rem;
  color: #333;
  line-height: 1.6;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background: transparent;
  gap: 10px;
}

.visualizacoes {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
}

.icon {
  font-size: 1.1rem;
}

.borda-destacadatxt {
  border: 1px solid #707070;
  border-radius: 5px;
  padding: 12px;
  outline: none;
  width: 100%;
  transition: border-color 0.3s ease;
  font-size: 1rem;
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

.search-input.borda-destacada:hover,
.search-input.borda-destacada:focus {
  border-color: #800080;
  box-shadow: 0 4px 10px rgba(128, 0, 128, 0.2);
}

.btn-ler-mais {
  cursor: pointer;
  background: none;
  border: none;
  font-size: 1rem;
  color: #800080;
  transition: background-color 0.2s ease, color 0.2s ease;
}

.btn-ler-mais:hover {
  background-color: rgba(128, 0, 128, 0.1);
  color: #660099;
}

.btn-proximo {
  width: 350px;
  margin: 0;
  font-size: 1.2rem;
  padding: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  position: absolute;
  top: -50px;
  right: 0;
}

.btn-primeira,
.btn-ultima {
  width: 40px;
  height: 40px;
  font-size: 1rem;
  padding: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  position: absolute;
  top: -50px;
}

.btn-primeira {
  left: 0;
}

.btn-ultima {
  right: 370px; /* Posicionado à esquerda do botão "Próximo" (350px + 20px gap) */
}

.arrow-icon {
  font-size: 1.5rem;
}

.btn.borda-destacada:hover {
  background-color: #66bb6a;
  color: white;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content.imagem-modal {
  position: relative;
  max-width: 40%;
  max-height: 40vh;
  margin: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-content.conteudo-modal {
  position: relative;
  max-width: 500px;
  max-height: 60vh;
  background: white;
  padding: 25px;
  border-radius: 12px;
  overflow-y: auto;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
}

.fechar-modal {
  position: absolute;
  top: -20px;
  right: -20px;
  font-size: 2rem;
  color: white;
  cursor: pointer;
  transition: color 0.2s ease;
}

.fechar-modal:hover {
  color: #66bb6a;
}
</style>
