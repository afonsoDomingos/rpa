<script setup>
defineProps({
  socials: {
    type: Array,
    icon: String,
    link: String,
    default: () => [
      {
        icon: '<i class="fab fa-facebook text-lg opacity-8"></i>',
        link: "https://www.facebook.com/CreativeTim/",
      },
      {
        icon: '<i class="fab fa-twitter text-lg opacity-8"></i>',
        link: "https://twitter.com/creativetim",
      },
      {
        icon: '<i class="fab fa-dribbble text-lg opacity-8"></i>',
        link: "https://dribbble.com/creativetim",
      },
      {
        icon: '<i class="fab fa-github text-lg opacity-8"></i>',
        link: "https://github.com/creativetimofficial",
      },
      {
        icon: '<i class="fab fa-youtube text-lg opacity-8"></i>',
        link: "https://www.youtube.com/@recuperaqui",
      },
    ],
  },
  links: {
    type: Array,
    name: String,
    href: String,
    default: () => [
      { href: "/home", name: "Início" },
      { href: "/about", name: "Sobre Nós" },
      { href: "/guia-documentos", name: "Guia" },
      { href: "/privacypolicy", name: "Privacidade" },
      { href: "/termsconditions", name: "Termos" },
    ],
  },
});
</script>
<template>
  <footer class="footer py-5">
    <div class="container">
      <div class="row">
        <div class="col-lg-8 mb-4 mx-auto text-center">
          <template v-for="{ name, href } of links" :key="name">
            <a
              v-if="href.startsWith('http')"
              :href="href"
              target="_blank"
              class="text-secondary me-xl-5 me-3 mb-sm-0 mb-2"
            >
              {{ name }}
            </a>
            <router-link
              v-else
              :to="href"
              class="text-secondary me-xl-5 me-3 mb-sm-0 mb-2"
            >
              {{ name }}
            </router-link>
          </template>
        </div>
        <div class="col-lg-8 mx-auto text-center mb-4 mt-2">
          <a
            v-for="{ icon, link } of socials"
            :key="link"
            :href="link"
            target="_blank"
            class="text-secondary me-xl-4 me-4"
            v-html="icon"
          >
          </a>
        </div>
      </div>
      <div class="row">
        <div class="col-8 mx-auto text-center mt-1">
          <p class="mb-0 text-secondary">
            Copyright © {{ new Date().getFullYear() }} Rpa.
          </p>
        </div>
      </div>
    </div>
  </footer>
</template>
