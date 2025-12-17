<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import RotatingCard from "../../../examples/cards/rotatingCards/RotatingCard.vue";
import RotatingCardFront from "../../../examples/cards/rotatingCards/RotatingCardFront.vue";
import RotatingCardBack from "../../../examples/cards/rotatingCards/RotatingCardBack.vue";
import DefaultInfoCard from "../../../examples/cards/infoCards/DefaultInfoCard.vue";

const sectionRef = ref(null);
const isVisible = ref(false);

let observer = null;

onMounted(() => {
  observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        isVisible.value = true;
        observer.disconnect(); // Animate only once
      }
    },
    { threshold: 0.2 }
  );

  if (sectionRef.value) {
    observer.observe(sectionRef.value);
  }
});

onUnmounted(() => {
  if (observer) observer.disconnect();
});
</script>
<template>
  <section
    ref="sectionRef"
    class="my-5 py-5 transition-section"
    :class="{ 'fade-up-visible': isVisible }"
  >
    <div class="container">
      <div class="row align-items-center">
        <!-- Content remains same -->
        <div class="col-lg-4 ms-auto me-auto p-lg-4 mt-lg-0 mt-4">
          <RotatingCard>
            <RotatingCardFront
              image=""
              icon="touch_app"
              title="Recupera <br /> Aqui"
              description="Perdeu um documento? Registre a perda, deixe nossa equipe analisar, busque nos órgãos competentes e receba seu documento recuperado diretamente. Simples e eficiente."
            />

            <RotatingCardBack
              image=""
              title="Recupera Aqui"
              description="Nossa plataforma cuida de tudo: basta registrar a perda, e nossa equipe encontra e entrega seu documento de volta, de maneira rápida e sem complicação."
              :action="[
                {
                  route:
                    'https://docs.google.com/forms/d/e/1FAIpQLSdLO0mga6ygr6oVlCHQ6Hgt48baiZuQlXTzPRYynhXv0etD3g/viewform',
                  label: 'Reportar',
                },
              ]"
            />
          </RotatingCard>
        </div>
        <div class="col-lg-6 ms-auto">
          <div class="row justify-content-start">
            <DefaultInfoCard
              class="info-card-hover"
              icon="content_paste"
              title="Cadastro de Documento"
              description="Registre o documento perdido e forneça os detalhes necessários para iniciar a busca."
            />
            <DefaultInfoCard
              class="info-card-hover"
              icon="query_stats"
              title="Análise do Caso"
              description="Nossa equipe avalia sua solicitação para determinar o melhor caminho de recuperação."
            />
          </div>
          <div class="row justify-content-start mt-4">
            <DefaultInfoCard
              class="mt-3 info-card-hover"
              icon="travel_explore"
              title="Busca e Verificação"
              description="Iniciamos a pesquisa para localizar seu documento com eficiência."
            />
            <DefaultInfoCard
              class="mt-3 info-card-hover"
              icon="volunteer_activism"
              title="Recuperação e Entrega"
              description="Assim que encontrado, o documento é recuperado e entregue a si."
            />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.transition-section {
  opacity: 0;
  transform: translateY(60px);
  transition: opacity 1s ease-out, transform 1s ease-out;
}

.fade-up-visible {
  opacity: 1;
  transform: translateY(0);
}

.info-card-hover {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  padding: 10px;
  border-radius: 10px;
}

.info-card-hover:hover {
  transform: translateY(-8px);
  background-color: #ffffff;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.05);
  cursor: default;
}
</style>
