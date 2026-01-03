// src/router/index.js
import { createRouter, createWebHistory } from "vue-router";

// OBS: As rotas agora usam Lazy Loading (importação dinâmica) para reduzir o bundle inicial

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "signin-basic",
      component: () => import("../views/LandingPages/SignIn/BasicView.vue"),
      meta: {
        title: "Login - RPA Moçambique | Recupera Aqui",
        description: "Acesse sua conta no RPA (Recupera Aqui) e encontre seus documentos perdidos em Moçambique. BI, Passaporte, Cartões e mais."
      }
    },
    {
      path: "/home",
      name: "presentation",
      component: () => import("../views/Presentation/PresentationView.vue"),
      meta: {
        title: "RPA - Recupera Aqui Moçambique | Recuperação de Documentos Perdidos",
        description: "Plataforma líder em Moçambique para recuperação de documentos perdidos. Encontre seu BI, Passaporte, Cartão de Eleitor e outros documentos de forma rápida e segura."
      }
    },
    {
      path: "/dashboard/admin",
      name: "dashboard",
      component: () => import("../views/Presentation/DashboardView.vue"),
      meta: {
        title: "Dashboard - RPA Moçambique",
        description: "Painel administrativo do RPA"
      }
    },
    {
      path: "/about",
      name: "about",
      component: () => import("../views/LandingPages/AboutUs/AboutView.vue"),
      meta: {
        title: "Sobre Nós - RPA Moçambique | Nossa História e Missão",
        description: "Conheça a história do RPA (Recupera Aqui), a primeira plataforma de recuperação de documentos em Moçambique. Saiba nossa missão e valores."
      }
    },
    {
      path: "/contactus",
      name: "contactus",
      component: () => import("../views/LandingPages/ContactUs/ContactView.vue"),
      meta: {
        title: "Contacte-nos - RPA Moçambique | Fale Connosco",
        description: "Entre em contacto com a equipe do RPA. Estamos aqui para ajudá-lo a recuperar seus documentos perdidos. WhatsApp, Email e Telefone disponíveis."
      }
    },
    {
      path: "/pages/landing-pages/author",
      name: "author",
      component: () => import("../views/LandingPages/Author/AuthorView.vue"),
      meta: {
        title: "Autor - RPA Moçambique",
        description: "Conheça Afonso Domingos, fundador do RPA Moçambique"
      }
    },

    {
      path: "/solicitante",
      name: "SolicitanteModal",
      component: () => import("../components/SolicitanteModal.vue"),
      meta: {
        title: "Solicitação - RPA Moçambique",
        description: "Solicite recuperação de documentos no RPA"
      }
    },
    {
      path: "/assinaturas",
      name: "Assinaturas",
      component: () => import("../components/Assinaturas.vue"),
      meta: {
        title: "Planos e Assinaturas - RPA Moçambique | Premium",
        description: "Conheça nossos planos de assinatura premium. Benefícios exclusivos para recuperação prioritária de documentos e suporte dedicado."
      }
    },
    {
      path: "/meus-documentos",
      name: "MeusDocumentos",
      component: () => import("../components/MeusDocumentos.vue"),
      meta: { requerAutenticacao: true },
    },
    {
      path: "/meus-pagamentos",
      name: "MeusPagamentos",
      component: () => import("../components/MeusPagamentos.vue"),
      meta: { requerAutenticacao: true },
    },
    {
      path: "/guardardocumentos",
      name: "GuardarDocumentos",
      component: () => import("../components/Guardardocumentos.vue"),
      meta: { requerAutenticacao: true },
    },
    {
      path: "/viaturas",
      name: "Viaturas",
      component: () => import("../components/viaturas.vue"),
      meta: { requerAutenticacao: true },
    },
    {
      path: "/CVGenerator",
      name: "CVGenerator",
      component: () => import("../components/CVGenerator.vue"),
      meta: {
        title: "Gerador de CV Grátis - RPA Moçambique | Crie seu Currículo",
        description: "Crie um currículo profissional gratuitamente com o gerador de CV do RPA. Modelos modernos, fácil de usar e download instantâneo em PDF."
      }
    },
    {
      path: "/noticias",
      name: "NoticiasAdmin",
      component: () => import("../components/NoticiasAdmin.vue"),
      meta: { requerAutenticacao: true, requerAdmin: true },
    },
    {
      path: "/comunidade",
      name: "ComunidadeRpa",
      component: () => import("../components/ComunidadeRpa.vue"),
      meta: {
        title: "Comunidade RPA - Documentos Perdidos e Achados em Moçambique",
        description: "Encontre ou anuncie documentos perdidos e achados na comunidade RPA. BI, Passaportes, Cartões, Cartas e mais. Ajude a reunir pessoas com seus documentos."
      }
    },
    {
      path: "/admin/assinaturas",
      name: "AdminAssinaturas",
      component: () => import("../components/AdminAssinaturas.vue"),
      meta: { requerAutenticacao: true, requerSuperAdmin: true },
    },
    {
      path: "/olhodedeus",
      name: "olhodedeus",
      component: () => import("../examples/navbars/olhodedeus.vue"),
    },
    {
      path: "/termsconditions",
      name: "termsconditions",
      component: () => import("../views/LandingPages/Legal/TermsView.vue"),
      meta: {
        title: "Termos e Condições - RPA Moçambique",
        description: "Leia os termos e condições de uso da plataforma RPA (Recupera Aqui). Políticas de privacidade e regras de utilização."
      }
    },
    {
      path: "/privacypolicy",
      name: "privacypolicy",
      component: () => import("../views/LandingPages/Legal/PrivacyView.vue"),
      meta: {
        title: "Política de Privacidade - RPA Moçambique",
        description: "Política de privacidade do RPA. Saiba como protegemos seus dados pessoais e informações de documentos."
      }
    },
    {
      path: "/pagamento-sucesso",
      name: "PagamentoSucesso",
      component: () => import("../components/PagamentoSucesso.vue"),
    },

    // === SISTEMA DE ANÚNCIOS ===
    {
      path: "/anuncie",
      name: "AnunciePage",
      component: () => import("@/components/anunciantes/AnunciePage.vue"),
      meta: {
        title: "Anuncie Connosco - RPA Moçambique | Publicidade na Plataforma",
        description: "Publique seus anúncios na maior plataforma de recuperação de documentos de Moçambique. Alcance milhares de usuários diariamente."
      }
    },
    {
      path: "/anuncie/editar",
      name: "EditarAnuncio",
      component: () => import("@/components/anunciantes/EditarAnuncio.vue"),
      meta: { requerAutenticacao: true },
    },
    {
      path: "/pagamento-anuncio",
      name: "AnuncioPayment",
      component: () => import("@/components/anunciantes/AnuncioPayment.vue"),
    },
    {
      path: "/meus-anuncios",
      name: "MeusAnuncios",
      component: () => import("@/components/anunciantes/MeusAnuncios.vue"),
      meta: { requerAutenticacao: true },
    },

    {
      path: "/admin/anuncios",
      name: "AdminAnuncios",
      component: () => import("@/components/anunciantes/AdminAnuncios.vue"),
      meta: {
        requerAutenticacao: true,
        requerAdmin: true,
      },
    },
    {
      path: "/admin/gestao-colaboradores",
      name: "AdminGestao",
      component: () => import("@/views/Admin/GestaoColaboradoresView.vue"),
      meta: {
        requerAutenticacao: true,
        requerAdmin: true,
      },
    },
    {
      path: "/admin/comprovativos",
      name: "AdminComprovativos",
      component: () => import("@/components/admin/AdminComprovativos.vue"),
      meta: {
        title: "Gestão de Comprovativos - Admin RPA",
        description: "Painel administrativo para validação de comprovativos de pagamento",
        requerAutenticacao: true,
        requerAdmin: true,
      },
    },
    {
      path: "/guia-documentos",
      name: "GuiaDocumentos",
      component: () => import("../views/DocumentGuide/DocumentGuideView.vue"),
      meta: {
        title: "Guia de Recuperação de Documentos - RPA Moçambique | Como Recuperar",
        description: "Guia completo sobre como recuperar documentos perdidos em Moçambique. Passo a passo para BI, Passaporte, Cartão de Eleitor e mais."
      }
    },
    {
      // Rota Catch-all para 404 - Deve ser a ÚLTIMA rota
      path: "/:pathMatch(.*)*",
      name: "NotFound",
      component: () => import("../views/NotFound.vue"),
    },
  ],
});

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const isAuthenticated = !!token;

  // 0. Atualizar Título e Meta Description Dinamicamente (SEO)
  if (to.meta.title) {
    document.title = to.meta.title;
  } else {
    document.title = "RPA - Recupera Aqui Moçambique | Recuperação de Documentos";
  }

  // Atualizar Meta Description
  if (to.meta.description) {
    let metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', to.meta.description);
    } else {
      metaDescription = document.createElement('meta');
      metaDescription.name = 'description';
      metaDescription.content = to.meta.description;
      document.head.appendChild(metaDescription);
    }
  }

  // 1. Verificar Autenticação
  if (to.meta.requerAutenticacao && !isAuthenticated) {
    next("/");
    return;
  }

  // 2. Verificar Permissão de SuperAdmin (Exclusiva)
  if (to.meta.requerSuperAdmin) {
    if (role === 'SuperAdmin') {
      next();
    } else {
      next("/home");
    }
    return;
  }

  // 3. Verificar Permissão de Admin (Serve para Admin e SuperAdmin)
  if (to.meta.requerAdmin) {
    if (["admin", "SuperAdmin"].includes(role)) {
      next();
    } else {
      // Redirecionar para home se não tiver permissão
      next("/home");
    }
    return;
  }

  // 4. Rota livre
  next();
});

export default router;
