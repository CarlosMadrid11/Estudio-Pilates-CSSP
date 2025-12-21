<template>
  <div>
    <NavBarInstructorView />

    <div class="calendario-instructor-view">
      <div class="container">
        <!-- ENCABEZADO -->
        <h1>📅 Calendario de Clases - Instructor</h1>
        <p class="subtitle">Gestiona tus clases y horarios asignados</p>
        
        <!-- CONTROLES -->
        <div class="controls">
          <button class="btn-primary" @click="abrirModal">
            ➕ Agregar Cita
          </button>
          <button class="btn-success" @click="cambiarVista('dayGridMonth')">
            Vista Mensual
          </button>
          <button class="btn-info" @click="cambiarVista('timeGridWeek')">
            Vista Semanal
          </button>
          <button class="btn-info" @click="cambiarVista('timeGridDay')">
            Vista Diaria
          </button>
        </div>

        <!-- CALENDARIO -->
        <div id="calendar" ref="calendarEl"></div>

        <!-- INFO BOX -->
        <div class="info-box">
          <h3>🔧 Características implementadas:</h3>
          <ul>
            <li><strong>Múltiples vistas:</strong> mensual, semanal y diaria</li>
            <li><strong>Agregar eventos:</strong> crea citas con título, fecha, hora y tipo de clase</li>
            <li><strong>Click en eventos:</strong> haz click en cualquier cita para ver detalles</li>
            <li><strong>Colores personalizados:</strong> cada tipo de clase tiene su color</li>
            <li><strong>Arrastrar y soltar:</strong> arrastra eventos para cambiar fechas</li>
            <li><strong>Idioma español:</strong> totalmente localizado</li>
            <li><strong>Responsive:</strong> se adapta a móviles y tablets</li>
          </ul>
        </div>
      </div>

      <!-- MODAL PARA AGREGAR CITAS -->
      <Teleport to="body">
        <div v-if="modalAbierto" class="modal" @click.self="cerrarModal">
          <div class="modal-content">
            <h2>Nueva Cita de Pilates</h2>
            
            <form @submit.prevent="onSubmitForm">
              <!-- CLIENTE / NOMBRE -->
              <div class="form-group">
                <label for="titulo">Cliente / Nombre:</label>
                <input 
                  type="text" 
                  id="titulo" 
                  v-model="formulario.titulo" 
                  required
                  placeholder="Ej: María González"
                >
              </div>
              
              <!-- FECHA -->
              <div class="form-group">
                <label for="fecha">Fecha:</label>
                <input 
                  type="date" 
                  id="fecha" 
                  v-model="formulario.fecha" 
                  required
                >
              </div>
              
              <!-- HORA -->
              <div class="form-group">
                <label for="hora">Hora:</label>
                <input 
                  type="time" 
                  id="hora" 
                  v-model="formulario.hora" 
                  required
                >
              </div>
              
              <!-- TIPO DE CLASE -->
              <div class="form-group">
                <label for="tipo">Tipo de Clase:</label>
                <select 
                  id="tipo" 
                  v-model="formulario.tipo" 
                  required
                >
                  <option value="">Selecciona...</option>
                  <option value="mat">Mat Pilates</option>
                  <option value="reformer">Reformer</option>
                  <option value="cadillac">Cadillac</option>
                  <option value="privada">Clase Privada</option>
                  <option value="grupal">Clase Grupal</option>
                </select>
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
                  class="btn-primary"
                >
                  Guardar Cita
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
import NavBarInstructorView from '@/ComponentesReutilizables/NavBarInstructorView.vue'
import { useCalendar } from '@/ComponentesReutilizables/useCalendar'

// ============================================
// USAR EL COMPOSABLE
// ============================================

const {
  calendarEl,
  modalAbierto,
  formulario,
  abrirModal,
  cerrarModal,
  guardarCita,
  cambiarVista
} = useCalendar()

// ============================================
// MANEJAR SUBMIT DEL FORMULARIO
// ============================================

const onSubmitForm = () => {
  // Obtener el texto del tipo seleccionado
  const selectElement = document.getElementById('tipo') as HTMLSelectElement
  const tipoTexto = selectElement?.options[selectElement.selectedIndex]?.text || formulario.value.tipo
  
  // Guardar la cita
  guardarCita(tipoTexto)
}
</script>

<style scoped>
/* ============================================
   ESTILOS GENERALES
   ============================================ */

.calendario-instructor-view {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: linear-gradient(135deg, #eced8b 0%, #32321c 100%);
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

h1 {
  color: #667eea;
  margin-bottom: 10px;
  font-size: 2em;
}

.subtitle {
  color: #666;
  margin-bottom: 20px;
  font-size: 0.95em;
}

/* ============================================
   CONTROLES
   ============================================ */

.controls {
  display: flex;
  gap: 15px;
  margin-bottom: 25px;
  flex-wrap: wrap;
}

button {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
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

.btn-primary {
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

/* ============================================
   CALENDARIO
   ============================================ */

#calendar {
  margin-top: 20px;
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
  align-items: flex-start;
  justify-content: center;
  padding-top: 50px;
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
  width: 90%;
  border-radius: 15px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideDown 0.3s;
}

@keyframes slideDown {
  from {
    transform: translateY(-50px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal h2 {
  color: #667eea;
  margin-bottom: 20px;
}

/* ============================================
   FORMULARIO
   ============================================ */

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 8px;
  color: #555;
  font-weight: 600;
}

input,
select {
  width: 100%;
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.3s;
}

input:focus,
select:focus {
  outline: none;
  border-color: #667eea;
}

.modal-buttons {
  display: flex;
  gap: 10px;
  margin-top: 25px;
}

.modal-buttons button {
  flex: 1;
}

.btn-cancel {
  background: #e0e0e0;
  color: #666;
}

/* ============================================
   INFO BOX
   ============================================ */

.info-box {
  background: #f0f4ff;
  border-left: 4px solid #667eea;
  padding: 15px;
  margin-top: 20px;
  border-radius: 8px;
}

.info-box h3 {
  color: #667eea;
  margin-bottom: 10px;
  font-size: 1.1em;
}

.info-box ul {
  margin-left: 20px;
  color: #555;
}

.info-box li {
  margin-bottom: 5px;
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

  .modal-content {
    margin: 20px;
    padding: 20px;
  }
}
</style>

<style>
/* ============================================
   ESTILOS GLOBALES PARA FULLCALENDAR
   (Sin scoped para que afecten al calendario)
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
}

.fc-event:hover {
  transform: scale(1.05);
}
</style>