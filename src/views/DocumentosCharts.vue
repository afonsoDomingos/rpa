<template>
  <!-- Exibindo os Gráficos em Linhas Separadas e Centralizados -->
  <div v-if="documentos.length > 0" class="charts-container">
    <!-- Gráfico de Documentos Reportados por Província -->
    <div class="chart-item">
      <Bar :data="provinciaReportadaChartData" :options="chartOptions" />
    </div>

    <!-- Gráfico de Documentos Reportados por Tipo -->
    <div class="chart-item">
      <Bar :data="tipoDocumentoReportadoChartData" :options="chartOptions" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import api from "@/api";
import { Bar } from "vue-chartjs";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
} from "chart.js";

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
);

const documentos = ref([]);

// Carregando documentos para o gráfico
onMounted(async () => {
  try {
    const { data } = await api.get("/documentos"); // Supondo que os dados vêm com 'provincia' e 'tipo_documento'
    documentos.value = data;
  } catch (error) {
    console.error("Erro ao carregar os documentos:", error);
  }
});

// Gráfico de Documentos Reportados por Província
const provinciaReportadaChartData = computed(() => {
  const contagemPorProvincia = documentos.value.reduce((acc, doc) => {
    if (doc.origem === "reportado") {
      // Apenas contando os reportados
      const prov = doc.provincia || "Não especificado";
      acc[prov] = (acc[prov] || 0) + 1;
    }
    return acc;
  }, {});

  return {
    labels: Object.keys(contagemPorProvincia),
    datasets: [
      {
        label: "Documentos Reportados por Província",
        data: Object.values(contagemPorProvincia),
        backgroundColor: "#800080", // Cor roxa para as barras
        borderColor: "#4CAF50", // Cor verde para a borda
        borderWidth: 2,
        hoverBackgroundColor: "#9B30B0", // Cor de hover mais suave para o roxo
        hoverBorderColor: "#388E3C", // Cor de borda de hover mais suave
        borderRadius: 5, // Barras com bordas arredondadas
      },
    ],
  };
});

// Gráfico de Documentos Reportados por Tipo
const tipoDocumentoReportadoChartData = computed(() => {
  const contagemPorTipo = documentos.value.reduce((acc, doc) => {
    if (doc.origem === "reportado") {
      // Apenas contando os reportados
      const tipo = doc.tipo_documento || "Não especificado";
      acc[tipo] = (acc[tipo] || 0) + 1;
    }
    return acc;
  }, {});

  return {
    labels: Object.keys(contagemPorTipo),
    datasets: [
      {
        label: "Documentos Reportados por Tipo",
        data: Object.values(contagemPorTipo),
        backgroundColor: "#4CAF50", // Cor verde para as barras
        borderColor: "#800080", // Cor roxa para a borda
        borderWidth: 2,
        hoverBackgroundColor: "#66BB6A", // Cor de hover mais suave para o verde
        hoverBorderColor: "#4C6F1F", // Cor de borda de hover mais suave
        borderRadius: 5, // Barras com bordas arredondadas
      },
    ],
  };
});

// Opções de Configuração do Gráfico
const chartOptions = {
  responsive: true,
  plugins: {
    legend: {
      position: "top",
      labels: {
        font: {
          family: "Arial, sans-serif",
          size: 14,
          weight: "bold",
        },
        padding: 20,
      },
    },
    title: {
      display: true,
      text: "Distribuição de Documentos Reportados",
      font: {
        family: "Arial, sans-serif",
        size: 18,
        weight: "bold",
      },
      padding: {
        bottom: 20,
      },
    },
  },
  maintainAspectRatio: false, // Permite controlar a altura do gráfico
  animation: {
    duration: 1000, // Duração da animação
    easing: "easeOutElastic", // Tipo de animação mais elástico
  },
};
</script>

<style scoped>
/* Layout para os gráficos com uma linha por gráfico e ocupando toda a largura */
.charts-container {
  display: flex;
  flex-direction: column; /* Coloca os gráficos em linhas separadas */
  align-items: center; /* Centraliza os gráficos horizontalmente */
  gap: 30px; /* Espaçamento entre os gráficos */
  padding: 30px;
  width: 100%; /* Garante que ocupe toda a largura da tela */
}

/* Estilo de cada gráfico */
.chart-item {
  width: 100%; /* O gráfico ocupa 100% da largura */
  height: 400px; /* Altura dos gráficos */
  display: flex;
  justify-content: center;
  align-items: center;
  background: #f4f6f9; /* Fundo suave para os gráficos */
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1); /* Sombra suave ao redor dos gráficos */
  transform: scale(0.95); /* Inicialmente um pouco menor para efeito de zoom */
  transition: transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out; /* Transições suaves */
}

/* Efeito de hover: ao passar o mouse, o gráfico vai aumentar */
.chart-item:hover {
  transform: scale(1); /* Aumenta o gráfico para o tamanho original */
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2); /* Sombra mais intensa ao passar o mouse */
}

/* Responsividade: ajuste de largura e altura para diferentes tamanhos de tela */
.chart-item canvas {
  width: 100% !important; /* Ocupa 100% da largura do contêiner */
  height: 100% !important; /* Ocupa 100% da altura do contêiner */
}
</style>
