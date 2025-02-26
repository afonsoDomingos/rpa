<script setup>
import api from "../api"; // Importa a instância da API para comunicação com o servidor
import { ref, onMounted, onUnmounted } from "vue"; // Importa funções do Vue para trabalhar com reatividade e ciclo de vida
import MaterialSwitch from "@/components/MaterialSwitch.vue"; // Componente para um switch material



import eventBus from "@/eventBus";

// Ouvir evento vindo do NavBarDefault.vue
const changeTab = (tabName) => {
  activeTab.value = tabName;
};

onMounted(() => eventBus.on("changeTab", changeTab));
onUnmounted(() => eventBus.off("changeTab", changeTab));

// Importação de função para efeitos na navegação de abas
import setNavPills from "@/assets/js/nav-pills.js";

// Executa a função para configurar o efeito de navegação após a montagem do componente
onMounted(() => {
  setNavPills();
});



// Estado reativo para controlar a aba ativa (inicialmente, a aba 'Cadastrar' está ativa)
const activeTab = ref("cadastrar");


// Campos para a aba "Cadastrar" (Submissão de documentos perdidos)
const nome_completo = ref('');
const tipo_documento = ref('');
const numero_documento = ref('');
const data_perda = ref('');
const provincia = ref('');
const origem = ref('');
const contacto = ref('');

// Campos para a aba "Reportar" (Status de recuperação de documentos)
const protocolo = ref('');

// Campos para a aba "Procurar" (Pesquisa de documentos)
const nome_completoRec = ref('');
const tipo_documentoRec = ref('');
const provinciaRec = ref('');

// Função para buscar todos os documentos disponíveis
const documentosDisponiveis = ref([]);

const buscarDocumentos = async () => {
  try {
    const response = await api.get('/documentos'); // Faz uma requisição para buscar todos os documentos
    documentosDisponiveis.value = response.data; // Atualiza a lista de documentos disponíveis com a resposta
  } catch (error) {
    console.error("Erro ao buscar documentos:", error); // Exibe erro em caso de falha
  }
};




// Funções para buscar documentos específicos (reportados e de proprietários)
const documentosReportados = ref([]);
const documentosProprietarios = ref([]);

const buscarDocumentosReportados = async () => {
  try {
    const response = await api.get('/documentos/reportados'); // Busca documentos reportados
    documentosReportados.value = response.data; // Atualiza a lista com documentos reportados
  } catch (error) {
    console.error("Erro ao buscar documentos reportados:", error); // Exibe erro em caso de falha
  }
};

const buscarDocumentosProprietarios = async () => {
  try {
    const response = await api.get('/documentos/proprietarios'); // Busca documentos de proprietários
    documentosProprietarios.value = response.data; // Atualiza a lista com documentos de proprietários
  } catch (error) {
    console.error("Erro ao buscar documentos proprietários:", error); // Exibe erro em caso de falha
  }
};

// Executa as funções de busca ao montar o componente
onMounted(() => {
  buscarDocumentosReportados();
  buscarDocumentosProprietarios();
});

// Função para cadastrar um novo documento perdido
// Variáveis reativas para mensagens
const mensagemErro = ref('');
const mensagemSucesso = ref('');

// Função para cadastrar um novo documento perdido
const cadastrarDocumento = async () => {
  mensagemErro.value = ''; // Limpa a mensagem de erro antes de tentar cadastrar
  mensagemSucesso.value = ''; // Limpa a mensagem de sucesso



  try {
    const novoDocumento = {
      nome_completo: nome_completo.value,
      tipo_documento: tipo_documento.value,
      numero_documento: numero_documento.value,
      provincia: provincia.value,
      data_perda: data_perda.value,
      origem: origem.value,
      contacto: contacto.value
    };

    const response = await api.post('/documentos', novoDocumento); // Envia os dados do novo documento para a API
    console.log('Documento cadastrado com sucesso:', response.data);

    // Exibe mensagem de sucesso com os dados cadastrados
    mensagemSucesso.value = `Documento cadastrado com sucesso: Nome: ${response.data.nome_completo}, Tipo: ${response.data.tipo_documento}, Número: ${response.data.numero_documento}, Província: ${response.data.provincia}, Data: ${response.data.data_perda}`;

    // Após o cadastro, limpa os campos do formulário
    nome_completo.value = '';
    tipo_documento.value = '';
    numero_documento.value = '';
    provincia.value = '';
    data_perda.value = '';
    origem.value = '';
    contacto.value = '';

    // Atualiza a lista de documentos
    buscarDocumentos();
  } catch (error) {
    console.error('Erro ao cadastrar documento:', error);

    // Define a mensagem de erro de forma mais amigável
    if (error.response) {
      mensagemErro.value = error.response.data.message || 'Erro ao cadastrar. Verifique os dados e tente novamente.';
    } else if (error.request) {
      mensagemErro.value = 'Não foi possível se conectar ao servidor. Verifique sua conexão.';
    } else {
      mensagemErro.value = 'Ocorreu um erro inesperado. Tente novamente mais tarde.';
    }
  }
};


// Função para procurar documentos perdidos por nome
const documentosEncontrados = ref([]);
const erroMensagem = ref("");

const procurarDocumento = async () => {
  erroMensagem.value = ""; // Reseta o erro antes da busca

  if (!nome_completoRec.value.trim()) {
    erroMensagem.value = "Por favor, insira um nome válido para a busca.";
    return;
  }

  try {
    const response = await api.get('/documentos', {
      params: { nome_completo: nome_completoRec.value.trim() }
    });

    documentosEncontrados.value = response.data;

    if (documentosEncontrados.value.length === 0) {
      erroMensagem.value = "Nenhum documento encontrado para esse nome.";
    }
  } catch (error) {
    if (!error.response) {
      erroMensagem.value = "Erro de conexão. Verifique sua internet.";
    } else if (error.response.status === 404) {
      erroMensagem.value = "Nenhum documento encontrado.";
    } else {
      erroMensagem.value = `Erro ao buscar documentos: ${error.response.data.message || "Tente novamente mais tarde."}`;
    }

    console.error("Erro ao procurar documentos:", error);
  }
};





// Executa a busca ao montar o componente
onMounted(() => {
  buscarDocumentos(); // Chama a função para buscar os documentos disponíveis ao carregar o componente
});

// Lista de províncias para o formulário
const provincias = [
  "Maputo", "Maputo Cidade", "Gaza", "Inhambane", "Sofala",
  "Manica", "Tete", "Zambézia", "Nampula", "Niassa", "Cabo Delgado"
];

// Lista de tipos de documentos disponíveis
const tipo_documentos = [
  "Bilhete de Identidade (BI)", "Passaporte", "Cartão de Eleitor",
  "Cartão de Estudante", "Carta de Condução", "Seguro do Veículo",
  "Documento de Registro do Veículo (livrete)", "Cartão de Identidade Militar"
];

// Função para reportar o status da recuperação de um documento
const reportarStatus = () => {
  console.log('Protocolo de Recuperação:', protocolo.value, 'Nome:', nome_completo.value);
};
</script>

<template>
  <section class="py-7">

    <div class="container">
      <!-- Conteúdo de Navegação -->
      <ul class="nav nav-pills nav-fill p-1" role="tablist">
        <li class="nav-item">
          <a class="nav-link mb-0 px-0 py-1" :class="{ active: activeTab === 'cadastrar' }"
            @click.prevent="activeTab = 'cadastrar'" role="tab" aria-selected="true">
            Cadastrar
          </a>
        </li>
        <li class="nav-item">
          <a class="nav-link mb-0 px-0 py-1" :class="{ active: activeTab === 'procurar' }"
            @click.prevent="activeTab = 'procurar'" role="tab" aria-selected="false">
            Procurar
          </a>
        </li>
        <li class="nav-item">
          <a class="nav-link mb-0 px-0 py-1" :class="{ active: activeTab === 'documentosReportados' }"
            @click.prevent="activeTab = 'documentosReportados'" role="tab" aria-selected="false">
            Reportados
          </a>
        </li>
        <li class="nav-item">
          <a class="nav-link mb-0 px-0 py-1" :class="{ active: activeTab === 'documentosProprietarios' }"
            @click.prevent="activeTab = 'documentosProprietarios'" role="tab" aria-selected="false">
            Proprietários
          </a>
        </li>
      </ul>
      <!-- Conteúdo das abas -->
      <div class="tab-content">

        <!-- Aba Cadastrar (Formulario para cadastro de documentos) -->
        <div v-if="activeTab === 'cadastrar'" class="tab-pane fade show active" id="cadastrar-tabs-simple">
          <form @submit.prevent="cadastrarDocumento" class="form">
            <div class="row">
              <!-- Campo para Nome Completo -->
              <div class="col-md-12 mb-3">
                <label for="nomeSolicitante" class="form-label">Nome Completo</label>
                <input type="text" id="nomeSolicitante" class="form-control zoom-field" v-model="nome_completo"
                  placeholder="Ex: João Silva" maxlength="50" required />
              </div>
              <!-- Campo para Número do Documento -->
              <div class="col-md-12 mb-3">
                <label for="numeroDocumento" class="form-label">Número do Documento</label>
                <input type="text" id="numeroDocumento" class="form-control zoom-field" v-model="numero_documento"
                  placeholder="Ex: 123" maxlength="15" required />
              </div>
              <!-- Campo para Tipo de Documento -->
              <div class="col-md-12 mb-3">
                <label for="tipoDocumento" class="form-label">Tipo de Documento</label>
                <select id="tipoDocumento" class="form-select zoom-field" v-model="tipo_documento" required>
                  <option disabled value="">Selecione o Tipo de Documento</option>
                  <option v-for="tipo_documento in tipo_documentos" :key="tipo_documento" :value="tipo_documento">{{
                    tipo_documento }}</option>
                </select>
              </div>
              <!-- Campo para Província -->
              <div class="col-md-12 mb-3">
                <label for="provincia" class="form-label"> Província Local onde foi encontrado ou perdido</label>
                <select id="provincia" class="form-select zoom-field" v-model="provincia" required>
                  <option disabled value="">Selecione o local</option>
                  <option v-for="provincia in provincias" :key="provincia" :value="provincia">{{ provincia }}</option>
                </select>
              </div>
              <!-- Campo para Contacto -->
              <div class="col-md-12 mb-3">
                <label for="contato" class="form-label">Contacto</label>
                <input type="tel" pattern="\d{9}" id="contato" class="form-control zoom-field" v-model="contacto"
                  placeholder="Ex: +258 84 123 4567" maxlength="9" required />
              </div>
              <!-- Campo para Data da Perda -->
              <div class="col-md-12 mb-3">
                <label for="dataPerda" class="form-label">Data</label>
                <input type="date" id="dataPerda" class="form-control zoom-field" v-model="data_perda" required />
              </div>
              <!-- Campo para Origem (Se é dono ou encontrou) -->
              <div class="col-md-12 mb-3">
                <label for="origem" class="form-label">Você é o dono ou apenas encontrou?</label>
                <select id="origem" class="form-select zoom-field" v-model="origem" required>
                  <option disabled value="">Escolha uma opção</option>
                  <option value="proprietario">Sou o dono</option>
                  <option value="reportado">Apenas encontrei</option>
                </select>
              </div>
              <!-- Campo para Concordância com Termos -->
              <div class="col-md-12 mb-3">
                <MaterialSwitch class="mb-4 d-flex align-items-center" id="flexSwitchCheckDefault"
                  labelClass="ms-3 mb-0">
                  Eu concordo com os <a href="javascript:;" class="text-dark"><u>Termos e Condições</u></a>.
                </MaterialSwitch>
              </div>
              <!-- Botão para Cadastrar Documento -->
              <div class="text-center">
                <button type="submit" class="btn btn-purple w-100 btn-lg shadow">Cadastrar</button>
              </div>
            </div>
            <div class="text-center">
              <!-- Mensagem de sucesso -->
              <p v-if="mensagemSucesso" class=" alert-success btn btn-purple w-100 btn-lg shadow">
                {{ mensagemSucesso }}
              </p>

              <!-- Mensagem de erro -->
              <p v-if="mensagemErro" class=" alert-danger btn btn-purple w-100 btn-lg shadow">
                {{ mensagemErro }}
              </p>
            </div>

          </form>
        </div>




        <!-- Aba Procurar (Formulário para busca de documentos) -->
        <div v-if="activeTab === 'procurar'" class=" tab-pane fade show active" id="procurar-tabs-simple">
          <form @submit.prevent="procurarDocumento" class="form">
            <div class="row">
              <!-- Campo para Nome Completo -->
              <div class="col-md-12 mb-3">
                <label for="nomeRec" class="form-label">Nome Completo</label>
                <input type="text" id="nomeRec" class="form-control" v-model="nome_completoRec"
                  placeholder="Ex: João Silva" required />
                <!-- Exibição da Mensagem de Erro -->
                <div v-if="erroMensagem" class="text-danger mt-2">
                  {{ erroMensagem }}
                </div>
              </div>
              <!-- Botão para Procurar Documento -->
              <div class="text-center">
                <button type="submit" class="btn btn-purple w-100 btn-lg shadow">Procurar</button>
              </div>
            </div>
          </form>

          <!-- Exibição de Documentos Encontrados -->
          <div v-if="documentosEncontrados.length > 0" class="mt-4">
            <div class="table-responsive">
              <table class="table table-striped">
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Tipo de Documento</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="doc in documentosEncontrados" :key="doc.numero_documento" class="table-row">
                    <td>{{ doc.nome_completo }}</td>
                    <td>{{ doc.tipo_documento }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>


        <!-- Aba Documentos Reportados -->
        <div v-if="activeTab === 'documentosReportados'" class="tab-pane fade show active"
          id="documentosReportados-tabs-simple">
          <div class="table-responsive">
            <table class="table table-striped">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Tipo de Documento</th>
                  <th>Número do Documento</th>
                  <th>Província</th>
                  <th>Data</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="documento in documentosReportados" :key="documento.numero_documento" class="table-row">
                  <td>{{ documento.nome_completo }}</td>
                  <td>{{ documento.tipo_documento }}</td>
                  <td>{{ documento.numero_documento }}</td>
                  <td>{{ documento.provincia }}</td>
                  <td>{{ documento.data_perda }}</td>
                </tr>
              </tbody>
            </table>
            <!-- Nota explicativa -->
            <div class="tab-pane fade show active">
              <strong>Nota:</strong> Esta é a lista de documentos perdidos registrados por alguém que os encontrou.
            </div>
          </div>
        </div>

        <!-- Aba Documentos Proprietários -->
        <div v-if="activeTab === 'documentosProprietarios'" class="tab-pane fade show active"
          id="documentosProprietarios-tabs-simple">
          <div class="table-responsive">
            <table class="table table-striped">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Tipo de Documento</th>
                  <th>Número do Documento</th>
                  <th>Província</th>
                  <th>Contacto</th>
                  <th>Data</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="documento in documentosProprietarios" :key="documento.numero_documento" class="table-row">
                  <td>{{ documento.nome_completo }}</td>
                  <td>{{ documento.tipo_documento }}</td>
                  <td>{{ documento.numero_documento }}</td>
                  <td>{{ documento.provincia }}</td>
                  <td>{{ documento.contacto }}</td>
                  <td>{{ documento.data_perda }}</td>
                </tr>
              </tbody>
            </table>
            <!-- Nota explicativa -->
            <div class="tab-pane fade show active">
              <strong>Nota:</strong> Esta é a lista de documentos perdidos reportados pelos seus donos.
            </div>
          </div>
        </div>

      </div>
    </div>
  </section>
</template>


<style scoped>
.nav-link {
  transition: background-color 0.3s ease, color 0.3s ease;
  /* Transição suave */
}

.nav-link:hover {
  background-color: #f0f0f0;
  /* Cor de fundo ao passar o cursor */
  color: #007bff;
  /* Cor do texto ao passar o cursor */
}




/* Estilo para os botões de navegação */
.nav-link {
  color: #800080;
  /* Cor roxa para o texto da aba */
  font-weight: 600;
  border-radius: 30px;
  padding: 12px 30px;
  transition: background-color 0.3s ease, transform 0.3s ease;
}

.nav-link:hover {
  background-color: #800080;
  /* Cor roxa de fundo ao passar o mouse */
  color: white;
  /* Texto branco */
  transform: scale(1.05);
  /* Efeito de aumento no tamanho da aba ao passar o mouse */
}

.nav-link.active {
  background-color: #6a006a;
  /* Tom de roxo mais escuro para a aba ativa */
  color: white;
}

.nav-link:focus {
  outline: none;
  /* Remove o contorno ao focar */
}

/* Cor roxa para os botões */
.btn-purple {
  background-color: #800080;
  /* Cor roxa */
  color: white;
  border-radius: 30px;
  border: none;
  padding: 15px 25px;
  font-size: 1.1rem;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
  transition: background-color 0.3s ease, box-shadow 0.3s ease;
  width: 100%;
  /* Garante que o botão tenha a mesma largura que os campos */
}

.btn-purple:hover {
  background-color: #6a006a;
  /* Tom de roxo mais escuro */
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.2);
  transform: scale(1.05);
  /* Efeito de aumento no botão ao passar o mouse */
}

/* Estilo de zoom nos campos */
.zoom-field {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.zoom-field:hover {
  transform: scale(1.05);
  /* Aumenta o tamanho ao passar o mouse */
  box-shadow: 0 0 10px rgba(128, 0, 128, 0.3);
  /* Sombra roxa suave */
}

/* Tabela */
.table {
  border-radius: 12px;
  overflow: hidden;
  border-collapse: separate;
  border-spacing: 0 10px;
}

.table th,
.table td {
  text-align: center;
  padding: 12px 20px;
  font-size: 1rem;
}

.table th {
  background-color: #800080;
  color: white;
  font-weight: bold;
}

.table tbody tr {
  background-color: #f9f9f9;
  border-radius: 8px;
  transition: transform 0.3s ease, background-color 0.3s ease, box-shadow 0.3s ease;
}

.table tbody tr:hover {
  transform: scale(1.02);
  /* Aumento suave ao passar o mouse */
  background-color: #f1f1f1;
  /* Cor suave de fundo */
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  /* Sombra suave */
}

.table td {
  font-size: 0.95rem;
}

/* Estilo das colunas de status */
.text-success {
  color: #28a745;
  font-weight: bold;
}

.text-warning {
  color: #ffc107;
  font-weight: bold;
}

.text-danger {
  color: #dc3545;
  font-weight: bold;
}

/* Estilo do botão "Detalhes" */
.btn-info {
  background-color: #17a2b8;
  color: white;
  border-radius: 12px;
  padding: 6px 12px;
  font-size: 0.9rem;
  transition: background-color 0.3s ease, transform 0.3s ease;
}

.btn-info:hover {
  background-color: #138496;
  /* Tom mais escuro de azul */
  transform: scale(1.05);
  /* Aumento suave ao passar o mouse */
}

/* Estilos gerais de hover */
.table td:hover {
  cursor: pointer;
  background-color: #f1f1f1;
}
</style>
