<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import DefaultReviewCard from "@/examples/cards/reviewCards/DefaultReviewCard.vue";

const sectionRef = ref(null);
const isVisible = ref(false);
let observer = null;

onMounted(() => {
  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        isVisible.value = entry.isIntersecting;
      });
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
  <section class="py-5 font-poppins" ref="sectionRef">
    <div class="container">
      <div class="row">
        <div class="col-lg-6 mx-auto text-center title-section" :class="{ 'animate-title': isVisible }">
          <h2 class="mb-1 text-dark font-weight-bold">Depoimentos</h2>
          <p class="lead text-muted">
            O impacto real na vida das pessoas.
          </p>
        </div>
      </div>
      <div class="row mt-4 testimonial-row" :class="{ 'animate-in': isVisible }">
        <DefaultReviewCard
          class="testimonial-card card-1"
          name="João Matusse"
          date="1 dia atrás"
          review='"Recuperei meu BI em 24h. Serviço incrível!"'
          :rating="5.0"
        />
        <DefaultReviewCard
          class="testimonial-card card-2 ms-md-auto"
          color="bg-gradient-success"
          name="Ana Cossa"
          date="1 semana atrás"
          review='"Encontrei uma carta e contactei o dono na hora. Muito fácil."'
          :rating="5.0"
        />

        <DefaultReviewCard
          class="testimonial-card card-3"
          name="Carlos Sitoe"
          date="3 semanas atrás"
          review='"Recuperei meu passaporte antes da viagem. Recomendo!"'
          :rating="5.0"
        />
      </div>
    </div>
  </section>
</template>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap");

.font-poppins {
  font-family: "Poppins", sans-serif !important;
}

.font-poppins :deep(*) {
  font-family: "Poppins", sans-serif !important;
}

h2 {
  color: #344767;
}

/* Animação do título */
.title-section {
  opacity: 0;
  transform: translateY(-20px);
  transition: all 0.6s ease;
}

.title-section.animate-title {
  opacity: 1;
  transform: translateY(0);
}

/* Animação dos cards */
.testimonial-card {
  opacity: 0;
  transform: translateX(-50px);
  transition: all 0.7s cubic-bezier(0.4, 0, 0.2, 1);
}

.animate-in .testimonial-card {
  opacity: 1;
  transform: translateX(0);
}

.animate-in .card-1 {
  transition-delay: 0.1s;
}

.animate-in .card-2 {
  transition-delay: 0.3s;
  transform: translateX(50px);
}

.animate-in .card-2 {
  transform: translateX(0);
}

.animate-in .card-3 {
  transition-delay: 0.5s;
}

/* Hover effect */
.testimonial-card:hover {
  transform: translateY(-8px) scale(1.02) !important;
  box-shadow: 0 15px 35px rgba(128, 0, 128, 0.15);
}
</style>
