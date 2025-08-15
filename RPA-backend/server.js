const express = require('express');
const cors = require('cors');
const sequelize = require('./models/database');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Rotas
const authRoutes = require('./routes/auth');
app.use('/auth', authRoutes);

// Sincroniza modelos e inicia servidor
sequelize.sync()
  .then(() => console.log('Banco MySQL conectado e tabelas sincronizadas'))
  .catch(err => console.error(err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
