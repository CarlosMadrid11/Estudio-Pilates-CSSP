<template>
  <div>


    <div class="registro-asistencia-view">
      <!-- Contenido de Registro de Asistencia -->
      <div class="container">
        <div class="card">
          
          <h1 class="title">Registro de Asistencia</h1>

          <div class="class-header">
            <p>Clase: Pilates en Reformer - Intermedio</p>
            <h2>Jueves, 17 de Octubre | 18:00 hrs</h2>
            <div class="details">
              <span>Instructor(a): Ana Gómez</span>
              <span>Reservas: <span style="color: #FFBB41;">10 / 12</span></span>
            </div>
          </div>

          <div class="bulk-actions">
            <button @click="marcarTodos">Marcar todos presentes</button>
            <button @click="desmarcarTodos">Desmarcar todos</button>
          </div>

          <div class="attendance-list">
            
            <div 
              v-for="cliente in clientes" 
              :key="cliente.id" 
              :class="['client-row', { 'absent': !cliente.presente, 'no-saldo': cliente.saldo === 0 }]"
            >
              <label :for="'client-' + cliente.id" class="client-row-label">
                <input 
                  type="checkbox" 
                  :id="'client-' + cliente.id" 
                  class="custom-checkbox" 
                  v-model="cliente.presente"
                  :disabled="cliente.saldo === 0"
                >
                <div class="client-info">
                  <p :class="['name', { 'name-absent': !cliente.presente && cliente.saldo > 0 }]">
                    {{ cliente.nombre }}
                  </p>
                  <p class="details-text">{{ cliente.cama }} | Paquete: {{ cliente.paquete }}</p>
                  <p v-if="cliente.saldo > 0" class="saldo">
                    Clases restantes: <span class="old-count">{{ cliente.saldo }}</span> → 
                    <span :class="['new-count', cliente.presente ? 'saldo-green' : 'saldo-default']">
                      {{ cliente.presente ? cliente.saldo - 1 : cliente.saldo }}
                    </span>
                  </p>
                  <p v-else class="saldo-alert">🚨 Sin saldo: 0 clases</p>
                </div>
                <span v-if="cliente.saldo === 0" class="badge-alert">Debe renovar paquete</span>
              </label>
            </div>

          </div>
          
          <div v-if="mensajeConfirmacion" :class="['confirmation-message', mensajeTipo]">
            {{ mensajeConfirmacion }}
          </div>

          <button @click="guardarAsistencia" class="btn-save">
            💾 Guardar Asistencia
          </button>

        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">

import { ref } from 'vue'

interface Cliente {
  id: number
  nombre: string
  cama: string
  paquete: string
  saldo: number
  presente: boolean
}

// Estado para los clientes
const clientes = ref<Cliente[]>([
  {
    id: 1,
    nombre: 'Ana López Pérez',
    cama: 'Cama #3',
    paquete: 'Mensual',
    saldo: 11,
    presente: true
  },
  {
    id: 2,
    nombre: 'María González',
    cama: 'Cama #5',
    paquete: 'Semanal',
    saldo: 3,
    presente: false
  },
  {
    id: 3,
    nombre: 'Jesús Vázquez',
    cama: 'Cama #1',
    paquete: 'Básico',
    saldo: 0,
    presente: false
  }
])

const mensajeConfirmacion = ref('')
const mensajeTipo = ref('')

const marcarTodos = () => {
  let marcados = 0
  clientes.value.forEach(cliente => {
    if (cliente.saldo > 0) {
      cliente.presente = true
      marcados++
    }
  })
  mostrarMensaje(`Se intentó marcar a ${marcados} clientes. Revisar alertas de saldo.`, 'warning')
}

const desmarcarTodos = () => {
  clientes.value.forEach(cliente => {
    if (cliente.saldo > 0) {
      cliente.presente = false
    }
  })
}

const guardarAsistencia = () => {
  let descontadas = 0
  
  clientes.value.forEach(cliente => {
    if (cliente.presente && cliente.saldo > 0) {
      cliente.saldo -= 1
      descontadas++
    }
  })

  mostrarMensaje(`Asistencia registrada correctamente. Se descontaron ${descontadas} clase(s).`, 'success')
}

const mostrarMensaje = (mensaje: string, tipo: string) => {
  mensajeConfirmacion.value = mensaje
  mensajeTipo.value = tipo
  
  setTimeout(() => {
    mensajeConfirmacion.value = ''
  }, 5000)
}
</script>

<style scoped>
.registro-asistencia-view {
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
  max-width: 900px;
  min-width: 300px;
  background: #2C2C2C;
  padding: 40px;
  border-radius: 5px;
}

.title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
}

/* Class Header */
.class-header {
  background: #3A3A3A;
  padding: 20px;
  border-radius: 5px;
  margin-bottom: 25px;
  border-left: 5px solid #FFBB41;
}

.class-header h2 {
  font-size: 20px;
  margin: 0 0 5px 0;
}

.class-header p {
  margin: 0;
  font-size: 14px;
  color: #D1D5DB;
}

.class-header .details {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
  font-weight: bold;
}

/* Bulk Actions */
.bulk-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-bottom: 20px;
}

.bulk-actions button {
  background: #3A3A3A;
  color: white;
  padding: 8px 15px;
  border: 1px solid #555;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.3s;
  font-size: 12px;
}

.bulk-actions button:hover {
  background: #4A4A4A;
}

/* Client Row */
.client-row {
  background: #3A3A3A;
  border-radius: 5px;
  margin-bottom: 10px;
  transition: background 0.2s;
}

.client-row.absent {
  background: #3A3A3A80;
}

.client-row.no-saldo {
  background: #F4433620;
  border-left: 5px solid #F44336;
  opacity: 0.7;
  pointer-events: none;
}

.client-row-label {
  display: flex;
  align-items: center;
  padding: 15px 20px;
  cursor: pointer;
  user-select: none;
  width: 100%;
  box-sizing: border-box;
}

.client-info {
  flex-grow: 1;
  padding: 0 15px;
}

.client-info p {
  margin: 0;
}

.name {
  font-weight: bold;
  font-size: 16px;
}

.name-absent {
  color: #D1D5DB;
}

.details-text {
  font-size: 12px;
  color: #D1D5DB;
  margin-top: 2px;
}

.saldo {
  font-size: 14px;
  font-weight: bold;
  margin-top: 5px;
}

.saldo-green {
  color: #4CAF50;
}

.saldo-default {
  color: white;
}

.saldo-alert {
  color: #F44336;
  font-weight: bold;
  font-size: 14px;
}

.badge-alert {
  background: #F44336;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: bold;
}

/* Custom Checkbox */
.custom-checkbox {
  appearance: none;
  width: 30px;
  height: 30px;
  border: 2px solid #D1D5DB;
  border-radius: 4px;
  cursor: pointer;
  position: relative;
  flex-shrink: 0;
}

.custom-checkbox:checked {
  background-color: #FFBB41;
  border-color: #FFBB41;
}

.custom-checkbox:checked::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #000;
  font-size: 18px;
  font-weight: bold;
}

.custom-checkbox:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Save Button */
.btn-save {
  width: 100%;
  background: #4CAF50;
  padding: 15px;
  border: none;
  font-size: 16px;
  margin-top: 20px;
  cursor: pointer;
  border-radius: 5px;
  color: black;
  font-weight: bold;
  box-shadow: 0 4px #388E3C;
}

.btn-save:hover {
  background: #45A049;
}

/* Confirmation Message */
.confirmation-message {
  padding: 15px;
  border-radius: 5px;
  text-align: center;
  font-weight: bold;
  margin-top: 15px;
}

.success {
  background: #4CAF5020;
  border: 1px solid #4CAF50;
  color: #4CAF50;
}

.warning {
  background: #FFBB4120;
  border: 1px solid #FFBB41;
  color: #FFBB41;
}

/* Responsive */
@media (max-width: 768px) {
  .card {
    width: 100%;
    padding: 20px;
  }
}
</style>