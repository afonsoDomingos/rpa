# RPA - Recuperação de Documentos Perdidos

![Logo RPA](file:///c:/Users/LENOVO/Documents/Rpa/FrontEnd/rpa/public/rpa-transparent.png)

O RPA é uma plataforma inovadora focada na recuperação de documentos perdidos. Equipado com tecnologias de ponta, o sistema oferece uma experiência fluida para registro, busca e notificações em tempo real.

## 🚀 Funcionalidades Principais

- **PWA (Progressive Web App):** Instale o RPA diretamente no seu telemóvel ou desktop para uma experiência nativa.
- **Notificações Push Reais:** Receba alertas instantâneos via VAPID (Web Push) mesmo com o navegador fechado.
- **App Badging API:** Veja o contador de notificações diretamente no ícone do aplicativo no telemóvel.
- **Card Flutuante (Busca em Tempo Real):** Um pequeno card lateral que exibe documentos recentemente encontrados de forma dinâmica e anonimizada.
- **Dashboard Administrativa:** Gestão avançada de assinaturas e pagamentos com atualizações em tempo real via Socket.io.
- **Busca Otimizada:** Algoritmo de busca por nome completo para localização rápida de documentos.
- **Segurança:** Integração segura com backend usando JWT e chaves VAPID dinâmicas.

## 🛠️ Tecnologia

O RPA utiliza um stack moderno focado em performance e experiência do utilizador:

- **Frontend:** Vue.js 3 com Composition API.
- **Estado Global:** Pinia.
- **Comunicação:** Axios (REST) e Socket.io-client (Real-time).
- **Notificações:** Web Push API (VAPID) e App Badging API.
- **Design:** CSS Moderno e Responsivo.

## 📲 Como Usar?

1. **Instale como App:** Abra o site no Chrome (Android) ou Safari (iOS) e selecione "Adicionar à tela inicial".
2. **Ative as Notificações:** No painel de administração ou perfil, clique em "Ativar Notificações" para receber avisos de pagamentos e documentos.
3. **Busque Documentos:** Use a barra de busca para encontrar itens registrados pelo nome.

## 📂 Estrutura do Projeto

```text
Rpa/
├── public/            # Ativos estáticos e Service Worker
│   ├── icons/         # Ícones do PWA
│   ├── rpa-transparent.png  # Logotipo oficial otimizado
│   └── service-worker.js    # Lógica de Push e Cache (v2)
├── src/
│   ├── api/           # Configuração base do Axios
│   ├── assets/        # Estilos, fontes e imagens
│   ├── components/    # Componentes Vue reutilizáveis
│   ├── composables/   # Lógica compartilhada (Push, Sockets, etc.)
│   ├── router/        # Configuração de rotas
│   ├── store/         # Gerenciamento de estado (Pinia)
│   └── views/         # Páginas da aplicação
└── package.json       # Dependências e scripts
```

## 🌐 Links e Suporte

- [Acesse o RPA](https://www.recuperaqui.vercel.app)
- [Suporte Técnico](https://www.recuperaqui.vercel.app/suporte)

---
© 2025 RPA - Recupera Aqui. Todos os direitos reservados.
