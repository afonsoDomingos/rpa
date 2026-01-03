<template>
  <nav aria-label="breadcrumb" class="breadcrumb-nav" v-if="breadcrumbs.length > 1">
    <ol class="breadcrumb" itemscope itemtype="https://schema.org/BreadcrumbList">
      <li
        v-for="(crumb, index) in breadcrumbs"
        :key="index"
        class="breadcrumb-item"
        :class="{ active: index === breadcrumbs.length - 1 }"
        itemprop="itemListElement"
        itemscope
        itemtype="https://schema.org/ListItem"
      >
        <router-link
          v-if="index < breadcrumbs.length - 1"
          :to="crumb.path"
          itemprop="item"
        >
          <i v-if="crumb.icon" :class="crumb.icon" class="breadcrumb-icon"></i>
          <span itemprop="name">{{ crumb.label }}</span>
          <meta itemprop="position" :content="index + 1" />
        </router-link>
        <span v-else itemprop="item">
          <i v-if="crumb.icon" :class="crumb.icon" class="breadcrumb-icon"></i>
          <span itemprop="name">{{ crumb.label }}</span>
          <meta itemprop="position" :content="index + 1" />
        </span>
      </li>
    </ol>
  </nav>
</template>

<script>
import { computed } from 'vue';
import { useRoute } from 'vue-router';

export default {
  name: 'BreadcrumbsComponent',
  setup() {
    const route = useRoute();

    const breadcrumbMap = {
      '/': { label: 'Início', icon: 'fas fa-home' },
      '/home': { label: 'Início', icon: 'fas fa-home' },
      '/about': { label: 'Sobre Nós', icon: 'fas fa-info-circle' },
      '/contactus': { label: 'Contacte-nos', icon: 'fas fa-envelope' },
      '/comunidade': { label: 'Comunidade', icon: 'fas fa-users' },
      '/CVGenerator': { label: 'Gerador de CV', icon: 'fas fa-file-alt' },
      '/guia-documentos': { label: 'Guia de Documentos', icon: 'fas fa-book' },
      '/assinaturas': { label: 'Assinaturas', icon: 'fas fa-crown' },
      '/anuncie': { label: 'Anuncie Connosco', icon: 'fas fa-bullhorn' },
      '/meus-documentos': { label: 'Meus Documentos', icon: 'fas fa-folder' },
      '/meus-pagamentos': { label: 'Meus Pagamentos', icon: 'fas fa-credit-card' },
      '/meus-anuncios': { label: 'Meus Anúncios', icon: 'fas fa-ad' },
      '/dashboard/admin': { label: 'Dashboard', icon: 'fas fa-tachometer-alt' },
      '/termsconditions': { label: 'Termos e Condições', icon: 'fas fa-file-contract' },
      '/privacypolicy': { label: 'Política de Privacidade', icon: 'fas fa-shield-alt' },
    };

    const breadcrumbs = computed(() => {
      const path = route.path;
      const crumbs = [{ label: 'Início', path: '/home', icon: 'fas fa-home' }];

      // Se não estamos na home, adicionar a página atual
      if (path !== '/' && path !== '/home') {
        const currentPage = breadcrumbMap[path];
        if (currentPage) {
          crumbs.push({
            label: currentPage.label,
            path: path,
            icon: currentPage.icon
          });
        }
      }

      return crumbs;
    });

    return {
      breadcrumbs
    };
  }
};
</script>

<style scoped>
.breadcrumb-nav {
  padding: 1rem 0;
  margin-bottom: 1.5rem;
}

.breadcrumb {
  display: flex;
  flex-wrap: wrap;
  padding: 0.75rem 1rem;
  margin-bottom: 0;
  list-style: none;
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 0.5rem;
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.breadcrumb-item {
  display: flex;
  align-items: center;
  font-size: 0.9rem;
}

.breadcrumb-item + .breadcrumb-item::before {
  content: "/";
  padding: 0 0.5rem;
  color: #6c757d;
}

.breadcrumb-item a {
  color: #800080;
  text-decoration: none;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.breadcrumb-item a:hover {
  color: #a020f0;
  text-decoration: underline;
}

.breadcrumb-item.active {
  color: #6c757d;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.breadcrumb-icon {
  font-size: 0.85rem;
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .breadcrumb {
    background-color: rgba(0, 0, 0, 0.2);
  }

  .breadcrumb-item a {
    color: #b388ff;
  }

  .breadcrumb-item a:hover {
    color: #d1c4e9;
  }

  .breadcrumb-item.active {
    color: #9e9e9e;
  }
}

/* Responsive */
@media (max-width: 768px) {
  .breadcrumb {
    font-size: 0.85rem;
    padding: 0.5rem 0.75rem;
  }

  .breadcrumb-icon {
    display: none;
  }
}
</style>
