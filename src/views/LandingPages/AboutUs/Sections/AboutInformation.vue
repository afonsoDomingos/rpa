<script setup>
// example components
import DefaultInfoCard from "../../../../examples/cards/infoCards/DefaultInfoCard.vue";
import CenteredBlogCard from "../../../../examples/cards/blogCards/CenteredBlogCard.vue";
import rPaImage from '@/assets/img/rPa.png';
</script>
<template>
  <section class="py-7">
    <div class="container">
      <div class="row align-items-center">
        <div class="col-lg-6">
          <div class="row justify-content-start">
            <DefaultInfoCard color="info" icon="public" title="O que é o Rpa ?"
              description="Rpa é uma  plataforma dedicada à recuperação rápida e segura de documentos perdidos." />
            <DefaultInfoCard color="info" icon="payments" title="Missão"
              description="Oferecer um serviço rápido, seguro e eficiente." />
          </div>
          <div class="row justify-content-start mt-4">
            <DefaultInfoCard color="info" icon="apps" title="Visão"
              description="Ser a plataforma líder em Moçambique na recuperação de documentos perdidos." />
            <DefaultInfoCard color="info" icon="3p" title="Valores" description="Confiança - Rapidez - Segurança." />
          </div>
        </div>
        <div class="col-lg-4 ms-auto mt-lg-0 mt-6">
          <CenteredBlogCard :image="rPaImage" title="Porquê usar a Rpa1?"
            description="Facilita a recuperação de seus documentos essenciais de forma rápida, segura e simples. Seja Bilhete de Identidade, Passaporte ou Cartão de Eleitor, a plataforma oferece um processo ágil e eficiente, garantindo segurança e confiança."
            :action="{
              color: 'btn-success',
              label: 'Ver no YouTube',
              route: 'https://www.youtube.com/@recuperaqui'
            }" />
        </div>
      </div>
    </div>
  </section>
</template>
