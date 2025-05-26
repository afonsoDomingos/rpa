<script setup>
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import axios from 'axios';

// Exemplo de componentes
import NavbarDefault from "../../../examples/navbars/NavbarDefault.vue";
import FooterDefault from "../../../examples/footers/FooterDefault.vue";

// Componentes do Vue Material Kit 2
import MaterialInput from "@/components/MaterialInput.vue";
import MaterialSwitch from "@/components/MaterialSwitch.vue";
import MaterialButton from "@/components/MaterialButton.vue";

// Função para inicializar o MaterialInput
import setMaterialInput from "@/assets/js/material-input";

// Dados reativos
const emailOrUsername = ref('');
const password = ref('');
const newEmail = ref('');
const newUsername = ref('');
const newPassword = ref('');
const confirmPassword = ref('');


const router = useRouter();


// Função para definir a classe do body
function setBodyClass(className) {
  document.body.className = className;
}

// Função de login
const login = async () => {
  const input = emailOrUsername.value.trim().toLowerCase();
  const pass = password.value.trim();

  try {
    const response = await axios.post('https://apirpa.onrender.com/api/auth/login', {
      email: input,
      senha: pass
    });

    const { token, redirectUrl } = response.data;

    // Armazenando o email e o token no localStorage
    localStorage.setItem('email', input)
    // localStorage.setItem('authToken', token) // se quiser armazenar o token também

    // Redireciona para a URL específica de acordo com o papel
    router.push(redirectUrl);
  } catch (error) {
    console.error('Erro no login', error);
    alert('Credenciais inválidas. Tente novamente.');
  }
};



// Função de registro
const register = async () => {
  if (newPassword.value !== confirmPassword.value) {
    alert('As senhas não coincidem!');
    return;
  }

  try {
    const response = await axios.post('https://apirpa.onrender.com/api/auth/register', {
      nome: newUsername.value,
      email: newEmail.value,
      senha: newPassword.value
    });

    alert('Cadastro realizado com sucesso!');
    router.push('/');  // Redireciona para a página de login após o cadastro

    // Limpa os campos após o registro
    newEmail.value = '';
    newUsername.value = '';
    newPassword.value = '';
    confirmPassword.value = '';

  } catch (error) {
    console.error('Erro no cadastro', error);
    alert('Erro ao registrar. Tente novamente.');
  }
};

</script>


<template>
  <NavbarDefault :sticky="true" />

  <div class="card card-body blur shadow-blur mx-3 mx-md-4 mt-n6">

    <div class="container page-header container">
      <div class="content first-content">
        <div class="first-column">
          <h2 class="title title-primary">bem-vindo de volta!</h2>
          <p class="description description-primary">Para continuar conectado conosco</p>
          <p class="description description-primary">faça login com suas informações pessoais</p>
          <button @click="setBodyClass('sign-in-js')" class="btn btn-primary">entrar</button>
        </div>
        <div class="second-column">
          <!--<h2 class="title title-second">criar uma conta</h2>-->
          <div class="card-header p-0 position-relative mt-n4 mx-3 z-index-2">
            <div class="bg-gradient-success shadow-success border-radius-lg py-3 pe-1">
              <h4 class="text-white font-weight-bolder text-center mt-2 mb-0">
                Criar uma conta
              </h4>
              <div class="row mt-3">
                <div class="col-2 text-center ms-auto">
                  <a class="btn btn-link px-3" href="javascript:;">
                    <i class="fa fa-facebook text-white text-lg"></i>
                  </a>
                </div>
                <div class="col-2 text-center px-1">
                  <a class="btn btn-link px-3" href="javascript:;">
                    <i class="fa fa-github text-white text-lg"></i>
                  </a>
                </div>
                <div class="col-2 text-center me-auto">
                  <a class="btn btn-link px-3" href="javascript:;">
                    <i class="fa fa-google text-white text-lg"></i>
                  </a>
                </div>
              </div>
            </div>
          </div>
          <div class="social-media">
            <ul class="list-social-media">
              <li class="item-social-media"><i class="fab fa-facebook-f"></i></li>
              <li class="item-social-media"><i class="fab fa-google-plus-g"></i></li>
              <li class="item-social-media"><i class="fab fa-linkedin-in"></i></li>
            </ul>
          </div>
          <p class="description description-second">Insira seus dados ou use seu e-mail para se registrar::</p>
          <form @submit.prevent="register" class="form">
            <label class="label-input">
              <i class="far fa-user icon-modify"></i>
              <input v-model="newUsername" type="text" placeholder="Nome" />
            </label>

            <label class="label-input">
              <i class="far fa-envelope icon-modify"></i>
              <input v-model="newEmail" type="text" placeholder="E-mail" />
            </label>

            <label class="label-input">
              <i class="fas fa-lock icon-modify"></i>
              <input v-model="newPassword" type="password" placeholder="Senha" />
            </label>

            <!-- Novo campo: Confirmar Senha -->
            <label class="label-input">
              <i class="fas fa-lock icon-modify"></i>
              <input v-model="confirmPassword" type="password" placeholder="Confirmar Senha" />
            </label>

            <div class="text-center">
              <MaterialButton type="submit" class="my-4 mb-2" variant="gradient" color="success" fullWidth>
                Registar
              </MaterialButton>
            </div>

            <p class="mt-4 text-sm text-center">
              Já possui uma conta?
              <a href="#" class="text-success text-gradient font-weight-bold">Acesse agora.</a>
            </p>
          </form>
        </div>
      </div>

      <div class="content second-content">
        <div class="first-column">
          <h2 class="title title-primary">olá, amigo!</h2>
          <p class="description description-primary">Insira seus dados pessoais</p>
          <p class="description description-primary">e comece a jornada conosco</p>
          <button @click="setBodyClass('sign-up-js')" class="btn btn-primary">registrar</button>
        </div>
        <div class="second-column">


         

          <!--<h2 class="title title-second">faça login</h2>-->
          <div class="card-header p-0 position-relative mt-n4 mx-3 z-index-2">
            <div class="bg-gradient-success shadow-success border-radius-lg py-3 pe-1">
              <h4 class="text-white font-weight-bolder text-center mt-2 mb-0">
                 Faça Login
              </h4>
              <div class="row mt-3">
                <div class="col-2 text-center ms-auto">
                  <a class="btn btn-link px-3" href="javascript:;">
                    <i class="fa fa-facebook text-white text-lg"></i>
                  </a>
                </div>
                <div class="col-2 text-center px-1">
                  <a class="btn btn-link px-3" href="javascript:;">
                    <i class="fa fa-github text-white text-lg"></i>
                  </a>
                </div>
                <div class="col-2 text-center me-auto">
                  <a class="btn btn-link px-3" href="javascript:;">
                    <i class="fa fa-google text-white text-lg"></i>
                  </a>
                </div>
              </div>
            </div>
          </div>
          <div class="social-media">
            <ul class="list-social-media">
              <li class="item-social-media"><i class="fab fa-facebook-f"></i></li>
              <li class="item-social-media"><i class="fab fa-google-plus-g"></i></li>
              <li class="item-social-media"><i class="fab fa-linkedin-in"></i></li>
            </ul>
          </div>
          <p class="description description-second">Insira seus dados ou use sua conta de e-mail para entrar:</p>

          <form @submit.prevent="login" class="form">
            <label class="label-input"><i class="far fa-user icon-modify label-input input-group-outline mb-3"></i>
              <input v-model="emailOrUsername" id="emailOrUsername"
                :label="{ text: 'E-mail ou Nome de Usuário', class: 'form-label' }" type="email" required />

            </label>


            <label class="label-input"><i class="far fa-envelope icon-modify label-input input-group-outline mb-3"></i>
              <input v-model="password" id="password" :label="{ text: 'Password', class: 'form-label' }" type="password"
                required />

            </label>


            <MaterialSwitch  class="d-flex align-items-center mb-3" id="rememberMe"
              labelClass="mb-0 ms-3">
              Lembre de mim
            </MaterialSwitch>

            <div class="text-center">
              <MaterialButton type="submit" class="my-4 mb-2" variant="gradient" color="success" fullWidth>
                Entrar
              </MaterialButton>
            </div>

            <p class="mt-4 text-sm text-center">
              Ainda não possui uma conta?
              <a href="#" class="text-success text-gradient font-weight-bold">
                Crie agora.
              </a>
            </p>
          </form>
        </div>
      </div>

    </div>
  </div>
  <FooterDefault></FooterDefault>


</template>

<style scoped>
@import url('https://use.fontawesome.com/releases/v5.8.2/css/all.css');
@import url('https://fonts.googleapis.com/css?family=Open+Sans:300,400,700&display=swap');


* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Open Sans', sans-serif;
}

.container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #ffffff;
  margin-top: 10%;
}

.content {
  background-color: #fff8ff;
  border-radius: 15px;
  width: 960px;
  height: 50%;
  justify-content: space-between;
  align-items: center;
  position: relative;
}

.content::before {
  content: "";
  position: absolute;

  background-color: #800080;
  width: 40%;
  height: 100%;
  border-top-left-radius: 15px;
  border-bottom-left-radius: 15px;


  left: 0;
}

.title {
  font-size: 28px;
  font-weight: bold;
  text-transform: capitalize;
}

.title-primary {
  color: #fff;
}

.title-second {
  color: #800080;
}

.description {
  font-size: 14px;
  font-weight: 300;
  line-height: 30px;
}

.description-primary {
  color: #fff;
}

.description-second {
  color: #800080;
}

.btn {
  border-radius: 15px;
  text-transform: uppercase;
  color: #fff;
  font-size: 10px;
  padding: 10px 50px;
  cursor: pointer;
  font-weight: bold;
  width: 150px;
  align-self: center;
  border: none;
  margin-top: 1rem;
}

.btn-primary {
  background-color: transparent;
  border: 1px solid #fff;
  transition: background-color .5s;
}

.btn-primary:hover {
  background-color: #fff;
  color: #800080;
}

.btn-second {
  background-color: #800080;
  border: 1px solid #800080;
  transition: background-color .5s;
}

.btn-second:hover {
  background-color: #fff;
  border: 1px solid #800080;
  color: #800080;
}

.first-content {
  display: flex;
}

.first-content .second-column {
  z-index: 11;
}

.first-column {
  text-align: center;
  width: 40%;
  z-index: 10;
}

.second-column {
  width: 60%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.social-media {
  margin: 1rem 0;
}

.link-social-media:not(:first-child) {
  margin-left: 10px;
}

.link-social-media .item-social-media {
  transition: background-color .5s;
}

.link-social-media:hover .item-social-media {
  background-color: #800080;
  color: #fff;
  border-color: #800080;
}

.list-social-media {
  display: flex;
  list-style-type: none;
}

.item-social-media {
  border: 1px solid #bdc3c7;
  border-radius: 50%;
  width: 35px;
  height: 35px;
  line-height: 35px;
  text-align: center;
  color: #28a745;
}

.form {
  display: flex;
  flex-direction: column;
  width: 55%;
}

.form input {
  height: 45px;
  width: 100%;
  border: none;
  background-color: #ecf0f1;
}

input:-webkit-autofill {
  -webkit-box-shadow: 0 0 0px 1000px #ecf0f1 inset !important;
  -webkit-text-fill-color: #000 !important;
}

.label-input {
  background-color: #ecf0f1;
  display: flex;
  align-items: center;
  margin: 8px;
}

.icon-modify {
  color: #800080;
  padding: 0 5px;
}

/* second content*/

.second-content {
  position: absolute;
  display: flex;
}

.second-content .first-column {
  order: 2;
  z-index: -1;
}

.second-content .second-column {
  order: 1;
  z-index: -1;
}

.password {
  color: #34495e;
  font-size: 14px;
  margin: 15px 0;
  text-align: center;
}

.password::first-letter {
  text-transform: capitalize;
}



.sign-in-js .first-content .first-column {
  z-index: -1;
}

.sign-in-js .second-content .second-column {
  z-index: 11;
}

.sign-in-js .second-content .first-column {
  z-index: 13;
}

.sign-in-js .content::before {
  left: 60%;
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
  border-top-right-radius: 15px;
  border-bottom-right-radius: 15px;
  animation: slidein 1.3s;
  /*MODIFIQUEI DE 3s PARA 1.3s*/

  z-index: 12;
}

.sign-up-js .content::before {
  animation: slideout 1.3s;
  /*MODIFIQUEI DE 3s PARA 1.3s*/

  z-index: 12;
}

.sign-up-js .second-content .first-column,
.sign-up-js .second-content .second-column {
  z-index: -1;
}

.sign-up-js .first-content .second-column {
  z-index: 11;
}

.sign-up-js .first-content .first-column {
  z-index: 13;
}


/* DESLOCAMENTO CONTEÚDO ATRÁS DO CONTENT:BEFORE*/
.sign-in-js .first-content .second-column {

  z-index: -1;
  position: relative;
  animation: deslocamentoEsq 1.3s;
  /*MODIFIQUEI DE 3s PARA 1.3s*/
}

.sign-up-js .second-content .second-column {
  position: relative;
  z-index: -1;
  animation: deslocamentoDir 1.3s;
  /*MODIFIQUEI DE 3s PARA 1.3s*/
}

/*ANIMAÇÃOO CSS PARA O CONTEÚDO*/

@keyframes deslocamentoEsq {

  from {
    left: 0;
    opacity: 1;
    z-index: 12;
  }

  25% {
    left: -80px;
    opacity: .5;

    /* z-index: 12; NÃO HÁ NECESSIDADE */
  }

  50% {
    left: -100px;
    opacity: .2;
    /* z-index: 12; NÃO HÁ NECESSIDADE */
  }

  to {
    left: -110px;
    opacity: 0;
    z-index: -1;
  }
}


@keyframes deslocamentoDir {

  from {
    left: 0;
    z-index: 12;
  }

  25% {
    left: 80px;
    /* z-index: 12;  NÃO HÁ NECESSIDADE*/
  }

  50% {
    left: 100px;
    /* z-index: 12; NÃO HÁ NECESSIDADE*/
    /* background-color: yellow;  Exemplo que dei no vídeo*/
  }

  to {
    left: 110px;
    z-index: -1;
  }
}


/*ANIMAÇÃO CSS*/

@keyframes slidein {

  from {
    left: 0;
    width: 40%;
  }

  25% {
    left: 5%;
    width: 50%;
  }

  50% {
    left: 25%;
    width: 60%;
  }

  75% {
    left: 45%;
    width: 50%;
  }

  to {
    left: 60%;
    width: 40%;
  }
}

@keyframes slideout {

  from {
    left: 60%;
    width: 40%;
  }

  25% {
    left: 45%;
    width: 50%;
  }

  50% {
    left: 25%;
    width: 60%;
  }

  75% {
    left: 5%;
    width: 50%;
  }

  to {
    left: 0;
    width: 40%;
  }
}





/*VERSÃO MOBILE*/
@media screen and (max-width: 1040px) {
  .content {
    width: 100%;
    height: 100%;
  }

  .content::before {
    width: 100%;
    height: 40%;
    top: 0;
    border-radius: 0;
  }

  .first-content,
  .second-content {
    flex-direction: column;
    justify-content: space-around;
  }

  .first-column,
  .second-column {
    width: 100%;
  }

  .sign-in-js .content::before {
    top: 60%;
    left: 0;
    border-radius: 0;

  }

  .form {
    width: 90%;
  }

  /* ANIMAÇÃO MOBILE CSS*/

  @keyframes deslocamentoEsq {

    from {
      top: 0;
      opacity: 1;
      z-index: 12;
    }

    25% {
      top: -80px;
      opacity: .5;
      /* z-index: 12; NÃO HÁ NECESSIDADE */
    }

    50% {
      top: -100px;
      opacity: .2;
      /* z-index: 12; NÃO HÁ NECESSIDADE */
    }

    to {
      top: -110px;
      opacity: 0;
      z-index: -1;
    }
  }


  @keyframes deslocamentoDir {

    from {
      top: 0;
      z-index: 12;
    }

    25% {
      top: 80px;
      /* z-index: 12;  NÃO HÁ NECESSIDADE*/
    }

    50% {
      top: 100px;
      /* z-index: 12; NÃO HÁ NECESSIDADE*/
      /* background-color: yellow;  Exemplo que dei no vídeo*/
    }

    to {
      top: 110px;
      z-index: -1;
    }
  }



  @keyframes slidein {

    from {
      top: 0;
      height: 40%;
    }

    25% {
      top: 5%;
      height: 50%;
    }

    50% {
      top: 25%;
      height: 60%;
    }

    75% {
      top: 45%;
      height: 50%;
    }

    to {
      top: 60%;
      height: 40%;
    }
  }

  @keyframes slideout {

    from {
      top: 60%;
      height: 40%;
    }

    25% {
      top: 45%;
      height: 50%;
    }

    50% {
      top: 25%;
      height: 60%;
    }

    75% {
      top: 5%;
      height: 50%;
    }

    to {
      top: 0;
      height: 40%;
    }
  }

}

@media screen and (max-width: 740px) {
  .form {
    width: 50%;
  }
}

@media screen and (max-width: 425px) {
  .form {
    width: 100%;
  }
}
</style>
