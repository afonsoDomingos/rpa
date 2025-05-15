<template>
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

      <!-- Campos Dinâmicos -->
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
        <div class="col-md-6">
          <label class="form-label">Província</label>
          <select v-model="form.provincia" class="form-select borda-destacada">
            <option disabled value="">Selecione</option>
            <option v-for="prov in provincias" :key="prov" :value="prov">{{ prov }}</option>
          </select>
        </div>
        <div class="col-md-6">
          <label class="form-label">Contacto</label>
          <input v-model="form.contacto" class="form-control borda-destacada" placeholder="Ex: 84xxxxxxx" />
        </div>
      </div>

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

      <!-- Botão -->
      <div class="text-center mt-4">
        <button class="btn btn-success px-4" @click="guardarLocalmente">
          <i class="bi bi-check-circle me-2"></i>
          Guardar Documento
        </button>
      </div>

      <div v-if="mensagem" :class="`alert mt-4 ${mensagemTipo}`">
        {{ mensagem }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const form = ref({
  tipoDocumento: '',
  nome: '',
  numeroDocumento: '',
  dataEmissao: '',
  validade: '',
  provincia: '',
  contacto: '',
  categoria: '',
  matricula: '',
  seguradora: ''
})

const tiposDocumento = [
  'Bilhete de Identidade',
  'Carta de Condução',
  'Seguro do Veículo'
]

const provincias = [
  'Maputo', 'Gaza', 'Inhambane', 'Sofala', 'Manica', 'Tete',
  'Zambézia', 'Nampula', 'Niassa', 'Cabo Delgado'
]

const mensagem = ref('')
const mensagemTipo = ref('')

const guardarLocalmente = () => {
  if (!form.value.tipoDocumento || !form.value.numeroDocumento) {
    mensagem.value = 'Preencha os campos obrigatórios.'
    mensagemTipo.value = 'alert-danger'
    return
  }

  console.log('Documento guardado:', { ...form.value })

  mensagem.value = 'Documento guardado com sucesso!'
  mensagemTipo.value = 'alert-success'

  const tipo = form.value.tipoDocumento
  form.value = { tipoDocumento: tipo }
}
</script>

<style scoped>
.container {
  max-width: 800px;
}

.borda-destacada {
  border: 1px solid #66bb6a;
  border-radius: 5px;
  padding: 10px;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.borda-destacada:focus {
  border-color: #800080;
  box-shadow: 0 0 0 0.2rem rgba(102, 16, 242, 0.25);
}
</style>
