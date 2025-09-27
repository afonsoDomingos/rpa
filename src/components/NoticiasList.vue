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
          <h5 class="fw-bold text-success mb-2 borda-destacada">
            {{ noticia.titulo }}
          </h5>
          <p class="text-muted small mb-2">
            {{ formatarData(noticia.data) }}
          </p>
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
              <span class="icon">👁️</span>
              {{ noticia.visualizacoes || 0 }}
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
    <div
      v-if="noticiasFiltradas.length === 0"
      class="text-center text-muted mt-3"
    >
      Nenhuma notícia encontrada.
    </div>

    <!-- Modal para imagem ampliada -->
    <div v-if="imagemAmpliada" class="modal" @click="fecharImagem">
      <div class="modal-content imagem-modal">
        <span class="fechar-modal" @click="fecharImagem">&times;</span>
        <img
          :src="API_BASE + imagemAmpliada"
          alt="Imagem Ampliada"
          class="img-fluid"
        />
      </div>
    </div>

    
    <!-- Modal para conteúdo da notícia -->
<div v-if="conteudoModal" class="modal" @click="fecharModalConteudo">
  <div class="modal-content conteudo-modal" @click.stop>
    <span class="fechar-modal" @click="fecharModalConteudo">&times;</span>
    <p class="conteudo">{{ conteudoModal }}</p>

    <!-- 🔗 Ícones de redes sociais -->
    <div class="redes-sociais">
      <a
        href="https://www.facebook.com/tuaPagina"
        target="_blank"
        aria-label="Facebook"
      >
        <i class="fab fa-facebook"></i>
      </a>
      <a
        href="https://www.instagram.com/teuPerfil"
        target="_blank"
        aria-label="Instagram"
      >
        <i class="fab fa-instagram"></i>
      </a>
      <a
        href="https://www.linkedin.com/company/tuaEmpresa"
        target="_blank"
        aria-label="LinkedIn"
      >
        <i class="fab fa-linkedin"></i>
      </a>
      <a
        href="https://www.youtube.com/@recuperaqui"
        target="_blank"
        aria-label="YouTube"
      >
        <i class="fab fa-youtube"></i>
      </a>
    </div>
  </div>
</div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue"
import axios from "axios"

// 🚀 Usa o backend em produção
const API_BASE = "https://apirpa.onrender.com"
const API_URL = `${API_BASE}/api/noticias`

const noticias = ref([])
const termoBusca = ref("")
const imagemAmpliada = ref(null)
const conteudoModal = ref(null)
const noticiasGrid = ref(null)
let autoScrollInterval = null

// 🔍 Filtro de notícias
const noticiasFiltradas = computed(() => {
  if (!termoBusca.value) return noticias.value
  return noticias.value.filter(
    (noticia) =>
      noticia.titulo.toLowerCase().includes(termoBusca.value.toLowerCase()) ||
      noticia.resumo.toLowerCase().includes(termoBusca.value.toLowerCase()) ||
      noticia.conteudo.toLowerCase().includes(termoBusca.value.toLowerCase())
  )
})

// ▶ Auto-scroll
const proximaNoticia = () => {
  if (noticiasGrid.value) {
    const cardWidth = 350 + 20
    const maxScroll =
      noticiasGrid.value.scrollWidth - noticiasGrid.value.clientWidth
    if (noticiasGrid.value.scrollLeft >= maxScroll - 1) {
      noticiasGrid.value.scrollTo({ left: 0, behavior: "smooth" })
      console.log("[INFO] Voltou para a primeira notícia")
    } else {
      noticiasGrid.value.scrollBy({ left: cardWidth, behavior: "smooth" })
      console.log("[INFO] Avançou para a próxima notícia")
    }
  }
}

const irParaPrimeiraNoticia = () => {
  if (noticiasGrid.value) {
    noticiasGrid.value.scrollTo({ left: 0, behavior: "smooth" })
    console.log("[INFO] Scrollado para a primeira notícia")
  }
}

const irParaUltimaNoticia = () => {
  if (noticiasGrid.value) {
    const maxScroll =
      noticiasGrid.value.scrollWidth - noticiasGrid.value.clientWidth
    noticiasGrid.value.scrollTo({ left: maxScroll, behavior: "smooth" })
    console.log("[INFO] Scrollado para a última notícia")
  }
}

const iniciarAutoScroll = () => {
  autoScrollInterval = setInterval(() => {
    proximaNoticia()
  }, 3000)
  console.log("[INFO] Auto-scroll iniciado")
}

const pausarAutoScroll = () => {
  if (autoScrollInterval) {
    clearInterval(autoScrollInterval)
    autoScrollInterval = null
    console.log("[INFO] Auto-scroll pausado")
  }
}

const retomarAutoScroll = () => {
  if (!autoScrollInterval) {
    iniciarAutoScroll()
    console.log("[INFO] Auto-scroll retomado")
  }
}

onMounted(() => {
  console.log("[INFO] Componente montado. Carregando notícias de:", API_URL)
  fetchNoticias()
  iniciarAutoScroll()
})

onUnmounted(() => {
  pausarAutoScroll()
})

// 🖼️ Abrir imagem + atualizar visualizações
const abrirImagem = async (noticia) => {
  console.log("[INFO] Abrindo imagem ampliada da notícia ID:", noticia.id)
  imagemAmpliada.value = noticia.imagem
  try {
    const res = await axios.patch(`${API_URL}/${noticia.id}`)
    noticia.visualizacoes = res.data.visualizacoes
    console.log(
      "[SUCESSO] Visualizações atualizadas para:",
      noticia.visualizacoes
    )
  } catch (err) {
    console.error("[ERRO] Falha ao atualizar visualizações:", err.message)
  }
}

const fecharImagem = () => {
  console.log("[INFO] Fechando modal de imagem")
  imagemAmpliada.value = null
}

// 📖 Abrir modal de conteúdo + atualizar visualizações
const abrirModalConteudo = async (noticia) => {
  console.log("[INFO] Abrindo conteúdo da notícia ID:", noticia.id)
  conteudoModal.value = noticia.conteudo
  try {
    const res = await axios.patch(`${API_URL}/${noticia.id}`)
    noticia.visualizacoes = res.data.visualizacoes
    console.log(
      "[SUCESSO] Visualizações atualizadas para:",
      noticia.visualizacoes
    )
  } catch (err) {
    console.error("[ERRO] Falha ao atualizar visualizações:", err.message)
  }
}

const fecharModalConteudo = () => {
  console.log("[INFO] Fechando modal de conteúdo")
  conteudoModal.value = null
}

// 🌐 Buscar notícias
const fetchNoticias = async () => {
  console.log("[INFO] Buscando notícias em:", API_URL)
  try {
    const res = await axios.get(API_URL)
    noticias.value = res.data
    console.log("[SUCESSO] Notícias carregadas:", noticias.value.length)
  } catch (err) {
    console.error("[ERRO] Falha ao carregar notícias:", err.message)
    if (err.response) {
      console.error("Status:", err.response.status)
      console.error("Resposta:", err.response.data)
    }
  }
}

// 📅 Formatador de datas
const formatarData = (data) => {
  if (!data) return ""
  const d = new Date(data)
  return d.toLocaleDateString("pt-PT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
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

/* 🔗 Redes sociais */
.redes-sociais {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 20px;
}

.redes-sociais a {
  font-size: 1.8rem;
  color: #555;
  transition: color 0.3s ease, transform 0.2s ease;
}

.redes-sociais a:hover {
  color: #800080;
  transform: scale(1.2);
}


</style>
