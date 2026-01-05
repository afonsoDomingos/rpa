# 🚀 BACKEND - Endpoints de Comprovativos (RESUMIDO)

## 📋 CONTEXTO
Frontend completo implementado. Preciso de **5 endpoints** para sistema de comprovativos de pagamento.

---

## 🗄️ TABELA (SQL)

```sql
CREATE TABLE comprovativos_pagamento (
  id INT PRIMARY KEY AUTO_INCREMENT,
  usuario_id INT NOT NULL,
  metodo_pagamento VARCHAR(50) NOT NULL,
  valor_pago DECIMAL(10,2) NOT NULL,
  referencia VARCHAR(100),
  observacoes TEXT,
  tipo VARCHAR(50) DEFAULT 'assinatura',
  arquivo_path VARCHAR(255) NOT NULL,
  status ENUM('pendente', 'aprovado', 'rejeitado') DEFAULT 'pendente',
  obs_admin TEXT,
  admin_responsavel VARCHAR(100),
  admin_id INT,
  data_envio DATETIME DEFAULT CURRENT_TIMESTAMP,
  data_validacao DATETIME,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
  INDEX idx_status (status)
);
```

---

## 🔌 ENDPOINTS

### 1. **Upload de Comprovativo**
```javascript
POST /api/pagamentos/comprovativo
Headers: Authorization: Bearer {token}
Content-Type: multipart/form-data

Body (FormData):
  - comprovativo: File (PNG, JPG, PDF - máx 5MB)
  - metodo_pagamento: String
  - valor_pago: Number
  - referencia: String (opcional)
  - observacoes: String (opcional)
  - tipo: String (default: 'assinatura')

Response:
{
  "sucesso": true,
  "mensagem": "Comprovativo recebido com sucesso!",
  "comprovativo": { "id": 123, "status": "pendente" }
}

Ações:
1. Validar arquivo (tipo e tamanho)
2. Salvar em /uploads/comprovativos/
3. Inserir no BD
4. (Opcional) Notificar admins
```

---

### 2. **Listar Comprovativos (Admin)**
```javascript
GET /api/pagamentos/comprovativos?status=pendente&metodo=M-Pesa
Headers: Authorization: Bearer {admin_token}

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
      "referencia": "MP12345",
      "observacoes": "...",
      "arquivo_path": "1704294000_456.jpg",
      "status": "pendente",
      "data_envio": "2026-01-03T13:45:00Z",
      "obs_admin": null,
      "admin_responsavel": null
    }
  ],
  "estatisticas": {
    "pendentes": 15,
    "aprovados": 42,
    "rejeitados": 3,
    "total": 60
  }
}

SQL:
SELECT c.*, u.nome as usuario_nome, u.email as usuario_email
FROM comprovativos_pagamento c
LEFT JOIN usuarios u ON c.usuario_id = u.id
WHERE status = ? AND metodo_pagamento = ?
ORDER BY data_envio DESC
```

---

### 3. **Aprovar Comprovativo**
```javascript
POST /api/pagamentos/comprovativos/:id/aprovar
Headers: Authorization: Bearer {admin_token}

Body:
{
  "obs_admin": "Comprovativo válido" // Opcional
}

Response:
{
  "sucesso": true,
  "mensagem": "Comprovativo aprovado com sucesso"
}

Ações:
1. Verificar se status = 'pendente'
2. UPDATE status = 'aprovado'
3. Salvar admin_id, admin_responsavel, obs_admin
4. Atualizar data_validacao
5. ⚠️ ATIVAR ASSINATURA DO USUÁRIO
6. Enviar email/notificação ao usuário
```

---

### 4. **Rejeitar Comprovativo**
```javascript
POST /api/pagamentos/comprovativos/:id/rejeitar
Headers: Authorization: Bearer {admin_token}

Body:
{
  "obs_admin": "Motivo da rejeição" // OBRIGATÓRIO
}

Response:
{
  "sucesso": true,
  "mensagem": "Comprovativo rejeitado"
}

Ações:
1. Validar obs_admin (obrigatório)
2. Verificar se status = 'pendente'
3. UPDATE status = 'rejeitado'
4. Salvar admin_id, admin_responsavel, obs_admin
5. Atualizar data_validacao
6. Enviar email ao usuário com motivo
```

---

### 5. **Servir Arquivo**
```javascript
GET /api/uploads/:filename
Headers: Authorization: Bearer {token}

Response: File (image/pdf)

Validações:
- Verificar se arquivo existe
- Verificar se usuário = dono OU admin
- res.sendFile(filepath)
```

---

## ⚙️ CONFIGURAÇÃO MULTER (Upload)

```javascript
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: 'uploads/comprovativos/',
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${uniqueSuffix}_${req.user.id}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|pdf/;
    const valid = allowed.test(path.extname(file.originalname).toLowerCase());
    cb(valid ? null : new Error('Apenas PNG, JPG, PDF'), valid);
  }
});

// Usar na rota:
router.post('/comprovativo', authMiddleware, upload.single('comprovativo'), ...)
```

---

## 📧 NOTIFICAÇÕES (Emails)

### Ao Aprovar:
```
Para: {usuario.email}
Assunto: ✅ Pagamento Confirmado - RPA
Mensagem: Seu comprovativo foi aprovado! Assinatura ativada.
```

### Ao Rejeitar:
```
Para: {usuario.email}
Assunto: ❌ Comprovativo Rejeitado - RPA
Mensagem: Seu comprovativo foi rejeitado. Motivo: {obs_admin}
```

---

## 🔒 VALIDAÇÕES IMPORTANTES

### Endpoint 1 (Upload):
- ✅ Verificar autenticação
- ✅ Validar tipo de arquivo (PNG, JPG, PDF)
- ✅ Validar tamanho (máx 5MB)
- ✅ Campos obrigatórios: metodo_pagamento, valor_pago

### Endpoint 2 (Listar):
- ✅ Verificar se é admin
- ✅ Fazer JOIN com tabela usuarios
- ✅ Aceitar filtros via query params

### Endpoint 3 (Aprovar):
- ✅ Verificar se é admin
- ✅ Verificar se status = 'pendente'
- ✅ **ATIVAR ASSINATURA** (importante!)
- ✅ Usar transação (BEGIN...COMMIT)

### Endpoint 4 (Rejeitar):
- ✅ Verificar se é admin
- ✅ obs_admin é OBRIGATÓRIO
- ✅ Verificar se status = 'pendente'

### Endpoint 5 (Servir):
- ✅ Verificar permissões (dono OU admin)
- ✅ Verificar se arquivo existe

---

## 🧪 TESTE RÁPIDO COM POSTMAN

```bash
# 1. Upload
POST http://localhost:3000/api/pagamentos/comprovativo
Header: Authorization: Bearer {token}
Body: form-data (comprovativo, metodo_pagamento, valor_pago)

# 2. Listar (Admin)
GET http://localhost:3000/api/pagamentos/comprovativos
Header: Authorization: Bearer {admin_token}

# 3. Aprovar
POST http://localhost:3000/api/pagamentos/comprovativos/1/aprovar
Header: Authorization: Bearer {admin_token}
Body: { "obs_admin": "OK" }

# 4. Rejeitar
POST http://localhost:3000/api/pagamentos/comprovativos/2/rejeitar
Header: Authorization: Bearer {admin_token}
Body: { "obs_admin": "Ilegível" }
```

---

## ✅ CHECKLIST

- [ ] Criar tabela `comprovativos_pagamento`
- [ ] `npm install multer`
- [ ] Criar pasta `/uploads/comprovativos/`
- [ ] Endpoint 1: Upload ✅
- [ ] Endpoint 2: Listar ✅
- [ ] Endpoint 3: Aprovar ✅
- [ ] Endpoint 4: Rejeitar ✅
- [ ] Endpoint 5: Servir arquivo ✅
- [ ] Testar com Postman

---

## 🚨 ATENÇÃO

Ao **aprovar**, você DEVE ativar a assinatura do usuário:

```javascript
// Exemplo (ajuste conforme sua estrutura):
await db.query(
  `UPDATE usuarios 
   SET assinatura_ativa = true,
       assinatura_inicio = NOW(),
       assinatura_fim = DATE_ADD(NOW(), INTERVAL 30 DAY)
   WHERE id = ?`,
  [comprovativo.usuario_id]
);
```

---

**Frontend já está 100% pronto esperando esses endpoints!** 🚀
