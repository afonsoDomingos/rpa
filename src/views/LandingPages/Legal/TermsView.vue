<script setup>
import { onMounted } from "vue";
import NavbarDefault from "@/examples/navbars/NavbarDefault.vue";
import FooterDefault from "@/examples/footers/FooterDefault.vue";

onMounted(() => {
  window.scrollTo(0, 0);
});
</script>

<template>
  <div class="container-fluid position-sticky z-index-sticky top-0 px-0">
    <div class="row gx-0">
      <div class="col-12">
        <NavbarDefault :sticky="true" />
      </div>
    </div>
  </div>

  <header class="bg-gradient-purple pt-8 pb-6 text-white text-center">
    <div class="container">
      <h1 class="display-4 font-weight-bold mb-3">Termos e Condições</h1>
      <p class="opacity-8 lead">Última atualização: Janeiro de 2026</p>
    </div>
  </header>

  <main class="py-7 bg-light">
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-lg-10 bg-white shadow-xl border-radius-xl p-5 p-md-7">
          <section class="mb-5 text-dark">
            <h3 class="text-purple mb-4">1. Aceitação dos Termos</h3>
            <p>Ao aceder e utilizar a plataforma <strong>Recupera Aqui (RPA Moçambique)</strong>, o utilizador concorda em cumprir e vincular-se aos presentes Termos e Condições. Se não concordar com qualquer parte destes termos, não deve utilizar o nosso site ou serviços.</p>
          </section>

          <section class="mb-5 text-dark">
            <h3 class="text-purple mb-4">2. Natureza do Serviço</h3>
            <p>A RPA Moçambique funciona como um intermediário digital para ajudar cidadãos moçambicanos a encontrar documentos perdidos. Nós:</p>
            <ul>
              <li><strong>Não garantimos</strong> a recuperação de qualquer documento.</li>
              <li><strong>Não somos responsáveis</strong> pela veracidade das informações introduzidas por terceiros (Achadores).</li>
              <li>Apenas facilitamos a ponte entre ambas as partes após validação de segurança.</li>
            </ul>
          </section>

          <section class="mb-5 text-dark">
            <h3 class="text-purple mb-4">3. Responsabilidades do Utilizador</h3>
            <p>O utilizador compromete-se a:</p>
            <ul>
              <li>Fornecer informações verdadeiras e atualizadas.</li>
              <li>Não utilizar a plataforma para fins fraudulentos ou ilegais.</li>
              <li>Não tentar extorquir outros utilizadores. Qualquer tentativa de chantagem ou extorsão será reportada às autoridades competentes (SERNIC).</li>
              <li>Manter a confidencialidade dos seus dados de acesso.</li>
            </ul>
          </section>

          <section class="mb-5 text-dark">
            <h3 class="text-purple mb-4">4. Subscrições e Pagamentos</h3>
            <p>Alguns serviços da plataforma requerem o pagamento de uma subscrição (Mensal, Semestral ou Anual). O acesso às funcionalidades premium é libertado após a confirmação do pagamento via M-Pesa ou Emola. Não efetuamos reembolsos após o acesso aos dados solicitados ter sido concedido.</p>
          </section>

          <section class="mb-5 text-dark">
            <h3 class="text-purple mb-4">5. Propriedade Intelectual</h3>
            <p>Todo o conteúdo presente no site (textos, logotipos, ícones, imagens e software) é propriedade da RPA Moçambique ou dos seus licenciadores e está protegido por leis de direitos de autor.</p>
          </section>

          <section class="mb-5 text-dark">
            <h3 class="text-purple mb-4">6. Limitação de Responsabilidade</h3>
            <p>Em nenhum caso a Recupera Aqui será responsável por danos indiretos, acidentais ou consequentes resultantes do uso ou da incapacidade de uso dos serviços da plataforma.</p>
          </section>

          <section class="mb-5 text-dark">
            <h3 class="text-purple mb-4">7. Lei Aplicável</h3>
            <p>Estes termos são regidos e interpretados de acordo com as leis da República de Moçambique. Qualquer disputa será resolvida nos tribunais competentes da Cidade de Maputo.</p>
          </section>

          <section class="text-dark">
            <h3 class="text-purple mb-4">8. Alterações aos Termos</h3>
            <p>Reservamo-nos o direito de modificar estes termos a qualquer momento. As alterações entram em vigor imediatamente após a sua publicação no site.</p>
          </section>
        </div>
      </div>
    </div>
  </main>

  <FooterDefault />
</template>

<style scoped>
.text-purple {
  color: #800080 !important;
}
.bg-gradient-purple {
  background: linear-gradient(135deg, #4b0082 0%, #800080 100%);
}
ul li {
  margin-bottom: 0.8rem;
  color: #333;
}
p {
  line-height: 1.6;
  color: #333;
}
</style>
