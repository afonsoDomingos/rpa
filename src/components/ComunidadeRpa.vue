<template>
  <!-- Navbar fixo -->
  <div class="container-fluid position-sticky z-index-sticky top-0 px-0">
    <div class="row gx-0">
      <div class="col-12">
        <NavbarDefault :sticky="true" />
      </div>
    </div>
  </div>
  <br/><br/><br/><br/>

  <div class="threads-feed">
    <!-- Header -->
    <div class="feed-header">
      <h2 class="feed-title">Comunidade RPA</h2>
      <p class="feed-subtitle">Compartilhe e discuta sobre documentos</p>
    </div>

    <!-- New Post Form -->
    <div class="new-post-card">
      <div class="new-post-header">
        <div class="avatar avatar-purple">
          <span>{{ usuario?.nome?.[0]?.toUpperCase() || 'VC' }}</span>
        </div>
        <textarea
          v-model="newPostContent"
          placeholder="Compartilhe algo sobre seus documentos..."
          class="post-textarea"
          rows="3"
        ></textarea>
      </div>
      <div class="new-post-footer">
        <div class="post-actions">
          <button class="action-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <circle cx="8.5" cy="8.5" r="1.5"></circle>
              <polyline points="21 15 16 10 5 21"></polyline>
            </svg>
          </button>
          <button class="action-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
            </svg>
          </button>
        </div>
        <button @click="criarPost" class="post-btn" :disabled="!newPostContent.trim()">Publicar</button>
      </div>
    </div>

    <!-- Posts Feed -->
    <div class="posts-container">
      <div v-if="carregando" class="text-center">Carregando posts...</div>

      <div v-for="post in posts" :key="post._id" class="post-card">
        <div class="post-header">
          <div class="avatar avatar-purple">
            <span>{{ post.autor?.nome?.[0]?.toUpperCase() || 'U' }}</span>
          </div>
          <div class="post-user-info">
            <div class="user-name">{{ post.autor?.nome || 'Usuário' }}</div>
            <div class="post-time">{{ formatTime(post.createdAt) }}</div>
          </div>
        </div>

        <div class="post-content">{{ post.conteudo }}</div>

        <div class="post-actions-bar">
          <button @click="curtirPost(post)" class="action-button">
            <svg width="20" height="20" viewBox="0 0 24 24" :fill="post.liked ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
            <span>{{ post.likes?.length || 0 }}</span>
          </button>

          <button @click="post.showReplies = !post.showReplies" class="action-button">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
            <span>{{ post.replies?.length || 0 }}</span>
          </button>

          <button class="action-button">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
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
          <div v-for="reply in post.replies" :key="reply._id" class="reply-card">
            <div class="avatar avatar-small avatar-purple">
              <span>{{ reply.autor?.nome?.[0]?.toUpperCase() || 'U' }}</span>
            </div>
            <div class="reply-content-wrapper">
              <div class="reply-header">
                <span class="reply-user-name">{{ reply.autor?.nome }}</span>
                <span class="reply-time">{{ formatTime(reply.createdAt) }}</span>
              </div>
              <div class="reply-content">{{ reply.conteudo }}</div>
            </div>
          </div>

          <!-- New Reply Form -->
          <div class="new-reply-form">
            <div class="avatar avatar-small avatar-purple">
              <span>{{ usuario?.nome?.[0]?.toUpperCase() || 'VC' }}</span>
            </div>
            <input
              v-model="post.newReply"
              @keyup.enter="responderPost(post)"
              placeholder="Escreva uma resposta..."
              class="reply-input"
            />
            <button @click="responderPost(post)" class="reply-send-btn" :disabled="!post.newReply?.trim()">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Rodapé -->
  <FooterDefault />
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'
import NavbarDefault from "../examples/navbars/NavbarDefault.vue";
import FooterDefault from "../examples/footers/FooterDefault.vue";

const router = useRouter()
const usuario = ref(null)
const posts = ref([])
const newPostContent = ref('')
const carregando = ref(false)

const API_URL = 'https://apirpa.onrender.com/api/posts'
const token = localStorage.getItem('token')
const headers = { Authorization: `Bearer ${token}` }

const buscarUsuario = async () => {
  try {
    const emailLogado = localStorage.getItem('email')
    if (!emailLogado) return router.push('/')
    const { data } = await axios.get('https://apirpa.onrender.com/api/auth/usuarios', { headers })
    usuario.value = data.find(u => u.email === emailLogado)
    if (!usuario.value) router.push('/')
  } catch (err) {
    console.error(err)
  }
}

const carregarPosts = async () => {
  try {
    carregando.value = true
    const { data } = await axios.get(API_URL, { headers })
    posts.value = data.map(p => ({ ...p, showReplies: false, newReply: '' }))
  } catch (err) {
    console.error(err)
  } finally {
    carregando.value = false
  }
}

const criarPost = async () => {
  if (!newPostContent.value.trim() || !usuario.value) return
  try {
    const { data } = await axios.post(API_URL, { conteudo: newPostContent.value }, { headers })
    posts.value.unshift({ ...data, showReplies: false, newReply: '' })
    newPostContent.value = ''
  } catch (err) {
    console.error(err)
  }
}

const curtirPost = async post => {
  try {
    const { data } = await axios.post(`${API_URL}/${post._id}/like`, {}, { headers })
    post.likes = data.likes
  } catch (err) {
    console.error(err)
  }
}

const responderPost = async post => {
  if (!post.newReply?.trim()) return
  try {
    const { data } = await axios.post(`${API_URL}/${post._id}/replies`, { conteudo: post.newReply }, { headers })
    post.replies = data.replies
    post.newReply = ''
  } catch (err) {
    console.error(err)
  }
}

const formatTime = timestamp => {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  const diff = Date.now() - date
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (minutes < 1) return 'agora'
  if (minutes < 60) return `${minutes}m`
  if (hours < 24) return `${hours}h`
  return `${days}d`
}

onMounted(async () => {
  await buscarUsuario()
  await carregarPosts()
})
</script>





<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700;800&display=swap');

.threads-feed { max-width: 680px; margin: 0 auto; padding: 24px 16px; font-family: 'Poppins', sans-serif; }

/* Header */
.feed-header { text-align: center; margin-bottom: 32px; padding: 32px 24px; background: linear-gradient(135deg,#667eea 0%,#764ba2 100%); border-radius: 24px; box-shadow: 0 20px 40px rgba(102,126,234,0.3); }

.feed-title {
  font-family: 'Poppins', sans-serif;
  font-weight: 900; /* Black */
  font-size: 32px;
  color: white;
  margin: 0 0 8px 0;
  letter-spacing: -0.5px;
}

.feed-subtitle { font-size: 16px; color: rgba(255,255,255,0.9); margin: 0; }

/* Novo Post */
.new-post-card { background: white; border-radius: 20px; padding: 24px; margin-bottom: 24px; box-shadow: 0 4px 20px rgba(102,126,234,0.15); border: 2px solid rgba(102,126,234,0.1); transition: all 0.3s ease; }
.new-post-card:hover { box-shadow:0 8px 30px rgba(102,126,234,0.25); border-color: rgba(102,126,234,0.3); }
.new-post-header { display:flex; gap:16px; margin-bottom:16px; }
.avatar { width:48px; height:48px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:16px; color:white; flex-shrink:0; box-shadow:0 4px 12px rgba(0,0,0,0.15); }
.avatar-small { width:36px; height:36px; font-size:13px; }
.avatar-purple { background: linear-gradient(135deg,#667eea 0%,#764ba2 100%); }
.avatar-blue { background: linear-gradient(135deg,#4facfe 0%,#00f2fe 100%); }
.avatar-green { background: linear-gradient(135deg,#43e97b 0%,#38f9d7 100%); }
.avatar-pink { background: linear-gradient(135deg,#fa709a 0%,#fee140 100%); }
.avatar-orange { background: linear-gradient(135deg,#ff9a56 0%,#ff6a88 100%); }

.post-textarea { flex:1; border:2px solid #e5e7eb; border-radius:16px; padding:14px 18px; font-size:15px; resize:none; font-family:inherit; transition:all 0.3s ease; background:#f9fafb; }
.post-textarea:focus { outline:none; border-color:#667eea; background:white; box-shadow:0 0 0 4px rgba(102,126,234,0.1); }

.new-post-footer { display:flex; justify-content:space-between; align-items:center; }
.post-actions { display:flex; gap:8px; }
.action-btn { width:40px; height:40px; border-radius:12px; border:none; background:#f3f4f6; color:#6b7280; cursor:pointer; display:flex; align-items:center; justify-content:center; transition: all 0.2s ease; }
.action-btn:hover { background:#e5e7eb; color:#667eea; transform:translateY(-2px); }
.post-btn { background: linear-gradient(135deg,#667eea 0%,#764ba2 100%); color:white; border:none; padding:12px 32px; border-radius:12px; font-weight:600; font-size:15px; cursor:pointer; transition: all 0.3s ease; box-shadow:0 4px 12px rgba(102,126,234,0.3); }
.post-btn:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 6px 20px rgba(102,126,234,0.4); }
.post-btn:disabled { opacity:0.5; cursor:not-allowed; }

/* Posts */
.posts-container { display:flex; flex-direction:column; gap:20px; }
.post-card { background:white; border-radius:20px; padding:24px; box-shadow:0 4px 20px rgba(102,126,234,0.12); border:2px solid rgba(102,126,234,0.08); transition:all 0.3s ease; }
.post-card:hover { box-shadow:0 8px 30px rgba(102,126,234,0.2); border-color: rgba(102,126,234,0.2); transform:translateY(-2px); }
.post-header { display:flex; gap:12px; margin-bottom:16px; }
.post-user-info { display:flex; flex-direction:column; justify-content:center; }
.user-name { font-weight:700; font-size:15px; color:#1f2937; }
.post-time { font-size:13px; color:#9ca3af; }
.post-content { font-size:15px; line-height:1.6; color:#374151; margin-bottom:16px; }

.post-actions-bar { display:flex; gap:8px; padding-top:12px; border-top:2px solid #f3f4f6; }
.action-button { display:flex; align-items:center; gap:8px; padding:10px 16px; border-radius:12px; border:none; background:#f9fafb; color:#6b7280; font-size:14px; font-weight:600; cursor:pointer; transition: all 0.2s ease; }
.action-button:hover { background: linear-gradient(135deg,#667eea 0%,#764ba2 100%); color:white; transform:translateY(-2px); box-shadow:0 4px 12px rgba(102,126,234,0.3); }
.action-button svg { transition: all 0.2s ease; }

/* Replies */
.replies-section { margin-top:20px; padding-top:20px; border-top:2px solid #f3f4f6; }
.reply-card { display:flex; gap:12px; margin-bottom:16px; padding:16px; background:#f9fafb; border-radius:16px; transition: all 0.2s ease; }
.reply-card:hover { background:#f3f4f6; }
.reply-content-wrapper { flex:1; }
.reply-header { display:flex; gap:8px; align-items:center; margin-bottom:6px; }
.reply-user-name { font-weight:700; font-size:14px; color:#1f2937; }
.reply-time { font-size:12px; color:#9ca3af; }
.reply-content { font-size:14px; line-height:1.5; color:#4b5563; }
.new-reply-form { display:flex; gap:12px; align-items:center; margin-top:16px; }
.reply-input { flex:1; border:2px solid #e5e7eb; border-radius:12px; padding:12px 16px; font-size:14px; font-family:inherit; transition: all 0.3s ease; background:white; }
.reply-input:focus { outline:none; border-color:#667eea; box-shadow:0 0 0 4px rgba(102,126,234,0.1); }
.reply-send-btn { width:44px; height:44px; border-radius:12px; border:none; background: linear-gradient(135deg,#667eea 0%,#764ba2 100%); color:white; cursor:pointer; display:flex; align-items:center; justify-content:center; transition: all 0.3s ease; box-shadow:0 4px 12px rgba(102,126,234,0.3); }
.reply-send-btn:hover:not(:disabled) { transform:translateY(-2px) scale(1.05); box-shadow:0 6px 20px rgba(102,126,234,0.4); }
.reply-send-btn:disabled { opacity:0.5; cursor:not-allowed; }

/* Responsivo */
@media (max-width: 768px) {
  .threads-feed { padding: 16px 12px; }
  .feed-title { font-size: 28px; }
  .feed-subtitle { font-size: 14px; }
  .post-textarea { font-size: 14px; }
  .post-content { font-size: 14px; }
  .action-button { font-size: 13px; padding:8px 12px; }
}
</style>
