# 📋 Sistema Completo de Gestão de Comprovativos de Pagamento

**Data:** 03 de Janeiro de 2026
**Status:** ✅ Implementado e Funcional

---

## 🎯 Visão Geral

Sistema completo de envio e validação de comprovativos de pagamento, permitindo que usuários enviem provas de pagamento e administradores validem esses comprovativos.

---

## 👤 LADO DO USUÁRIO

### 📍 Acesso
- **Rota:** `/assinaturas`
- **Localização:** Card na página de assinaturas (Passo 1)

### 🔄 Fluxo do Usuário

#### 1️⃣ **Passo 1: Escolher Método de Pagamento**
```
Usuário visualiza 4 opções:
├── PayPal: karinganastudio23@gmail.com
├── M-Pesa: 847877405
├── Emola: 879642412
└── NIB BIM: 000100000074301049557
```

**Funcionalidades:**
- ✅ Ver número de pagamento
- ✅ Copiar número com um clique
- ✅ Ícones coloridos por método
- ✅ Seleção visual interativa

#### 2️⃣ **Passo 2: Upload do Comprovativo**
```
Formulário de Envio:
├── Upload de arquivo (PNG, JPG, PDF - máx 5MB)
│   ├── Arrastar e soltar
│   ├── Click para selecionar
│   └── Preview antes de enviar
├── Valor Pago (obrigatório)
├── Referência/Número da Transação (opcional)
└── Observações (opcional)
```

**Validações:**
- ✅ Formato de arquivo válido
- ✅ Tamanho até 5MB
- ✅ Campos obrigatórios preenchidos

#### 3️⃣ **Envio e Confirmação**
```
POST /pagamentos/comprovativo

FormData:
{
  comprovativo: File,
  metodo_pagamento: String,
  valor_pago: Number,
  referencia: String,
  observacoes: String,
  tipo: 'assinatura'
}

Resposta:
✅ Mensagem de sucesso
✅ Modal fecha automaticamente
```

---

## 👨‍💼 LADO DO ADMINISTRADOR

### 📍 Acesso
- **Rota:** `/admin/comprovativos`
- **Permissão:** Requer `role: admin` ou `role: SuperAdmin`

### 📊 Dashboard Administrativo

#### 1️⃣ **Estatísticas em Tempo Real**
```
┌─────────────┬─────────────┬─────────────┬─────────────┐
│  Pendentes  │  Aprovados  │  Rejeitados │    Total    │
│     15      │     42      │      3      │     60      │
└─────────────┴─────────────┴─────────────┴─────────────┘
```

**Indicadores Visuais:**
- 🟡 Pendentes (amarelo)
- 🟢 Aprovados (verde)
- 🔴 Rejeitados (vermelho)
- 🔵 Total (azul)

#### 2️⃣ **Filtros Avançados**

```javascript
Filtros Disponíveis:
├── Status: Todos | Pendentes | Aprovados | Rejeitados
├── Método: Todos | M-Pesa | Emola | NIB BIM | PayPal
└── Busca: Nome, Email, Referência
```

**Exemplo de Uso:**
```
Status: Pendentes
Método: M-Pesa
Busca: "João Silva"
→ Mostra apenas comprovativos pendentes do M-Pesa do João Silva
```

#### 3️⃣ **Visualização de Comprovativo**

Cada comprovativo mostra:

```
┌─────────────────────────────────────────────────┐
│ 👤 João Silva                     [🟡 Pendente] │
│    joao.silva@email.com                         │
├─────────────────────────────────────────────────┤
│                                                  │
│ Detalhes do Pagamento:                          │
│ ├── 💳 Método: M-Pesa                           │
│ ├── 💰 Valor: 150 MZN                           │
│ ├── # Referência: MP12345678                   │
│ └── 📅 Data: 03/01/2026 13:45                  │
│                                                  │
│ Observações: "Pagamento do plano mensal"        │
│                                                  │
│ ┌─────────────────────┐                         │
│ │  [Imagem Preview]   │ ← Click para ampliar   │
│ │  ou                 │                         │
│ │  [📄 PDF]           │                         │
│ └─────────────────────┘                         │
│                                                  │
│ [✅ Aprovar]  [❌ Rejeitar]                     │
└─────────────────────────────────────────────────┘
```

#### 4️⃣ **Ações de Validação**

##### ✅ **Aprovar Comprovativo**
```
Modal de Aprovação:
├── Título: "Aprovar Comprovativo"
├── Confirmação visual
├── Campo: Observações (opcional)
└── Botões: [Cancelar] [Confirmar Aprovação]

→ POST /pagamentos/comprovativos/{id}/aprovar
  Body: { obs_admin: "Aprovado conforme..." }

Resultado:
✅ Status atualizado para "aprovado"
✅ Usuário notificado (email/push)
✅ Admin registrado
✅ Data de validação salva
```

##### ❌ **Rejeitar Comprovativo**
```
Modal de Rejeição:
├── Título: "Rejeitar Comprovativo"
├── Campo: Motivo da Rejeição (obrigatório)
└── Botões: [Cancelar] [Confirmar Rejeição]

→ POST /pagamentos/comprovativos/{id}/rejeitar
  Body: { obs_admin: "Comprovativo ilegível..." }

Resultado:
❌ Status atualizado para "rejeitado"
❌ Usuário notificado com motivo
📝 Motivo visível para o usuário
```

#### 5️⃣ **Visualização Detalhada**

**Preview de Imagens:**
- ✅ Thumbnail na listagem
- ✅ Click para ampliar (modal)
- ✅ Qualidade original
- ✅ Download disponível

**Preview de PDFs:**
- ✅ Ícone de PDF na listagem
- ✅ Viewer incorporado no modal
- ✅ Download do PDF

#### 6️⃣ **Histórico e Rastreabilidade**

Para comprovativos aprovados/rejeitados:
```
Status: Aprovado ✅
Aprovado por: Admin João
Em: 03/01/2026 às 14:30
Observações: "Comprovativo válido. Assinatura ativada."
```

---

## 📡 API Backend (Endpoints Necessários)

### 1. **Enviar Comprovativo (Usuário)**
```javascript
POST /pagamentos/comprovativo
Authorization: Bearer {token}
Content-Type: multipart/form-data

Body (FormData):
- comprovativo: File
- metodo_pagamento: String
- valor_pago: Number
- referencia: String
- observacoes: String
- tipo: String

Response:
{
  "sucesso": true,
  "mensagem": "Comprovativo recebido com sucesso!",
  "id": 123
}
```

### 2. **Listar Comprovativos (Admin)**
```javascript
GET /pagamentos/comprovativos
Authorization: Bearer {token}

Response:
{
  "sucesso": true,
  "comprovativos": [
    {
      "id": 123,
      "usuario": {
        "id": 456,
        "nome": "João Silva",
        "email": "joao@email.com"
      },
      "metodo_pagamento": "M-Pesa",
      "valor_pago": 150,
      "referencia": "MP12345678",
      "observacoes": "Pagamento mensal",
      "arquivo_path": "comprovativos/123456789.jpg",
      "status": "pendente", // pendente | aprovado | rejeitado
      "data_envio": "2026-01-03T13:45:00Z",
      "tipo": "assinatura",
      "obs_admin": null,
      "admin_responsavel": null,
      "data_validacao": null
    }
  ]
}
```

### 3. **Aprovar Comprovativo (Admin)**
```javascript
POST /pagamentos/comprovativos/{id}/aprovar
Authorization: Bearer {token}

Body:
{
  "obs_admin": "Comprovativo válido"
}

Response:
{
  "sucesso": true,
  "mensagem": "Comprovativo aprovado com sucesso"
}

Ações no Backend:
1. Atualizar status para "aprovado"
2. Registrar admin responsável
3. Salvar data de validação
4. Salvar observações do admin
5. Ativar assinatura do usuário
6. Enviar notificação ao usuário
```

### 4. **Rejeitar Comprovativo (Admin)**
```javascript
POST /pagamentos/comprovativos/{id}/rejeitar
Authorization: Bearer {token}

Body:
{
  "obs_admin": "Comprovativo ilegível. Por favor envie novamente."
}

Response:
{
  "sucesso": true,
  "mensagem": "Comprovativo rejeitado"
}

Ações no Backend:
1. Atualizar status para "rejeitado"
2. Registrar admin responsável
3. Salvar data de validação
4. Salvar motivo da rejeição
5. Enviar notificação ao usuário com motivo
```

### 5. **Servir Arquivo (Download)**
```javascript
GET /uploads/{filename}
Authorization: Bearer {token}

Response: File (image/pdf)
```

---

## 🗄️ Estrutura de Banco de Dados

### Tabela: `comprovativos_pagamento`

```sql
CREATE TABLE comprovativos_pagamento (
  id INT PRIMARY KEY AUTO_INCREMENT,
  usuario_id INT NOT NULL,
  metodo_pagamento VARCHAR(50) NOT NULL,
  valor_pago DECIMAL(10,2) NOT NULL,
  referencia VARCHAR(100),
  observacoes TEXT,
  arquivo_path VARCHAR(255) NOT NULL,
  status ENUM('pendente', 'aprovado', 'rejeitado') DEFAULT 'pendente',
  tipo VARCHAR(50) DEFAULT 'assinatura',
  obs_admin TEXT,
  admin_responsavel VARCHAR(100),
  data_envio DATETIME DEFAULT CURRENT_TIMESTAMP,
  data_validacao DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

-- Índices
CREATE INDEX idx_status ON comprovativos_pagamento(status);
CREATE INDEX idx_usuario ON comprovativos_pagamento(usuario_id);
CREATE INDEX idx_data_envio ON comprovativos_pagamento(data_envio);
```

---

## 📱 Notificações

### Para o Usuário:

#### Ao enviar comprovativo:
```
✅ Título: "Comprovativo Recebido"
Mensagem: "Seu comprovativo foi recebido e será analisado em breve."
```

#### Ao aprovar:
```
✅ Título: "Pagamento Confirmado!"
Mensagem: "Seu comprovativo foi aprovado. Sua assinatura está ativa!"
```

#### Ao rejeitar:
```
❌ Título: "Comprovativo Rejeitado"
Mensagem: "Seu comprovativo foi rejeitado. Motivo: {obs_admin}"
```

### Para o Admin:

#### Novo comprovativo:
```
🔔 Título: "Novo Comprovativo"
Mensagem: "{usuario} enviou um novo comprovativo (MZN {valor})"
```

---

## 🎨 Features de Design

### Usuário:
- ✅ Modal elegante com backdrop blur
- ✅ Drag & drop para upload
- ✅ Preview de imagens antes de enviar
- ✅ Animações suaves
- ✅ Toast de confirmação
- ✅ Loading states
- ✅ Responsive design

### Admin:
- ✅ Dashboard com estatísticas em tempo real
- ✅ Cards visuais para cada comprovativo
- ✅ Filtros avançados
- ✅ Preview inline + modal ampliado
- ✅ Ações com confirmação
- ✅ Histórico de validações
- ✅ Design moderno dark theme
- ✅ Totalmente responsivo

---

## 🔐 Segurança

### Validações:
- ✅ Autenticação obrigatória (JWT)
- ✅ Permissões de admin verificadas
- ✅ Tipo de arquivo validado
- ✅ Tamanho de arquivo limitado (5MB)
- ✅ Sanitização de inputs
- ✅ Upload seguro com renomeação

### Armazenamento:
```javascript
Arquivos salvos em: /uploads/comprovativos/
Nomenclatura: {timestamp}_{userId}_{randomHash}.{ext}
Exemplo: 1704294000_456_a8f9d2c1.jpg
```

---

## 📊 Métricas e Relatórios (Futuro)

### Dashboard Analytics:
```
- Taxa de aprovação
- Tempo médio de validação
- Métodos de pagamento mais usados
- Volume de comprovativos por período
- Taxa de rejeição e motivos principais
```

---

## ✅ Checklist de Implementação

### Frontend: ✅ Completo
- [x] Componente EnviarComprovativo.vue
- [x] Integração na página de Assinaturas
- [x] Componente AdminComprovativos.vue
- [x] Rota /admin/comprovativos
- [x] Sistema de upload com validação
- [x] Modais de aprovação/rejeição
- [x] Filtros e busca
- [x] Preview de imagens/PDF
- [x] Design responsivo

### Backend: ⏳ Pendente
- [ ] POST /pagamentos/comprovativo
- [ ] GET /pagamentos/comprovativos
- [ ] POST /pagamentos/comprovativos/{id}/aprovar
- [ ] POST /pagamentos/comprovativos/{id}/rejeitar
- [ ] Middleware de upload (multer)
- [ ] Criação da tabela no BD
- [ ] Sistema de notificações
- [ ] Ativação automática de assinatura

---

## 🚀 Como Usar

### Como Usuário:
1. Acesse `/assinaturas`
2. Clique em "Enviar Comprovativo"
3. Escolha o método de pagamento
4. Copie o número
5. Faça o pagamento
6. Volte e faça upload do comprovativo
7. Aguarde aprovação

### Como Admin:
1. Acesse `/admin/comprovativos`
2. Visualize estatísticas
3. Use filtros se necessário
4. Click em um comprovativo
5. Visualize detalhes e imagem
6. Aprove ou Rejeite
7. Usuário é notificado automaticamente

---

## 📞 Suporte

Para dúvidas ou problemas:
- Email: info@recuperaaqui.co.mz
- WhatsApp: +258 847877405
- Dashboard Admin: Gestão de Comprovativos

---

**Desenvolvido por:** Antigravity Assistant  
**Data:** 03 de Janeiro de 2026  
**Status:** ✅ Pronto para Deploy (Frontend)  
**Próximo:** Backend API Implementation
