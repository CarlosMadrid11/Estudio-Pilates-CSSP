<template>
  <div>
    <div class="registro-asistencia-view">
      <div class="container">
        <!-- ENCABEZADO -->
        <div class="header">
          <h1>📋 Registro de Asistencia</h1>
          <p class="subtitle">Marca quién asistió a tus clases pasadas</p>
        </div>

        <!-- LOADING -->
        <div v-if="cargando" class="loading">
          <div class="spinner"></div>
          <p>Cargando clases pasadas...</p>
        </div>

        <!-- SIN CLASES -->
        <div v-else-if="clasesPasadas.length === 0" class="no-clases">
          <div class="empty-state">
            <span class="empty-icon">📅</span>
            <h3>No hay clases pasadas</h3>
            <p>Cuando tengas clases con estudiantes registrados, aparecerán aquí para marcar asistencia.</p>
          </div>
        </div>

        <!-- LISTA DE CLASES -->
        <div v-else class="clases-lista">
          <div 
            v-for="clase in clasesPasadas" 
            :key="clase.id"
            class="clase-card"
            @click="seleccionarClase(clase)"
          >
            <div class="clase-fecha">
              <div class="fecha-dia">{{ formatearFechaCorta(clase.fecha) }}</div>
              <div class="fecha-hora">
                {{ clase.hora_inicio.substring(0, 5) }} - {{ clase.hora_fin.substring(0, 5) }}
              </div>
            </div>

            <div class="clase-info">
              <div class="clase-estudiantes">
                <span class="icon">👥</span>
                <span>{{ clase.reservas.length }} estudiante(s)</span>
              </div>
              
              <div class="clase-estado">
                <span 
                  v-if="clase.reservas.every(r => r.asistio !== null)"
                  class="badge badge-success"
                >
                  ✅ Completo
                </span>
                <span 
                  v-else
                  class="badge badge-pending"
                >
                  ⏳ Pendiente
                </span>
              </div>
            </div>

            <div class="clase-arrow">→</div>
          </div>
        </div>

        <!-- INFO BOX -->
        <div v-if="!cargando && clasesPasadas.length > 0" class="info-box">
          <h3>💡 Instrucciones:</h3>
          <ul>
            <li>Haz clic en una clase para ver la lista de estudiantes</li>
            <li>Marca quién asistió (✅) y quién faltó (❌)</li>
            <li>Las asistencias se guardan automáticamente</li>
            <li>Solo se muestran las últimas 20 clases pasadas con reservas</li>
          </ul>
        </div>
      </div>

      <!-- MODAL DE DETALLES -->
      <Teleport to="body">
        <div v-if="claseSeleccionada" class="modal" @click.self="cerrarDetalles">
          <div class="modal-content">
            <button class="btn-close" @click="cerrarDetalles">✕</button>
            
            <h2>📋 Registro de Asistencia</h2>
            
            <!-- INFO DE LA CLASE -->
            <div class="clase-detalle">
              <div class="detalle-item">
                <span class="label">📅 Fecha:</span>
                <span class="valor">{{ formatearFecha(claseSeleccionada.fecha) }}</span>
              </div>
              
              <div class="detalle-item">
                <span class="label">🕐 Horario:</span>
                <span class="valor">
                  {{ claseSeleccionada.hora_inicio.substring(0, 5) }} - 
                  {{ claseSeleccionada.hora_fin.substring(0, 5) }}
                </span>
              </div>
            </div>

            <!-- RESUMEN -->
            <div class="resumen">
              <div class="resumen-item">
                <span class="resumen-label">✅ Asistieron</span>
                <span class="resumen-valor">{{ totalAsistencias }}</span>
              </div>
              <div class="resumen-item">
                <span class="resumen-label">❌ Faltaron</span>
                <span class="resumen-valor">{{ totalFaltas }}</span>
              </div>
              <div class="resumen-item">
                <span class="resumen-label">⏳ Pendientes</span>
                <span class="resumen-valor">{{ totalPendientes }}</span>
              </div>
            </div>

            <!-- LISTA DE ESTUDIANTES -->
            <div class="estudiantes-lista">
              <h3>👥 Estudiantes ({{ claseSeleccionada.reservas.length }})</h3>
              
              <div 
                v-for="(reserva, index) in claseSeleccionada.reservas" 
                :key="reserva.id"
                class="estudiante-card"
              >
                <div class="estudiante-numero">{{ index + 1 }}</div>
                
                <div class="estudiante-info">
                  <p class="estudiante-nombre">{{ reserva.cliente_nombre }}</p>
                  <p class="estudiante-telefono">📞 {{ reserva.cliente_telefono }}</p>
                </div>

                <div class="estudiante-acciones">
                  <button
                    class="btn-asistio"
                    :class="{ active: reserva.asistio === true }"
                    @click="marcarAsistencia(reserva.id, true)"
                  >
                    ✅ Asistió
                  </button>
                  <button
                    class="btn-falto"
                    :class="{ active: reserva.asistio === false }"
                    @click="marcarAsistencia(reserva.id, false)"
                  >
                    ❌ Faltó
                  </button>
                </div>
              </div>
            </div>

            <!-- BOTONES -->
            <div class="modal-buttons">
              <button 
                class="btn-secondary" 
                @click="cerrarDetalles"
              >
                Cerrar
              </button>
              <button 
                v-if="!todosMarcados"
                class="btn-primary" 
                disabled
              >
                ⚠️ Marca todos primero
              </button>
              <button 
                v-else
                class="btn-success" 
                @click="guardarTodasAsistencias"
                :disabled="guardando"
              >
                {{ guardando ? 'Guardando...' : '✅ Confirmar Registro' }}
              </button>
            </div>
          </div>
        </div>
      </Teleport>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRegistroAsistencia } from '@/composables/useRegistroAsistencia'

// ============================================
// USAR EL COMPOSABLE
// ============================================

const {
  cargando,
  guardando,
  clasesPasadas,
  claseSeleccionada,
  totalAsistencias,
  totalFaltas,
  totalPendientes,
  todosMarcados,
  seleccionarClase,
  cerrarDetalles,
  marcarAsistencia,
  guardarTodasAsistencias,
  formatearFecha,
  formatearFechaCorta
} = useRegistroAsistencia()
</script>

<style scoped>
/* ============================================
   ESTILOS GENERALES
   ============================================ */

.registro-asistencia-view {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  min-height: 100vh;
}

.container {
  max-width: 1000px;
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
  margin-bottom: 30px;
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
   EMPTY STATE
   ============================================ */

.no-clases {
  padding: 60px 20px;
}

.empty-state {
  text-align: center;
  background: #f8f9fa;
  padding: 50px 30px;
  border-radius: 15px;
}

.empty-icon {
  font-size: 80px;
  display: block;
  margin-bottom: 20px;
}

.empty-state h3 {
  color: #667eea;
  margin-bottom: 15px;
  font-size: 1.5em;
}

.empty-state p {
  color: #666;
  font-size: 1em;
  line-height: 1.6;
}

/* ============================================
   LISTA DE CLASES
   ============================================ */

.clases-lista {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 30px;
}

.clase-card {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 12px;
  border-left: 5px solid #667eea;
  cursor: pointer;
  transition: all 0.3s ease;
}

.clase-card:hover {
  background: #e9ecef;
  transform: translateX(8px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.clase-fecha {
  flex-shrink: 0;
  text-align: center;
  padding: 10px 15px;
  background: white;
  border-radius: 10px;
  border: 2px solid #667eea;
}

.fecha-dia {
  font-weight: 700;
  color: #667eea;
  font-size: 14px;
  margin-bottom: 5px;
}

.fecha-hora {
  font-size: 13px;
  color: #666;
  font-weight: 600;
}

.clase-info {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 20px;
}

.clase-estudiantes {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  color: #333;
  font-weight: 600;
}

.icon {
  font-size: 18px;
}

.clase-estado {
  margin-left: auto;
}

.badge {
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
}

.badge-success {
  background: #d4edda;
  color: #155724;
}

.badge-pending {
  background: #fff3cd;
  color: #856404;
}

.clase-arrow {
  font-size: 24px;
  color: #667eea;
  font-weight: 700;
}

/* ============================================
   INFO BOX
   ============================================ */

.info-box {
  background: #f0f4ff;
  border-left: 4px solid #667eea;
  padding: 20px;
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
  max-width: 700px;
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
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s ease;
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
   DETALLE DE CLASE
   ============================================ */

.clase-detalle {
  background: #f8f9fa;
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 20px;
}

.detalle-item {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid #e0e0e0;
}

.detalle-item:last-child {
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

/* ============================================
   RESUMEN
   ============================================ */

.resumen {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
  margin-bottom: 25px;
}

.resumen-item {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 10px;
  text-align: center;
}

.resumen-label {
  display: block;
  font-size: 13px;
  color: #666;
  margin-bottom: 8px;
}

.resumen-valor {
  display: block;
  font-size: 28px;
  font-weight: 700;
  color: #667eea;
}

/* ============================================
   ESTUDIANTES
   ============================================ */

.estudiantes-lista {
  margin-bottom: 25px;
}

.estudiantes-lista h3 {
  color: #667eea;
  margin-bottom: 15px;
  font-size: 1.1em;
}

.estudiante-card {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 10px;
  margin-bottom: 12px;
  border-left: 4px solid #667eea;
}

.estudiante-numero {
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

.estudiante-info {
  flex: 1;
}

.estudiante-nombre {
  font-weight: 600;
  color: #333;
  margin: 0 0 5px 0;
  font-size: 15px;
}

.estudiante-telefono {
  color: #666;
  margin: 0;
  font-size: 13px;
}

.estudiante-acciones {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.btn-asistio,
.btn-falto {
  padding: 8px 16px;
  border: 2px solid transparent;
  border-radius: 8px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  transition: all 0.3s ease;
  background: white;
}

.btn-asistio {
  color: #28a745;
  border-color: #28a745;
}

.btn-asistio:hover {
  background: #28a745;
  color: white;
}

.btn-asistio.active {
  background: #28a745;
  color: white;
  box-shadow: 0 0 0 3px rgba(40, 167, 69, 0.2);
}

.btn-falto {
  color: #dc3545;
  border-color: #dc3545;
}

.btn-falto:hover {
  background: #dc3545;
  color: white;
}

.btn-falto.active {
  background: #dc3545;
  color: white;
  box-shadow: 0 0 0 3px rgba(220, 53, 69, 0.2);
}

/* ============================================
   BOTONES MODAL
   ============================================ */

.modal-buttons {
  display: flex;
  gap: 12px;
}

.modal-buttons button {
  flex: 1;
  padding: 14px;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-size: 15px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-secondary {
  background: #e0e0e0;
  color: #666;
}

.btn-secondary:hover {
  background: #d0d0d0;
}

.btn-primary {
  background: #667eea;
  color: white;
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-success {
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
  color: white;
}

.btn-success:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(17, 153, 142, 0.3);
}

.btn-success:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* ============================================
   RESPONSIVE
   ============================================ */

@media (max-width: 768px) {
  .container {
    padding: 15px;
  }

  .clase-card {
    flex-direction: column;
    align-items: flex-start;
  }

  .clase-arrow {
    display: none;
  }

  .resumen {
    grid-template-columns: 1fr;
  }

  .estudiante-acciones {
    width: 100%;
  }

  .btn-asistio,
  .btn-falto {
    flex: 1;
  }

  .modal-buttons {
    flex-direction: column;
  }
}
</style>