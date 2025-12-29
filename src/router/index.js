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
    },
    {
      path: "/home",
      name: "presentation",
      component: () => import("../views/Presentation/PresentationView.vue"),
    },
    {
      path: "/dashboard/admin",
      name: "dashboard",
      component: () => import("../views/Presentation/DashboardView.vue"),
    },
    {
      path: "/about",
      name: "about",
      component: () => import("../views/LandingPages/AboutUs/AboutView.vue"),
    },
    {
      path: "/contactus",
      name: "contactus",
      component: () => import("../views/LandingPages/ContactUs/ContactView.vue"),
    },
    {
      path: "/pages/landing-pages/author",
      name: "author",
      component: () => import("../views/LandingPages/Author/AuthorView.vue"),
    },

    {
      path: "/solicitante",
      name: "SolicitanteModal",
      component: () => import("../components/SolicitanteModal.vue"),
    },
    {
      path: "/assinaturas",
      name: "Assinaturas",
      component: () => import("../components/Assinaturas.vue"),
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
      component: () => import("../components/TermsConditions.vue"),
    },
    {
      path: "/privacypolicy",
      name: "privacypolicy",
      component: () => import("../components/PrivacyPolicy.vue"),
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
