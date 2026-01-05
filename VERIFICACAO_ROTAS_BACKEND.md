# Prompt de Verificação e Implementação de Rotas de Comprovativos

**Contexto:**
Acabamos de implementar um novo módulo no Frontend para **Envio e Validação de Comprovativos de Pagamento**.
Ao testar o envio (`EnviarComprovativo.vue`), estamos recebendo um erro **404 (Not Found)**, o que indica que as rotas não existem no Backend.

**Sua Tarefa:**
1. Verifique no código do Backend (controllers/routes) se as rotas listadas abaixo existem.
2. Se não existirem, por favor, implemente-as imediatamente para que o sistema funcione.

---

## 🚨 Rotas que estão faltando (Erro 404)

### 1. Upload de Comprovativo (Prioridade Máxima)
Esta é a rota que está falhando agora.
- **Método:** `POST`
- **Rota:** `/api/pagamentos/comprovativo`
- **Tipo:** `multipart/form-data` (Upload de Arquivo + Dados)
- **Campos Recebidos (FormData):**
  - `comprovativo`: Arquivo (imagem ou PDF)
  - `metodo_pagamento`: String (ex: 'M-Pesa')
  - `valor_pago`: Number
  - `referencia`: String
  - `tipo`: String ('assinatura' ou 'anuncio')
  - `pacote`: String (opcional)
  - `anuncioId`: String (opcional)

### 2. Listagem para Admin (Validar Comprovativos)
- **Método:** `GET`
- **Rota:** `/api/pagamentos/comprovativos`
- **Função:** Retornar lista de todos os comprovativos pendentes e históricos.

### 3. Aprovação (Ação do Admin)
- **Método:** `POST`
- **Rota:** `/api/pagamentos/comprovativos/:id/aprovar`
- **Body:** `{ "obs_admin": "..." }`
- **Função:** Atualizar status para 'aprovado' e ativar o serviço do usuário.

### 4. Rejeição (Ação do Admin)
- **Método:** `POST`
- **Rota:** `/api/pagamentos/comprovativos/:id/rejeitar`
- **Body:** `{ "obs_admin": "Motivo..." }`
- **Função:** Atualizar status para 'rejeitado' e notificar o usuário.

---

**Observação:**
Para a implementação detalhada (Schema do Banco de Dados + Lógica de Upload), consulte o arquivo `BACKEND_PROMPT_COMPROVATIVOS.md` que já está na raiz do projeto.
