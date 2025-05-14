<script setup>
// example component
import HorizontalTeamCard from "@/examples/cards/teamCards/HorizontalTeamCard.vue";

// images
import emma from "@/assets/img/team-5.jpg";
import william from "@/assets/img/bruce-mars.jpg";
import ivana from "@/assets/img/ivana-squares.jpg";
import marquez from "@/assets/img/ivana-square.jpg";
</script>

<template>
  <section class="pb-5 position-relative bg-gradient-dark mx-n3">
    <div class="container">
      <div class="row">
        <div class="col-md-8 text-start mb-5 mt-5">
          <h3 class="text-white z-index-1 position-relative">
            A Equipe Executiva
          </h3>
          <p class="text-white opacity-8 mb-0">
            Não há nada que eu realmente quisesse fazer na vida que não fosse capaz
            fique bom em. Essa é minha habilidade.
          </p>
        </div>
      </div>
      <div class="row">
        <div class="col-lg-6 col-12">
          <HorizontalTeamCard
            class="mt-lg-4 mt-5"
            :image="william"
            :profile="{ name: 'Vibe', link: 'javascript:;' }"
            :position="{ label: 'CEO', color: 'success' }"
            description="Líder estratégico da empresa, responsável por definir a visão, missão e direção do negócio. Supervisiona todas as operações."
          />
        </div>
        
        <div class="col-lg-6 col-12">
          <HorizontalTeamCard
            class="mt-4"
            :image="william"
            :profile="{ name: 'Nome', link: 'javascript:;' }"
            :position="{ label: 'Contabilista', color: 'success' }"
            description="Responsável pela gestão financeira da empresa, assegurando que todas as transações sejam registradas com precisão"
          />
        </div>

      </div>
      <div class="row mt-4">
        <div class="col-lg-6 col-12">
          <HorizontalTeamCard
            class="mt-4 z-index-2"
            :image="william"
            :profile="{ name: 'Nome', link: 'javascript:;' }"
            :position="{ label: 'Gestor de Marketing', color: 'success' }"
            description=" – Responsável pelo desenvolvimento e execução de estratégias de marketing para fortalecer a marca, atrair clientes e impulsionar as vendas."
          />
        </div>
        <div class="col-lg-6 col-12">
          <HorizontalTeamCard
            class="mt-lg-4 mt-5 z-index-2"
            :image="william"
            :profile="{ name: 'Nome', link: 'javascript:;' }"
            :position="{ label: 'Técnico Informático', color: 'success' }"
            description="Responsável pela manutenção, segurança e otimização dos sistemas tecnológicos da empresa."
          />
        </div>
      </div>
    </div>
  </section>
</template>
