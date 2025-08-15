const express = require('express');
const router = express.Router();
const Usuario = require('../models/Usuario');
const bcrypt = require('bcryptjs');
const { OAuth2Client } = require('google-auth-library');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Cadastro tradicional
router.post('/register', async (req, res) => {
  const { nome, email, senha, role } = req.body;
  if (!nome || !email || !senha) return res.status(400).json({ msg: 'Preencha todos os campos' });

  try {
    const existe = await Usuario.findOne({ where: { email } });
    if (existe) return res.status(400).json({ msg: 'Email já cadastrado' });

    const hash = await bcrypt.hash(senha, 10);
    const usuario = await Usuario.create({ nome, email, senha: hash, role });
    res.json({ user: usuario, msg: 'Usuário criado com sucesso!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Erro ao criar usuário' });
  }
});

// Login tradicional
router.post('/login', async (req, res) => {
  const { email, senha } = req.body;
  try {
    const usuario = await Usuario.findOne({ where: { email } });
    if (!usuario) return res.status(400).json({ msg: 'Usuário não encontrado' });

    if (!usuario.senha) return res.status(400).json({ msg: 'Faça login com Google' });

    const match = await bcrypt.compare(senha, usuario.senha);
    if (!match) return res.status(400).json({ msg: 'Senha incorreta' });

    res.json({ user: usuario, msg: 'Login realizado com sucesso!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Erro no login' });
  }
});

// Login / cadastro com Google
router.post('/google', async (req, res) => {
  try {
    const { token } = req.body;
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    const { email, name, picture } = payload;

    let usuario = await Usuario.findOne({ where: { email } });
    if (!usuario) {
      usuario = await Usuario.create({
        nome: name,
        email,
        foto: picture,
        senha: null,
        role: 'cliente'
      });
    }

    res.json({ user: usuario, msg: 'Login Google bem-sucedido' });
  } catch (err) {
    console.error(err);
    res.status(401).json({ msg: 'Token inválido' });
  }
});

module.exports = router;
