# 🔧 DEBUG - Problema nos Dropdowns da Navbar

## Testes para identificar o problema:

### 1. Abre o Console do Browser (F12)
- Ve se há algum erro em vermelho quando clicas no dropdown

### 2. Testa o seguinte no Console:
```javascript
// Ver se Bootstrap está carregado
console.log(typeof bootstrap);  // Deve retornar "object"

// Ver se há dropdowns
document.querySelectorAll('.dropdown-menu');

// Tentar fechar manualmente
document.querySelectorAll('.dropdown-menu.show').forEach(d => d.classList.remove('show'));
```

### 3. Testa clicar diretamente no botão:
- Abre o dropdown de Perfil
- Inspect Element (F12) no botão "Dashboard"
- Vai para a aba Console
- Digite:
```javascript
document.querySelector('[data-bs-toggle="dropdown"]').click();
```

### 4. Verifica se o problema é CSS:
- Abre DevTools (F12)
- Clica no botão do dropdown
- Vai para Elements tab
- Procura `.dropdown-menu`
- Verifica se tem `pointer-events: none` ou `z-index` negativo

## Soluções possíveis:

### Se for CSS bloqueando clicks:
Adiciona isto ao CSS da Navbar:
```css
.dropdown-menu {
  pointer-events: auto !important;
  z-index: 1050 !important;
}

.dropdown-item {
  pointer-events: auto !important;
  cursor: pointer !important;
}
```

### Se Bootstrap não estiver a funcionar:
Verifica se no `main.js` ou `app.js` tens:
```javascript
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
```

---

**Faz estes testes e diz-me o que aparece no console!**
