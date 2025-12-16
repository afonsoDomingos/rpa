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
    },
    {
      path: "/viaturas",
      name: "Viaturas",
      component: () => import("../components/viaturas.vue"),
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
      meta: { requerAutenticacao: true },
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
  ],
});

export default router;
