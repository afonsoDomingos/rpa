<template>
  <div class="noticias-container">
    <!-- Campo de busca -->
    <div class="busca-container">
      <input
        v-model="termoBusca"
        type="text"
        class="search-input"
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
      <div v-for="noticia in noticiasVisiveis" :key="noticia._id" class="card">
        <div class="card-image">
          <img
            v-if="noticia.imagem"
            :src="
              noticia.imagem.startsWith('http')
                ? noticia.imagem
                : API_BASE + noticia.imagem
            "
            :alt="noticia.titulo || 'Notícia Recupera Aqui Moçambique'"
            class="img-fluid"
            @click="abrirImagem(noticia)"
          />
          <div v-else class="placeholder-image"></div>
        </div>
        <div class="card-overlay">
          <div class="card-content">
            <p class="card-resumo">{{ noticia.resumo }}</p>
          </div>
          <div class="card-footer">
            <button
              class="btn-ler-mais"
              @click="abrirModalConteudo(noticia)"
              aria-label="Ler mais sobre a notícia"
            >
              Ler mais
            </button>
            <p class="visualizacoes">
              <span class="icon">👁️</span>
              {{ noticia.visualizacoes || 0 }}
            </p>
          </div>
        </div>
      </div>

      <!-- Navegação -->
      <button
        v-if="noticiasFiltradas.length > 0"
        class="btn-nav btn-proximo"
        @click="proximaNoticia"
      >
        <span class="arrow-icon">→</span>
      </button>
      <button
        v-if="noticiasFiltradas.length > 0"
        class="btn-nav btn-primeira"
        @click="irParaPrimeiraNoticia"
      >
        <span class="arrow-icon">⮜</span>
      </button>
    </div>

    <!-- Ver mais -->
    <div
      v-if="noticiasFiltradas.length > noticiasVisiveis.length"
      class="ver-mais-container"
    >
      <button class="btn-ver-mais" @click="mostrarMaisNoticias">
        Ver mais notícias
      </button>
    </div>

    <!-- Sem notícias -->
    <div v-if="noticiasFiltradas.length === 0" class="no-news">
      Nenhuma notícia encontrada.
    </div>

    <!-- Modal imagem -->
    <div v-if="imagemAmpliada" class="modal" @click="fecharImagem">
      <div class="modal-content imagem-modal">
        <span class="fechar-modal" @click="fecharImagem">×</span>
        <img :src="imagemAmpliada" :alt="conteudoModal?.titulo || 'Imagem da Notícia Ampliada'" class="img-fluid" />
      </div>
    </div>

    <!-- Modal conteúdo -->
    <div v-if="conteudoModal" class="modal" @click="fecharModalConteudo">
      <div class="modal-content conteudo-modal" @click.stop>
        <span class="fechar-modal" @click="fecharModalConteudo">×</span>
        <h5 class="modal-title">{{ conteudoModal.titulo }}</h5>
        <p class="modal-conteudo">{{ conteudoModal.conteudo }}</p>
        <div class="redes-sociais">
          <a href="https://web.facebook.com/recuperaaqui/" target="_blank"
            ><i class="bi bi-facebook"></i
          ></a>
          <a href="https://www.instagram.com/rpamocambique/" target="_blank"
            ><i class="bi bi-instagram"></i
          ></a>
          <a
            href="https://www.linkedin.com/company/rpa-mo%C3%A7ambique"
            target="_blank"
            ><i class="bi bi-linkedin"></i
          ></a>
          <a href="https://www.youtube.com/@recuperaqui" target="_blank"
            ><i class="bi bi-youtube"></i
          ></a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import api from "../api";

const API_URL = "/noticias";

const noticias = ref([]);
const termoBusca = ref("");
const imagemAmpliada = ref(null);
const conteudoModal = ref(null);
const noticiasGrid = ref(null);

const noticiasPorPagina = 4;
const paginaAtual = ref(1);
let autoScrollInterval = null;

const noticiasFiltradas = computed(() => {
  if (!termoBusca.value) return noticias.value;
  return noticias.value.filter(
    (noticia) =>
      noticia.titulo.toLowerCase().includes(termoBusca.value.toLowerCase()) ||
      noticia.resumo.toLowerCase().includes(termoBusca.value.toLowerCase()) ||
      noticia.conteudo.toLowerCase().includes(termoBusca.value.toLowerCase())
  );
});

const noticiasVisiveis = computed(() =>
  noticiasFiltradas.value.slice(0, paginaAtual.value * noticiasPorPagina)
);

const mostrarMaisNoticias = () => paginaAtual.value++;

const proximaNoticia = () => {
  if (!noticiasGrid.value) return;
  const cardWidth = 270;
  const maxScroll =
    noticiasGrid.value.scrollWidth - noticiasGrid.value.clientWidth;
  if (noticiasGrid.value.scrollLeft >= maxScroll - 1) {
    noticiasGrid.value.scrollTo({ left: 0, behavior: "smooth" });
  } else {
    noticiasGrid.value.scrollBy({ left: cardWidth, behavior: "smooth" });
  }
};

const irParaPrimeiraNoticia = () =>
  noticiasGrid.value?.scrollTo({ left: 0, behavior: "smooth" });

const iniciarAutoScroll = () => {
  autoScrollInterval = setInterval(proximaNoticia, 3000);
};

const pausarAutoScroll = () => {
  if (autoScrollInterval) {
    clearInterval(autoScrollInterval);
    autoScrollInterval = null;
  }
};

const retomarAutoScroll = () => {
  if (!autoScrollInterval) iniciarAutoScroll();
};

const abrirImagem = async (noticia) => {
  imagemAmpliada.value = noticia.imagem;
  await incrementarVisualizacoes(noticia);
};

const fecharImagem = () => (imagemAmpliada.value = null);

const abrirModalConteudo = async (noticia) => {
  conteudoModal.value = noticia;
  await incrementarVisualizacoes(noticia);
};

const fecharModalConteudo = () => (conteudoModal.value = null);

const incrementarVisualizacoes = async (noticia) => {
  try {
    const res = await api.patch(`${API_URL}/${noticia._id}`);
    noticia.visualizacoes = res.data.visualizacoes;
  } catch (err) {
    console.error("[ERRO] Falha ao atualizar visualizações:", err.message);
  }
};

const fetchNoticias = async () => {
  try {
    const res = await api.get(API_URL);
    noticias.value = res.data;
  } catch (err) {
    console.error("[ERRO] Falha ao carregar notícias:", err.message);
  }
};

onMounted(() => {
  fetchNoticias();
  iniciarAutoScroll();
});

onUnmounted(pausarAutoScroll);
</script>

<style scoped>
/*@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&display=swap');
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css');*/

/* Importando o Font Awesome localmente - Removido em favor do Bootstrap Icons global */
/* @import "@fortawesome/fontawesome-free/css/all.min.css"; */

/* Para a fonte Poppins */
@import "@fontsource/poppins/500.css";
@import "@fontsource/poppins/600.css";
@import "@fontsource/poppins/700.css";

* {
  font-family: "Poppins", sans-serif;
  box-sizing: border-box;
}

.noticias-container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 20px;
  background: transparent;
  transition: background 0.3s ease;
}

.busca-container {
  max-width: 600px;
  margin: 0 auto 20px;
}
.search-input {
  width: 100%;
  padding: 10px 15px;
  font-size: 0.9rem;
  border: none;
  border-radius: 25px;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}
.search-input:focus {
  outline: none;
  box-shadow: 0 4px 12px rgba(107, 70, 193, 0.2);
  transform: scale(1.02);
}

.noticias-grid {
  display: flex;
  overflow-x: auto;
  gap: 20px;
  padding-bottom: 10px;
  scroll-snap-type: x mandatory;
  scroll-behavior: smooth;
  position: relative;
}
.noticias-grid::-webkit-scrollbar {
  height: 6px;
}
.noticias-grid::-webkit-scrollbar-thumb {
  background: #6b46c1;
  border-radius: 3px;
}
.noticias-grid::-webkit-scrollbar-track {
  background: #e0e0e0;
}

.card {
  flex: 0 0 250px;
  aspect-ratio: 1/1;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  scroll-snap-align: center;
  position: relative;
  overflow: hidden;
}
.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(107, 70, 193, 0.2);
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 12px;
  cursor: pointer;
  transition: transform 0.3s ease;
}
.card-image img:hover {
  transform: scale(1.03);
}

.placeholder-image {
  width: 100%;
  height: 100%;
  background: #e0e0e0;
  border-radius: 12px;
}

.card-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.5);
  padding: 8px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  color: #fff;
}
.card-content {
  flex: 1;
}

.card-resumo {
  font-size: 0.65rem;
  line-height: 1.2;
  color: #fff;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 6;
  line-clamp: 6;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
}

.btn-ler-mais {
  background: #6b46c1;
  color: #fff;
  border: none;
  padding: 5px 12px;
  font-size: 0.75rem;
  font-weight: 500;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}
.btn-ler-mais:hover {
  background: #553c9a;
  transform: scale(1.05);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
}

.visualizacoes {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.75rem;
  color: #e0e0e0;
}
.icon {
  font-size: 0.85rem;
}

.btn-nav {
  position: absolute;
  top: -40px;
  background: #fff;
  border: none;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}
.btn-nav:hover {
  background: #6b46c1;
  color: #fff;
}
.btn-proximo {
  right: 10px;
}
.btn-primeira {
  left: 10px;
}

.ver-mais-container {
  text-align: center;
  margin-top: 20px;
}
.btn-ver-mais {
  background: #6b46c1;
  color: #fff;
  border: none;
  padding: 10px 20px;
  font-size: 0.9rem;
  font-weight: 500;
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.3s ease;
}
.btn-ver-mais:hover {
  background: #553c9a;
  transform: scale(1.05);
}

.no-news {
  text-align: center;
  font-size: 0.9rem;
  color: #666;
  margin-top: 20px;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}
.modal-content.imagem-modal {
  max-width: 90%;
  max-height: 80vh;
  border-radius: 12px;
  overflow: hidden;
}
.modal-content.imagem-modal img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 12px;
}
.modal-content.conteudo-modal {
  max-width: 500px;
  background: #fff;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(107, 70, 193, 0.2);
  overflow-y: auto;
}

.fechar-modal {
  position: absolute;
  top: -15px;
  right: -15px;
  font-size: 1.5rem;
  color: #fff;
  cursor: pointer;
  transition: color 0.3s ease;
}
.fechar-modal:hover {
  color: #6b46c1;
}

.modal-title {
  font-size: 1.2rem;
  font-weight: 500;
  color: #6b46c1;
  margin-bottom: 10px;
}

.modal-conteudo {
  font-size: 0.9rem;
  line-height: 1.5;
  color: #444;
}

.redes-sociais {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-top: 15px;
}
.redes-sociais a {
  font-size: 1.2rem;
  color: #666;
  transition: all 0.3s ease;
}
.redes-sociais a:hover {
  color: #6b46c1;
  transform: scale(1.1);
}
</style>
