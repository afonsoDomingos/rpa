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
