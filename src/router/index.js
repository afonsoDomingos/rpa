// src/router/index.js
import { createRouter, createWebHistory } from "vue-router";

// === TODAS AS SUAS ROTAS ORIGINAIS (NENHUMA FOI REMOVIDA) ===
import PresentationView from "../views/Presentation/PresentationView.vue";
import DashboardView from "../views/Presentation/DashboardView.vue";
import AboutView from "../views/LandingPages/AboutUs/AboutView.vue";
import ContactView from "../views/LandingPages/ContactUs/ContactView.vue";
import AuthorView from "../views/LandingPages/Author/AuthorView.vue";
import SignInBasicView from "../views/LandingPages/SignIn/BasicView.vue";

import SolicitanteModal from "../components/SolicitanteModal.vue";
import TermsConditions from "../components/TermsConditions.vue";
import PrivacyPolicy from "../components/PrivacyPolicy.vue";
import GuardarDocumentos from "../components/Guardardocumentos.vue";
import Assinaturas from "../components/Assinaturas.vue";
import MeusPagamentos from "../components/MeusPagamentos.vue";
import MeusDocumentos from "../components/MeusDocumentos.vue";
import Viaturas from "../components/viaturas.vue";
import NoticiasAdmin from "../components/NoticiasAdmin.vue";
import ComunidadeRpa from "../components/ComunidadeRpa.vue";
import AdminAssinaturas from "../components/AdminAssinaturas.vue";
import olhodedeus from "../examples/navbars/olhodedeus.vue";
import CVGenerator from "../components/CVGenerator.vue";
import PagamentoSucesso from "../components/PagamentoSucesso.vue";

// === SISTEMA DE ANUNCIANTES (ORGANIZADO) ===
import AnunciePage from "@/components/anunciantes/AnunciePage.vue";
import AnuncioPayment from "@/components/anunciantes/AnuncioPayment.vue";
import MeusAnuncios from "@/components/anunciantes/MeusAnuncios.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // === TODAS AS ROTAS ORIGINAIS (NENHUMA FOI REMOVIDA) ===
    { path: "/", name: "signin-basic", component: SignInBasicView },
    { path: "/home", name: "presentation", component: PresentationView },
    { path: "/dashboard/admin", name: "dashboard", component: DashboardView },
    { path: "/about", name: "about", component: AboutView },
    { path: "/contactus", name: "contactus", component: ContactView },
    {
      path: "/pages/landing-pages/author",
      name: "author",
      component: AuthorView,
    },

    {
      path: "/solicitante",
      name: "SolicitanteModal",
      component: SolicitanteModal,
    },
    { path: "/assinaturas", name: "Assinaturas", component: Assinaturas },
    {
      path: "/meus-documentos",
      name: "MeusDocumentos",
      component: MeusDocumentos,
      meta: { requerAutenticacao: true },
    },
    {
      path: "/meus-pagamentos",
      name: "MeusPagamentos",
      component: MeusPagamentos,
      meta: { requerAutenticacao: true },
    },
    {
      path: "/guardardocumentos",
      name: "GuardarDocumentos",
      component: GuardarDocumentos,
    },
    { path: "/viaturas", name: "Viaturas", component: Viaturas },
    { path: "/CVGenerator", name: "CVGenerator", component: CVGenerator },
    { path: "/noticias", name: "NoticiasAdmin", component: NoticiasAdmin },
    { path: "/comunidade", name: "ComunidadeRpa", component: ComunidadeRpa },
    {
      path: "/admin/assinaturas",
      name: "AdminAssinaturas",
      component: AdminAssinaturas,
      meta: { requerAutenticacao: true },
    },
    { path: "/olhodedeus", name: "olhodedeus", component: olhodedeus },
    {
      path: "/termsconditions",
      name: "termsconditions",
      component: TermsConditions,
    },
    { path: "/privacypolicy", name: "privacypolicy", component: PrivacyPolicy },
    {
      path: "/pagamento-sucesso",
      name: "PagamentoSucesso",
      component: PagamentoSucesso,
    },

    // === ROTAS DO SISTEMA DE ANÚNCIOS (CORRETAS E ORGANIZADAS) ===
    {
      path: "/anuncie",
      name: "AnunciePage",
      component: AnunciePage,
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
      component: AnuncioPayment,
    },
    {
      path: "/meus-anuncios",
      name: "MeusAnuncios",
      component: MeusAnuncios,
      meta: { requerAutenticacao: true },
    },

    {
      path: "/admin/anuncios",
      name: "AdminAnuncios",
      component: () => import("@/components/anunciantes/AdminAnuncios.vue"),
      meta: {
        requerAutenticacao: true,
        requerAdmin: true, // opcional: use no guard para verificar perfil
      },
    },
  ],
});

export default router;
