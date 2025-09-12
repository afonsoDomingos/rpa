<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import axios from 'axios';

import NavbarDefault from "../../../examples/navbars/NavbarDefault.vue";
import FooterDefault from "../../../examples/footers/FooterDefault.vue";
import MaterialButton from "@/components/MaterialButton.vue";
import MaterialSwitch from "@/components/MaterialSwitch.vue";

const email = ref('');
const nome = ref('');
const password = ref('');
const newEmail = ref('');
const newPassword = ref('');
const confirmPassword = ref('');


// Adicione estes estados para controle de visualização das senhas
const showPassword = ref(false);
const showConfirmPassword = ref(false);
const showLoginPassword = ref(false);


const router = useRouter();

const setBodyClass = (className) => {
  console.log('[setBodyClass] Alterando classe do body para:', className);
  document.body.className = className;
};

const login = async () => {
  const inputEmail = email.value.trim().toLowerCase();
  const senhaLogin = password.value.trim();
  console.log('[login] Tentando login com:', { email: inputEmail });

  if (!inputEmail || !senhaLogin) {
    console.warn('[login] Campos obrigatórios não preenchidos.');
    alert('Por favor, preencha o e-mail e a senha.');
    return;
  }

  try {
    const response = await axios.post('https://apirpa.onrender.com/api/auth/login', {
      email: inputEmail,
      senha: senhaLogin,
    });
    console.log('[login] Login bem-sucedido. Resposta:', response.data);

    localStorage.setItem('email', inputEmail);
    localStorage.setItem('token', response.data.token);

    await router.push(response.data.redirectUrl || '/home');
  } catch (error) {
    console.error('[login] Erro ao logar:', error);
    if (error.response?.status === 400 || error.response?.status === 401) {
      alert(error.response.data.msg || 'Credenciais inválidas. Verifique seu e-mail e senha.');
    } else {
      alert('Erro ao tentar logar. Tente novamente mais tarde.');
    }
  }
};


const register = async () => {
  const nomeUsuario = nome.value.trim();
  const emailUsuario = newEmail.value.trim().toLowerCase();
  const senhaUsuario = newPassword.value.trim();
  const senhaConfirmacao = confirmPassword.value.trim();
  console.log('[register] Tentando registrar:', { nome: nomeUsuario, email: emailUsuario });

  if (!nomeUsuario || !emailUsuario || !senhaUsuario || !senhaConfirmacao) {
    console.warn('[register] Campos obrigatórios não preenchidos.');
    return alert('Por favor, preencha todos os campos!');
  }

  if (senhaUsuario !== senhaConfirmacao) {
    console.warn('[register] Senhas não coincidem.');
    return alert('As senhas não coincidem!');
  }

  try {
    const res = await axios.post('https://apirpa.onrender.com/api/auth/register', {
      nome: nomeUsuario,
      email: emailUsuario,
      senha: senhaUsuario,
      role: 'cliente'
    });
    console.log('[register] Registro bem-sucedido. Resposta:', res.data);

    alert('Cadastro realizado com sucesso!');
    router.push('/');

    // Limpar os campos
    nome.value = '';
    newEmail.value = '';
    newPassword.value = '';
    confirmPassword.value = '';
  } catch (error) {
    console.error('[register] Erro no registro:', error);
    if (error.response?.status === 400) {
      alert(error.response.data.msg || 'Erro: e-mail já cadastrado.');
    } else {
      alert('Erro ao registrar. Tente novamente.');
    }
  }
};

</script>

<template>
  <NavbarDefault :sticky="true" />

  <div class="card card-body blur shadow-blur mx-3 mx-md-4 mt-n6">
    <div class="container page-header container">

      <div class="content first-content">
        <div class="first-column text-center">
          <h2 class="title title-primary">Bem-vindo!</h2>
          <p class="description description-primary">Para continuar conectado conosco</p>
          <p class="description description-primary">faça login com suas informações pessoais</p>
          <button @click="setBodyClass('sign-in-js')" class="btn btn-primary">Entrar</button>
        </div>

        <div class="second-column">
          <div class="card-header p-0 position-relative mt-n4 mx-3 z-index-2">
            <div class="bg-gradient-success shadow-success border-radius-lg py-3 pe-1">
              <h4 class="text-white font-weight-bolder text-center mt-2 mb-0">Criar uma conta</h4>
              <div class="row mt-3 text-center">
                <div class="col-2 ms-auto"><a class="btn btn-link px-3" href="#"><i class="fab fa-facebook text-white text-lg"></i></a></div>
                <div class="col-2 px-1"><a class="btn btn-link px-3" href="#"><i class="fab fa-github text-white text-lg"></i></a></div>
                <div class="col-2 me-auto"><a class="btn btn-link px-3" href="#"><i class="fab fa-google text-white text-lg"></i></a></div>
              </div>
            </div>
          </div>

          <p class="description description-second">Insira seus dados ou use seu e-mail para se registrar:</p>

          <form @submit.prevent="register" class="form">
            <label class="label-input">
              <i class="far fa-user icon-modify"></i>
              <input v-model="nome" type="text" placeholder="Nome" required />
            </label>

            <label class="label-input">
              <i class="far fa-envelope icon-modify"></i>
              <input v-model="newEmail" type="email" placeholder="E-mail" required />
            </label>

            <label class="label-input">
              <i class="fas fa-lock icon-modify"></i>
              <input
                :type="showPassword ? 'text' : 'password'"
                v-model="newPassword"
                placeholder="Senha"
                required
              />
              <span class="toggle-password" @click="showPassword = !showPassword" style="cursor:pointer; margin-left:8px;">
                <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
              </span>
            </label>

            <label class="label-input">
              <i class="fas fa-lock icon-modify"></i>
              <input
                :type="showConfirmPassword ? 'text' : 'password'"
                v-model="confirmPassword"
                placeholder="Confirmar Senha"
                required
              />
              <span class="toggle-password" @click="showConfirmPassword = !showConfirmPassword" style="cursor:pointer; margin-left:8px;">
                <i :class="showConfirmPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
              </span>
            </label>

            <div class="text-center">
              <MaterialButton type="submit" variant="gradient" color="success" fullWidth>
                Registrar
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
        <div class="first-column text-center">
          <h2 class="title title-primary">Olá, amigo!</h2>
          <p class="description description-primary">Insira seus dados</p>
          <p class="description description-primary">e comece a jornada conosco</p>
          <button @click="setBodyClass('sign-up-js')" class="btn btn-primary">Registrar</button>
        </div>

        <div class="second-column">
          <div class="card-header p-0 position-relative mt-n4 mx-3 z-index-2">
            <div class="bg-gradient-success shadow-success border-radius-lg py-3 pe-1">
              <h4 class="text-white font-weight-bolder text-center mt-2 mb-0">Faça Login</h4>
              <div class="row mt-3 text-center">
                <div class="col-2 ms-auto"><a class="btn btn-link px-3" href="#"><i class="fab fa-facebook text-white text-lg"></i></a></div>
                <div class="col-2 px-1"><a class="btn btn-link px-3" href="#"><i class="fab fa-github text-white text-lg"></i></a></div>
                <div class="col-2 me-auto"><a class="btn btn-link px-3" href="#"><i class="fab fa-google text-white text-lg"></i></a></div>
              </div>
            </div>
          </div>

          <p class="description description-second">Insira seu e-mail e senha para entrar:</p>

          <form @submit.prevent="login" class="form">
            <label class="label-input">
              <i class="far fa-envelope icon-modify"></i>
              <input v-model="email" type="email" placeholder="E-mail" required />
            </label>

            <label class="label-input">
              <i class="fas fa-lock icon-modify"></i>
              <input
                :type="showLoginPassword ? 'text' : 'password'"
                v-model="password"
                placeholder="Senha"
                required
              />
              <span class="toggle-password" @click="showLoginPassword = !showLoginPassword" style="cursor:pointer; margin-left:8px;">
                <i :class="showLoginPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
              </span>
            </label>

            <MaterialSwitch class="d-flex align-items-center mb-3" id="rememberMe" labelClass="mb-0 ms-3">
              Lembre de mim
            </MaterialSwitch>

            <div class="text-center">
              <MaterialButton type="submit" variant="gradient" color="success" fullWidth>
                Entrar
              </MaterialButton>
            </div>

            <p class="mt-4 text-sm text-center">
              Ainda não possui uma conta?
              <a href="#" class="text-success text-gradient font-weight-bold">Crie agora.</a>
            </p>
          </form>
        </div>
      </div>
    </div>
  </div>

  <FooterDefault />
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
  min-height: calc(100vh - 100px); /* espaço para navbar/footer */
  background-color: #ffffff;
  padding: 2rem;
  margin-top: 10%;
}



.content {
  background-color: #fff8ff;
  border-radius: 15px;
  width: 960px;
  flex-wrap: wrap;
  min-height: 400px;
  height: auto;
  justify-content: space-between;
  align-items: center;
  position: relative;
}



.content::before {
  content: "";
  position: absolute;

  background-color: #ffffff;
  width: 40%;
  max-width: 400px;
  height: 100%;

  border-top-left-radius: 24px;
  border-bottom-left-radius: 24px;

  box-shadow: 2px 0 12px rgba(0, 0, 0, 0.1);

  transition: all 0.3s ease-in-out;

  left: 0;
  top: 0;
  z-index: 1;
}


.title {
  font-size: 28px;
  font-weight: bold;
  text-transform: capitalize;
}

.title-primary {
  color: #000000;
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
  color: #000000;
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
  background-color: #28a745;
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




/* Responsividade aprimorada para telas pequenas */

@media screen and (max-width: 1024px) {
  .container {
    margin-top: 0;
    padding: 1rem;
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: flex-start;
    margin-top: 50%;
  }

  .content {
    flex-direction: column;
    width: 100%;
    height: auto;
    min-height: 100vh;
    box-shadow: none;
  }

  .content::before {
    display: none; /* Remove o bloco animado lateral para simplificar no mobile */
  }

  .first-content,
  .second-content {
    flex-direction: column;
    width: 100%;
  }

  .first-column,
  .second-column {
    width: 100%;
    padding: 1rem;
  }

  .title,
  .description,
  .password {
    text-align: center;
  }

  .form {
    width: 100%;
    padding: 1rem;
  }

  .btn {
    margin: 1rem auto;
  }

  .list-social-media {
    justify-content: center;
  }
}

@media screen and (max-width: 768px) {
  .form {
    width: 90%;
  }

  .title {
    font-size: 24px;
  }

  .description {
    font-size: 13px;
  }

  .btn {
    font-size: 12px;
    padding: 10px 30px;
  }
}

@media screen and (max-width: 480px) {
  .form {
    width: 100%;
  }

  .item-social-media {
    width: 30px;
    height: 30px;
    line-height: 30px;
    font-size: 14px;
  }

  .btn {
    width: 100%;
  }
}

.toggle-password {
  color: #800080;
  font-size: 18px;
  margin-left: 4px;
  user-select: none;
}
</style>
