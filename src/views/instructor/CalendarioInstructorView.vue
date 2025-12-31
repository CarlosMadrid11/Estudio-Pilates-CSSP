<template>
  <div>
    <div class="calendario-instructor-view">
      <div class="container">
        <!-- ENCABEZADO -->
        <div class="header">
          <h1>📅 Mis Clases Programadas</h1>
          <p class="subtitle">Vista de tus clases asignadas y estudiantes registrados</p>
        </div>
        
        <!-- CONTROLES -->
        <div class="controls">
          <button class="btn-refresh" @click="recargarClases">
            🔄 Actualizar
          </button>
          <button class="btn-success" @click="cambiarVista('dayGridMonth')">
            📆 Vista Mensual
          </button>
          <button class="btn-info" @click="cambiarVista('timeGridWeek')">
            📅 Vista Semanal
          </button>
          <button class="btn-info" @click="cambiarVista('timeGridDay')">
            📋 Vista Diaria
          </button>
        </div>

        <!-- LOADING -->
        <div v-if="cargandoClases" class="loading">
          <div class="spinner"></div>
          <p>Cargando tus clases...</p>
        </div>

        <!-- CALENDARIO -->
        <div v-else id="calendar" ref="calendarEl"></div>

        <!-- LEYENDA DE COLORES -->
        <div class="leyenda">
          <h3>🎨 Código de colores:</h3>
          <div class="leyenda-items">
            <div class="leyenda-item">
              <span class="color-box" style="background: #95a5a6;"></span>
              <span>Vacía (0%)</span>
            </div>
            <div class="leyenda-item">
              <span class="color-box" style="background: #3498db;"></span>
              <span>Baja ocupación (&lt;50%)</span>
            </div>
            <div class="leyenda-item">
              <span class="color-box" style="background: #f39c12;"></span>
              <span>Media ocupación (50-99%)</span>
            </div>
            <div class="leyenda-item">
              <span class="color-box" style="background: #e74c3c;"></span>
              <span>Llena (100%)</span>
            </div>
          </div>
        </div>

        <!-- INFO BOX -->
        <div class="info-box">
          <h3>💡 Información:</h3>
          <ul>
            <li>Haz clic en cualquier clase para ver los detalles y lista de estudiantes</li>
            <li>Los colores indican el nivel de ocupación de cada clase</li>
            <li>Puedes cambiar entre vista mensual, semanal y diaria</li>
            <li>Las clases se actualizan automáticamente cuando los clientes reservan</li>
          </ul>
        </div>
      </div>

      <!-- MODAL DE DETALLES -->
      <Teleport to="body">
        <div v-if="modalDetalles && claseSeleccionada" class="modal" @click.self="cerrarModal">
          <div class="modal-content">
            <button class="btn-close" @click="cerrarModal">✕</button>
            
            <h2>📋 Detalles de la Clase</h2>
            
            <!-- INFO DE LA CLASE -->
            <div class="clase-info">
              <div class="info-item">
                <span class="label">📅 Fecha:</span>
                <span class="valor">{{ formatearFecha(claseSeleccionada.fecha) }}</span>
              </div>
              
              <div class="info-item">
                <span class="label">🕐 Horario:</span>
                <span class="valor">
                  {{ claseSeleccionada.hora_inicio.substring(0, 5) }} - 
                  {{ claseSeleccionada.hora_fin.substring(0, 5) }}
                </span>
              </div>
              
              <div class="info-item">
                <span class="label">👥 Ocupación:</span>
                <span class="valor">
                  {{ claseSeleccionada.capacidad_actual }} / {{ claseSeleccionada.capacidad_maxima }}
                  ({{ porcentajeOcupacion }}%)
                </span>
              </div>
              
              <div class="info-item">
                <span class="label">📊 Estado:</span>
                <span class="badge" :style="{ backgroundColor: colorEstado }">
                  {{ estadoClase }}
                </span>
              </div>
            </div>

            <!-- LISTA DE CLIENTES -->
            <div class="clientes-section">
              <h3>👥 Estudiantes Registrados ({{ claseSeleccionada.clientes.length }})</h3>
              
              <div v-if="claseSeleccionada.clientes.length === 0" class="no-clientes">
                <p>😔 Aún no hay estudiantes registrados en esta clase</p>
              </div>
              
              <div v-else class="clientes-lista">
                <div 
                  v-for="(cliente, index) in claseSeleccionada.clientes" 
                  :key="index"
                  class="cliente-card"
                >
                  <div class="cliente-numero">{{ index + 1 }}</div>
                  <div class="cliente-info">
                    <p class="cliente-nombre">{{ cliente.nombre_completo }}</p>
                    <p class="cliente-telefono">📞 {{ cliente.telefono }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- BOTONES -->
            <div class="modal-buttons">
              <button class="btn-primary" @click="cerrarModal">
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </Teleport>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useCalendarioInstructor } from '@/composables/useCalendarioInstructor'

// ============================================
// USAR EL COMPOSABLE
// ============================================

const {
  calendarEl,
  modalDetalles,
  claseSeleccionada,
  cargandoClases,
  porcentajeOcupacion,
  estadoClase,
  colorEstado,
  cerrarModal,
  cambiarVista,
  recargarClases,
  formatearFecha
} = useCalendarioInstructor()
</script>

<style scoped>
/* ============================================
   ESTILOS GENERALES
   ============================================ */

.calendario-instructor-view {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  min-height: 100vh;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  background: white;
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

/* ============================================
   ENCABEZADO
   ============================================ */

.header {
  margin-bottom: 25px;
}

h1 {
  color: #667eea;
  margin-bottom: 10px;
  font-size: 2em;
}

.subtitle {
  color: #666;
  font-size: 0.95em;
}

/* ============================================
   CONTROLES
   ============================================ */

.controls {
  display: flex;
  gap: 12px;
  margin-bottom: 25px;
  flex-wrap: wrap;
}

button {
  padding: 12px 20px;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
}

.btn-refresh {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-success {
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
  color: white;
}

.btn-info {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  width: 100%;
  padding: 14px;
}

/* ============================================
   LOADING
   ============================================ */

.loading {
  text-align: center;
  padding: 60px 20px;
}

.spinner {
  width: 50px;
  height: 50px;
  margin: 0 auto 20px;
  border: 5px solid #f3f3f3;
  border-top: 5px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading p {
  color: #666;
  font-size: 16px;
}

/* ============================================
   CALENDARIO
   ============================================ */

#calendar {
  margin-top: 20px;
}

/* ============================================
   LEYENDA
   ============================================ */

.leyenda {
  background: #f8f9fa;
  border-radius: 10px;
  padding: 20px;
  margin-top: 25px;
}

.leyenda h3 {
  color: #667eea;
  margin-bottom: 15px;
  font-size: 1.1em;
}

.leyenda-items {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
}

.leyenda-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.color-box {
  width: 30px;
  height: 30px;
  border-radius: 6px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* ============================================
   INFO BOX
   ============================================ */

.info-box {
  background: #f0f4ff;
  border-left: 4px solid #667eea;
  padding: 20px;
  margin-top: 25px;
  border-radius: 10px;
}

.info-box h3 {
  color: #667eea;
  margin-bottom: 15px;
  font-size: 1.1em;
}

.info-box ul {
  margin-left: 20px;
  color: #555;
}

.info-box li {
  margin-bottom: 8px;
  line-height: 1.6;
}

/* ============================================
   MODAL
   ============================================ */

.modal {
  display: flex;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  z-index: 1000;
  animation: fadeIn 0.3s;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-content {
  position: relative;
  background: white;
  padding: 30px;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  border-radius: 15px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s;
}

@keyframes slideUp {
  from {
    transform: translateY(50px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.btn-close {
  position: absolute;
  top: 15px;
  right: 15px;
  width: 35px;
  height: 35px;
  padding: 0;
  background: #e0e0e0;
  color: #666;
  font-size: 20px;
  border-radius: 50%;
}

.btn-close:hover {
  background: #d0d0d0;
}

.modal h2 {
  color: #667eea;
  margin-bottom: 25px;
  padding-right: 40px;
}

/* ============================================
   INFO DE CLASE
   ============================================ */

.clase-info {
  background: #f8f9fa;
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 25px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #e0e0e0;
}

.info-item:last-child {
  border-bottom: none;
}

.label {
  font-weight: 600;
  color: #555;
  font-size: 14px;
}

.valor {
  color: #333;
  font-size: 14px;
  text-align: right;
}

.badge {
  padding: 6px 14px;
  border-radius: 20px;
  color: white;
  font-size: 13px;
  font-weight: 600;
}

/* ============================================
   CLIENTES SECTION
   ============================================ */

.clientes-section {
  margin-top: 25px;
}

.clientes-section h3 {
  color: #667eea;
  margin-bottom: 15px;
  font-size: 1.1em;
}

.no-clientes {
  text-align: center;
  padding: 30px 20px;
  background: #fff3cd;
  border-radius: 10px;
}

.no-clientes p {
  color: #856404;
  margin: 0;
}

.clientes-lista {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.cliente-card {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 10px;
  border-left: 4px solid #667eea;
  transition: all 0.3s ease;
}

.cliente-card:hover {
  background: #e9ecef;
  transform: translateX(5px);
}

.cliente-numero {
  width: 35px;
  height: 35px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #667eea;
  color: white;
  border-radius: 50%;
  font-weight: 700;
  font-size: 14px;
  flex-shrink: 0;
}

.cliente-info {
  flex: 1;
}

.cliente-nombre {
  font-weight: 600;
  color: #333;
  margin: 0 0 5px 0;
  font-size: 15px;
}

.cliente-telefono {
  color: #666;
  margin: 0;
  font-size: 13px;
}

/* ============================================
   MODAL BUTTONS
   ============================================ */

.modal-buttons {
  margin-top: 25px;
}

/* ============================================
   RESPONSIVE
   ============================================ */

@media (max-width: 768px) {
  .container {
    padding: 15px;
  }

  .controls {
    flex-direction: column;
  }

  button {
    width: 100%;
  }

  .leyenda-items {
    grid-template-columns: 1fr;
  }

  .modal-content {
    padding: 20px;
  }
}
</style>

<style>
/* ============================================
   ESTILOS GLOBALES PARA FULLCALENDAR
   ============================================ */

.fc {
  border: none;
}

.fc-theme-standard td,
.fc-theme-standard th {
  border-color: #e0e0e0;
}

.fc-col-header-cell {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-weight: 600;
  padding: 15px 0;
}

.fc-daygrid-day-number {
  color: #333;
  font-weight: 600;
  padding: 8px;
}

.fc-daygrid-day.fc-day-today {
  background-color: #f0f4ff !important;
}

.fc-event {
  border: none;
  padding: 4px 8px;
  border-radius: 6px;
  cursor: pointer;
  transition: transform 0.2s;
  font-weight: 600;
}

.fc-event:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}
</style>