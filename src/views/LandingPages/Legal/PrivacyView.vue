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

  <header class="bg-gradient-dark pt-8 pb-6">
    <div class="container">
      <div class="row justify-content-center text-center">
        <div class="col-lg-8">
          <h1 class="text-white display-4 font-weight-bold mb-3">Política de Privacidade</h1>
          <p class="text-white opacity-8 lead">Última atualização: Janeiro de 2026</p>
        </div>
      </div>
    </div>
  </header>

  <main class="py-7 bg-gray-100">
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-lg-10 shadow-xl border-radius-xl bg-white p-5 p-md-7">
          <section class="mb-5">
            <h3 class="text-purple mb-4">1. Introdução</h3>
            <p>A <strong>Recupera Aqui (RPA Moçambique)</strong> valoriza a sua privacidade. Esta Política de Privacidade descreve como recolhemos, utilizamos e protegemos as suas informações pessoais ao utilizar a nossa plataforma para recuperação de documentos e registo de achados em Moçambique.</p>
          </section>

          <section class="mb-5">
            <h3 class="text-purple mb-4">2. Informações que Recolhemos</h3>
            <p>Para o funcionamento da plataforma, podemos solicitar os seguintes dados:</p>
            <ul>
              <li><strong>Identificação:</strong> Nome completo, data de nascimento e filiação.</li>
              <li><strong>Contactos:</strong> Número de telefone (M-Pesa/Emola) e endereço de e-mail.</li>
              <li><strong>Dados de Documentos:</strong> Número do BI, NUIT, Passaporte ou Carta de Condução (essenciais para validação cruzada).</li>
              <li><strong>Localização:</strong> Dados sobre onde o documento foi perdido ou encontrado.</li>
            </ul>
          </section>

          <section class="mb-5">
            <h3 class="text-purple mb-4">3. Finalidade do Uso de Dados</h3>
            <p>Utilizamos os seus dados estritamente para:</p>
            <ul>
              <li>Facilitar o encontro entre proprietários e achadores de documentos.</li>
              <li>Validar a autenticidade dos pedidos de recuperação.</li>
              <li>Processar pagamentos de subscrições e serviços premium.</li>
              <li>Prevenir fraudes e usos indevidos da plataforma.</li>
            </ul>
          </section>

          <section class="mb-5">
            <h3 class="text-purple mb-4">4. Cookies e Tecnologias de Publicidade</h3>
            <p>O nosso site utiliza <strong>cookies</strong> para melhorar a experiência do utilizador. Além disso:</p>
            <ul>
              <li>Utilizamos o <strong>Google AdSense</strong> para exibir anúncios. O Google utiliza o cookie DART para exibir anúncios baseados nas suas visitas ao nosso e a outros sites.</li>
              <li>Pode optar por desativar os cookies nas definições do seu navegador, embora isso possa afetar algumas funcionalidades do site.</li>
            </ul>
          </section>

          <section class="mb-5">
            <h3 class="text-purple mb-4">5. Partilha de Informação</h3>
            <p>A Recupera Aqui <strong>não vende</strong> a sua base de dados a terceiros. A informação de contacto de um "Achador" só será revelada ao "Dono" do documento após a validação do sistema e vice-versa, para garantir a segurança de ambas as partes.</p>
          </section>

          <section class="mb-5">
            <h3 class="text-purple mb-4">6. Segurança</h3>
            <p>Implementamos medidas de segurança técnica e organizacional para proteger os seus dados contra acesso não autorizado, alteração ou destruição. No entanto, lembre-se que nenhum método de transmissão pela Internet é 100% seguro.</p>
          </section>

          <section class="mb-5">
            <h3 class="text-purple mb-4">7. Os Seus Direitos</h3>
            <p>Tem o direito de:</p>
            <ul>
              <li>Solicitar o acesso aos seus dados pessoais.</li>
              <li>Corrigir informações incorretas.</li>
              <li>Solicitar a eliminação da sua conta e dados associados.</li>
            </ul>
          </section>

          <section>
            <h3 class="text-purple mb-4">8. Contacto</h3>
            <p>Para qualquer questão sobre esta política, pode contactar-nos através de:</p>
            <p><strong>E-mail:</strong> info@recuperaaqui.co.mz<br>
            <strong>WhatsApp:</strong> +258 84 787 7405</p>
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
.bg-gradient-dark {
  background: linear-gradient(135deg, #1a1a1a 0%, #333333 100%);
}
ul li {
  margin-bottom: 0.8rem;
  color: #444;
}
p {
  line-height: 1.6;
  color: #444;
}
</style>
