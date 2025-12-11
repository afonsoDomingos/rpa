# 🧪 Guia de Teste do Meta Pixel

## 📋 Pré-requisitos

1. **Facebook Pixel Helper** (Extensão Chrome)
   - [Instalar aqui](https://chrome.google.com/webstore/detail/facebook-pixel-helper/fdgfkebogiimcoedlicjlajpkdmockpc)

2. **Acesso ao Events Manager**
   - [Facebook Events Manager](https://business.facebook.com/events_manager2)
   - Pixel ID: `1265895278678340`

3. **Console do Navegador** (F12)
   - Para ver logs de debug

## 🔍 Como Testar

### 1. Teste de PageView (Automático)

**Passos:**
1. Abra qualquer página do site
2. Verifique o ícone do Facebook Pixel Helper (deve ficar azul)
3. Clique no ícone para ver detalhes
4. Deve mostrar: `PageView` evento disparado

**Console:**
```
[Meta Pixel] PageView
```

### 2. Teste de ViewContent (Página de Anúncio)

**Passos:**
1. Navegue para `/anuncie`
2. Abra o console (F12)
3. Verifique o Pixel Helper

**Esperado:**
- Evento `ViewContent` disparado
- Parâmetros: `content_name`, `content_category`

**Console:**
```
[Meta Pixel] ViewContent { content_name: "...", content_category: "..." }
[CAPI] ViewContent enviado com sucesso
```

### 3. Teste de AddToCart (Pacotes de Anúncio)

**Passos:**
1. Navegue para página de pacotes
2. Clique em "Escolher Pacote"
3. Verifique o console

**Esperado:**
- Evento `AddToCart` disparado
- Parâmetros: `value`, `currency`, `content_name`

### 4. Teste de InitiateCheckout (Assinaturas)

**Passos:**
1. Navegue para `/assinaturas`
2. Clique em um plano
3. Verifique o console

**Esperado:**
- Evento `InitiateCheckout` disparado
- Parâmetros: `value`, `currency`, `content_name`

### 5. Teste de Subscribe (Completar Assinatura)

**Passos:**
1. Complete o processo de assinatura
2. Após pagamento bem-sucedido
3. Verifique o console

**Esperado:**
- Evento `Subscribe` disparado
- Parâmetros: `value`, `currency`, `predicted_ltv`

### 6. Teste de Purchase (Compra de Anúncio)

**Passos:**
1. Complete o pagamento de um anúncio
2. Verifique o console

**Esperado:**
- Evento `Purchase` disparado
- Parâmetros: `value`, `currency`, `transaction_id`

### 7. Teste de Lead (Formulário)

**Passos:**
1. Preencha o formulário de anúncio
2. Submeta o formulário
3. Verifique o console

**Esperado:**
- Evento `Lead` disparado
- Parâmetros: `content_name`

## 🔧 Verificação no Events Manager

### Passo a Passo:

1. **Acesse o Events Manager**
   - https://business.facebook.com/events_manager2
   - Selecione o Pixel `1265895278678340`

2. **Vá para "Test Events"**
   - Menu lateral > Test Events
   - Ative "Test Events"

3. **Navegue pelo site**
   - Faça as ações que disparam eventos
   - Veja os eventos aparecendo em tempo real

4. **Verifique os Dados**
   - Cada evento deve mostrar:
     - Nome do evento
     - Parâmetros enviados
     - Event ID
     - URL da página
     - User Agent

## ⚠️ Problemas Comuns

### Pixel Helper não fica azul
- **Causa**: Pixel não está carregando
- **Solução**: Verificar se `/js/pixel.js` está acessível
- **Teste**: Abrir `https://seusite.com/js/pixel.js` no navegador

### Eventos não aparecem no Events Manager
- **Causa 1**: Pixel ID incorreto
  - Verificar se é `1265895278678340`
- **Causa 2**: Bloqueador de anúncios ativo
  - Desativar bloqueadores durante teste
- **Causa 3**: CAPI não configurado
  - Verificar rota `/facebook/conversion` no backend

### Console mostra "fbq não está disponível"
- **Causa**: Script do pixel não carregou
- **Solução**: 
  1. Verificar `/public/js/pixel.js`
  2. Verificar `index.html` linha 14
  3. Limpar cache do navegador

### CAPI falha (warning no console)
- **Causa**: Rota `/facebook/conversion` não existe no backend
- **Impacto**: Pixel browser ainda funciona
- **Solução**: Implementar rota no backend

## ✅ Checklist de Validação

- [ ] PageView dispara automaticamente em todas as páginas
- [ ] ViewContent dispara ao visualizar anúncio
- [ ] AddToCart dispara ao escolher pacote
- [ ] InitiateCheckout dispara ao iniciar assinatura
- [ ] Subscribe dispara ao completar assinatura
- [ ] Purchase dispara ao completar pagamento
- [ ] Lead dispara ao submeter formulário
- [ ] Eventos aparecem no Pixel Helper
- [ ] Eventos aparecem no Events Manager
- [ ] CAPI está funcionando (sem warnings)
- [ ] Event IDs são únicos
- [ ] Parâmetros corretos em cada evento

## 📊 Métricas Importantes

### No Events Manager, verifique:

1. **Event Match Quality**
   - Deve ser > 5.0 (idealmente > 7.0)
   - Indica qualidade dos dados enviados

2. **Events Received**
   - Total de eventos nas últimas 24h
   - Deve aumentar conforme uso do site

3. **Deduplication**
   - Eventos duplicados entre Pixel e CAPI
   - Deve ser próximo de 100% se CAPI funcionar

4. **Browser vs Server Events**
   - Browser: Eventos do Pixel
   - Server: Eventos da CAPI
   - Idealmente ambos devem estar funcionando

## 🚀 Próximos Passos

Após validar que tudo funciona:

1. **Criar Públicos Personalizados**
   - Visitantes do site
   - Pessoas que iniciaram checkout
   - Compradores

2. **Configurar Conversões**
   - Definir eventos de conversão
   - Atribuir valores monetários

3. **Otimizar Campanhas**
   - Usar eventos para otimização
   - Criar lookalike audiences

4. **Monitorar Performance**
   - Acompanhar eventos diariamente
   - Identificar problemas rapidamente
