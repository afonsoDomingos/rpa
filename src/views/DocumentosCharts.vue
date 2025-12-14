<template>
  <div class="charts-wrapper">
    <div class="charts-container">
      <!-- Header Section -->
      <div class="section-header mb-5">
        <h2 class="section-title">
          <i class="bi bi-pie-chart-fill me-2"></i> Distribuição de Documentos
        </h2>
        <p class="section-subtitle">Análise visual dos documentos reportados por província e tipo</p>
      </div>

      <div v-if="documentos.length > 0" class="charts-grid">
        <!-- Gráfico de Província - Com design card moderno -->
        <div class="chart-card">
          <div class="chart-card-header">
            <div class="chart-icon purple">
              <i class="bi bi-geo-alt-fill"></i>
            </div>
            <div>
              <h3 class="chart-title">Por Província</h3>
              <p class="chart-description">Distribuição geográfica dos documentos</p>
            </div>
          </div>
          <div class="chart-body">
            <Bar :data="provinciaReportadaChartData" :options="chartOptionsBar" />
          </div>
          <div class="chart-stats">
            <div class="stat-item">
              <span class="stat-label">Total</span>
              <span class="stat-value">{{ totalReportados }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Províncias</span>
              <span class="stat-value">{{ totalProvincias }}</span>
            </div>
          </div>
        </div>

        <!-- Gráfico de Tipo - Design com Doughnut moderno -->
        <div class="chart-card">
          <div class="chart-card-header">
            <div class="chart-icon green">
              <i class="bi bi-file-earmark-text-fill"></i>
            </div>
            <div>
              <h3 class="chart-title">Por Tipo de Documento</h3>
              <p class="chart-description">Categorização dos documentos reportados</p>
            </div>
          </div>
          <div class="chart-body doughnut">
            <Doughnut :data="tipoDocumentoReportadoChartData" :options="chartOptionsDoughnut" />
          </div>
          <div class="chart-stats">
            <div class="stat-item">
              <span class="stat-label">Categorias</span>
              <span class="stat-value">{{ totalTipos }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Mais Comum</span>
              <span class="stat-value-small">{{ tipoMaisComum }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Estado vazio -->
      <div v-else class="empty-state">
        <i class="bi bi-inbox empty-icon"></i>
        <h4>Nenhum Documento Disponível</h4>
        <p>Os gráficos aparecerão quando houver documentos reportados no sistema.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import api from "@/api";
import { Bar, Doughnut } from "vue-chartjs";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  ArcElement,
  CategoryScale,
  LinearScale,
} from "chart.js";

ChartJS.register(Title, Tooltip, Legend, BarElement, ArcElement, CategoryScale, LinearScale);

const documentos = ref([]);

onMounted(async () => {
  try {
    const { data } = await api.get("/documentos");
    documentos.value = data;
  } catch (error) {
    console.error("Erro ao carregar os documentos:", error);
  }
});

// Stats computados
const totalReportados = computed(() => {
  return documentos.value.filter(doc => doc.origem === "reportado").length;
});

const totalProvincias = computed(() => {
  const provincias = new Set(
    documentos.value.filter(doc => doc.origem === "reportado").map(doc => doc.provincia)
  );
  return provincias.size;
});

const totalTipos = computed(() => {
  const tipos = new Set(
    documentos.value.filter(doc => doc.origem === "reportado").map(doc => doc.tipo_documento)
  );
  return tipos.size;
});

const tipoMaisComum = computed(() => {
  const contagem = documentos.value
    .filter(doc => doc.origem === "reportado")
    .reduce((acc, doc) => {
      const tipo = doc.tipo_documento || "Não especificado";
      acc[tipo] = (acc[tipo] || 0) + 1;
      return acc;
    }, {});
  
  const arr = Object.entries(contagem);
  if (arr.length === 0) return "N/A";
  
  const [tipo] = arr.reduce((a, b) => (a[1] > b[1] ? a : b));
  return tipo.length > 15 ? tipo.substring(0, 15) + "..." : tipo;
});

// Gráfico de Província (Bar)
const provinciaReportadaChartData = computed(() => {
  const contagemPorProvincia = documentos.value.reduce((acc, doc) => {
    if (doc.origem === "reportado") {
      const prov = doc.provincia || "Não especificado";
      acc[prov] = (acc[prov] || 0) + 1;
    }
    return acc;
  }, {});

  return {
    labels: Object.keys(contagemPorProvincia),
    datasets: [
      {
        label: "Documentos",
        data: Object.values(contagemPorProvincia),
        backgroundColor: "rgba(128, 0, 128, 0.8)", // Roxo
        borderColor: "#800080",
        borderWidth: 2,
        borderRadius: 8,
        hoverBackgroundColor: "rgba(128, 0, 128, 1)",
      },
    ],
  };
});

// Gráfico de Tipo (Doughnut)
const tipoDocumentoReportadoChartData = computed(() => {
  const contagemPorTipo = documentos.value.reduce((acc, doc) => {
    if (doc.origem === "reportado") {
      const tipo = doc.tipo_documento || "Não especificado";
      acc[tipo] = (acc[tipo] || 0) + 1;
    }
    return acc;
  }, {});

  // Cores vibrantes para o Doughnut
  const colors = [
    "rgba(128, 0, 128, 0.9)", // Roxo
    "rgba(76, 175, 80, 0.9)", // Verde
    "rgba(255, 152, 0, 0.9)", // Laranja
    "rgba(33, 150, 243, 0.9)", // Azul
    "rgba(244, 67, 54, 0.9)", // Vermelho
    "rgba(156, 39, 176, 0.9)", // Roxo claro
    "rgba(0, 188, 212, 0.9)", // Ciano
    "rgba(255, 193, 7, 0.9)", // Amarelo
  ];

  return {
    labels: Object.keys(contagemPorTipo),
    datasets: [
      {
        data: Object.values(contagemPorTipo),
        backgroundColor: colors,
        borderColor: "#ffffff",
        borderWidth: 3,
        hoverOffset: 15,
      },
    ],
  };
});

// Opções para Bar Chart
const chartOptionsBar = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      backgroundColor: "rgba(0, 0, 0, 0.8)",
      padding: 12,
      titleFont: {
        family: "Poppins",
        size: 14,
        weight: "bold",
      },
      bodyFont: {
        family: "Poppins",
        size: 13,
      },
      callbacks: {
        label: (context) => ` ${context.parsed.y} documento(s)`,
      },
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        font: {
          family: "Poppins",
          size: 12,
        },
        color: "#666",
      },
      grid: {
        color: "rgba(0, 0, 0, 0.05)",
      },
    },
    x: {
      ticks: {
        font: {
          family: "Poppins",
          size: 11,
          weight: "600",
        },
        color: "#666",
      },
      grid: {
        display: false,
      },
    },
  },
  animation: {
    duration: 1500,
    easing: "easeInOutQuart",
  },
};

// Opções para Doughnut Chart
const chartOptionsDoughnut = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: "70%",
  plugins: {
    legend: {
      position: "bottom",
      labels: {
        font: {
          family: "Poppins",
          size: 11,
          weight: "600",
        },
        padding: 15,
        usePointStyle: true,
        pointStyle: "circle",
      },
    },
    tooltip: {
      backgroundColor: "rgba(0, 0, 0, 0.8)",
      padding: 12,
      titleFont: {
        family: "Poppins",
        size: 14,
        weight: "bold",
      },
      bodyFont: {
        family: "Poppins",
        size: 13,
      },
      callbacks: {
        label: (context) => ` ${context.label}: ${context.parsed} documento(s)`,
      },
    },
  },
  animation: {
    animateRotate: true,
    animateScale: true,
    duration: 2000,
    easing: "easeInOutElastic",
  },
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700;900&display=swap');
@import url("https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css");

.charts-wrapper {
  width: 100%;
  background-color: #ffffff;
  padding: 3rem 0;
}

.charts-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  font-family: 'Poppins', sans-serif;
}

.section-header {
  text-align: center;
}

.section-title {
  font-family: 'Poppins', sans-serif;
  font-weight: 900;
  color: #800080;
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.section-subtitle {
  font-family: 'Poppins', sans-serif;
  font-weight: 400;
  color: #6c757d;
  font-size: 1rem;
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
  gap: 2rem;
}

.chart-card {
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  transition: all 0.3s ease;
  border: 1px solid #e0e0e0;
}

.chart-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 30px rgba(128, 0, 128, 0.15);
}

.chart-card-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  border-bottom: 1px solid #e0e0e0;
}

.chart-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
  flex-shrink: 0;
}

.chart-icon.purple {
  background: linear-gradient(135deg, #800080 0%, #6a006a 100%);
}

.chart-icon.green {
  background: linear-gradient(135deg, #4CAF50 0%, #388E3C 100%);
}

.chart-title {
  font-family: 'Poppins', sans-serif;
  font-weight: 700;
  font-size: 1.25rem;
  color: #212529;
  margin: 0;
}

.chart-description {
  font-family: 'Poppins', sans-serif;
  font-size: 0.875rem;
  color: #6c757d;
  margin: 0;
}

.chart-body {
  padding: 2rem;
  height: 350px;
}

.chart-body.doughnut {
  padding: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chart-stats {
  display: flex;
  justify-content: space-around;
  padding: 1.25rem;
  background: #f8f9fa;
  border-top: 1px solid #e0e0e0;
}

.stat-item {
  text-align: center;
}

.stat-label {
  display: block;
  font-family: 'Poppins', sans-serif;
  font-size: 0.75rem;
  font-weight: 600;
  color: #6c757d;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0.25rem;
}

.stat-value {
  display: block;
  font-family: 'Poppins', sans-serif;
  font-size: 1.75rem;
  font-weight: 900;
  color: #800080;
}

.stat-value-small {
  display: block;
  font-family: 'Poppins', sans-serif;
  font-size: 1rem;
  font-weight: 700;
  color: #4CAF50;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background: #f8f9fa;
  border-radius: 16px;
  border: 2px dashed #dee2e6;
}

.empty-icon {
  font-size: 4rem;
  color: #dee2e6;
  margin-bottom: 1rem;
}

.empty-state h4 {
  font-family: 'Poppins', sans-serif;
  font-weight: 700;
  color: #495057;
  margin-bottom: 0.5rem;
}

.empty-state p {
  font-family: 'Poppins', sans-serif;
  color: #6c757d;
}

/* Responsive */
@media (max-width: 1100px) {
  .charts-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .section-title {
    font-size: 1.5rem;
  }

  .charts-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .chart-card-header {
    flex-direction: column;
    text-align: center;
  }

  .chart-body {
    height: 300px;
    padding: 1rem;
  }
}
</style>
