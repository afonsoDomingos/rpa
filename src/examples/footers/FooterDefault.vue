<script setup>

import logoDark2 from "@/assets/img/rPa.png";
defineProps({
  brand: {
    type: Object,
    name: String,
    logo: String,
    route: "",
    default: () => ({
      name: "Rpa",
      logo: logoDark2,
      route: "/"
    })
  },
  socials: {
    type: Array,
    icon: String,
    link: String,
    default: () => [
      {
        icon: '<i class="fab fa-facebook text-lg opacity-8"></i>',
        link: "https://www.facebook.com/profile.php?id=61570930139844&sk=photos"
      },
      {
        icon: '<i class="fab fa-linkedin text-lg opacity-8"></i>',
        link: "https://www.linkedin.com/in/afonso-domingos-6b59361a5/"
      },
      {
        icon: '<i class="fab fa-dribbble text-lg opacity-8"></i>',
        link: "https://recuperaaqui.vercel.app"
      },
      {
        icon: '<i class="fab fa-github text-lg opacity-8"></i>',
        link: "https://github.com/afonsoDomingos/rpa"
      },
      {
        icon: '<i class="fab fa-youtube text-lg opacity-8"></i>',
        link: "https://www.youtube.com/channel/UClyCqvjCJeQHY21K5SMe2LA"
      }
    ]
  },
  menus: {
    type: Array,
    name: String,
    items: {
      type: Array,
      name: String,
      href: String
    },
    default: () => [
      {
        name: "Empresa",
        items: [
          {
            name: "Sobre Nós",
            href: ""
          },
          {
            name: "Porquê Rpa",
            href: ""
          },
          {
            name: "Como Funciona",
            href: ""
          },
          { name: "Equipe", href: "" }
        ]
      },
      {
        name: "Redes sociais",
        items: [
          { name: "Facebook", href: "https://www.facebook.com/profile.php?id=61570930139844&sk=photos" },
          {
            name: "Instagram",
            href: "https://www.facebook.com/profile.php?id=61570930139844&sk=photos"
          },
          {
            name: "Whatsapp",
            href: "https://www.facebook.com/profile.php?id=61570930139844&sk=photos"
          }
        ]
      },
      {
        name: "Suporte",
        items: [
          {
            name: "Contacte-nos",
            href: "pages/landing-pages/contact-us"
          },
        
        ]
      },
      {
        name: "Jurídico",
        items: [
          {
            name: "Termos e Condições",
            href: ""
          },
          {
            name: "Política de Privacidade",
            href: ""
          },
          
        ]
      }
    ]
  }
});
</script>
<template>
  <footer class="footer pt-5 mt-5">
    <div class="container">
      <div class="row">
        <div class="col-md-3 mb-4 ms-auto">
          <div>
            <a :href="brand.route">
              <img :src="brand.logo" class="mb-3 footer-logo" alt="main_logo" />
            </a>
            <h6 class="font-weight-bolder mb-4">{{ brand.name }}</h6>
          </div>
          <div>
            <ul class="d-flex flex-row ms-n3 nav">
              <li
                class="nav-item"
                v-for="{ icon, link } of socials"
                :key="link"
              >
                <a
                  class="nav-link pe-1"
                  :href="link"
                  target="_blank"
                  v-html="icon"
                >
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div
          class="col-md-2 col-sm-6 col-6 mb-4"
          v-for="{ name, items } of menus"
          :key="name"
        >
          <h6 class="text-sm">{{ name }}</h6>
          <ul class="flex-column ms-n3 nav">
            <li class="nav-item" v-for="item of items" :key="item.name">
              <a class="nav-link" :href="item.href" target="_blank">
                {{ item.name }}
              </a>
            </li>
          </ul>
        </div>

        <div class="col-12">
          <div class="text-center">
            <p class="text-dark my-4 text-sm font-weight-normal">
              Todos os Direitos Reservados. 
              {{ new Date().getFullYear() }}
              Rpa By
              <a href="https://www.facebook.com/Techvibemz/" target="_blank"
                >Techvibe</a
              >.
            </p>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>
