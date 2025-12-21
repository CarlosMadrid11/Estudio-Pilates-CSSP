<template>
  <div>
    <NavBarLogueadoView />

    <div class="mis-reservas-view">
      <!-- Contenido de Mis Reservas -->
      <div class="container">
        <div class="card">

          <h1>Mis Reservas</h1>

          <div 
            v-for="reserva in reservas" 
            :key="reserva.id" 
            class="reservation-card"
          >
            <h3>📅 {{ reserva.fecha }}</h3>
            <p>🕐 {{ reserva.hora }}</p>
            <p>👩‍🏫 Instructora: {{ reserva.instructora }}</p>
            <p>🛏️ Cama asignada: #{{ reserva.cama }}</p>
            <p :class="getStatusClass(reserva.estado)">
              {{ getStatusIcon(reserva.estado) }} {{ reserva.estadoTexto }}
            </p>
            <button 
              @click="cancelarReserva(reserva.id)" 
              class="btn-cancel" 
              :disabled="!reserva.cancelable"
            >
              Cancelar Reserva
            </button>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import NavBarLogueadoView from '@/ComponentesReutilizables/NavBarLogueadoView.vue'
import { ref } from 'vue'

interface Reserva {
  id: number
  fecha: string
  hora: string
  instructora: string
  cama: number
  estado: 'confirmada' | 'pendiente' | 'no-cancelable'
  estadoTexto: string
  cancelable: boolean
}

// Datos de reservas
const reservas = ref<Reserva[]>([
  {
    id: 1,
    fecha: 'Miércoles 10 Dic 2025',
    hora: '10:00 AM - 11:00 AM',
    instructora: 'Laura Sánchez',
    cama: 5,
    estado: 'confirmada',
    estadoTexto: '🟢 Confirmada',
    cancelable: true
  },
  {
    id: 2,
    fecha: 'Viernes 12 Dic 2025',
    hora: '18:00 PM - 19:00 PM',
    instructora: 'Ana Gómez',
    cama: 2,
    estado: 'pendiente',
    estadoTexto: '🟡 Pendiente (Lista de espera)',
    cancelable: true
  },
  {
    id: 3,
    fecha: 'Hoy',
    hora: '16:00 PM - 17:00 PM',
    instructora: 'María Ruiz',
    cama: 8,
    estado: 'no-cancelable',
    estadoTexto: '🔴 No cancelable (Falta < 1 hora)',
    cancelable: false
  }
])

const getStatusClass = (estado: string) => {
  switch (estado) {
    case 'confirmada':
      return 'status-green'
    case 'pendiente':
      return 'status-yellow'
    case 'no-cancelable':
      return 'status-red'
    default:
      return ''
  }
}

const getStatusIcon = (estado: string) => {
  switch (estado) {
    case 'confirmada':
      return '🟢'
    case 'pendiente':
      return '🟡'
    case 'no-cancelable':
      return '🔴'
    default:
      return ''
  }
}

const cancelarReserva = (id: number) => {
  const reserva = reservas.value.find(r => r.id === id)
  
  if (!reserva || !reserva.cancelable) {
    return
  }

  if (confirm(`¿Estás seguro de cancelar la reserva del ${reserva.fecha}?`)) {
    // Aquí conectarías con tu backend para cancelar
    console.log('Cancelando reserva:', id)
    
    // Eliminar la reserva de la lista
    reservas.value = reservas.value.filter(r => r.id !== id)
    
    alert('Reserva cancelada exitosamente')
  }
}
</script>

<style scoped>
.mis-reservas-view {
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
  padding: 20px;
  margin-top: 40px;
}

.card {
  width: 75%;
  max-width: 900px;
  background: #2C2C2C;
  padding: 40px;
  border-radius: 5px;
}

h1 {
  margin: 0 0 25px 0;
  font-size: 24px;
  font-weight: bold;
}

/* Reservation Card */
.reservation-card {
  background: #3A3A3A;
  border-radius: 6px;
  padding: 20px;
  margin-bottom: 15px;
  border-left: 5px solid #FFBB41;
  transition: transform 0.2s;
}

.reservation-card:hover {
  transform: translateY(-2px);
}

.reservation-card h3 {
  margin: 0 0 8px 0;
  font-size: 18px;
}

.reservation-card p {
  margin: 3px 0;
  font-size: 14px;
  color: #D1D5DB;
}

/* Status Colors */
.status-green {
  color: #4CAF50;
  font-weight: bold;
}

.status-yellow {
  color: #FFBB41;
  font-weight: bold;
}

.status-red {
  color: #F44336;
  font-weight: bold;
}

/* Cancel Button */
.btn-cancel {
  margin-top: 10px;
  background: #F44336;
  padding: 10px 18px;
  border: none;
  color: white;
  cursor: pointer;
  border-radius: 4px;
  font-weight: bold;
  transition: all 0.3s ease;
}

.btn-cancel:hover:not(:disabled) {
  background: #D32F2F;
  transform: scale(1.02);
}

.btn-cancel:disabled {
  background: #555;
  cursor: not-allowed;
  opacity: 0.6;
}

/* Responsive */
@media (max-width: 768px) {
  .card {
    width: 100%;
    padding: 20px;
  }
}
</style>