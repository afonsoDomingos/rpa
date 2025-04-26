<template>
  <div>
    <form @submit.prevent="fazerLogin">
      <input v-model="email" placeholder="Email" />
      <input v-model="senha" type="password" placeholder="Senha" />
      <button type="submit">Entrar</button>
    </form>
  </div>
</template>

<script>
export default {
  data() {
    return {
      email: '',
      senha: '',
      usuario: null
    };
  },
  methods: {
    async fazerLogin() {
      try {
        const resposta = await fetch('http://localhost:5000/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: this.email, senha: this.senha })
        });

        const dados = await resposta.json();

        if (resposta.ok) {
          // Salva token e dados do usuário no localStorage
          localStorage.setItem('token', dados.token);
          localStorage.setItem('usuario', JSON.stringify(dados.usuario));

          this.usuario = dados.usuario;

          // Redireciona com base na role
          this.$router.push(dados.redirectUrl);
        } else {
          alert(dados.msg || 'Erro no login');
        }
      } catch (err) {
        console.error('Erro na requisição:', err);
      }
    }
  },
  created() {
    // Tenta carregar usuário do localStorage se já estiver logado
    const usuarioSalvo = localStorage.getItem('usuario');
    if (usuarioSalvo) {
      this.usuario = JSON.parse(usuarioSalvo);
    }
  }
};
</script>
