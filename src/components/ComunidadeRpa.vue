<template>
  <!-- Navbar fixo -->
  <div class="container-fluid position-sticky z-index-sticky top-0 px-0">
    <div class="row gx-0">
      <div class="col-12">
        <NavbarDefault :sticky="true" />
      </div>
    </div>
  </div>
  <br /><br /><br /><br />

  <div class="threads-feed">
    <!-- Header -->
    <div class="feed-header">
      <h2 class="feed-title">Comunidade Rpa</h2>
      <p class="feed-subtitle">Um espaço para compartilhamentos</p>
      
      <button @click="showSupportModal = true" class="btn-apoio mt-3">
        <i class="bi bi-heart-fill me-2"></i>Apoiar Plataforma
      </button>
    </div>

    <!-- New Post Form -->
    <div class="new-post-card">
      <div class="new-post-header d-block">
        <!-- Tabs de Tipo de Post -->
        <div class="d-flex gap-2 mb-3">
          <button 
            @click="isDocumentReport = false"
            class="mode-btn"
            :class="{ active: !isDocumentReport }"
          >
            <i class="bi bi-chat-left-text me-2"></i>Post Normal
          </button>
          <button 
            @click="isDocumentReport = true"
            class="mode-btn"
            :class="{ active: isDocumentReport }"
          >
            <i class="bi bi-file-earmark-person me-2"></i>Relatar Documento
          </button>
        </div>

        <div class="d-flex gap-3">
          <div class="avatar avatar-purple">
            <span>{{ usuario?.nome?.[0]?.toUpperCase() || "EU" }}</span>
          </div>
          <div class="w-100">
            <!-- Campos Específicos para Documento -->
            <div v-if="isDocumentReport" class="doc-report-fields mb-3">
              <div class="row g-2">
                <div class="col-md-6">
                  <input v-model="docName" class="form-control" placeholder="Nome no Documento" />
                </div>
                <div class="col-md-6">
                  <select v-model="docType" class="form-select">
                    <option value="" disabled selected>Tipo de Documento</option>
                    <option>INSS</option>
                    <option>Bilhete de Identidade (BI)</option>
                    <option>Carta de Condução</option>
                    <option>Passaporte</option>
                    <option>Cartão de Estudante</option>
                    <option>Dire</option>
                    <option>Outro</option>
                  </select>
                </div>
                <div class="col-12">
                  <input v-model="docContact" class="form-control" placeholder="Seu Contacto (Ex: 84 123 4567)" />
                </div>
              </div>
            </div>

            <textarea
              v-model="newPostContent"
              :placeholder="isDocumentReport ? 'Onde encontrou? Detalhes adicionais...' : 'Compartilhe algo sobre...'"
              class="post-textarea w-100"
              rows="3"
            ></textarea>
            
            <!-- Preview da Imagem -->
            <div v-if="previewUrl" class="image-preview mt-3 position-relative">
              <img :src="previewUrl" class="preview-img" />
              <button @click="removeImage" class="remove-img-btn">
                <i class="bi bi-x"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
      <div class="new-post-footer">
        <div class="post-actions">
          <!-- Input Invisível -->
          <input
            type="file"
            ref="fileInput"
            class="d-none"
            accept="image/*"
            @change="onFileSelected"
          />
          <button class="action-btn" @click="triggerFileInput" title="Adicionar imagem">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <circle cx="8.5" cy="8.5" r="1.5"></circle>
              <polyline points="21 15 16 10 5 21"></polyline>
            </svg>
          </button>
          <button class="action-btn">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"
              ></path>
            </svg>
          </button>
        </div>
        <button
          @click="criarPost"
          class="post-btn"
          :disabled="!newPostContent.trim() && !selectedFile"
        >
          Publicar
        </button>
      </div>
    </div>

    <!-- Posts Feed -->
    <div class="posts-container">
      <div v-if="carregando" class="text-center">Carregando posts...</div>

      <div v-for="post in posts" :key="post._id" class="post-card">
        <div class="post-header">
          <!-- AVATAR DO RPAADMIN COM LOGO -->
          <div v-if="post.autor?.nome === 'RpaAdmin'" class="avatar avatar-rpa">
            <img src="@/assets/img/rPa.png" alt="RpaAdmin" class="rpa-logo" />
          </div>
          <div v-else class="avatar avatar-purple">
            <span>{{ post.autor?.nome?.[0]?.toUpperCase() || "U" }}</span>
          </div>

          <div class="post-user-info">
            <div class="user-name">
              {{
                post.autor?.nome === "RpaAdmin"
                  ? "RpaAdmin"
                  : post.autor?.nome || "Usuário"
              }}
              <small
                v-if="post.autor?.nome === 'RpaAdmin'"
                class="assistente-badge"
                >(Assistente)</small
              >
            </div>
          <div class="post-time">{{ formatTime(post.createdAt) }}</div>
          </div>
          
          <!-- Botão de Deletar (Visível apenas para Admin ou Dono do Post) -->
          <button 
            v-if="usuario && (usuario.nome === 'RpaAdmin' || post.autor?._id === usuario._id || post.autor?.email === usuario.email)"
            class="delete-btn ms-auto" 
            @click="deletarPost(post)"
            title="Apagar post"
          >
            <i class="bi bi-trash"></i>
          </button>
        </div>

        <div class="post-content">
          <!-- Renderização Condicional: Se for um Relatório de Documento Formar -->
          <div v-if="post.conteudo.includes('📄 DOCUMENTO ENCONTRADO')" class="doc-found-card mb-3">
            <div class="doc-badge"><i class="bi bi-check-circle-fill me-1"></i>Encontrado</div>
            <p style="white-space: pre-line;">{{ post.conteudo }}</p>
          </div>
          <p v-else class="mb-2" style="white-space: pre-line;">{{ post.conteudo }}</p>
          
          <div v-if="post.imagem" class="post-image-container mt-2">
            <img :src="post.imagem" alt="Post image" class="img-fluid rounded-3" loading="lazy" />
          </div>
        </div>

        <div class="post-actions-bar">
          <button @click="curtirPost(post)" class="action-button">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              :fill="post.liked ? 'currentColor' : 'none'"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
              ></path>
            </svg>
            <span>{{ post.likes?.length || 0 }}</span>
          </button>

          <button
            @click="post.showReplies = !post.showReplies"
            class="action-button"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
              ></path>
            </svg>
            <span>{{ post.replies?.length || 0 }}</span>
          </button>

          <button @click="compartilharPost(post)" class="action-button">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <circle cx="18" cy="5" r="3"></circle>
              <circle cx="6" cy="12" r="3"></circle>
              <circle cx="18" cy="19" r="3"></circle>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
            </svg>
            <span>Compartilhar</span>
          </button>
        </div>

        <!-- Replies Section -->
        <div v-if="post.showReplies" class="replies-section">
          <!-- RpaAdmin está pensando... -->
          <div v-if="pensandoEm === post._id" class="reply-card bot-typing">
            <div class="avatar avatar-small avatar-rpa">
              <img
                src="@/assets/img/rPa.png"
                alt="RpaAdmin"
                class="rpa-logo-small"
              />
            </div>
            <div class="reply-content-wrapper">
              <div class="reply-header">
                <span class="reply-user-name">RpaAdmin</span>
                <span class="reply-time">digitando</span>
              </div>
              <div class="reply-content">
                <i>RpaAdmin está pensando</i>
              </div>
            </div>
          </div>

          <!-- Replies reais -->
          <div
            v-for="reply in post.replies"
            :key="reply._id"
            class="reply-card"
            :class="{ 'bot-reply': reply.autor?.nome === 'RpaAdmin' }"
          >
            <!-- AVATAR DO RPAADMIN NAS RESPOSTAS -->
            <div
              v-if="reply.autor?.nome === 'RpaAdmin'"
              class="avatar avatar-small avatar-rpa"
            >
              <img
                src="@/assets/img/rPa.png"
                alt="RpaAdmin"
                class="rpa-logo-small"
              />
            </div>
            <div v-else class="avatar avatar-small avatar-purple">
              <span>{{ reply.autor?.nome?.[0]?.toUpperCase() || "U" }}</span>
            </div>

            <div class="reply-content-wrapper">
              <div class="reply-header">
                <span class="reply-user-name">
                  {{
                    reply.autor?.nome === "RpaAdmin"
                      ? "RpaAdmin"
                      : reply.autor?.nome
                  }}
                  <small
                    v-if="reply.autor?.nome === 'RpaAdmin'"
                    class="assistente-badge"
                    >(Assistente)</small
                  >
                </span>
                <span class="reply-time">{{
                  formatTime(reply.createdAt)
                }}</span>
              </div>
              <div class="reply-content">{{ reply.conteudo }}</div>
            </div>
          </div>

          <!-- New Reply Form -->
          <div class="new-reply-form">
            <div class="avatar avatar-small avatar-purple">
              <span>{{ usuario?.nome?.[0]?.toUpperCase() || "VC" }}</span>
            </div>
            <input
              v-model="post.newReply"
              @keyup.enter="responderPost(post)"
              placeholder="Escreva uma resposta..."
              class="reply-input"
            />
            <button
              @click="responderPost(post)"
              class="reply-send-btn"
              :disabled="!post.newReply?.trim()"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal de Apoio -->
  <transition name="fade">
    <div v-if="showSupportModal" class="modal-overlay" @click.self="showSupportModal = false">
      <div class="modal-content-apoio">
        <button class="close-modal-btn" @click="showSupportModal = false">&times;</button>
        <DoacaoProjeto />
      </div>
    </div>
  </transition>

  <!-- Modal de Partilha (Fallback) -->
  <transition name="fade">
    <div v-if="showShareModal" class="modal-overlay" @click.self="closeShareModal">
      <div class="modal-content-apoio share-modal">
        <button class="close-modal-btn" @click="closeShareModal">&times;</button>
        <div class="text-center p-4">
          <h3 class="mb-3 fw-bold" style="color: #4a148c;">Partilhar Post</h3>
          <p class="text-secondary mb-4 small">Escolha onde deseja partilhar esta informação.</p>
          
          <div class="d-grid gap-3">
            <button @click="shareTo('whatsapp')" class="btn-share whatsapp">
              <i class="fab fa-whatsapp me-2"></i> WhatsApp
            </button>
            <button @click="shareTo('facebook')" class="btn-share facebook">
              <i class="fab fa-facebook me-2"></i> Facebook
            </button>
            <button @click="shareTo('linkedin')" class="btn-share linkedin">
              <i class="fab fa-linkedin me-2"></i> LinkedIn
            </button>
            <button @click="shareTo('twitter')" class="btn-share twitter">
              <i class="fab fa-twitter me-2"></i> X (Twitter)
            </button>
            <button @click="shareTo('copy')" class="btn-share copy">
              <i class="bi bi-clipboard me-2"></i> Copiar Texto
            </button>
          </div>
        </div>
      </div>
    </div>
  </transition>

  <FooterDefault />
</template>

<script setup>
// ← Todo o script permanece 100% igual ao que tinhas
import { ref, onMounted, onBeforeUnmount } from "vue";
import axios from "axios";
import { useRouter } from "vue-router";
import { io } from "socket.io-client";
import NavbarDefault from "../examples/navbars/NavbarDefault.vue";
import FooterDefault from "../examples/footers/FooterDefault.vue";
import DoacaoProjeto from "./DoacaoProjeto.vue";

const router = useRouter();
const usuario = ref(null);
const posts = ref([]);
const newPostContent = ref("");
const carregando = ref(false);
const pensandoEm = ref(null);
const showSupportModal = ref(false);

// Share Logic
const showShareModal = ref(false);
const postToShare = ref(null);

// Gestão de Imagens
const fileInput = ref(null);
const selectedFile = ref(null);
const previewUrl = ref(null);

// Gestão de Relatório de Documentos
const isDocumentReport = ref(false);
const docName = ref("");
const docType = ref("");
const docContact = ref("");

const API_URL = "https://apirpa.onrender.com/api/posts";
const token = localStorage.getItem("token");
const headers = { Authorization: `Bearer ${token}` };

const socket = io("https://apirpa.onrender.com", {
  transports: ["websocket"],
  reconnection: true,
});

socket.on("connect", () =>
  console.log("Conectado ao servidor Socket.IO:", socket.id)
);
socket.on("disconnect", () =>
  console.log("Desconectado do servidor Socket.IO")
);

socket.on("novoPost", (post) => {
  posts.value.unshift({ ...post, showReplies: false, newReply: "" });
  if (post.autor?._id !== "685bff7d1b6abc16c490af52") {
    pensandoEm.value = post._id;
    setTimeout(() => {
      if (pensandoEm.value === post._id) pensandoEm.value = null;
    }, 15000);
  }
});

socket.on("postLiked", ({ postId, likes }) => {
  const post = posts.value.find((p) => p._id === postId);
  if (post) post.likes = likes;
});

socket.on("novaResposta", ({ postId, replies }) => {
  const post = posts.value.find((p) => p._id === postId);
  if (post) {
    post.replies = replies;
    if (pensandoEm.value === postId) pensandoEm.value = null;
  }
});

socket.on("postDeletado", ({ postId }) => {
  posts.value = posts.value.filter((p) => p._id !== postId);
});

socket.on("respostaDeletada", ({ postId, replyId }) => {
  const post = posts.value.find((p) => p._id === postId);
  if (post) post.replies = post.replies.filter((r) => r._id !== replyId);
});

const buscarUsuario = async () => {
  try {
    const emailLogado = localStorage.getItem("email");
    if (!emailLogado) return router.push("/");
    const { data } = await axios.get(
      "https://apirpa.onrender.com/api/auth/usuarios",
      { headers }
    );
    usuario.value = data.find((u) => u.email === emailLogado);
    if (!usuario.value) router.push("/");
  } catch (err) {
    console.error(err);
  }
};

const carregarPosts = async () => {
  try {
    carregando.value = true;
    const { data } = await axios.get(API_URL, { headers });
    posts.value = data.map((p) => ({ ...p, showReplies: false, newReply: "" }));
  } catch (err) {
    console.error(err);
  } finally {
    carregando.value = false;
  }
};

const criarPost = async () => {
  if (!usuario.value) return;

  // Validação para Relatório de Documento
  if (isDocumentReport.value) {
    if (!docName.value || !docType.value || !docContact.value) {
      alert("Por favor, preencha todos os campos do documento (Nome, Tipo e Contacto).");
      return;
    }
  }

  // Se não for relatório, exige conteúdo OU ficheiro
  if (!isDocumentReport.value && !newPostContent.value.trim() && !selectedFile.value) {
    return;
  }
  
  try {
    let finalContent = newPostContent.value;

    // Formatar conteúdo se for um relatório
    if (isDocumentReport.value) {
      finalContent = `📄 DOCUMENTO ENCONTRADO
      
👤 Nome: ${docName.value}
🪪 Tipo: ${docType.value}
📞 Contacto: ${docContact.value}

📝 Detalhes: ${newPostContent.value || "Sem detalhes adicionais."}`;
    }

    // Se NÃO houver imagem, enviamos como JSON normal
    if (!selectedFile.value) {
      await axios.post(
        API_URL, 
        { conteudo: finalContent }, 
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          } 
        }
      );
    } else {
      // Se TIVER imagem, enviamos como FormData
      const formData = new FormData();
      formData.append("conteudo", finalContent);
      formData.append("imagem", selectedFile.value);

      await axios.post(API_URL, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    }

    // Limpar form completamente
    newPostContent.value = "";
    docName.value = "";
    docType.value = "";
    docContact.value = "";
    isDocumentReport.value = false;
    removeImage();

  } catch (err) {
    console.error("Erro ao criar post:", err);
    alert("Erro ao publicar. Verifique a conexão.");
  }
};

const triggerFileInput = () => {
  fileInput.value?.click();
};

const onFileSelected = (event) => {
  const file = event.target.files[0];
  if (file) {
    selectedFile.value = file;
    previewUrl.value = URL.createObjectURL(file);
  }
};

const removeImage = () => {
  selectedFile.value = null;
  previewUrl.value = null;
  if (fileInput.value) fileInput.value.value = "";
};

const curtirPost = async (post) => {
  try {
    await axios.put(`${API_URL}/${post._id}/like`, {}, { headers });
  } catch (err) {
    console.error(err);
  }
};

const responderPost = async (post) => {
  if (!post.newReply?.trim()) return;
  try {
    await axios.post(
      `${API_URL}/${post._id}/replies`,
      { conteudo: post.newReply },
      { headers }
    );
    post.newReply = "";
  } catch (err) {
    console.error(err);
  }
};

const deletarPost = async (post) => {
  if (!confirm("Tem certeza que deseja apagar este post? Esta ação não pode ser desfeita.")) return;
  
  try {
    await axios.delete(`${API_URL}/${post._id}`, { headers });
    // O socket vai tratar de remover da lista automáticamente via 'postDeletado'
  } catch (err) {
    console.error("Erro ao deletar post:", err);
    alert("Erro ao apagar o post.");
  }
};

// --- Lógica de Partilha ---
const compartilharPost = async (post) => {
  const shareData = {
    title: "Comunidade RPA",
    text: `📢 *RPA Moçambique* \n\n${post.conteudo}\n\n🔗 Saiba mais em: https://rpa.mz`,
    url: "https://rpa.mz"
  };

  // Se o browser suportar partilha nativa (Mobile/Moderno), usa-a.
  if (navigator.share) {
    try {
      await navigator.share(shareData);
    } catch (err) {
      console.log("Partilha cancelada ou erro:", err);
    }
  } else {
    // Fallback para Modal Customizado
    postToShare.value = post;
    showShareModal.value = true;
  }
};

const closeShareModal = () => {
  showShareModal.value = false;
  postToShare.value = null;
};

const shareTo = (platform) => {
  if (!postToShare.value) return;
  
  const text = encodeURIComponent(`📢 RPA Moçambique \n\n${postToShare.value.conteudo}\n\n🔗 https://rpa.mz`);
  const url = encodeURIComponent("https://rpa.mz");
  
  let link = "";

  switch (platform) {
    case 'whatsapp':
      link = `https://wa.me/?text=${text}`;
      break;
    case 'facebook':
      link = `https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${text}`;
      break;
    case 'linkedin':
      link = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
      break;
    case 'twitter': // X
      link = `https://twitter.com/intent/tweet?text=${text}`;
      break;
    case 'copy':
      navigator.clipboard.writeText(`${postToShare.value.conteudo}\n\nLink: https://rpa.mz`);
      alert("Texto copiado para a área de transferência!");
      closeShareModal();
      return;
  }

  if (link) {
    window.open(link, '_blank');
    closeShareModal();
  }
};

const formatTime = (timestamp) => {
  if (!timestamp) return "";
  const date = new Date(timestamp);
  const diff = Date.now() - date;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (minutes < 1) return "agora";
  if (minutes < 60) return `${minutes}m`;
  if (hours < 24) return `${hours}h`;
  return `${days}d`;
};

onMounted(async () => {
  await buscarUsuario();
  await carregarPosts();
});

onBeforeUnmount(() => socket.disconnect());
</script>

<style scoped>
@import "bootstrap-icons/font/bootstrap-icons.css";

/* Para a fonte Poppins */
@import "@fontsource/poppins/500.css";
@import "@fontsource/poppins/600.css";
@import "@fontsource/poppins/700.css";

/* NOVO: Avatar com logo oficial */
.avatar-rpa {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid #9b59b6;
  box-shadow: 0 0 15px rgba(155, 89, 182, 0.4);
  background: white;
}

.avatar-rpa .rpa-logo {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.avatar-rpa .rpa-logo-small,
.avatar-small.avatar-rpa .rpa-logo {
  width: 36px;
  height: 36px;
}

.assistente-badge {
  background: linear-gradient(135deg, #9b59b6, #3498db);
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 700;
  margin-left: 6px;
}

/* Botão de Apoio */
.btn-apoio {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.4);
  color: white;
  padding: 8px 20px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  backdrop-filter: blur(5px);
}

.btn-apoio:hover {
  background: white;
  color: #800080;
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

/* Modal de Apoio */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  padding: 20px;
}

.modal-content-apoio {
  position: relative;
  width: 100%;
  max-width: 450px;
  animation: slideUp 0.3s ease;
}

.close-modal-btn {
  position: absolute;
  top: -15px;
  right: -10px;
  background: white;
  border: none;
  font-size: 24px;
  color: #333;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 4px 10px rgba(0,0,0,0.2);
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

@keyframes slideUp {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.avatar-bot {
  background: linear-gradient(135deg, #9b59b6, #3498db) !important;
  font-weight: 900;
  box-shadow: 0 0 15px rgba(155, 89, 182, 0.4);
}

.bot-reply {
  background: linear-gradient(90deg, #f8f5ff 0%, #f3efff 100%);
  border-left: 4px solid #9b59b6;
}

.bot-typing {
  opacity: 0.75;
  background: #f8f9fa;
  border-left: 4px solid #9b59b6;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 0.75;
  }
  50% {
    opacity: 1;
  }
}

.threads-feed {
  max-width: 680px;
  margin: 0 auto;
  padding: 24px 16px;
  font-family: "Poppins", sans-serif;
}

/* Header */
.feed-header {
  text-align: center;
  margin-bottom: 32px;
  padding: 32px 24px;
  background: linear-gradient(
    135deg,
    #800080 0%,
    #2e7d32 100%
  ); /* gradiente roxo e verde */
  border-radius: 24px;
  box-shadow: 0 10px 20px rgba(128, 0, 128, 0.15); /* shadow mais leve */
}

.feed-title {
  font-family: "Poppins", sans-serif;
  font-weight: 900;
  font-size: 32px;
  color: white;
  margin: 0 0 8px 0;
  letter-spacing: -0.5px;
}

.feed-subtitle {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
}

/* Novo Post */
.new-post-card {
  background: white;
  border-radius: 20px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 4px 20px rgba(102, 126, 234, 0.15);
  border: 2px solid rgba(102, 126, 234, 0.1);
  transition: all 0.3s ease;
}
.new-post-card:hover {
  box-shadow: 0 8px 30px rgba(102, 126, 234, 0.25);
  border-color: rgba(102, 126, 234, 0.3);
}

.new-post-header {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
}

/* Avatares */
.avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 16px;
  color: white;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.avatar-small {
  width: 36px;
  height: 36px;
  font-size: 13px;
}

.avatar-purple {
  background: linear-gradient(
    135deg,
    #800080 0%,
    #2e7d32 100%
  ); /* gradiente roxo e verde */
}

.avatar-blue,
.avatar-green,
.avatar-pink,
.avatar-orange {
  background: #e5e7eb;
} /* neutro */

.post-textarea {
  flex: 1;
  border: 2px solid #e5e7eb;
  border-radius: 16px;
  padding: 14px 18px;
  font-size: 15px;
  resize: none;
  font-family: inherit;
  transition: all 0.3s ease;
  background: #f9fafb;
}
.post-textarea:focus {
  outline: none;
  border-color: #9b59b6; /* roxo suave */
  background: white;
  box-shadow: 0 0 0 4px rgba(128, 0, 128, 0.15); /* shadow leve roxo */
}

.new-post-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.post-actions {
  display: flex;
  gap: 8px;
}
.action-btn {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  border: none;
  background: #f3f4f6;
  color: #6b7280;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}
.action-btn:hover {
  background: #e5e7eb;
  color: #667eea;
  transform: translateY(-2px);
}

.post-btn {
  background: linear-gradient(
    135deg,
    #9b59b6 0%,
    #4caf50 100%
  ); /* gradiente roxo-verde suave */
  color: white;
  border: none;
  padding: 12px 32px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 6px rgba(128, 0, 128, 0.15); /* shadow mais leve */
}

.post-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(128, 0, 128, 0.2); /* leve efeito hover */
}

.post-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}
.post-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Posts */
.posts-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.post-card {
  background: white;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(102, 126, 234, 0.12);
  border: 2px solid rgba(102, 126, 234, 0.08);
  transition: all 0.3s ease;
}
.post-card:hover {
  box-shadow: 0 8px 30px rgba(102, 126, 234, 0.2);
  border-color: rgba(102, 126, 234, 0.2);
  transform: translateY(-2px);
}

.post-header {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}
.post-user-info {
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.user-name {
  font-weight: 700;
  font-size: 15px;
  color: #1f2937;
}
.post-time {
  font-size: 13px;
  color: #9ca3af;
}
.post-content {
  font-size: 15px;
  line-height: 1.6;
  color: #374151;
  margin-bottom: 16px;
}

.post-actions-bar {
  display: flex;
  gap: 8px;
  padding-top: 12px;
  border-top: 2px solid #f3f4f6;
}
.action-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border-radius: 12px;
  border: none;
  background: #f9fafb;
  color: #6b7280;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}
.action-button:hover {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}
.action-button svg {
  transition: all 0.2s ease;
}

/* Replies */
.replies-section {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 2px solid #f3f4f6;
}
.reply-card {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  padding: 16px;
  background: #f9fafb;
  border-radius: 16px;
  transition: all 0.2s ease;
}
.reply-card:hover {
  background: #f3f4f6;
}
.reply-content-wrapper {
  flex: 1;
}
.reply-header {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 6px;
}
.reply-user-name {
  font-weight: 700;
  font-size: 14px;
  color: #1f2937;
}
.reply-time {
  font-size: 12px;
  color: #9ca3af;
}
.reply-content {
  font-size: 14px;
  line-height: 1.5;
  color: #4b5563;
}
.new-reply-form {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-top: 16px;
}
.reply-input {
  flex: 1;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  padding: 12px 16px;
  font-size: 14px;
  font-family: inherit;
  transition: all 0.3s ease;
  background: white;
}
.reply-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
}
.reply-send-btn {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  border: none;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.delete-btn {
  background: transparent;
  border: none;
  color: #9ca3af;
  padding: 8px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.delete-btn:hover {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
}
.reply-send-btn:hover:not(:disabled) {
  transform: translateY(-2px) scale(1.05);
}

/* Estilos para Imagens */
.post-textarea.w-100 {
  width: 100%;
}

.image-preview {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #e5e7eb;
}

.preview-img {
  width: 100%;
  max-height: 300px;
  object-fit: cover;
  display: block;
}

.remove-img-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  border: none;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.remove-img-btn:hover {
  background: rgba(229, 57, 53, 0.9);
}

.post-image-container img {
  max-width: 100%;
  border-radius: 12px;
  border: 1px solid #f3f4f6;
  max-height: 500px;
  object-fit: contain;
  background: #f9fafb;
}

@media (max-width: 768px) {
  .post-image-container img {
    max-height: 350px;
  }
}

/* Estilos para Tabs e Form de Documentos */
.mode-btn {
  border: none;
  background: #f3f4f6;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  color: #6b7280;
  transition: all 0.3s;
}

.mode-btn.active {
  background: linear-gradient(135deg, #2e7d32 0%, #4caf50 100%);
  color: white;
  box-shadow: 0 4px 10px rgba(76, 175, 80, 0.3);
}

.doc-report-fields input,
.doc-report-fields select {
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  padding: 10px;
  font-size: 14px;
}

.doc-found-card {
  background: #f0fdf4; /* Verde muito claro */
  border-left: 4px solid #2e7d32;
  padding: 16px;
  border-radius: 8px;
  position: relative;
}

.doc-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  background: #2e7d32;
  color: white;
  font-size: 10px;
  font-weight: bold;
  padding: 4px 8px;
  border-radius: 12px;
  text-transform: uppercase;
}

.modal-content-apoio.share-modal {
  max-width: 350px;
  background: white;
  border-radius: 20px;
}

.btn-share {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 12px;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  font-size: 15px;
  color: white;
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;
}

.btn-share:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.btn-share.whatsapp { background-color: #25D366; }
.btn-share.facebook { background-color: #1877F2; }
.btn-share.linkedin { background-color: #0A66C2; }
.btn-share.twitter { background-color: #000000; }
.btn-share.copy { background-color: #6c757d; }

</style>
