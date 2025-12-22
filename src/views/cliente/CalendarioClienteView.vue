<template>
  <div>
    <!-- NAVBAR -->


    <!-- CONTENIDO PRINCIPAL -->
    <div class="calendario-cliente-view">
      <div class="container">
        <!-- ENCABEZADO -->
        <div class="header">
          <button class="btn-back" @click="volverAtras">
            ← Volver a Mis Reservas
          </button>
          <h1>📅 Agendar Nueva Clase</h1>
          <p class="subtitle">Selecciona el día que deseas reservar tu clase de Pilates</p>
        </div>

        <!-- CALENDARIO -->
        <div id="calendar" ref="calendarEl"></div>

        <!-- INFO BOX -->
        <div class="info-box">
          <h3>💡 Instrucciones:</h3>
          <ul>
            <li>Haz clic en el día que deseas reservar</li>
            <li>Selecciona la hora disponible</li>
            <li>Confirma tu reserva</li>
            <li>Recibirás una confirmación por correo</li>
          </ul>
        </div>
      </div>

      <!-- MODAL PARA SELECCIONAR HORA -->
      <Teleport to="body">
        <div v-if="modalAbierto" class="modal" @click.self="cerrarModal">
          <div class="modal-content">
            <h2>Agendar Clase</h2>
            
            <!-- FECHA SELECCIONADA -->
            <div class="fecha-info">
              <span class="label">📅 Fecha:</span>
              <span class="valor">{{ fechaFormateada }}</span>
            </div>

            <!-- LOADER -->
            <div v-if="cargandoHorarios" class="loading">
              <div class="spinner"></div>
              <p>Cargando horarios disponibles...</p>
            </div>

            <!-- SIN HORARIOS DISPONIBLES -->
            <div v-else-if="!hayHorariosDisponibles" class="no-horarios">
              <p>😔 No hay horarios disponibles para este día</p>
              <p class="sugerencia">Por favor selecciona otra fecha</p>
            </div>

            <!-- SELECCIÓN DE HORA -->
            <form v-else @submit.prevent="confirmarReserva">
              <div class="form-group">
                <label for="hora">🕐 Selecciona la hora:</label>
                <select 
                  id="hora" 
                  v-model="horaSeleccionada" 
                  required
                  class="hora-select"
                >
                  <option value="">Selecciona una hora...</option>
                  <option 
                    v-for="horario in horariosDisponibles" 
                    :key="horario.valor"
                    :value="horario.valor"
                    :disabled="!horario.disponible"
                  >
                    {{ horario.texto }} {{ !horario.disponible ? '(Ocupado)' : '' }}
                  </option>
                </select>
              </div>

              <!-- RESUMEN -->
              <div v-if="horaSeleccionada" class="resumen">
                <h4>📋 Resumen de tu reserva:</h4>
                <div class="resumen-detalle">
                  <p><strong>Fecha:</strong> {{ fechaFormateada }}</p>
                  <p><strong>Hora:</strong> {{ obtenerTextoHora(horaSeleccionada) }}</p>
                  <p><strong>Duración:</strong> 1 hora</p>
                </div>
              </div>

              <!-- BOTONES -->
              <div class="modal-buttons">
                <button 
                  type="button" 
                  class="btn-cancel" 
                  @click="cerrarModal"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  class="btn-confirm"
                  :disabled="!horaSeleccionada"
                >
                  Confirmar Reserva
                </button>
              </div>
            </form>
          </div>
        </div>
      </Teleport>
    </div>
  </div>
</template>

<script setup lang="ts">

import { useRouter } from 'vue-router'


// ============================================
// ROUTER
// ============================================

const router = useRouter()

const volverAtras = () => {
  router.push('/mis-reservas')
}

// ============================================
// USAR EL COMPOSABLE
// ============================================

const {
  calendarEl,
  modalAbierto,
  horaSeleccionada,
  cargandoHorarios,
  horariosDisponibles,
  hayHorariosDisponibles,
  fechaFormateada,
  cerrarModal,
  confirmarReserva
} = useCalendarCliente()

// ============================================
// HELPER
// ============================================

const obtenerTextoHora = (valor: string): string => {
  const horario = horariosDisponibles.value.find(h => h.valor === valor)
  return horario ? horario.texto : valor
}
</script>

<style scoped>
/* ============================================
   ESTILOS GENERALES
   ============================================ */

.calendario-cliente-view {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: linear-gradient(135deg, #4e4f33 0%, #f8f588 100%);
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

.btn-back {
  background: #e0e0e0;
  color: #555;
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 20px;
  transition: all 0.3s ease;
}

.btn-back:hover {
  background: #d0d0d0;
  transform: translateX(-5px);
}

h1 {
  color: #087cf9;
  margin-bottom: 10px;
  font-size: 2em;
}

.subtitle {
  color: #666;
  font-size: 0.95em;
}

/* ============================================
   CALENDARIO
   ============================================ */

#calendar {
  margin-top: 20px;
  margin-bottom: 20px;
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
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal-content {
  position: relative;
  background: white;
  padding: 30px;
  max-width: 500px;
  width: 100%;
  border-radius: 15px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s;
  max-height: 90vh;
  overflow-y: auto;
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

.modal h2 {
  color: #11998e;
  margin-bottom: 20px;
  text-align: center;
}

/* ============================================
   FECHA INFO
   ============================================ */

.fecha-info {
  background: #f0f9f7;
  padding: 15px;
  border-radius: 10px;
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.fecha-info .label {
  font-weight: 600;
  color: #11998e;
  font-size: 14px;
}

.fecha-info .valor {
  color: #333;
  font-size: 16px;
  text-transform: capitalize;
}

/* ============================================
   LOADING
   ============================================ */

.loading {
  text-align: center;
  padding: 40px 20px;
}

.spinner {
  width: 40px;
  height: 40px;
  margin: 0 auto 15px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #11998e;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* ============================================
   SIN HORARIOS
   ============================================ */

.no-horarios {
  text-align: center;
  padding: 30px 20px;
  background: #fff3cd;
  border-radius: 10px;
  margin-bottom: 20px;
}

.no-horarios p {
  margin: 5px 0;
  color: #856404;
}

.sugerencia {
  font-size: 14px;
  font-style: italic;
}

/* ============================================
   FORMULARIO
   ============================================ */

.form-group {
  margin-bottom: 25px;
}

label {
  display: block;
  margin-bottom: 10px;
  color: #555;
  font-weight: 600;
  font-size: 15px;
}

.hora-select {
  width: 100%;
  padding: 14px;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  font-size: 15px;
  transition: border-color 0.3s;
  background: white;
  cursor: pointer;
}

.hora-select:focus {
  outline: none;
  border-color: #11998e;
}

.hora-select option:disabled {
  color: #999;
  font-style: italic;
}

/* ============================================
   RESUMEN
   ============================================ */

.resumen {
  background: #f0f9f7;
  padding: 20px;
  border-radius: 10px;
  margin-bottom: 25px;
  border-left: 4px solid #11998e;
}

.resumen h4 {
  color: #11998e;
  margin-bottom: 15px;
  font-size: 16px;
}

.resumen-detalle p {
  margin: 8px 0;
  color: #333;
  font-size: 14px;
}

/* ============================================
   BOTONES
   ============================================ */

.modal-buttons {
  display: flex;
  gap: 12px;
  margin-top: 25px;
}

.modal-buttons button {
  flex: 1;
  padding: 14px 24px;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-size: 15px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-cancel {
  background: #e0e0e0;
  color: #666;
}

.btn-cancel:hover {
  background: #d0d0d0;
}

.btn-confirm {
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
  color: white;
}

.btn-confirm:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(17, 153, 142, 0.3);
}

.btn-confirm:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* ============================================
   INFO BOX
   ============================================ */

.info-box {
  background: #f0f9f7;
  border-left: 4px solid #11998e;
  padding: 20px;
  border-radius: 10px;
  margin-top: 30px;
}

.info-box h3 {
  color: #11998e;
  margin-bottom: 15px;
  font-size: 1.1em;
}

.info-box ul {
  margin-left: 20px;
  color: #555;
}

.info-box li {
  margin-bottom: 8px;
  line-height: 1.5;
}

/* ============================================
   RESPONSIVE
   ============================================ */

@media (max-width: 768px) {
  .container {
    padding: 15px;
  }

  .modal-content {
    padding: 20px;
  }

  .modal-buttons {
    flex-direction: column;
  }

  .modal-buttons button {
    width: 100%;
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
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
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
  background-color: #f0f9f7 !important;
}

.fc-daygrid-day.fc-day-past {
  background-color: #f5f5f5;
  opacity: 0.6;
}

.fc-daygrid-day:not(.fc-day-past):hover {
  background-color: #e8f5f3;
  cursor: pointer;
}
</style>