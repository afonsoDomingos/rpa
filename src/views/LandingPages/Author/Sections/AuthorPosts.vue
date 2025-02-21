<script setup>
// example components
import TransparentBlogCard from "../../../../examples/cards/blogCards/TransparentBlogCard.vue";
import BackgroundBlogCard from "../../../../examples/cards/blogCards/BackgroundBlogCard.vue";

//Vue Material Kit 2 components
import post1 from "@/assets/img/examples/testimonial-6-2.jpg";
import post2 from "@/assets/img/examples/testimonial-6-3.jpg";
import post3 from "@/assets/img/examples/blog-9-4.jpg";
import post4 from "@/assets/img/examples/blog2.jpg";
</script>
<template>
  <section class="py-3">
    <div class="container">
      <div class="row">
        <div class="col-lg-6">
          <h3 class="mb-5">Confira as últimas postagens</h3>
        </div>
      </div>
      <div class="row">
        <div class="col-lg-3 col-sm-6">
          <TransparentBlogCard
            :image="post1"
            title="Ganhe um Extra"
            description="Já encontrou um documento perdido e não soube o que fazer? Agora, com o Recupera Aqui, você pode não apenas ajudar alguém a recuperar um documento importante, mas também ganhar um extra por isso!

Nosso sistema facilita a entrega de documentos perdidos e recompensa aqueles que colaboram. Basta enviar o documento para nossa plataforma, e assim que o dono recuperá-lo, você recebe uma bonificação."
          />
        </div>
        <div class="col-lg-3 col-sm-6">
          <TransparentBlogCard
            :image="post2"
            title="O que é o Recupera Aqui?"
            description="O Recupera Aqui é uma plataforma inovadora criada para facilitar a recuperação de documentos perdidos de forma rápida e segura. Nosso sistema conecta pessoas que perderam seus documentos com aquelas que os encontraram, agilizando o processo de devolução sem burocracia."
          />
        </div>
        <div class="col-lg-3 col-sm-6">
          <TransparentBlogCard
            :image="post3"
            title="Perdeu su documento, Procura aqui!"
            description="Perder um documento pode ser um grande transtorno, mas agora ficou muito mais fácil encontrá-lo! Com o Recupera Aqui, você pode procurar seu documento perdido de forma simples e segura.

Nosso sistema reúne documentos encontrados por pessoas em diferentes locais e facilita a conexão entre quem perdeu e quem achou. Basta acessar nossa plataforma, buscar pelo seu nome e verificar se o seu documento já foi registrado."
          />
        </div>
        <div class="col-lg-3 col-md-12 col-12">
          <BackgroundBlogCard
            :image="post4"
            title="Recuperar um documento nunca foi facil"
            description="buscar seu documento perdido em poucos cliques."
          />
        </div>
      </div>
    </div>
  </section>
</template>
