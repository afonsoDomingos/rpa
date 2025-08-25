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
      
  <div class="min-vh-100 bg-light py-5">
    <div class="container">
      <!-- Header -->
      <div class="text-center mb-5">
        <h1 class="display-4 fw-bold text-purple">Recuperação de Viaturas</h1>
        <p class="lead text-muted">Sistema especializado para recuperação de veículos roubados ou furtados</p>
         <!-- AVISO DE DESENVOLVIMENTO -->
        <div class="alert alert-warning mt-4 fw-bold" role="alert">
          🚧 Esta página ainda está em desenvolvimento. Algumas funcionalidades podem não estar disponíveis.
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="row g-4 mb-5">
        <div class="col-md-4" v-for="(valor, chave) in statsDisplay" :key="chave">
          <div class="card shadow-lg border-0 stat-card h-100 text-center p-3">
            <h2 class="fw-bold text-green">{{ valor }}</h2>
            <p class="mb-0 text-muted">{{ chave }}</p>
          </div>
        </div>
      </div>

      <!-- Search Form -->
      <div class="card glass-card mb-5 shadow-lg">
        <div class="card-body">
          <h2 class="h4 fw-bold mb-4 text-purple">Buscar Viatura</h2>
          <div class="row g-3">
            <div class="col-md-4">
              <div class="form-floating">
                <input v-model="searchForm.placa" type="text" class="form-control custom-input" id="placaBusca" placeholder="Placa">
                <label for="placaBusca">Placa do veículo</label>
              </div>
            </div>
            <div class="col-md-4">
              <div class="form-floating">
                <select v-model="searchForm.marca" class="form-select custom-input" id="marcaBusca">
                  <option value="">Selecione a marca</option>
                  <option v-for="marca in marcas" :key="marca" :value="marca">{{ marca }}</option>
                </select>
                <label for="marcaBusca">Marca</label>
              </div>
            </div>
            <div class="col-md-4 d-grid">
              <button @click="buscarViatura" class="btn btn-green fw-bold">🔍 Buscar</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Report Form -->
      <div class="card glass-card mb-5 shadow-lg">
        <div class="card-body">
          <h2 class="h4 fw-bold mb-4 text-purple">Reportar Viatura Roubada/Furtada</h2>
          <form @submit.prevent="reportarViatura">
            <div class="row g-3">
              <div class="col-md-6" v-for="(field, key) in reportFields" :key="key">
                <div v-if="field.type !== 'textarea' && field.type !== 'file'" class="form-floating">
                  <input
                    v-model="reportForm[key]"
                    :type="field.type"
                    class="form-control custom-input"
                    :id="key"
                    :placeholder="field.placeholder"
                    :required="field.required"
                  />
                  <label :for="key">{{ field.placeholder }}</label>
                </div>
                <div v-else-if="field.type === 'textarea'" class="form-floating">
                  <textarea
                    v-model="reportForm[key]"
                    class="form-control custom-input"
                    :id="key"
                    style="height: 120px"
                    :placeholder="field.placeholder"
                  ></textarea>
                  <label :for="key">{{ field.placeholder }}</label>
                </div>
                <div v-else-if="field.type === 'file'" class="upload-section">
                  <label class="form-label fw-bold">{{ field.placeholder }}</label>
                  <input
                    type="file"
                    accept="image/*"
                    @change="handleImageUpload"
                    class="form-control custom-input"
                  />
                  <div v-if="reportForm.fotoPreview" class="image-preview mt-3 mx-auto">
                    <img :src="reportForm.fotoPreview" alt="Foto da viatura" />
                  </div>
                </div>
              </div>
            </div>
            <div class="mt-4 d-grid">
              <button type="submit" class="btn btn-purple fw-bold">🚨 Reportar Viatura</button>
            </div>
          </form>
        </div>
      </div>

      <!-- Active Cases -->
      <div class="card glass-card shadow-lg">
        <div class="card-body">
          <h2 class="h4 fw-bold mb-4 text-purple">Viaturas em Busca</h2>
          <div class="row g-4">
            <div v-for="viatura in viaturasAtivas" :key="viatura.id" class="col-md-6 col-lg-4">
              <div class="card h-100 border-0 shadow-sm case-card">
                <div class="car-image-wrapper">
                  <img v-if="viatura.foto" :src="viatura.foto" alt="Foto da viatura" />
                  <div v-else class="car-placeholder">🚘</div>
                </div>
                <div class="card-body d-flex flex-column">
                  <h5 class="fw-bold text-green">{{ viatura.marca }} {{ viatura.modelo }}</h5>
                  <p class="small text-muted">{{ viatura.ano }} • {{ viatura.cor }}</p>
                  <p class="mb-1"><strong>Proprietário:</strong> {{ viatura.nome }}</p>
                  <p class="mb-1"><strong>Contacto:</strong> {{ viatura.contacto }}</p>
                  <p class="mb-1"><strong>Placa:</strong> {{ viatura.placa }}</p>
                  <p class="small description">{{ viatura.descricao }}</p>
                  <div class="d-flex justify-content-between align-items-center mt-auto">
                    <small class="text-muted">{{ viatura.dataRoubo }}</small>
                    <span v-if="viatura.recompensa" class="badge bg-green text-white fs-6">
                      💰 {{ viatura.recompensa.toLocaleString("pt-MZ") }} MT
                    </span>
                    <button @click="contatarProprietario(viatura.id)" class="btn btn-purple btn-sm fw-bold">
                      📩 Contatar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
    </div>

    <!-- Rodapé -->
    <FooterDefault />
  </div>
</template>

<script setup>
import NavbarDefault from "../examples/navbars/NavbarDefault.vue";
import FooterDefault from "../examples/footers/FooterDefault.vue";




import { ref, reactive, computed } from 'vue'

const stats = reactive({
  recuperadas: 1247,
  ativas: 89,
  recompensas: 125000
})

const statsDisplay = computed(() => ({
  'Viaturas Recuperadas': stats.recuperadas,
  'Casos Ativos': stats.ativas,
  'Recompensas Pagas (MT)': stats.recompensas.toLocaleString("pt-MZ")
}))

const searchForm = reactive({ placa: '', marca: '' })

const reportForm = reactive({
  nome: '',
  contacto: '',
  placa: '',
  marca: '',
  modelo: '',
  ano: '',
  cor: '',
  recompensa: '',
  descricao: '',
  foto: null,
  fotoPreview: null
})

const reportFields = {
  nome: { type: 'text', placeholder: 'Seu Nome', required: true },
  contacto: { type: 'text', placeholder: 'Seu Contacto', required: true },
  placa: { type: 'text', placeholder: 'Placa', required: true },
  marca: { type: 'text', placeholder: 'Marca', required: true },
  modelo: { type: 'text', placeholder: 'Modelo', required: true },
  ano: { type: 'number', placeholder: 'Ano', required: true },
  cor: { type: 'text', placeholder: 'Cor', required: true },
  recompensa: { type: 'number', placeholder: 'Recompensa (MT)', required: false },
  descricao: { type: 'textarea', placeholder: 'Descrição adicional', required: false },
  foto: { type: 'file', placeholder: 'Foto da viatura', required: false }
}

const marcas = ['Toyota','Volkswagen','Chevrolet','Ford','Fiat','Honda','Hyundai','Nissan','Renault','Peugeot','BMW','Mercedes-Benz','Audi']

const viaturasAtivas = ref([
  { 
    id: 1,
    nome: 'João Silva',
    contacto: '841234567',
    marca: 'Toyota',
    modelo: 'Corolla',
    ano: 2020,
    cor: 'Prata',
    placa: 'ABC-1234',
    recompensa: 5000,
    descricao: 'Roubado na Zona Sul, próximo ao shopping.',
    dataRoubo: '15/01/2024',
    foto: null
  },
  { 
    id: 2,
    nome: 'Maria Santos',
    contacto: '849876543',
    marca: 'Honda',
    modelo: 'Civic',
    ano: 2019,
    cor: 'Preto',
    placa: 'DEF-5678',
    recompensa: 8000,
    descricao: 'Furtado no estacionamento do supermercado.',
    dataRoubo: '12/01/2024',
    foto: null
  },
  { 
    id: 3,
    nome: 'Carlos Mendes',
    contacto: '847112233',
    marca: 'Volkswagen',
    modelo: 'Gol',
    ano: 2018,
    cor: 'Branco',
    placa: 'GHI-9012',
    recompensa: null,
    descricao: 'Amassado na porta direita, suspeita de furto oportunista.',
    dataRoubo: '10/01/2024',
    foto: null
  }
])

const buscarViatura = () => alert(`Buscando viatura com placa: ${searchForm.placa}`)
const contatarProprietario = id => alert('Redirecionando para contato...')
const reportarViatura = () => {
  const nova = { 
    id: viaturasAtivas.value.length + 1,
    nome: reportForm.nome,
    contacto: reportForm.contacto,
    marca: reportForm.marca,
    modelo: reportForm.modelo,
    ano: reportForm.ano,
    cor: reportForm.cor,
    placa: reportForm.placa,
    recompensa: reportForm.recompensa,
    descricao: reportForm.descricao,
    dataRoubo: new Date().toLocaleDateString(),
    foto: reportForm.fotoPreview
  }
  viaturasAtivas.value.unshift(nova)
  alert('Viatura reportada com sucesso!')
  Object.keys(reportForm).forEach(key => reportForm[key] = (key==='foto'||key==='fotoPreview')? null : '')
}
const handleImageUpload = e => {
  const file = e.target.files[0]
  if (file) {
    reportForm.foto = file
    reportForm.fotoPreview = URL.createObjectURL(file)
  }
}

</script>


<style scoped>
.text-green { color: #66bb6a; }
.text-purple { color: #800080; }

.btn-green, .btn-purple {
  border-radius: 12px;
  padding: 12px;
  font-size: 16px;
  transition: 0.3s;
}
.btn-green { background-color: #66bb6a; color: #fff; }
.btn-green:hover { background-color: #57a65b; }
.btn-purple { background-color: #800080; color: #fff; }
.btn-purple:hover { background-color: #660066; }

.glass-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 1rem;
  border: 1px solid rgba(0, 0, 0, 0.1);
}
.case-card { border-radius: 1rem; overflow: hidden; transition: transform 0.2s; display: flex; flex-direction: column; }
.case-card:hover { transform: translateY(-6px); }

.custom-input {
  border-radius: 12px;
  padding: 14px;
  border: 1px solid #ccc;
}
.custom-input:focus {
  border-color: #800080;
  box-shadow: 0 0 0 0.2rem rgba(128, 0, 128, 0.2);
}

.image-preview {
  width: 220px;
  aspect-ratio: 1 / 1;
  border-radius: 16px;
  overflow: hidden;
  border: 2px dashed #800080;
  display: flex;
  justify-content: center;
  align-items: center;
}
.image-preview img { width: 100%; height: 100%; object-fit: cover; }

.car-image-wrapper {
  width: 100%;
  aspect-ratio: 1 / 1;
  overflow: hidden;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
}
.car-image-wrapper img { width: 100%; height: 100%; object-fit: cover; }
.car-placeholder { font-size: 48px; color: #aaa; }

.description {
  max-height: 60px;
  overflow-y: auto;
  margin-bottom: 8px;
}

/* Responsividade */
@media (max-width: 768px) {
  .display-4 { font-size: 2rem; }
  .form-floating label { font-size: 0.9rem; }
}
</style>
