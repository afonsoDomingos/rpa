# 🔧 PROMPT PARA BACKEND - Sistema de Comprovativos de Pagamento

## 📋 CONTEXTO

Preciso implementar um sistema completo de gestão de comprovativos de pagamento no backend da aplicação RPA (Recupera Aqui). O frontend já está 100% implementado e funcional. Agora preciso criar os endpoints e a lógica de backend para suportar:

1. Upload de comprovativos pelos usuários
2. Listagem de comprovativos para administradores
3. Aprovação de comprovativos
4. Rejeição de comprovativos
5. Notificações automáticas

---

## 🎯 REQUISITOS TÉCNICOS

### Stack:
- **Backend:** Node.js + Express.js
- **Banco de Dados:** MySQL/PostgreSQL
- **Upload:** Multer
- **Autenticação:** JWT (já implementado)
- **Notificações:** Email (nodemailer) ou push notifications

---

## 📊 1. CRIAR TABELA NO BANCO DE DADOS

### SQL Schema:

```sql
CREATE TABLE comprovativos_pagamento (
  id INT PRIMARY KEY AUTO_INCREMENT,
  
  -- Informações do usuário
  usuario_id INT NOT NULL,
  
  -- Dados do pagamento
  metodo_pagamento VARCHAR(50) NOT NULL,
  valor_pago DECIMAL(10,2) NOT NULL,
  referencia VARCHAR(100),
  observacoes TEXT,
  tipo VARCHAR(50) DEFAULT 'assinatura',
  
  -- Arquivo
  arquivo_path VARCHAR(255) NOT NULL,
  arquivo_original VARCHAR(255) NOT NULL,
  arquivo_tamanho INT,
  arquivo_tipo VARCHAR(50),
  
  -- Status e validação
  status ENUM('pendente', 'aprovado', 'rejeitado') DEFAULT 'pendente',
  obs_admin TEXT,
  admin_responsavel VARCHAR(100),
  admin_id INT,
  
  -- Datas
  data_envio DATETIME DEFAULT CURRENT_TIMESTAMP,
  data_validacao DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Foreign Keys
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (admin_id) REFERENCES usuarios(id) ON DELETE SET NULL,
  
  -- Índices para performance
  INDEX idx_status (status),
  INDEX idx_usuario (usuario_id),
  INDEX idx_data_envio (data_envio),
  INDEX idx_metodo (metodo_pagamento)
);
```

---

## 🔌 2. ENDPOINTS A IMPLEMENTAR

### **Endpoint 1: Upload de Comprovativo (Usuário)**

```javascript
/**
 * POST /api/pagamentos/comprovativo
 * 
 * Descrição: Permite que usuários autenticados enviem comprovativos de pagamento
 * Autenticação: Obrigatória (JWT)
 * Permissões: Usuário autenticado
 * Content-Type: multipart/form-data
 */

// REQUEST
{
  // FormData fields:
  comprovativo: File,              // Arquivo (PNG, JPG, JPEG, PDF)
  metodo_pagamento: String,        // "M-Pesa" | "Emola" | "NIB BIM" | "PayPal"
  valor_pago: Number,              // Exemplo: 150
  referencia: String,              // Opcional: "MP12345678"
  observacoes: String,             // Opcional: "Pagamento do plano mensal"
  tipo: String                     // "assinatura" | "documento" | "outro"
}

// RESPONSE SUCCESS (201)
{
  "sucesso": true,
  "mensagem": "Comprovativo recebido com sucesso!",
  "comprovativo": {
    "id": 123,
    "usuario_id": 456,
    "status": "pendente",
    "data_envio": "2026-01-03T14:00:00Z"
  }
}

// RESPONSE ERROR (400)
{
  "sucesso": false,
  "mensagem": "Arquivo inválido. Use PNG, JPG ou PDF."
}

// VALIDAÇÕES OBRIGATÓRIAS:
// ✅ Verificar autenticação (JWT válido)
// ✅ Validar tipo de arquivo (PNG, JPG, JPEG, PDF)
// ✅ Validar tamanho máximo (5MB)
// ✅ Validar campos obrigatórios (metodo_pagamento, valor_pago)
// ✅ Sanitizar inputs (prevenir SQL injection, XSS)
// ✅ Renomear arquivo para evitar conflitos: {timestamp}_{userId}_{random}.{ext}
// ✅ Salvar arquivo em: /uploads/comprovativos/
// ✅ Salvar registro no banco de dados
// ✅ Notificar admins sobre novo comprovativo (opcional mas recomendado)
```

**Exemplo de implementação com Multer:**

```javascript
const multer = require('multer');
const path = require('path');

// Configuração do Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/comprovativos/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}_${req.user.id}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|pdf/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (mimetype && extname) {
    return cb(null, true);
  }
  cb(new Error('Apenas PNG, JPG e PDF são permitidos'));
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: fileFilter
});

// Route
router.post('/comprovativo', 
  authMiddleware, // Verificar JWT
  upload.single('comprovativo'),
  async (req, res) => {
    try {
      const { metodo_pagamento, valor_pago, referencia, observacoes, tipo } = req.body;
      
      // Validações
      if (!metodo_pagamento || !valor_pago) {
        return res.status(400).json({
          sucesso: false,
          mensagem: 'Campos obrigatórios faltando'
        });
      }
      
      // Salvar no BD
      const result = await db.query(
        `INSERT INTO comprovativos_pagamento 
         (usuario_id, metodo_pagamento, valor_pago, referencia, observacoes, tipo, 
          arquivo_path, arquivo_original, arquivo_tamanho, arquivo_tipo) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          req.user.id,
          metodo_pagamento,
          valor_pago,
          referencia || null,
          observacoes || null,
          tipo || 'assinatura',
          req.file.filename,
          req.file.originalname,
          req.file.size,
          req.file.mimetype
        ]
      );
      
      // Notificar admins (opcional)
      await notificarAdmins({
        tipo: 'novo_comprovativo',
        usuario: req.user.nome,
        valor: valor_pago
      });
      
      res.status(201).json({
        sucesso: true,
        mensagem: 'Comprovativo recebido com sucesso!',
        comprovativo: {
          id: result.insertId,
          usuario_id: req.user.id,
          status: 'pendente',
          data_envio: new Date()
        }
      });
      
    } catch (error) {
      console.error('Erro ao processar comprovativo:', error);
      res.status(500).json({
        sucesso: false,
        mensagem: 'Erro ao processar comprovativo'
      });
    }
  }
);
```

---

### **Endpoint 2: Listar Comprovativos (Admin)**

```javascript
/**
 * GET /api/pagamentos/comprovativos
 * 
 * Descrição: Lista todos os comprovativos para administradores
 * Autenticação: Obrigatória (JWT)
 * Permissões: Admin ou SuperAdmin
 * Query Params: status, metodo, page, limit
 */

// REQUEST
GET /api/pagamentos/comprovativos?status=pendente&metodo=M-Pesa&page=1&limit=50

// RESPONSE (200)
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
      "valor_pago": 150.00,
      "referencia": "MP12345678",
      "observacoes": "Pagamento do plano mensal",
      "arquivo_path": "1704294000_456_a8f9d2c1.jpg",
      "arquivo_original": "comprovativo.jpg",
      "arquivo_tamanho": 245678,
      "arquivo_tipo": "image/jpeg",
      "status": "pendente",
      "tipo": "assinatura",
      "obs_admin": null,
      "admin_responsavel": null,
      "admin_id": null,
      "data_envio": "2026-01-03T13:45:00Z",
      "data_validacao": null
    }
  ],
  "paginacao": {
    "total": 150,
    "pagina": 1,
    "limite": 50,
    "totalPaginas": 3
  },
  "estatisticas": {
    "pendentes": 15,
    "aprovados": 42,
    "rejeitados": 3,
    "total": 60
  }
}

// VALIDAÇÕES:
// ✅ Verificar se usuário é admin ou superadmin
// ✅ Aceitar filtros: status, metodo_pagamento
// ✅ Implementar paginação
// ✅ Incluir JOIN com tabela usuarios para pegar dados do usuário
// ✅ Ordenar por data_envio DESC (mais recentes primeiro)
// ✅ Incluir estatísticas gerais
```

**Exemplo de implementação:**

```javascript
router.get('/comprovativos',
  authMiddleware,
  adminMiddleware, // Verificar se é admin
  async (req, res) => {
    try {
      const { status, metodo, page = 1, limit = 50 } = req.query;
      const offset = (page - 1) * limit;
      
      // Query base
      let query = `
        SELECT 
          c.*,
          u.nome as usuario_nome,
          u.email as usuario_email,
          a.nome as admin_nome
        FROM comprovativos_pagamento c
        LEFT JOIN usuarios u ON c.usuario_id = u.id
        LEFT JOIN usuarios a ON c.admin_id = a.id
        WHERE 1=1
      `;
      
      const params = [];
      
      // Filtros
      if (status && status !== 'todos') {
        query += ' AND c.status = ?';
        params.push(status);
      }
      
      if (metodo && metodo !== 'todos') {
        query += ' AND c.metodo_pagamento = ?';
        params.push(metodo);
      }
      
      // Ordenação e paginação
      query += ' ORDER BY c.data_envio DESC LIMIT ? OFFSET ?';
      params.push(parseInt(limit), offset);
      
      const comprovativos = await db.query(query, params);
      
      // Estatísticas
      const stats = await db.query(`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN status = 'pendente' THEN 1 ELSE 0 END) as pendentes,
          SUM(CASE WHEN status = 'aprovado' THEN 1 ELSE 0 END) as aprovados,
          SUM(CASE WHEN status = 'rejeitado' THEN 1 ELSE 0 END) as rejeitados
        FROM comprovativos_pagamento
      `);
      
      // Formatar resposta
      const resultado = comprovativos.map(c => ({
        ...c,
        usuario: {
          id: c.usuario_id,
          nome: c.usuario_nome,
          email: c.usuario_email
        },
        admin_responsavel: c.admin_nome
      }));
      
      res.json({
        sucesso: true,
        comprovativos: resultado,
        paginacao: {
          total: stats[0].total,
          pagina: parseInt(page),
          limite: parseInt(limit),
          totalPaginas: Math.ceil(stats[0].total / limit)
        },
        estatisticas: stats[0]
      });
      
    } catch (error) {
      console.error('Erro ao listar comprovativos:', error);
      res.status(500).json({
        sucesso: false,
        mensagem: 'Erro ao listar comprovativos'
      });
    }
  }
);
```

---

### **Endpoint 3: Aprovar Comprovativo (Admin)**

```javascript
/**
 * POST /api/pagamentos/comprovativos/:id/aprovar
 * 
 * Descrição: Aprova um comprovativo e ativa a assinatura do usuário
 * Autenticação: Obrigatória (JWT)
 * Permissões: Admin ou SuperAdmin
 */

// REQUEST
POST /api/pagamentos/comprovativos/123/aprovar
{
  "obs_admin": "Comprovativo válido. Assinatura ativada."  // Opcional
}

// RESPONSE (200)
{
  "sucesso": true,
  "mensagem": "Comprovativo aprovado com sucesso"
}

// AÇÕES OBRIGATÓRIAS:
// 1. ✅ Verificar se comprovativo existe
// 2. ✅ Verificar se status é "pendente" (não pode aprovar já aprovado/rejeitado)
// 3. ✅ Atualizar status para "aprovado"
// 4. ✅ Registrar admin_id e admin_responsavel
// 5. ✅ Salvar obs_admin se fornecida
// 6. ✅ Atualizar data_validacao
// 7. ✅ ATIVAR ASSINATURA DO USUÁRIO (tabela usuarios ou assinaturas)
// 8. ✅ Enviar notificação ao usuário (email/push)
```

**Exemplo de implementação:**

```javascript
router.post('/comprovativos/:id/aprovar',
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { obs_admin } = req.body;
      
      // Buscar comprovativo
      const [comprovativo] = await db.query(
        'SELECT * FROM comprovativos_pagamento WHERE id = ?',
        [id]
      );
      
      if (!comprovativo) {
        return res.status(404).json({
          sucesso: false,
          mensagem: 'Comprovativo não encontrado'
        });
      }
      
      if (comprovativo.status !== 'pendente') {
        return res.status(400).json({
          sucesso: false,
          mensagem: 'Comprovativo já foi processado'
        });
      }
      
      // Iniciar transação
      await db.beginTransaction();
      
      try {
        // Atualizar comprovativo
        await db.query(
          `UPDATE comprovativos_pagamento 
           SET status = 'aprovado',
               admin_id = ?,
               admin_responsavel = ?,
               obs_admin = ?,
               data_validacao = NOW()
           WHERE id = ?`,
          [req.user.id, req.user.nome, obs_admin || null, id]
        );
        
        // ATIVAR ASSINATURA (ajustar conforme sua estrutura)
        await db.query(
          `UPDATE usuarios 
           SET assinatura_ativa = true,
               assinatura_inicio = NOW(),
               assinatura_fim = DATE_ADD(NOW(), INTERVAL 30 DAY)
           WHERE id = ?`,
          [comprovativo.usuario_id]
        );
        
        // Commit
        await db.commit();
        
        // Enviar notificação ao usuário
        await enviarNotificacao({
          usuario_id: comprovativo.usuario_id,
          tipo: 'comprovativo_aprovado',
          titulo: 'Pagamento Confirmado!',
          mensagem: 'Seu comprovativo foi aprovado. Sua assinatura está ativa!'
        });
        
        res.json({
          sucesso: true,
          mensagem: 'Comprovativo aprovado com sucesso'
        });
        
      } catch (error) {
        await db.rollback();
        throw error;
      }
      
    } catch (error) {
      console.error('Erro ao aprovar comprovativo:', error);
      res.status(500).json({
        sucesso: false,
        mensagem: 'Erro ao aprovar comprovativo'
      });
    }
  }
);
```

---

### **Endpoint 4: Rejeitar Comprovativo (Admin)**

```javascript
/**
 * POST /api/pagamentos/comprovativos/:id/rejeitar
 * 
 * Descrição: Rejeita um comprovativo e notifica o usuário com o motivo
 * Autenticação: Obrigatória (JWT)
 * Permissões: Admin ou SuperAdmin
 */

// REQUEST
POST /api/pagamentos/comprovativos/123/rejeitar
{
  "obs_admin": "Comprovativo ilegível. Por favor, envie novamente com melhor qualidade."  // OBRIGATÓRIO
}

// RESPONSE (200)
{
  "sucesso": true,
  "mensagem": "Comprovativo rejeitado"
}

// VALIDAÇÕES:
// ✅ obs_admin é OBRIGATÓRIO (motivo da rejeição)
// ✅ Verificar se comprovativo existe
// ✅ Verificar se status é "pendente"
// ✅ Atualizar status para "rejeitado"
// ✅ Salvar motivo da rejeição
// ✅ NÃO ativar assinatura
// ✅ Notificar usuário com o motivo
```

**Exemplo de implementação:**

```javascript
router.post('/comprovativos/:id/rejeitar',
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { obs_admin } = req.body;
      
      // Validar motivo
      if (!obs_admin || obs_admin.trim() === '') {
        return res.status(400).json({
          sucesso: false,
          mensagem: 'Motivo da rejeição é obrigatório'
        });
      }
      
      // Buscar comprovativo
      const [comprovativo] = await db.query(
        'SELECT * FROM comprovativos_pagamento WHERE id = ?',
        [id]
      );
      
      if (!comprovativo) {
        return res.status(404).json({
          sucesso: false,
          mensagem: 'Comprovativo não encontrado'
        });
      }
      
      if (comprovativo.status !== 'pendente') {
        return res.status(400).json({
          sucesso: false,
          mensagem: 'Comprovativo já foi processado'
        });
      }
      
      // Atualizar comprovativo
      await db.query(
        `UPDATE comprovativos_pagamento 
         SET status = 'rejeitado',
             admin_id = ?,
             admin_responsavel = ?,
             obs_admin = ?,
             data_validacao = NOW()
         WHERE id = ?`,
        [req.user.id, req.user.nome, obs_admin, id]
      );
      
      // Enviar notificação ao usuário com o motivo
      await enviarNotificacao({
        usuario_id: comprovativo.usuario_id,
        tipo: 'comprovativo_rejeitado',
        titulo: 'Comprovativo Rejeitado',
        mensagem: `Seu comprovativo foi rejeitado. Motivo: ${obs_admin}`,
        motivo: obs_admin
      });
      
      res.json({
        sucesso: true,
        mensagem: 'Comprovativo rejeitado'
      });
      
    } catch (error) {
      console.error('Erro ao rejeitar comprovativo:', error);
      res.status(500).json({
        sucesso: false,
        mensagem: 'Erro ao rejeitar comprovativo'
      });
    }
  }
);
```

---

### **Endpoint 5 (Opcional): Servir Arquivos**

```javascript
/**
 * GET /api/uploads/:filename
 * 
 * Descrição: Serve arquivos de comprovativo (imagens/PDFs)
 * Autenticação: Obrigatória
 * Permissões: Usuário deve ser dono do arquivo ou admin
 */

router.get('/uploads/:filename',
  authMiddleware,
  async (req, res) => {
    try {
      const { filename } = req.params;
      const filepath = path.join(__dirname, '../uploads/comprovativos/', filename);
      
      // Verificar se arquivo existe
      if (!fs.existsSync(filepath)) {
        return res.status(404).json({
          sucesso: false,
          mensagem: 'Arquivo não encontrado'
        });
      }
      
      // Verificar permissões (opcional mas recomendado)
      const [comprovativo] = await db.query(
        'SELECT usuario_id FROM comprovativos_pagamento WHERE arquivo_path = ?',
        [filename]
      );
      
      if (!comprovativo) {
        return res.status(404).json({
          sucesso: false,
          mensagem: 'Comprovativo não encontrado'
        });
      }
      
      // Permitir se: dono do arquivo OU admin
      const isOwner = comprovativo.usuario_id === req.user.id;
      const isAdmin = ['admin', 'SuperAdmin'].includes(req.user.role);
      
      if (!isOwner && !isAdmin) {
        return res.status(403).json({
          sucesso: false,
          mensagem: 'Sem permissão para acessar este arquivo'
        });
      }
      
      // Servir arquivo
      res.sendFile(filepath);
      
    } catch (error) {
      console.error('Erro ao servir arquivo:', error);
      res.status(500).json({
        sucesso: false,
        mensagem: 'Erro ao carregar arquivo'
      });
    }
  }
);
```

---

## 📧 3. SISTEMA DE NOTIFICAÇÕES

### Função auxiliar para enviar notificações:

```javascript
async function enviarNotificacao({ usuario_id, tipo, titulo, mensagem, motivo }) {
  try {
    // Buscar dados do usuário
    const [usuario] = await db.query(
      'SELECT nome, email FROM usuarios WHERE id = ?',
      [usuario_id]
    );
    
    if (!usuario) return;
    
    // Email
    if (tipo === 'comprovativo_aprovado') {
      await enviarEmail({
        to: usuario.email,
        subject: '✅ Pagamento Confirmado - RPA',
        html: `
          <h2>Olá ${usuario.nome}!</h2>
          <p>Seu comprovativo de pagamento foi <strong>aprovado</strong>!</p>
          <p>Sua assinatura está agora <strong>ativa</strong> e você pode aproveitar todos os benefícios.</p>
          <p>Obrigado por escolher o RPA!</p>
          <a href="https://recuperaaqui.vercel.app/dashboard">Acessar Dashboard</a>
        `
      });
    }
    
    if (tipo === 'comprovativo_rejeitado') {
      await enviarEmail({
        to: usuario.email,
        subject: '❌ Comprovativo Rejeitado - RPA',
        html: `
          <h2>Olá ${usuario.nome}!</h2>
          <p>Infelizmente, seu comprovativo de pagamento foi <strong>rejeitado</strong>.</p>
          <p><strong>Motivo:</strong> ${motivo}</p>
          <p>Por favor, envie um novo comprovativo corrigindo o problema mencionado.</p>
          <a href="https://recuperaaqui.vercel.app/assinaturas">Enviar Novo Comprovativo</a>
        `
      });
    }
    
    // Push notification (se implementado)
    // await enviarPushNotification(usuario_id, titulo, mensagem);
    
  } catch (error) {
    console.error('Erro ao enviar notificação:', error);
  }
}

// Notificar admins sobre novo comprovativo
async function notificarAdmins({ tipo, usuario, valor }) {
  try {
    const admins = await db.query(
      "SELECT email FROM usuarios WHERE role IN ('admin', 'SuperAdmin')"
    );
    
    for (const admin of admins) {
      await enviarEmail({
        to: admin.email,
        subject: '🔔 Novo Comprovativo de Pagamento - RPA Admin',
        html: `
          <h3>Novo Comprovativo Recebido</h3>
          <p><strong>Usuário:</strong> ${usuario}</p>
          <p><strong>Valor:</strong> ${valor} MZN</p>
          <p>Acesse o painel administrativo para validar.</p>
          <a href="https://recuperaaqui.vercel.app/admin/comprovativos">
            Ver Comprovativos Pendentes
          </a>
        `
      });
    }
  } catch (error) {
    console.error('Erro ao notificar admins:', error);
  }
}
```

---

## 🔒 4. MIDDLEWARES NECESSÁRIOS

### Auth Middleware (já deve existir):
```javascript
function authMiddleware(req, res, next) {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({
      sucesso: false,
      mensagem: 'Autenticação necessária'
    });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      sucesso: false,
      mensagem: 'Token inválido'
    });
  }
}
```

### Admin Middleware:
```javascript
function adminMiddleware(req, res, next) {
  if (!['admin', 'SuperAdmin'].includes(req.user.role)) {
    return res.status(403).json({
      sucesso: false,
      mensagem: 'Acesso negado. Permissões de admin necessárias.'
    });
  }
  next();
}
```

---

## 📁 5. ESTRUTURA DE PASTAS

```
backend/
├── routes/
│   └── pagamentos.js          # Todas as rotas de comprovativos
├── middlewares/
│   ├── auth.js                # authMiddleware
│   ├── admin.js               # adminMiddleware
│   └── upload.js              # Configuração Multer
├── utils/
│   ├── email.js               # enviarEmail()
│   └── notifications.js       # enviarNotificacao()
├── uploads/
│   └── comprovativos/         # Pasta para arquivos
└── app.js                     # Registrar rotas
```

---

## ✅ CHECKLIST DE IMPLEMENTAÇÃO

### Banco de Dados:
- [ ] Criar tabela `comprovativos_pagamento`
- [ ] Criar índices para performance
- [ ] Testar conexão e queries

### Upload:
- [ ] Instalar multer: `npm install multer`
- [ ] Configurar storage e fileFilter
- [ ] Criar pasta `/uploads/comprovativos/`
- [ ] Testar upload de arquivo

### Endpoints:
- [ ] POST /pagamentos/comprovativo (upload)
- [ ] GET /pagamentos/comprovativos (listar)
- [ ] POST /pagamentos/comprovativos/:id/aprovar
- [ ] POST /pagamentos/comprovativos/:id/rejeitar
- [ ] GET /uploads/:filename (servir arquivo)

### Notificações:
- [ ] Instalar nodemailer: `npm install nodemailer`
- [ ] Configurar SMTP (Gmail, SendGrid, etc)
- [ ] Criar função enviarEmail()
- [ ] Criar função enviarNotificacao()
- [ ] Testar envio de emails

### Middlewares:
- [ ] Verificar authMiddleware existe
- [ ] Criar adminMiddleware
- [ ] Configurar multer middleware

### Testes:
- [ ] Testar upload com Postman/Insomnia
- [ ] Testar listagem com filtros
- [ ] Testar aprovação
- [ ] Testar rejeição
- [ ] Testar notificações

---

## 🧪 TESTES COM POSTMAN

### 1. Upload de Comprovativo
```
POST http://localhost:3000/api/pagamentos/comprovativo
Headers:
  Authorization: Bearer {token}
  Content-Type: multipart/form-data

Body (form-data):
  comprovativo: [selecionar arquivo]
  metodo_pagamento: M-Pesa
  valor_pago: 150
  referencia: MP12345678
  observacoes: Pagamento teste
  tipo: assinatura
```

### 2. Listar Comprovativos (Admin)
```
GET http://localhost:3000/api/pagamentos/comprovativos?status=pendente&page=1
Headers:
  Authorization: Bearer {admin_token}
```

### 3. Aprovar
```
POST http://localhost:3000/api/pagamentos/comprovativos/1/aprovar
Headers:
  Authorization: Bearer {admin_token}
  Content-Type: application/json

Body:
{
  "obs_admin": "Aprovado"
}
```

### 4. Rejeitar
```
POST http://localhost:3000/api/pagamentos/comprovativos/2/rejeitar
Headers:
  Authorization: Bearer {admin_token}
  Content-Type: application/json

Body:
{
  "obs_admin": "Comprovativo ilegível"
}
```

---

## 🚨 SEGURANÇA

### Validações Obrigatórias:
1. ✅ Verificar autenticação em TODAS as rotas
2. ✅ Validar role de admin nas rotas administrativas
3. ✅ Sanitizar todos os inputs (prevenir SQL injection)
4. ✅ Validar tipo e tamanho de arquivo
5. ✅ Renomear arquivos para evitar conflitos
6. ✅ Usar transações para aprovar (BD + atualizar assinatura)
7. ✅ Verificar permissões ao servir arquivos

---

## 📞 SUPORTE

Se tiver dúvidas durante a implementação:
1. Verifique os logs do console
2. Teste cada endpoint individualmente
3. Use Postman para validar requests/responses
4. Verifique se a tabela foi criada corretamente

**Frontend já está 100% implementado e esperando esses endpoints!**

Boa implementação! 🚀
