<template>
  <div>
    <NavBarAdministradorView />

    <div class="reportes-ventas-view">
      <!-- Contenido de Reportes -->
      <div class="container">
        <div class="card">
          
          <h1>Reportes de Ventas y Rendimiento</h1>

          <!-- Filtros -->
          <div class="filters">
            <select v-model="periodoSeleccionado">
              <option value="hoy">Hoy</option>
              <option value="semana">Esta Semana</option>
              <option value="mes" selected>Este Mes</option>
              <option value="trimestre">Últimos 3 Meses</option>
              <option value="anio">Año 2025</option>
            </select>
            <input type="date" v-model="fechaInicio">
            <span> - </span>
            <input type="date" v-model="fechaFin">
          </div>

          <!-- Métricas Principales -->
          <div class="metric-cards-grid">
            
            <div class="metric-card">
              <p class="title">💰 Ingresos Netos</p>
              <p class="value">$45,600 MXN</p>
              <p class="change positive">↑ +12% vs mes anterior</p>
            </div>

            <div class="metric-card">
              <p class="title">📦 Paquetes Vendidos</p>
              <p class="value white">23 paquetes</p>
              <p class="change neutral">→ 0% vs mes anterior</p>
            </div>

            <div class="metric-card">
              <p class="title">👥 Nuevos Clientes</p>
              <p class="value white">8 clientes</p>
              <p class="change negative">↓ -5% vs mes anterior</p>
            </div>

          </div>

          <!-- Gráficas -->
          <div class="charts-section">

            <div class="chart-box large">
              <h3>Ingresos Mensuales (Línea de Tiempo)</h3>
              <div class="line-chart-simulation"></div>
            </div>

            <div class="chart-box small">
              <h3>Distribución de Paquetes</h3>
              
              <div class="pie-chart-container">
                <div class="pie-chart"></div>

                <ul class="pie-chart-legend">
                  <li><span class="color-box blue"></span>Semanales (35%)</li>
                  <li><span class="color-box green"></span>Mensuales (30%)</li>
                  <li><span class="color-box purple"></span>Anuales (20%)</li>
                  <li><span class="color-box gray"></span>Individuales (15%)</li>
                </ul>
              </div>

            </div>
          </div>
          
          <!-- Tablas de Datos -->
          <div class="charts-section">
            
            <div class="chart-box large">
              <h3>Paquetes Próximos a Vencer (⚠️)</h3>
              <div class="list-header">
                <span style="width: 25%;">Cliente</span>
                <span style="width: 25%;">Paquete</span>
                <span style="width: 20%;">Vencimiento</span>
                <span style="width: 15%; text-align: center;">Clases</span>
                <span style="width: 15%; text-align: right;">Acción</span>
              </div>
              
              <div 
                v-for="paquete in paquetesPorVencer" 
                :key="paquete.id" 
                class="list-row"
              >
                <span style="width: 25%;">{{ paquete.cliente }}</span>
                <span style="width: 25%;">{{ paquete.tipo }}</span>
                <span :class="['fecha-vencimiento', paquete.urgente ? 'urgente' : 'warning']" style="width: 20%;">
                  {{ paquete.vencimiento }}
                </span>
                <span style="width: 15%; text-align: center;">{{ paquete.clasesRestantes }}</span>
                <span style="width: 15%; text-align: right;">
                  <button @click="contactarCliente(paquete.cliente)" class="action-btn">
                    📞 Contactar
                  </button>
                </span>
              </div>
            </div>
            
            <div class="chart-box small">
              <h3>Top Clientes (Total Gastado)</h3>
              <div class="list-header">
                <span>Cliente</span>
                <span style="text-align: right;">Gastado</span>
              </div>
              <div 
                v-for="(cliente, index) in topClientes" 
                :key="cliente.id" 
                class="list-row"
              >
                <span>{{ index + 1 }}. {{ cliente.nombre }}</span>
                <span :class="['monto', { 'destacado': index === 0 }]">
                  ${{ cliente.totalGastado.toLocaleString() }}
                </span>
              </div>
            </div>

          </div>

          <!-- Botones de Exportación -->
          <div class="export-buttons">
            <button @click="descargarPDF" class="btn-pdf">
              📄 Descargar Reporte PDF
            </button>
            <button @click="exportarExcel" class="btn-excel">
              📊 Exportar a Excel
            </button>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import NavBarAdministradorView from '@/ComponentesReutilizables/NavBarAdministradorView.vue'
import { ref } from 'vue'

interface PaquetePorVencer {
  id: number
  cliente: string
  tipo: string
  vencimiento: string
  clasesRestantes: number
  urgente: boolean
}

interface TopCliente {
  id: number
  nombre: string
  totalGastado: number
}

// Estado para filtros
const periodoSeleccionado = ref('mes')
const fechaInicio = ref('2025-10-01')
const fechaFin = ref('2025-10-31')

// Datos de ejemplo
const paquetesPorVencer = ref<PaquetePorVencer[]>([
  {
    id: 1,
    cliente: 'Ana López',
    tipo: 'Mensual',
    vencimiento: '15 Nov 2025',
    clasesRestantes: 5,
    urgente: true
  },
  {
    id: 2,
    cliente: 'Carlos Soto',
    tipo: 'Semanal',
    vencimiento: '28 Oct 2025',
    clasesRestantes: 2,
    urgente: false
  }
])

const topClientes = ref<TopCliente[]>([
  { id: 1, nombre: 'Luisa G.', totalGastado: 18000 },
  { id: 2, nombre: 'Roberto M.', totalGastado: 14500 },
  { id: 3, nombre: 'Elena P.', totalGastado: 12100 }
])

const contactarCliente = (cliente: string) => {
  alert(`Contactando a ${cliente}...`)
  console.log('Contactar cliente:', cliente)
}

const descargarPDF = () => {
  alert('Descargando reporte en PDF...')
  console.log('Descargar PDF')
}

const exportarExcel = () => {
  alert('Exportando a Excel...')
  console.log('Exportar Excel')
}
</script>

<style scoped>
.reportes-ventas-view {
  margin: 0;
  padding: 0;
  background: #1E1E1E;
  font-family: Arial, sans-serif;
  color: white;
  min-height: 100vh;
}

/* Container */
.container {
  display: flex;
  justify-content: center;
  margin-top: 40px;
  padding: 0 20px;
}

.card {
  width: 75%;
  max-width: 1200px;
  min-width: 300px;
  background: #2C2C2C;
  padding: 40px;
  border-radius: 5px;
}

h1 {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
}

/* Filtros */
.filters {
  display: flex;
  gap: 15px;
  margin-bottom: 30px;
  flex-wrap: wrap;
  align-items: center;
}

.filters select, .filters input {
  background: #3A3A3A;
  padding: 10px 12px;
  border: none;
  color: white;
  border-radius: 3px;
  font-size: 14px;
}

/* Métricas */
.metric-cards-grid {
  display: flex;
  gap: 20px;
  margin-bottom: 30px;
  flex-wrap: wrap;
  justify-content: space-between;
}

.metric-card {
  background: #3A3A3A;
  padding: 20px;
  border-radius: 5px;
  width: calc(33.33% - 14px);
  min-width: 280px;
  box-sizing: border-box;
}

.metric-card .title {
  font-size: 14px;
  color: #D1D5DB;
  margin-bottom: 5px;
}

.metric-card .value {
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 5px;
  color: #FFDD00;
}

.metric-card .value.white {
  color: white;
}

.metric-card .change {
  font-size: 12px;
  font-weight: bold;
}

.change.positive {
  color: #4CAF50;
}

.change.neutral {
  color: #FFBB41;
}

.change.negative {
  color: #F44336;
}

/* Gráficas */
.charts-section {
  display: flex;
  gap: 30px;
  margin-bottom: 30px;
  flex-wrap: wrap;
}

.chart-box {
  background: #3A3A3A;
  padding: 20px;
  border-radius: 5px;
  width: 100%;
  box-sizing: border-box;
}

.chart-box.large {
  flex: 2;
}

.chart-box.small {
  flex: 1;
}

.chart-box h3 {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 15px;
}

.line-chart-simulation {
  height: 200px;
  border-bottom: 1px solid #999;
  border-left: 1px solid #999;
  position: relative;
  padding: 10px;
}

.line-chart-simulation::after {
  content: 'Gráfica de Línea: Ingresos (MXN) vs Días';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #D1D5DB;
  font-style: italic;
}

.pie-chart-container {
  width: 100%;
  max-width: 350px;
  margin: 0 auto;
}

.pie-chart {
  width: 100px;
  height: 100px;
  background: conic-gradient(
    #3F88C5 0% 35%,
    #4CAF50 35% 65%,
    #8A2BE2 65% 85%,
    #999 85% 100%
  );
  border-radius: 50%;
  margin: 0 auto;
}

.pie-chart-legend {
  list-style: none;
  padding: 0;
  margin-top: 20px;
}

.pie-chart-legend li {
  display: flex;
  align-items: center;
  margin-bottom: 5px;
  font-size: 14px;
}

.color-box {
  width: 12px;
  height: 12px;
  margin-right: 10px;
  border-radius: 2px;
}

.color-box.blue { background: #3F88C5; }
.color-box.green { background: #4CAF50; }
.color-box.purple { background: #8A2BE2; }
.color-box.gray { background: #999; }

/* Listas y Tablas */
.list-header {
  font-weight: bold;
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid #4A4A4A;
  margin-bottom: 10px;
  font-size: 14px;
}

.list-row {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid #3A3A3A;
  font-size: 14px;
  align-items: center;
}

.list-row:last-child {
  border-bottom: none;
}

.fecha-vencimiento {
  font-weight: bold;
}

.fecha-vencimiento.urgente {
  color: #F44336;
}

.fecha-vencimiento.warning {
  color: #FFBB41;
}

.action-btn {
  background: none;
  border: 1px solid #FFBB41;
  color: #FFBB41;
  padding: 4px 8px;
  border-radius: 3px;
  cursor: pointer;
  font-size: 12px;
  transition: background 0.3s;
}

.action-btn:hover {
  background: #FFBB41;
  color: #000;
}

.monto {
  text-align: right;
}

.monto.destacado {
  color: #FFDD00;
  font-weight: bold;
}

/* Botones de Exportación */
.export-buttons {
  display: flex;
  gap: 15px;
  justify-content: flex-end;
  margin-top: 30px;
}

.export-buttons button {
  padding: 15px 25px;
  border: none;
  font-size: 16px;
  cursor: pointer;
  border-radius: 3px;
  font-weight: bold;
}

.btn-pdf {
  background: #D1D5DB;
  color: black;
}

.btn-pdf:hover {
  opacity: 0.85;
}

.btn-excel {
  background: #FFDD00;
  color: black;
}

.btn-excel:hover {
  opacity: 0.85;
}

/* Responsive */
@media (max-width: 1024px) {
  .metric-card {
    width: calc(50% - 10px);
  }
}

@media (max-width: 768px) {
  .card {
    width: 100%;
    padding: 20px;
  }
  
  .metric-card {
    width: 100%;
    min-width: 100%;
  }
  
  .filters {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>