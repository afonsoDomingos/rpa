<template>
    <div class="test-page">
      <div class="container">
        <h1 class="title">Página de Teste</h1>
        <p class="description">Este é um template de uma página de teste em Vue 3.</p>
        <p class="note">Aqui você pode verificar o funcionamento da aplicação e seus componentes.</p>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'TestPage',
  }
  </script>
  
  <style scoped>
  .test-page {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    background-color: #f0f0f0;
  }
  
  .container {
    text-align: center;
    background-color: #ffffff;
    padding: 40px;
    border-radius: 10px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    width: 80%;
    max-width: 600px;
  }
  
  .title {
    font-size: 36px;
    color: #333;
    font-weight: 600;
  }
  
  .description {
    font-size: 18px;
    color: #555;
    margin-top: 10px;
  }
  
  .note {
    font-size: 16px;
    color: #888;
    margin-top: 20px;
  }
  
  </style>
  