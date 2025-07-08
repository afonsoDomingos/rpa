<template>
  <div class="container-fluid position-sticky z-index-sticky top-0 px-0">
    <div class="row gx-0">
      <div class="col-12">
        <NavbarDefault :sticky="true" />
      </div>
    </div>
  </div>
  <br/><br/><br/>
  <div class="container py-4">

 <div class="card shadow rounded-4 p-4">
      <h4 class="mb-4 text-center">
        <i class="bi bi-folder-plus text-primary me-2"></i>
        Guardar Meus Documentos
      </h4>

      <!-- Tipo do Documento -->
      <div class="mb-3">
        <label class="form-label">Tipo de Documento</label>
        <select v-model="form.tipoDocumento" class="form-select borda-destacada">
          <option disabled value="">Selecione</option>
          <option v-for="tipo in tiposDocumento" :key="tipo" :value="tipo">{{ tipo }}</option>
        </select>
      </div>

      <!-- Campos para Bilhete de Identidade -->
      <div v-if="form.tipoDocumento === 'Bilhete de Identidade'" class="row g-3">
        <div class="col-md-6">
          <label class="form-label">Nome completo</label>
          <input v-model="form.nome" class="form-control borda-destacada" placeholder="Nome completo" />
        </div>
        <div class="col-md-6">
          <label class="form-label">Número do BI</label>
          <input v-model="form.numeroDocumento" class="form-control borda-destacada" placeholder="Número do BI" />
        </div>
        <div class="col-md-6">
          <label class="form-label">Data de Emissão</label>
          <input type="date" v-model="form.dataEmissao" class="form-control borda-destacada" />
        </div>
        <div class="col-md-6">
          <label class="form-label">Validade</label>
          <input type="date" v-model="form.validade" class="form-control borda-destacada" />
        </div>
      </div>

      <!-- Campos para Carta de Condução -->
      <div v-else-if="form.tipoDocumento === 'Carta de Condução'" class="row g-3">
        <div class="col-md-6">
          <label class="form-label">Nome completo</label>
          <input v-model="form.nome" class="form-control borda-destacada" />
        </div>
        <div class="col-md-6">
          <label class="form-label">Número da Carta</label>
          <input v-model="form.numeroDocumento" class="form-control borda-destacada" />
        </div>
        <div class="col-md-6">
          <label class="form-label">Categoria</label>
          <input v-model="form.categoria" class="form-control borda-destacada" />
        </div>
        <div class="col-md-6">
          <label class="form-label">Data de Emissão</label>
          <input type="date" v-model="form.dataEmissao" class="form-control borda-destacada" />
        </div>
        <div class="col-md-6">
          <label class="form-label">Validade</label>
          <input type="date" v-model="form.validade" class="form-control borda-destacada" />
        </div>
      </div>

      <!-- Campos para Seguro do Veículo -->
      <div v-else-if="form.tipoDocumento === 'Seguro do Veículo'" class="row g-3">
        <div class="col-md-6">
          <label class="form-label">Nome do Proprietário</label>
          <input v-model="form.nome" class="form-control borda-destacada" />
        </div>
        <div class="col-md-6">
          <label class="form-label">Número da Apólice</label>
          <input v-model="form.numeroDocumento" class="form-control borda-destacada" />
        </div>
        <div class="col-md-6">
          <label class="form-label">Matrícula</label>
          <input v-model="form.matricula" class="form-control borda-destacada" />
        </div>
        <div class="col-md-6">
          <label class="form-label">Companhia Seguradora</label>
          <input v-model="form.seguradora" class="form-control borda-destacada" />
        </div>
        <div class="col-md-6">
          <label class="form-label">Validade</label>
          <input type="date" v-model="form.validade" class="form-control borda-destacada" />
        </div>
      </div>

      <!-- Campos para NUIT -->
      <div v-else-if="form.tipoDocumento === 'NUIT'" class="row g-3">
        <div class="col-md-6">
          <label class="form-label">Nome do Contribuinte</label>
          <input v-model="form.nome" class="form-control borda-destacada" placeholder="Nome completo" />
        </div>
        <div class="col-md-6">
          <label class="form-label">Número do NUIT</label>
          <input v-model="form.numeroDocumento" class="form-control borda-destacada" placeholder="Ex: 123456789" />
        </div>
      </div>

      <!-- Campos para NUIB -->
      <div v-else-if="form.tipoDocumento === 'NUIB'" class="row g-3">
        <div class="col-md-6">
          <label class="form-label">Nome do Titular</label>
          <input v-model="form.nome" class="form-control borda-destacada" placeholder="Nome completo" />
        </div>
        <div class="col-md-6">
          <label class="form-label">Banco</label>
          <input v-model="form.entidadeEmissora" class="form-control borda-destacada"
            placeholder="Nome do banco emissor" />
        </div>
        <div class="col-md-6">
          <label class="form-label">Número do NUIB</label>
          <input v-model="form.numeroDocumento" class="form-control borda-destacada" placeholder="Ex: MZ123456789" />
        </div>
        <div class="col-md-6">
          <label class="form-label">Número de Conta</label>
          <input v-model="form.numeroConta" class="form-control borda-destacada" placeholder="Ex: 1234567890" />
        </div>
        <div class="col-md-6">
          <label class="form-label">Número do Cartão</label>
          <input v-model="form.numeroCartao" class="form-control borda-destacada"
            placeholder="Ex: 1234 5678 9012 3456" />
        </div>
      </div>


      <!-- Campos para Passaporte -->
      <div v-else-if="form.tipoDocumento === 'Passaporte'" class="row g-3">
        <div class="col-md-6">
          <label class="form-label">Nome Completo</label>
          <input v-model="form.nome" class="form-control borda-destacada" placeholder="Nome completo" />
        </div>
        <div class="col-md-6">
          <label class="form-label">Número do Passaporte</label>
          <input v-model="form.numeroDocumento" class="form-control borda-destacada" placeholder="Ex: AB123456" />
        </div>
        <div class="col-md-6">
          <label class="form-label">Data de Emissão</label>
          <input type="date" v-model="form.dataEmissao" class="form-control borda-destacada" />
        </div>
        <div class="col-md-6">
          <label class="form-label">Validade</label>
          <input type="date" v-model="form.validade" class="form-control borda-destacada" />
        </div>
      </div>

      <!-- Campos para Certidão de Nascimento -->
      <div v-else-if="form.tipoDocumento === 'Certidão de Nascimento'" class="row g-3">
        <div class="col-md-6">
          <label class="form-label">Nome da Criança</label>
          <input v-model="form.nome" class="form-control borda-destacada" placeholder="Nome completo" />
        </div>
        <div class="col-md-6">
          <label class="form-label">Número de Registo</label>
          <input v-model="form.numeroDocumento" class="form-control borda-destacada" placeholder="Número do registo" />
        </div>
        <div class="col-md-6">
          <label class="form-label">Data de Nascimento</label>
          <input type="date" v-model="form.dataEmissao" class="form-control borda-destacada" />
        </div>
      </div>

      <!-- Campos para Cartão de Eleitor -->
      <div v-else-if="form.tipoDocumento === 'Cartão de Eleitor'" class="row g-3">
        <div class="col-md-6">
          <label class="form-label">Nome Completo</label>
          <input v-model="form.nome" class="form-control borda-destacada" />
        </div>
        <div class="col-md-6">
          <label class="form-label">Número do Cartão</label>
          <input v-model="form.numeroDocumento" class="form-control borda-destacada" />
        </div>
        <div class="col-md-6">
          <label class="form-label">Zona Eleitoral</label>
          <input v-model="form.zonaEleitoral" class="form-control borda-destacada" />
        </div>
      </div>

      <!--Cartão da Segurança Social-->
      <div v-else-if="form.tipoDocumento === 'Cartão da Segurança Social'" class="row g-3">
        <div class="col-md-6">
          <label class="form-label">Nome Completo</label>
          <input v-model="form.nome" class="form-control borda-destacada" />
        </div>
        <div class="col-md-6">
          <label class="form-label">Número da Segurança Social</label>
          <input v-model="form.numeroSegurancaSocial" class="form-control borda-destacada" />
        </div>
      </div>

      <!--Cartão de Identidade Militar-->
      <div v-else-if="form.tipoDocumento === 'Cartão de Identidade Militar'" class="row g-3">
        <div class="col-md-6">
          <label class="form-label">Nome do Militar</label>
          <input v-model="form.nome" class="form-control borda-destacada" />
        </div>
        <div class="col-md-6">
          <label class="form-label">Número de Identificação</label>
          <input v-model="form.numeroDocumento" class="form-control borda-destacada" />
        </div>
        <div class="col-md-6">
          <label class="form-label">Patente</label>
          <input v-model="form.patente" class="form-control borda-destacada" />
        </div>
      </div>

      <!--Livrete-->
      <div v-else-if="form.tipoDocumento === 'Livrete'" class="row g-3">
        <div class="col-md-6">
          <label class="form-label">Nome do Proprietário</label>
          <input v-model="form.nome" class="form-control borda-destacada" />
        </div>
        <div class="col-md-6">
          <label class="form-label">Número do Livrete</label>
          <input v-model="form.numeroDocumento" class="form-control borda-destacada" />
        </div>
        <div class="col-md-6">
          <label class="form-label">Matrícula</label>
          <input v-model="form.matricula" class="form-control borda-destacada" />
        </div>
        <div class="col-md-6">
          <label class="form-label">Modelo do Veículo</label>
          <input v-model="form.modelo" class="form-control borda-destacada" />
        </div>
      </div>
      <!--Cartões Virtuais-->
      <div v-else-if="form.tipoDocumento === 'Cartões Virtuais'" class="row g-3">
        <div class="col-md-6">
          <label class="form-label">Tipo do Cartão Virtual</label>
          <input v-model="form.cartaoVirtualTipo" class="form-control borda-destacada"
            placeholder="Ex: Cartão SIM, Cartão de Transporte" />
        </div>
        <div class="col-md-6">
          <label class="form-label">Código/Número Virtual</label>
          <input v-model="form.codigoVirtual" class="form-control borda-destacada"
            placeholder="Ex: ID ou código digital" />
        </div>
      </div>

      <!-- Botão -->
      <div class="text-center mt-4">
        <button class="btn btn-success px-4" @click="salvarDocumento">
          <i class="bi bi-check-circle me-2"></i>
          Guardar Documento
        </button>
      </div>

      <div v-if="mensagem" :class="`alert mt-4 ${mensagemTipo}`">
        {{ mensagem }}
      </div>


    </div>

 <!-- Lista de documentos guardados -->
<div class="container mt-5" v-if="documentos.length > 0">
  <h4 class="mb-4 text-primary fw-bold">📁 Documentos Guardados</h4>

  <div
    v-for="(doc, index) in documentos"
    :key="doc.id || index"
    class="card shadow-sm mb-4"
  >
    <div class="card-body">
      <div class="row">
        <div class="col-md-6" v-if="doc.tipoDocumento"><strong>Tipo:</strong> {{ doc.tipoDocumento }}</div>
        <div class="col-md-6" v-if="doc.nome"><strong>Nome:</strong> {{ doc.nome }}</div>
        <div class="col-md-6" v-if="doc.numeroDocumento"><strong>Número:</strong> {{ doc.numeroDocumento }}</div>
        <div class="col-md-6" v-if="doc.dataEmissao"><strong>Data de Emissão:</strong> {{ doc.dataEmissao }}</div>
        <div class="col-md-6" v-if="doc.validade"><strong>Validade:</strong> {{ doc.validade }}</div>
        <div class="col-md-6" v-if="doc.categoria"><strong>Categoria:</strong> {{ doc.categoria }}</div>
        <div class="col-md-6" v-if="doc.matricula"><strong>Matrícula:</strong> {{ doc.matricula }}</div>
        <div class="col-md-6" v-if="doc.seguradora"><strong>Seguradora:</strong> {{ doc.seguradora }}</div>
        <div class="col-md-6" v-if="doc.numeroConta"><strong>Nº Conta:</strong> {{ doc.numeroConta }}</div>
        <div class="col-md-6" v-if="doc.numeroCartao"><strong>Nº Cartão:</strong> {{ doc.numeroCartao }}</div>
        <div class="col-md-6" v-if="doc.zonaEleitoral"><strong>Zona Eleitoral:</strong> {{ doc.zonaEleitoral }}</div>
        <div class="col-md-6" v-if="doc.numeroSegurancaSocial"><strong>Nº Segurança Social:</strong> {{ doc.numeroSegurancaSocial }}</div>
        <div class="col-md-6" v-if="doc.patente"><strong>Patente:</strong> {{ doc.patente }}</div>
        <div class="col-md-6" v-if="doc.modelo"><strong>Modelo:</strong> {{ doc.modelo }}</div>
        <div class="col-md-6" v-if="doc.cartaoVirtualTipo"><strong>Tipo Cartão Virtual:</strong> {{ doc.cartaoVirtualTipo }}</div>
        <div class="col-md-6" v-if="doc.codigoVirtual"><strong>Código Virtual:</strong> {{ doc.codigoVirtual }}</div>
      </div>

      <div class="mt-3 d-flex gap-2">
        <button class="btn btn-outline-danger btn-sm" @click="removerDocumento(doc.id)">
          🗑 Remover
        </button>
        <button class="btn btn-outline-primary btn-sm" @click="editarDocumento(doc)">
          ✏️ Editar
        </button>
      </div>
    </div>
  </div>
</div>

<div v-else class="text-center mt-5">
  <p class="text-muted fs-5">📂 Nenhum documento guardado.</p>
</div>

<!-- Modal de edição -->
<div v-if="modalAberto" class="modal-overlay" @click.self="fecharModal">
  <div class="modal-content p-4 shadow-lg rounded bg-white" style="max-width: 800px; margin: auto;">
    <h4 class="mb-4 text-center text-primary">✏️ Editar Documento</h4>
    <form @submit.prevent="salvarEdicao">
      <div class="row g-3">
        <template v-for="chave in Object.keys(form)" :key="chave">
          <div class="col-md-6">
            <label class="form-label text-capitalize">{{ formatarLabel(chave) }}</label>
            <input
              :type="chave.includes('data') ? 'date' : 'text'"
              class="form-control borda-destacada"
              v-model="form[chave]"
            />
          </div>
        </template>
      </div>
      <div class="mt-4 text-center">
        <button type="submit" class="btn btn-success me-2">💾 Salvar</button>
        <button type="button" class="btn btn-secondary" @click="fecharModal">❌ Cancelar</button>
      </div>
    </form>
  </div>
</div>


  </div><!-- Componente para exibir o rodapé padrão -->
  <FooterDefault />

</template>

<script setup>
import NavbarDefault from "../examples/navbars/NavbarDefault.vue";
import FooterDefault from "../examples/footers/FooterDefault.vue";
import { ref, onMounted } from 'vue'
import api from '../api'


// Reactive state
const documentos = ref([])
const mensagem = ref('')
const mensagemTipo = ref('')

// Formulário
const form = ref({
  id: null,
  tipoDocumento: '',
  nome: '',
  numeroDocumento: '',
  dataEmissao: '',
  validade: '',
  categoria: '',
  matricula: '',
  seguradora: '',
  numeroConta: '',
  numeroCartao: '',
  zonaEleitoral: '',
  numeroSegurancaSocial: '',
  patente: '',
  modelo: '',
  cartaoVirtualTipo: '',
  codigoVirtual: ''
})

const modalAberto = ref(false)
const camposIgnorados = ['_id', 'createdAt', 'updatedAt', '__v']

// Lista de tipos de documento
const tiposDocumento = [
  'Bilhete de Identidade',
  'Carta de Condução',
  'Seguro do Veículo',
  'Livrete',
  'NUIT',
  'NUIB',
  'Passaporte',
  'Certidão de Nascimento',
  'Cartão de Eleitor',
  'Cartão da Segurança Social',
  'Cartão de Identidade Militar',
  'Cartões Virtuais'
]

const formatarLabel = (campo) => {
  return campo
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .replace(/numero/g, 'Número')
    .replace(/data/g, 'Data')
    .replace(/seguranca/g, 'Segurança')
    .replace(/cartao/g, 'Cartão')
    .replace(/virtual/g, 'Virtual')
    .replace(/conta/g, 'Conta')
    .replace(/zona/g, 'Zona')
    .trim()
}

// Buscar documentos do backend
const fetchDocumentos = async () => {
  try {
    const res = await api.get('/documentosguardados')
    documentos.value = res.data
  } catch (err) {
    mostrarMensagem('Erro ao carregar documentos.', 'alert-danger')
  }
}

// Salvar novo documento ou atualizar existente
const salvarDocumento = async () => {
  if (!form.value.tipoDocumento) {
    mostrarMensagem('Selecione o tipo de documento.', 'alert-danger')
    return
  }

  try {
    if (form.value.id) {
      const { id, ...dadosAtualizados } = form.value
      await api.put(`/documentosguardados/${id}`, dadosAtualizados)
      const index = documentos.value.findIndex(doc => doc.id === id)
      if (index !== -1) documentos.value[index] = { ...form.value }
      mostrarMensagem('Documento atualizado com sucesso.', 'alert-success')
    } else {
      const res = await api.post('/documentosguardados', form.value)
      documentos.value.push(res.data)
      mostrarMensagem('Documento guardado com sucesso.', 'alert-success')
    }
    limparFormulario()
  } catch (err) {
    mostrarMensagem('Erro ao guardar documento.', 'alert-danger')
  }
}

// Exibir mensagem com tempo
const mostrarMensagem = (msg, tipo) => {
  mensagem.value = msg
  mensagemTipo.value = tipo
  setTimeout(() => {
    mensagem.value = ''
    mensagemTipo.value = ''
  }, 3000)
}

// Remover documento do backend
const removerDocumento = async (id) => {
  try {
    await api.delete(`/documentosguardados/${id}`)
    documentos.value = documentos.value.filter(doc => doc.id !== id)
    mostrarMensagem('Documento removido com sucesso.', 'alert-success')
  } catch (err) {
    mostrarMensagem('Erro ao remover documento.', 'alert-danger')
  }
}

// Abrir modal de edição
const editarDocumento = (doc) => {
  form.value = {}
  Object.keys(doc).forEach((chave) => {
    const valor = doc[chave]
    if (!camposIgnorados.includes(chave)) {
      form.value[chave] = valor
    }
  })
  modalAberto.value = true
}

// Fechar modal
const fecharModal = () => {
  modalAberto.value = false
}

// Salvar edição (mesma função do botão principal)
const salvarEdicao = () => {
  salvarDocumento()
  fecharModal()
}

// Limpar formulário
const limparFormulario = () => {
  Object.keys(form.value).forEach(key => form.value[key] = '')
  form.value.id = null
}

// Carregar documentos ao iniciar
onMounted(() => {
  fetchDocumentos()
})
</script>



<style scoped>
.container {
  max-width: 800px;
}

.card {
  animation: fadeIn 0.4s ease-in-out;
  border: 1px solid #ddd;
  border-radius: 16px;
}

h4 {
  font-weight: bold;
  color: #343a40;
}

.borda-destacada {
  border: 1px solid #66bb6a;
  border-radius: 8px;
  padding: 10px;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
  background-color: #fefefe;
}

.borda-destacada:focus {
  border-color: #6f42c1;
  box-shadow: 0 0 0 0.2rem rgba(111, 66, 193, 0.25);
}

.alert {
  transition: all 0.3s ease;
  border-radius: 8px;
  padding: 10px 20px;
  font-size: 15px;
}

.btn {
  font-weight: 500;
}

.btn-outline-danger,
.btn-outline-primary {
  border-radius: 10px;
}

.modal-content {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  min-width: 320px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0px 10px 25px rgba(0, 0, 0, 0.2);
  animation: slideUp 0.3s ease-out;
}

.modal-content form input {
  width: 100%;
  margin-top: 0.2rem;
  margin-bottom: 1rem;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

</style>
