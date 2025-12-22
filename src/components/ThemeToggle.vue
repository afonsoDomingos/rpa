<template>
  <button
    class="theme-toggle"
    @click="toggleTheme"
    :title="isDark ? 'Ativar Modo Claro' : 'Ativar Modo Escuro'"
  >
    <transition name="fade-icon" mode="out-in">
      <i v-if="isDark" class="bi bi-sun-fill text-warning"></i>
      <i v-else class="bi bi-moon-stars-fill text-purple"></i>
    </transition>
  </button>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const isDark = ref(false);

const toggleTheme = () => {
  isDark.value = !isDark.value;
  const theme = isDark.value ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
};

onMounted(() => {
  const savedTheme = localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  isDark.value = savedTheme === 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
});
</script>

<style scoped>
.theme-toggle {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  backdrop-filter: blur(10px);
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 0;
}

.theme-toggle:hover {
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 6px 16px rgba(128, 0, 128, 0.2);
  border-color: var(--accent-purple);
}

.theme-toggle i {
  font-size: 1.2rem;
}

.text-purple {
  color: #800080;
}

/* Animação do Ícone */
.fade-icon-enter-active,
.fade-icon-leave-active {
  transition: all 0.3s ease;
}

.fade-icon-enter-from {
  opacity: 0;
  transform: rotate(-90deg) scale(0.5);
}

.fade-icon-leave-to {
  opacity: 0;
  transform: rotate(90deg) scale(0.5);
}
</style>
