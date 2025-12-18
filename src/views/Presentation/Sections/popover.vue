<script setup>
import { onMounted, ref } from "vue";
//Vue Material Kit 2 components
import MaterialButton from "@/components/MaterialButton.vue";

// popover
import setPopover from "@/assets/js/popover";

// store
import { useAppStore } from "@/stores";
const store = useAppStore();

// Estado para controlar visibilidade
const isVisible = ref(false);
const sectionRef = ref(null);

// hook
onMounted(() => {
  setPopover(store.bootstrap);
  
  // Intersection Observer para detectar scroll
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        // Ativa quando entra, desativa quando sai
        isVisible.value = entry.isIntersecting;
      });
    },
    { threshold: 0.2 }
  );
  
  if (sectionRef.value) {
    observer.observe(sectionRef.value);
  }
});
</script>
<template>
  <div class="container" ref="sectionRef">
    <div class="row py-7 text-center">
      <div class="popover-buttons-wrapper" :class="{ 'animate-in': isVisible }">
        <MaterialButton
          class="popover-btn"
          variant="gradient"
          color="success"
          data-bs-container="body"
          data-bs-toggle="popover"
          data-bs-placement="top"
          data-bs-content="Pesquise seu nome e veja se seu documento já foi registrado!"
        >
          Como funciona?
        </MaterialButton>

        <MaterialButton
          class="popover-btn mx-2"
          variant="gradient"
          color="success"
          data-bs-container="body"
          data-bs-toggle="popover"
          data-bs-placement="right"
          data-bs-content="Cadastre um alerta e avisamos quando seu documento for encontrado!"
        >
          E se não encontrar?
        </MaterialButton>

        <MaterialButton
          class="popover-btn"
          variant="gradient"
          color="success"
          data-bs-container="body"
          data-bs-toggle="popover"
          data-bs-placement="bottom"
          data-bs-content="Qualquer pessoa que encontrou um documento pode registrá-lo aqui!"
        >
          Quem pode cadastrar?
        </MaterialButton>

        <MaterialButton
          class="popover-btn ms-2"
          variant="gradient"
          color="success"
          data-bs-container="body"
          data-bs-toggle="popover"
          data-bs-placement="left"
          data-bs-content=" Sim! Mostramos apenas o necessário para a recuperação segura do documento."
        >
          É seguro?
        </MaterialButton>
      </div>
    </div>
  </div>
</template>

<style scoped>
.popover-buttons-wrapper {
  opacity: 0;
  transform: translateY(30px);
  transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

.popover-buttons-wrapper.animate-in {
  opacity: 1;
  transform: translateY(0);
}

.popover-btn {
  transition: all 0.3s ease;
}

.animate-in .popover-btn:nth-child(1) {
  animation: fadeSlideUp 0.6s ease forwards;
  animation-delay: 0.1s;
}

.animate-in .popover-btn:nth-child(2) {
  animation: fadeSlideUp 0.6s ease forwards;
  animation-delay: 0.2s;
}

.animate-in .popover-btn:nth-child(3) {
  animation: fadeSlideUp 0.6s ease forwards;
  animation-delay: 0.3s;
}

.animate-in .popover-btn:nth-child(4) {
  animation: fadeSlideUp 0.6s ease forwards;
  animation-delay: 0.4s;
}

@keyframes fadeSlideUp {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.popover-btn:hover {
  transform: translateY(-3px) scale(1.02);
  box-shadow: 0 8px 25px rgba(25, 135, 84, 0.3);
}
</style>
