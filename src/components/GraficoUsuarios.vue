<template>
  <div class="grafico-container p-4 bg-white rounded-4 shadow-sm mb-4">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <div>
        <h6 class="text-uppercase text-muted fw-bold small ls-1 mb-1">Crescimento de Usuários</h6>
        <h3 class="mw-bold text-dark font-poppins-black">{{ total }} <span class="text-success fs-6 fw-bold">+12%</span></h3>
      </div>
      <div class="p-2 bg-light rounded-circle text-success">
        <i class="bi bi-graph-up-arrow fs-5"></i>
      </div>
    </div>
    <div class="chart-wrapper">
      <Line :data="chartData" :options="chartOptions" />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'vue-chartjs';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const props = defineProps({
  total: {
    type: Number,
    default: 0
  }
});

// Dados mockados para ilustrar crescimento até chegar ao total atual (ou próximo)
const chartData = computed(() => {
  // Gera uma curva suave simulada
  const labels = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'];
  // Cria dados baseados no total pra parecer realista
  const base = Math.max(0, props.total - 5); 
  const data = [
    Math.max(0, base - 10), 
    Math.max(0, base - 8), 
    Math.max(0, base - 4), 
    Math.max(0, base - 2), 
    Math.max(0, base - 1), 
    props.total
  ];

  return {
    labels,
    datasets: [
      {
        label: 'Usuários Ativos',
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 400);
          gradient.addColorStop(0, 'rgba(76, 175, 80, 0.2)');
          gradient.addColorStop(1, 'rgba(76, 175, 80, 0.0)');
          return gradient;
        },
        borderColor: '#4caf50',
        pointBackgroundColor: '#ffffff',
        pointBorderColor: '#4caf50',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        data: data,
        fill: true,
        tension: 0.4
      }
    ]
  };
});

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      backgroundColor: '#1a1a1a',
      padding: 12,
      titleFont: { family: 'Poppins', size: 13 },
      bodyFont: { family: 'Poppins', size: 12 },
      displayColors: false,
      callbacks: {
        label: (context) => ` ${context.parsed.y} Usuários`
      }
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: {
        display: true,
        borderDash: [5, 5],
        color: '#f0f0f0'
      },
      ticks: {
        font: { family: 'Poppins' },
        color: '#9e9e9e'
      },
      border: { display: false }
    },
    x: {
      grid: { display: false },
      ticks: {
        font: { family: 'Poppins' },
        color: '#9e9e9e'
      },
      border: { display: false }
    }
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700;900&display=swap');

.font-poppins-black {
  font-family: 'Poppins', sans-serif;
  font-weight: 900;
}

.bg-white {
  background-color: #ffffff;
}

.chart-wrapper {
  height: 220px;
  width: 100%;
}

.ls-1 {
  letter-spacing: 1px;
}
</style>
