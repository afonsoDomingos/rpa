<script setup>
import api from "../api"; // Importa a instância da API para comunicação com o servidor
import { ref, onMounted, onUnmounted, watch } from "vue"; // Importa funções do Vue para reatividade e ciclo de vida
import MaterialSwitch from "@/components/MaterialSwitch.vue"; // Componente para um switch material
import eventBus from "@/eventBus";

//Vue Material Kit 2 components
import MaterialButton from "@/components/MaterialButton.vue";

// Estado reativo para controlar a aba ativa
const activeTab = ref("procurar");

// Ouvir evento vindo do NavBarDefault.vue
const changeTab = (tabName) => {
  activeTab.value = tabName;
};

onMounted(() => eventBus.on("changeTab", changeTab));
onUnmounted(() => eventBus.off("changeTab", changeTab));

// Importação de função para efeitos na navegação de abas
import setNavPills from "@/assets/js/nav-pills.js";

// Executa a função para configurar o efeito de navegação após a montagem do componente
onMounted(async () => {
  await setNavPills();
});

// Campos para a aba "Cadastrar"
const nome_completo = ref('');
const tipo_documento = ref('');
const numero_documento = ref('');
//const data_perda = ref('');
const provincia = ref('');
const contacto = ref('');



// Campos para a aba "Reportar"
const protocolo = ref('');

// Campos para a aba "Procurar"
const nome_completoRec = ref('');
const tipo_documentoRec = ref('');
const provinciaRec = ref('');
const numero_documentoRec = ref('');


// Lista de documentos
const documentosDisponiveis = ref([]);
const documentosReportados = ref([]);
const documentosProprietarios = ref([]);
const documentosEncontrados = ref([]);



// Mensagens reativas para feedback
const mensagemErro = ref('');
const mensagemSucesso = ref('');
const erroMensagem = ref('');
const nomeError = ref(''); // Para armazenar erros do nome completo
const contactoError = ref(''); // Variável para armazenar erros do contacto


// Função para obter a data de hoje no formato 'YYYY-MM-DD'
const getHoje = () => {
  const hoje = new Date()
  const ano = hoje.getFullYear()
  const mes = String(hoje.getMonth() + 1).padStart(2, '0')
  const dia = String(hoje.getDate()).padStart(2, '0')
  return `${ano}-${mes}-${dia}`
}
const data_perda = ref(getHoje())


// Função de validação do nome completo
const validarNome = () => {
  const nomeRegex = /^[A-Za-zÀ-ÿ\s]+$/; // Regex para letras e espaços
  if (!nome_completo.value) {
    nomeError.value = 'O nome  é obrigatório.';
    return false;
  } else if (!nomeRegex.test(nome_completo.value)) {
    nomeError.value = 'O nome completo deve conter apenas letras.';
    return false;
  }
  nomeError.value = ''; // Limpa o erro se tudo estiver correto
  return true;
};


// Função de validação do contacto
const validarContacto = () => {
  const contactoRegex = /^(84|85|86|87|83)\d{7}$/; // Regex para validar números que começam com 84, 85, 83, 86, 87 ou 83 e têm 9 dígitos
  if (!contacto.value) {
    contactoError.value = 'O contacto é obrigatório.';
    return false;
  } else if (!contactoRegex.test(contacto.value)) {
    contactoError.value = 'O contacto deve conter 9 dígitos e começar com 84, 85, 86, 87 ou 83.';
    return false;
  }
  contactoError.value = ''; // Limpa o erro se tudo estiver correto
  return true;
};



// Função para buscar todos os documentos disponíveis
const buscarDocumentos = async () => {
  try {
    const response = await api.get('/documentos');
    documentosDisponiveis.value = response.data;
  } catch (error) {
    console.error("Erro ao buscar documentos:", error);
  }

  // Chama as validações do nome  e contacto
  if (!validarNome() || !validarContacto()) {
    return; // Não prossegue se alguma validação falhar
  }

};


// Funções para buscar documentos específicos
const buscarDocumentosReportados = async () => {
  try {
    const response = await api.get('/documentos/reportados');
    documentosReportados.value = response.data;
  } catch (error) {
    console.error("Erro ao buscar documentos reportados:", error);
  }
};

const buscarDocumentosProprietarios = async () => {
  try {
    const response = await api.get('/documentos/proprietarios');
    documentosProprietarios.value = response.data;
  } catch (error) {
    console.error("Erro ao buscar documentos proprietários:", error);
  }
};

// Executa buscas ao montar o componente
onMounted(() => {
  buscarDocumentos();
  buscarDocumentosReportados();
  buscarDocumentosProprietarios();
});

// Função para cadastrar um novo documento perdido
const cadastrarDocumento = async () => {
  mensagemErro.value = '';
  mensagemSucesso.value = '';


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

    const response = await api.post('/documentos', novoDocumento);
    console.log('Documento cadastrado com sucesso:', response.data);

    mensagemSucesso.value = `Documento cadastrado com sucesso: Nome: ${response.data.nome_completo}, Tipo: ${response.data.tipo_documento}, Número: ${response.data.numero_documento}, Província: ${response.data.provincia}, Data: ${response.data.data_perda}`;

    // Limpar os campos do formulário
    nome_completo.value = '';
    tipo_documento.value = '';
    numero_documento.value = '';
    provincia.value = '';
    data_perda.value = '';
    origem.value = '';
    contacto.value = '';

    buscarDocumentos(); // Atualiza a lista de documentos
  } catch (error) {
    console.error('Erro ao cadastrar documento:', error);
    mensagemErro.value = error.response?.data?.message || 'Erro ao cadastrar. Verifique os dados e tente novamente.';
  }
};

// Filtro de busca de documentos

// Estado do filtro
const tipoFiltro = ref("nome");


// Watch para resetar os campos ao mudar o filtro
watch(tipoFiltro, (novoValor) => {
  console.log("Filtro alterado para:", novoValor);
  nome_completoRec.value = "";
  tipo_documentoRec.value = "";
  provinciaRec.value = "";
  numero_documentoRec.value = "";
});


// Função para procurar documentos
const procurarDocumento = async () => {
  erroMensagem.value = ""; // Reseta o erro

  // Verifica qual filtro está selecionado
  let params = {};

  if (tipoFiltro.value === "nome" && nome_completoRec.value.trim()) {
    params.nome_completo = nome_completoRec.value.trim();
  } else if (tipoFiltro.value === "tipo" && tipo_documentoRec.value) {
    params.tipo_documento = tipo_documentoRec.value;
  } else if (tipoFiltro.value === "provincia" && provinciaRec.value) {
    params.provincia = provinciaRec.value;
  } else if (tipoFiltro.value === "numero" && numero_documentoRec.value.trim()) { // Adiciona a condição para número de documento
    params.numero_documento = numero_documentoRec.value.trim();
  } else {
    erroMensagem.value = "Por favor, preencha o campo correspondente ao filtro selecionado.";
    return;
  }
  try {
    const response = await api.get("/documentos", { params });
    documentosEncontrados.value = response.data;

    if (documentosEncontrados.value.length === 0) {
      erroMensagem.value = "Nenhum documento encontrado.";
    }
  } catch (error) {
    erroMensagem.value = error.response?.data?.message || "Erro ao buscar documentos. Tente novamente.";
    console.error("Erro ao procurar documentos:", error);
  }

};


// Watch para resetar campos ao mudar de aba
watch(activeTab, (novaAba) => {
  if (novaAba !== "procurar") {
    nome_completoRec.value = "";
    tipo_documentoRec.value = "";
  }
});

// Lista de províncias
const provincias = [
  "Maputo", "Maputo Cidade", "Gaza", "Inhambane", "Sofala",
  "Manica", "Tete", "Zambézia", "Nampula", "Niassa", "Cabo Delgado"
];

// Lista de tipos de documentos
const tipo_documentos = [
  "Bilhete de Identidade", "Passaporte", "Cartão de Eleitor",
  "Cartão de Estudante", "Carta de Condução", "Seguro do Veículo",
  "Livrete", "Cartão de Identidade Militar"
];

// Função para reportar status da recuperação de um documento
const reportarStatus = () => {
  console.log('Protocolo de Recuperação:', protocolo.value, 'Nome:', nome_completo.value);
};



///Minha Funcao de solicitane

</script>

<template>
  <section class="py-7">
    <div class="container">
      <!-- Conteúdo de Navegação -->
      <ul class="nav nav-pills nav-fill p-1" role="tablist">
        <li class="nav-item">
          <a class="nav-link mb-0 px-0 py-1" :class="{ active: activeTab === 'procurar' }"
            @click.prevent="activeTab = 'procurar'" role="tab" aria-selected="true">
            Procurar
          </a>
        </li>
        <li class="nav-item">
          <a class="nav-link mb-0 px-0 py-1" :class="{ active: activeTab === 'cadastrar' }"
            @click.prevent="activeTab = 'cadastrar'" role="tab" aria-selected="false">
            Reportar
          </a>
        </li>
        <!--<li class="nav-item">
          <a class="nav-link mb-0 px-0 py-1" :class="{ active: activeTab === 'documentosReportados' }"
            @click.prevent="activeTab = 'documentosReportados'" role="tab" aria-selected="false">
            Reportados
          </a>
        </li>-->
        <!--<li class="nav-item">
          <a class="nav-link mb-0 px-0 py-1" :class="{ active: activeTab === 'documentosProprietarios' }"
            @click.prevent="activeTab = 'documentosProprietarios'" role="tab" aria-selected="false">
            Proprietários
          </a>
        </li>-->
      </ul>
      <!-- Conteúdo das abas -->
      <div class="tab-content">
        <!-- Aba Procurar (Formulário para busca de documentos) -->
        <div v-if="activeTab === 'procurar'" class="tab-pane fade show active" id="procurar-tabs-simple">
          <form @submit.prevent="procurarDocumento" class="form">
            <div class="row">
              <!-- Seletor de Tipo de Filtro -->
              <div class="col-md-12 mb-3">
                <label for="tipoFiltro" class="form-label fw-bold">Escolha o tipo de filtro</label>
                <select id="tipoFiltro" class="form-control" v-model="tipoFiltro">
                  <option value="nome">Nome Completo</option>
                  <option value="tipo">Tipo de Documento</option>
                  <option value="provincia">Província</option>
                  <option value="numero">Número de Documento</option>
                </select>
              </div>

              <!-- Campo para Nome Completo (Exibido se o filtro for por nome) -->
              <div v-if="tipoFiltro === 'nome'" class="col-md-12 mb-3">
                <label for="nomeRec" class="form-label fw-bold">Nome Completo</label>
                <input type="text" id="nomeRec" class="form-control borda-destacadanome" v-model="nome_completoRec"
                  placeholder="Ex: João Silva" required />
              </div>



              <!-- Campo para Tipo de Documento (Exibido se o filtro for por tipo) -->
              <div v-if="tipoFiltro === 'tipo'" class="col-md-12 mb-3">
                <label for="tipoDocumento" class="form-label fw-bold">Tipo de Documento</label>
                <select id="tipoDocumento" class="form-select zoom-field" v-model="tipo_documentoRec" required>
                  <option disabled value="">Selecione o Tipo de Documento</option>
                  <option v-for="tipo in tipo_documentos" :key="tipo" :value="tipo">{{ tipo }}</option>
                </select>
              </div>

              <!-- Campo para Província (Exibido se o filtro for por província) -->
              <div v-if="tipoFiltro === 'provincia'" class="col-md-12 mb-3">
                <label for="provinciaRec" class="form-label fw-bold">Província</label>
                <select id="provinciaRec" class="form-select zoom-field" v-model="provinciaRec" required>
                  <option disabled value="">Selecione a Província</option>
                  <option v-for="provincia in provincias" :key="provincia" :value="provincia">{{ provincia }}</option>
                </select>
              </div>

              <!-- Campo para Número de Documento (Exibido se o filtro for por número) -->
              <div v-if="tipoFiltro === 'numero'" class="col-md-12 mb-3">
                <label for="numero_documentoRec" class="form-label fw-bold">Número de Documento</label>
                <input type="text" id="numero_documentoRec" class="form-control" v-model="numero_documentoRec"
                  placeholder="Ex: 123456789" required />
              </div>

              <!-- Exibição da Mensagem de Erro -->
              <!--<div v-if="erroMensagem" class="text-danger mt-2">
                {{ erroMensagem }}
              </div>-->

              <!-- Mensagem de erro com botão de redirecionamento -->
              <div v-if="erroMensagem && documentosEncontrados.length === 0"
                class="text-center mt-4 p-4 rounded shadow-sm animate-fade-in" style="background-color: #f8f9fa;">
                <p class="text-danger fw-bold fs-5 mb-3">{{ erroMensagem }}</p>

                <!-- Mensagem motivacional -->
                <p class="text-muted fst-italic fs-6 mensagem-motivacional">
                  Não desanime! Muitas pessoas encontram seus documentos depois de alguns dias, especialmente quando são
                  registrados na plataforma.</p>

                <!-- Botão com destaque -->
                <button @click="activeTab = 'cadastrar'" class="btn btn-success btn-lg mt-3 px-4 py-2 btn-zoom"
                  style="transition: 0.3s;" @mouseover="hover = true" @mouseleave="hover = false">
                  📢 Não encontrou? Cadastre aqui
                </button>
              </div>

              <br />
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
                    <th>Acção</th>

                  </tr>
                </thead>
                <tbody>
                  <tr v-for="doc in documentosEncontrados" :key="doc.numero_documento" class="table-row">
                    <td>{{ doc.nome_completo }}</td>
                    <td>{{ doc.tipo_documento }}</td>
                    <td className="btn-zoom">

                      <!-- Button trigger modal -->
                      <MaterialButton variant="gradient" color="success" data-bs-toggle="modal"
                        data-bs-target="#exampleModal">
                        Solicitar
                      </MaterialButton>

                    </td>

                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Aba Cadastrar (Formulario para cadastro de documentos) -->
        <div v-if="activeTab === 'cadastrar'" class="tab-pane fade show active" id="cadastrar-tabs-simple">
          <form @submit.prevent="cadastrarDocumento" class="form">
            <div class="row">
              <!-- Campo para Nome Completo -->
              <div class="col-md-12 mb-3">
                <label for="nomeSolicitante" class="form-label fw-bold">Nome completo conforme o documento</label>
                <input type="text" id="nomeSolicitante" class="form-control zoom-field borda-destacadanome"
                  v-model="nome_completo" placeholder="Ex: João Silva" maxlength="50" required @blur="validarNome" />
                <div v-if="nomeError" class="text-warning visible">{{ nomeError }}</div>
                <!-- Adicionada a classe 'visible' -->
              </div>
              <!-- Campo para Número do Documento -->
              <div class="col-md-12 mb-3">
                <label for="numeroDocumento" class="form-label fw-bold">Número do Documento</label>
                <input type="text" id="numeroDocumento" class="form-control zoom-field borda-destacada"
                  v-model="numero_documento" placeholder="Ex: 123" maxlength="15" required />
              </div>
              <!-- Campo para Tipo de Documento -->
              <div class="col-md-12 mb-3">
                <label for="tipoDocumento" class="form-label fw-bold">Tipo de Documento</label>
                <select id="tipoDocumento" class="form-select zoom-field" v-model="tipo_documento" required>
                  <option disabled value="">Selecione o Tipo de Documento</option>
                  <option v-for="tipo_documento in tipo_documentos" :key="tipo_documento" :value="tipo_documento">{{
                    tipo_documento }}</option>
                </select>
              </div>
              <!-- Campo para Província -->
              <div class="col-md-12 mb-3">
                <label for="provincia" class="form-label fw-bold"> Província Local onde foi encontrado ou
                  perdido</label>
                <select id="provincia" class="form-select zoom-field" v-model="provincia" required>
                  <option disabled value="">Selecione o local</option>
                  <option v-for="provincia in provincias" :key="provincia" :value="provincia">{{ provincia }}</option>
                </select>
              </div>
              <!-- Campo para Contacto -->
              <div class="col-md-12 mb-3">
                <label for="contato" class="form-label fw-bold">Contacto</label>
                <input type="tel" id="contato" class="form-control zoom-field borda-destacada" v-model="contacto"
                  placeholder="Ex: 84 123 4567" maxlength="9" required @blur="validarContacto" />
                <div v-if="contactoError" class="text-warning visible">{{ contactoError }}</div>
              </div>
              
              <!-- Campo para Data da Perda -->
              <div class="col-md-12 mb-3" style="display: none;">
                <label for="dataPerda" class="form-label fw-bold">
                  Data
                </label>
                <input type="date" id="dataPerda" class="form-control zoom-field " v-model="data_perda" required />
              </div>

              <!-- Campo para Origem (Se é dono ou encontrou) -->
              <div class="col-md-12 mb-3">
                <label for="origem" class="form-label fw-bold">Você é o dono ou apenas encontrou?</label>
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
              <p v-if="mensagemSucesso" class="alert-success btn btn-purple w-100 btn-lg shadow visible">
                {{ mensagemSucesso }}
              </p>

              <!-- Mensagem de erro -->
              <p v-if="mensagemErro" class="alert-danger btn btn-purple w-100 btn-lg shadow visible">
                {{ mensagemErro }}
              </p>
            </div>
          </form>
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

/* Efeiro de erro de mensagem NOME COMPLETO */
@keyframes pulse {
  0% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.05);
  }

  100% {
    transform: scale(1);
  }
}

.text-warning {
  animation: pulse 1s infinite;
  /* Adiciona o efeito de pulsar */
}


/* Efeiro de Mensagem de Envio e Erro  de Cadastro */

@keyframes pulse {
  0% {
    transform: scale(1);
    color: #28a745;
    /* Cor padrão para sucesso */
  }

  50% {
    transform: scale(1.05);
    color: rgb(255, 255, 255);
    /* Cor branco durante o pulsar */
  }

  100% {
    transform: scale(1);
    color: #28a745;
    /* Retorna para a cor padrão */
  }
}

@keyframes pulse-danger {
  0% {
    transform: scale(1);
    color: #dc3545;
    /* Cor padrão para erro */
  }

  50% {
    transform: scale(1.05);
    color: rgb(255, 255, 255);
    /* Cor branco durante o pulsar */
  }

  100% {
    transform: scale(1);
    color: #dc3545;
    /* Retorna para a cor padrão */
  }
}

.alert-success {
  animation: pulse 1s infinite;
  /* Adiciona o efeito de pulsar para sucesso */
}

.alert-danger {
  animation: pulse-danger 1s infinite;
  /* Adiciona o efeito de pulsar para erro */
}




.animate-fade-in {
  animation: fadeIn 1s ease-in-out;
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

.shadow-sm {
  box-shadow: 0 0.3125rem 0.625rem 0 #80008036 !important;
}

/* Estilo da mensagem motivacional com efeito de digitação */
.mensagem-motivacional {

  color: #856404;
  font-style: italic;
  font-size: 1rem;
  margin-bottom: 5px;
  overflow: hidden;
  /* Esconde o texto até ser mostrado */
  white-space: nowrap;
  /* Impede quebra de linha */
  border-right: 3px solid #856404;
  /* Simula o cursor de digitação */
  width: 0;
  /* Inicializa o tamanho do texto como 0 */
  animation: typing 6s steps(60) 1s forwards, blink 0.75s step-end infinite;
  /* Animação de digitação */
}

/* Animação de digitação horizontal (para desktop) */
@keyframes typing {
  from {
    width: 0;
  }

  to {
    width: 100%;
  }
}

/* Animação de piscada do cursor */
@keyframes blink {
  50% {
    border-color: transparent;
  }
}

/* Ajustes para telas menores (dispositivos móveis) */
@media (max-width: 768px) {
  .mensagem-motivacional {
    font-size: 0.9rem;
    /* Reduz o tamanho da fonte para dispositivos móveis */
    width: auto;
    /* Ajusta a largura automaticamente */
    white-space: normal;
    /* Permite que o texto quebre em várias linhas */
    word-wrap: break-word;
    /* Permite quebra de linha */
    max-width: 90%;
    /* Limita a largura para não ocupar toda a tela */
    margin: 0 auto;
    /* Centraliza o texto */
    height: 0;
    /* Inicializa altura como 0 */
    animation: typingVertical 4s steps(60) 1s forwards, blink 0.75s step-end infinite;
    /* Animação de digitação vertical */
  }
}

/* Efeito de digitação vertical (para dispositivos móveis) */
@keyframes typingVertical {
  from {
    height: 0;
  }

  to {
    height: 100%;
  }
}

/* Ajustes para telas muito pequenas (smartphones com menos de 480px) */
@media (max-width: 480px) {
  .mensagem-motivacional {
    font-size: 0.8rem;
    /* Ajuste adicional para telas muito pequenas */
  }
}


/* Classe de animação de zoom in e zoom out */
.btn-zoom {
  animation: zoomInOut 1.5s ease-in-out infinite;
  /* Efeito de zoom contínuo */
}

/* Animação de zoom in e zoom out */
@keyframes zoomInOut {
  0% {
    transform: scale(1);
    /* Tamanho original */
  }

  50% {
    transform: scale(1.1);
    /* Aumenta o botão em 10% */
  }

  100% {
    transform: scale(1);
    /* Retorna ao tamanho original */
  }
}



.borda-destacadanome {
  border: 2px solid #66bb6a;
  border-radius: 5px;
  padding: 10px;
  outline: none;
}

.borda-destacada {
  border: 1px solid #66bb6a;
  border-radius: 5px;
  padding: 10px;
  outline: none;
}

.borda-destacada:focus {
  border-color: #800080;
  /* Roxo */
  box-shadow: 0 0 0 0.2rem rgba(102, 16, 242, 0.25);
}
</style>
