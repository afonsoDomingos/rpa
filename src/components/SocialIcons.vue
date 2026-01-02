<script setup>
import { onMounted, ref } from 'vue';

const isVisible = ref(false);

const socialLinks = [
  {
    name: 'Facebook',
    url: 'https://www.facebook.com/profile.php?id=61570930139844',
    color: '#1877F3',
    path: 'M21.5 16.01h-3.01v10h-4.01v-10h-2v-3.5h2v-2.2c0-2.1 1.1-4.3 4.3-4.3l3.2.01v3.5h-2.3c-.3 0-.7.2-.7.7v2.3h3l-.4 3.5z'
  },
  {
    name: 'Instagram',
    url: 'https://www.instagram.com/rpamocambique/',
    color: '#E4405F',
    path: 'M16 10.7a5.3 5.3 0 1 0 0 10.6 5.3 5.3 0 0 0 0-10.6zm0 8.7a3.4 3.4 0 1 1 0-6.8 3.4 3.4 0 0 1 0 6.8zm6.8-8.9a1.2 1.2 0 1 1-2.4 0 1.2 1.2 0 0 1 2.4 0zM24 12.2c-.1-1.1-.3-1.8-.6-2.4-.3-.6-.7-1.1-1.3-1.7-.6-.6-1.1-1-1.7-1.3-.6-.3-1.3-.5-2.4-.6-1.1-.1-1.4-.1-4.1-.1s-3 0-4.1.1c-1.1.1-1.8.3-2.4.6-.6.3-1.1.7-1.7 1.3-.6.6-1 1.1-1.3 1.7-.3.6-.5 1.3-.6 2.4-.1 1.1-.1 1.4-.1 4.1s0 3 .1 4.1c.1 1.1.3 1.8.6 2.4.3.6.7 1.1 1.3 1.7.6.6 1.1 1 1.7 1.3.6.3 1.3.5 2.4.6 1.1.1 1.4.1 4.1.1s3 0 4.1-.1c1.1-.1 1.8-.3 2.4-.6.6-.3 1.1-.7 1.7-1.3.6-.6 1-1.1 1.3-1.7.3-.6.5-1.3.6-2.4.1-1.1.1-1.4.1-4.1s0-3-.1-4.1zm-2.2 9.7c-.1.8-.3 1.3-.5 1.7-.2.4-.5.7-.9 1.1-.4.4-.7.7-1.1.9-.4.2-.9.4-1.7.5-1.1.1-1.4.1-4.1.1s-3 0-4.1-.1c-.8-.1-1.3-.3-1.7-.5-.4-.2-.7-.5-1.1-.9-.4-.4-.7-.7-.9-1.1-.2-.4-.4-.9-.5-1.7-.1-1.1-.1-1.4-.1-4.1s0-3 .1-4.1c.1-.8.3-1.3.5-1.7.2-.4.5-.7.9-1.1.4-.4.7-.7 1.1-.9.4-.2.9-.4 1.7-.5 1.1-.1 1.4-.1 4.1-.1s3 0 4.1.1c.8.1 1.3.3 1.7.5.4.2.7.5 1.1.9.4.4.7.7.9 1.1.2.4.4.9.5 1.7.1 1.1.1 1.4.1 4.1s0 3-.1 4.1z'
  },
  {
    name: 'LinkedIn',
    url: 'https://mz.linkedin.com/company/rpa-mo%C3%A7ambique',
    color: '#0A66C2',
    path: 'M12.7 24h-3.1V13.1h3.1V24zm-1.6-12.3c-1 0-1.7-.7-1.7-1.6 0-.9.7-1.6 1.7-1.6s1.7.7 1.7 1.6c0 .9-.7 1.6-1.7 1.6zm13.1 12.3h-3.1v-5.5c0-1.3-.5-2.1-1.6-2.1-.9 0-1.4.6-1.7 1.2-.1.2-.1.5-.1.8V24h-3.1s.1-10.9 0-10.9h3.1v1.5c.4-.7 1.1-1.7 2.7-1.7 2 0 3.5 1.3 3.5 4.1V24z'
  },
  {
    name: 'Whatsapp',
    url: 'https://whatsapp.com/channel/0029Vb7LiyEBlHpZinsHGG2v',
    color: '#25D366',
    path: 'M23.5 20.7c-.3-.2-1.7-.8-2-1-0.3-.1-.5-.2-.7.1-.2.3-.7 1-0.9 1.2-.2.2-.3.2-.6.1-1.6-.6-2.8-2.2-2.9-2.3-.2-.2-.2-.4 0-.6.2-.2.3-.4.5-.6.2-.2.2-.3.3-.5.1-.2 0-.4 0-.6 0-.2-.7-1.7-1-2.3-.3-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.7.3-.2.2-.9.9-.9 2.1 0 1.2.9 2.3 1 2.5.1.2 1.8 2.8 4.4 3.7.6.2 1.1.3 1.5.2.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.1-1.2z'
  }
];

onMounted(() => {
  setTimeout(() => {
    isVisible.value = true;
  }, 300);
});
</script>

<template>
  <div class="social-wrapper" :class="{ 'is-active': isVisible }">
    <div class="social-container" role="navigation" aria-label="Redes sociais">
      <a
        v-for="(link, index) in socialLinks"
        :key="link.name"
        :href="link.url"
        target="_blank"
        rel="noopener"
        :aria-label="link.name"
        class="social-item"
        :style="{ '--hover-color': link.color, '--delay': `${index * 0.1}s` }"
      >
        <span class="tooltip">{{ link.name }}</span>
        <div class="icon-box">
          <svg
            viewBox="0 0 32 32"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <circle cx="16" cy="16" r="16" class="icon-bg" />
            <path :d="link.path" fill="currentColor" />
          </svg>
        </div>
      </a>
    </div>
  </div>
</template>

<style scoped>
.social-wrapper {
  position: fixed;
  bottom: 24px;
  left: 16px;
  z-index: 9999;
  pointer-events: none;
}

.social-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 10px;
  pointer-events: auto;
  opacity: 0;
  transform: translateX(-20px);
  transition: all 0.6s cubic-bezier(0.22, 1, 0.36, 1);
}

.social-wrapper.is-active .social-container {
  opacity: 1;
  transform: translateX(0);
}

.social-item {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  color: #444; /* Cor escura por padrão para ser visível em temas claros */
  text-decoration: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 50%;
  animation: slideIn 0.5s ease-out forwards;
  animation-delay: var(--delay);
  opacity: 0;
}

/* Garante que se o fundo for escuro, eles fiquem brancos */
@media (prefers-color-scheme: dark) {
  .social-item {
    color: #fff;
  }
  .social-container {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.icon-box {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.icon-box svg {
  width: 24px;
  height: 24px;
  transition: all 0.3s ease;
}

.icon-bg {
  fill: rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

/* Tooltip */
.tooltip {
  position: absolute;
  left: 50px;
  background: rgba(0, 0, 0, 0.85);
  color: white;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
  opacity: 0;
  transform: translateX(-10px);
  transition: all 0.3s ease;
  pointer-events: none;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* Hover Effects */
.social-item:hover {
  transform: scale(1.15) translateY(-2px);
  color: #fff; /* Fica branco no hover pois o fundo ganha cor */
}

.social-item:hover .tooltip {
  opacity: 1;
  transform: translateX(0);
}

.social-item:hover .icon-bg {
  fill: var(--hover-color);
}

.social-item:hover .icon-box svg {
  filter: drop-shadow(0 0 8px var(--hover-color));
}

/* Mobile Responsiveness */
@media (max-width: 768px) {
  .social-wrapper {
    bottom: 16px;
    left: 12px;
  }

  .social-container {
    gap: 8px;
    padding: 8px;
  }

  .social-item {
    width: 32px;
    height: 32px;
  }

  .tooltip {
    display: none; /* Hide tooltips on touch devices */
  }
}
</style>
