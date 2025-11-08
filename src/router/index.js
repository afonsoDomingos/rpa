// src/router/index.js
import { createRouter, createWebHistory } from "vue-router";

// === TODAS AS SUAS ROTAS ORIGINAIS (NENHUMA FOI REMOVIDA) ===
import PresentationView from "../views/Presentation/PresentationView.vue";
import DashboardView from "../views/Presentation/DashboardView.vue";
import AboutView from "../views/LandingPages/AboutUs/AboutView.vue";
import ContactView from "../views/LandingPages/ContactUs/ContactView.vue";
import AuthorView from "../views/LandingPages/Author/AuthorView.vue";
import SignInBasicView from "../views/LandingPages/SignIn/BasicView.vue";
import PageHeaders from "../layouts/sections/page-sections/page-headers/HeadersView.vue";
import PageFeatures from "../layouts/sections/page-sections/features/FeaturesView.vue";
import NavigationNavbars from "../layouts/sections/navigation/navbars/NavbarsView.vue";
import NavigationNavTabs from "../layouts/sections/navigation/nav-tabs/NavTabsView.vue";
import NavigationPagination from "../layouts/sections/navigation/pagination/PaginationView.vue";
import InputAreasInputs from "../layouts/sections/input-areas/inputs/InputsView.vue";
import InputAreasForms from "../layouts/sections/input-areas/forms/FormsView.vue";
import ACAlerts from "../layouts/sections/attention-catchers/alerts/AlertsView.vue";
import ACModals from "../layouts/sections/attention-catchers/modals/ModalsView.vue";
import ACTooltipsPopovers from "../layouts/sections/attention-catchers/tooltips-popovers/TooltipsPopoversView.vue";
import ElAvatars from "../layouts/sections/elements/avatars/AvatarsView.vue";
import ElBadges from "../layouts/sections/elements/badges/BadgesView.vue";
import ElBreadcrumbs from "../layouts/sections/elements/breadcrumbs/BreadcrumbsView.vue";
import ElButtons from "../layouts/sections/elements/buttons/ButtonsView.vue";
import ElButtonGroups from "../layouts/sections/elements/button-groups/ButtonGroupsView.vue";
import ElDropdowns from "../layouts/sections/elements/dropdowns/DropdownsView.vue";
import ElProgressBars from "../layouts/sections/elements/progress-bars/ProgressBarsView.vue";
import ElToggles from "../layouts/sections/elements/toggles/TogglesView.vue";
import ElTypography from "../layouts/sections/elements/typography/TypographyView.vue";
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
    { path: "/pages/landing-pages/author", name: "author", component: AuthorView },
    { path: "/sections/page-sections/page-headers", name: "page-headers", component: PageHeaders },
    { path: "/sections/page-sections/features", name: "page-features", component: PageFeatures },
    { path: "/sections/navigation/navbars", name: "navigation-navbars", component: NavigationNavbars },
    { path: "/sections/navigation/nav-tabs", name: "navigation-navtabs", component: NavigationNavTabs },
    { path: "/sections/navigation/pagination", name: "navigation-pagination", component: NavigationPagination },
    { path: "/sections/input-areas/inputs", name: "inputareas-inputs", component: InputAreasInputs },
    { path: "/sections/input-areas/forms", name: "inputareas-forms", component: InputAreasForms },
    { path: "/sections/attention-catchers/alerts", name: "ac-alerts", component: ACAlerts },
    { path: "/sections/attention-catchers/modals", name: "ac-modals", component: ACModals },
    { path: "/sections/attention-catchers/tooltips-popovers", name: "ac-tooltips-popovers", component: ACTooltipsPopovers },
    { path: "/sections/elements/avatars", name: "el-avatars", component: ElAvatars },
    { path: "/sections/elements/badges", name: "el-badges", component: ElBadges },
    { path: "/sections/elements/breadcrumbs", name: "el-breadcrumbs", component: ElBreadcrumbs },
    { path: "/sections/elements/buttons", name: "el-buttons", component: ElButtons },
    { path: "/sections/elements/button-groups", name: "el-button-groups", component: ElButtonGroups },
    { path: "/sections/elements/dropdowns", name: "el-dropdowns", component: ElDropdowns },
    { path: "/sections/elements/progress-bars", name: "el-progress-bars", component: ElProgressBars },
    { path: "/sections/elements/toggles", name: "el-toggles", component: ElToggles },
    { path: "/sections/elements/typography", name: "el-typography", component: ElTypography },
    { path: "/solicitante", name: "SolicitanteModal", component: SolicitanteModal },
    { path: "/assinaturas", name: "Assinaturas", component: Assinaturas },
    { path: "/meus-documentos", name: "MeusDocumentos", component: MeusDocumentos, meta: { requerAutenticacao: true } },
    { path: "/meus-pagamentos", name: "MeusPagamentos", component: MeusPagamentos, meta: { requerAutenticacao: true } },
    { path: "/guardardocumentos", name: "GuardarDocumentos", component: GuardarDocumentos },
    { path: "/viaturas", name: "Viaturas", component: Viaturas },
    { path: "/CVGenerator", name: "CVGenerator", component: CVGenerator },
    { path: "/noticias", name: "NoticiasAdmin", component: NoticiasAdmin },
    { path: "/comunidade", name: "ComunidadeRpa", component: ComunidadeRpa },
    { path: "/admin/assinaturas", name: "AdminAssinaturas", component: AdminAssinaturas, meta: { requerAutenticacao: true } },
    { path: "/olhodedeus", name: "olhodedeus", component: olhodedeus },
    { path: "/termsconditions", name: "termsconditions", component: TermsConditions },
    { path: "/privacypolicy", name: "privacypolicy", component: PrivacyPolicy },

    // === ROTAS DO SISTEMA DE ANÚNCIOS (CORRETAS E ORGANIZADAS) ===
    {
      path: "/anuncie",
      name: "AnunciePage",
      component: AnunciePage,
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
  ],
});

export default router;