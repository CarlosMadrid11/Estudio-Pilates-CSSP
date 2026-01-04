<template>
  <div>
    <div class="mis-reservas-view">
      <div class="container">
        <div class="card">
          <h1>Mis Reservas</h1>

          <!-- Loading -->
          <div v-if="isLoading" class="loading-container">
            <div class="spinner"></div>
            <p>Cargando reservas...</p>
          </div>

          <!-- Error -->
          <div v-else-if="error" class="error-container">
            <p>❌ Error: {{ error }}</p>
            <button @click="cargarReservas" class="btn-retry">Reintentar</button>
          </div>

          <!-- Sin Reservas -->
          <div v-else-if="reservas.length === 0" class="empty-container">
            <p>📅 No tienes reservas activas</p>
            <router-link to="/calendario-cliente" class="btn-calendario">
              Ver Calendario de Clases
            </router-link>
          </div>

          <!-- Lista de Reservas -->
          <div 
            v-else
            v-for="reserva in reservas" 
            :key="reserva.id" 
            class="reservation-card"
          >
            <h3>📅 {{ formatearFechaCompleta(reserva.clase_fecha) }}</h3>
            <p>🕐 {{ reserva.hora_inicio }} - {{ reserva.hora_fin }}</p>
            <p>👩‍🏫 Instructora: {{ reserva.instructor_nombre }}</p>
            <p :class="getStatusClass(reserva.estado)">
              {{ getStatusIcon(reserva.estado) }} {{ getStatusTexto(reserva.estado) }}
            </p>
            <button 
              @click="cancelarReserva(reserva)" 
              class="btn-cancel" 
              :disabled="!esCancelable(reserva) || isCancelling"
            >
              {{ isCancelling ? 'Cancelando...' : 'Cancelar Reserva' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { supabase } from '@/lib/supabase'

const authStore = useAuthStore()

// Types
interface Reserva {
  id: string
  estado: string
  fecha_reserva: string
  clase_fecha: string
  hora_inicio: string
  hora_fin: string
  instructor_nombre: string
  clase_id: string
  mi_paquete_id: string
}

// Estado
const reservas = ref<Reserva[]>([])
const isLoading = ref(true)
const error = ref<string | null>(null)
const isCancelling = ref(false)

// Cargar reservas del cliente
const cargarReservas = async () => {
  isLoading.value = true
  error.value = null

  try {
    console.log('📋 Cargando reservas...')

    // PASO 1: Obtener cliente_id
    const { data: clienteData, error: clienteError } = await supabase
      .from('clientes')
      .select('id')
      .eq('profile_id', authStore.userId)
      .single()

    if (clienteError || !clienteData) {
      throw new Error('No se encontró información del cliente')
    }

    const clienteId = clienteData.id
    console.log('✅ Cliente ID:', clienteId)

    // PASO 2: Obtener reservas con JOIN a clases e instructores
    const { data: reservasData, error: reservasError } = await supabase
      .from('mis_reservas')
      .select(`
        id,
        estado,
        fecha_reserva,
        clase_id,
        mi_paquete_id,
        clases (
          fecha,
          hora_inicio,
          hora_fin,
          instructores (
            profiles (
              nombre_completo
            )
          )
        )
      `)
      .eq('cliente_id', clienteId)
      .in('estado', ['confirmada', 'pendiente'])
      .order('clases(fecha)', { ascending: true })

    if (reservasError) {
      console.error('❌ Error al obtener reservas:', reservasError)
      throw new Error('Error al cargar reservas')
    }

    console.log('✅ Reservas obtenidas:', reservasData)

    // Mapear datos
    reservas.value = (reservasData || [])
      .filter((r) => r.clases) // Filtrar reservas sin clase
      .map((item) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const clase = item.clases as any
        const instructor = clase?.instructores?.profiles
        
        return {
          id: item.id,
          estado: item.estado,
          fecha_reserva: item.fecha_reserva,
          clase_fecha: clase?.fecha || '',
          hora_inicio: clase?.hora_inicio || '',
          hora_fin: clase?.hora_fin || '',
          instructor_nombre: instructor?.nombre_completo || 'Instructor',
          clase_id: item.clase_id,
          mi_paquete_id: item.mi_paquete_id
        }
      })
      .sort((a, b) => {
        // Comparar como strings YYYY-MM-DD (evita timezone)
        return a.clase_fecha.localeCompare(b.clase_fecha)
      })

    console.log('✅ Reservas procesadas:', reservas.value.length)

  } catch (err) {
    console.error('❌ Error en cargarReservas:', err)
    error.value = err instanceof Error ? err.message : 'Error desconocido'
  } finally {
    isLoading.value = false
  }
}

// ✅ CORREGIDO: Formatear fecha sin timezone issues
const formatearFechaCompleta = (fecha: string): string => {
  if (!fecha) return ''
  
  // Parsear manualmente para evitar conversión de timezone
  const [year, month, day] = fecha.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  
  const hoy = new Date()
  const manana = new Date(hoy)
  manana.setDate(manana.getDate() + 1)

  // Comparar solo la fecha (sin horas)
  const fechaSoloFecha = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const hoySoloFecha = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate())
  const mananaSoloFecha = new Date(manana.getFullYear(), manana.getMonth(), manana.getDate())

  if (fechaSoloFecha.getTime() === hoySoloFecha.getTime()) {
    return 'Hoy'
  } else if (fechaSoloFecha.getTime() === mananaSoloFecha.getTime()) {
    return 'Mañana'
  }

  return date.toLocaleDateString('es-MX', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

// Verificar si es cancelable
const esCancelable = (reserva: Reserva): boolean => {
  if (reserva.estado !== 'confirmada' && reserva.estado !== 'pendiente') {
    return false
  }

  // ✅ CORREGIDO: Parsear fecha manualmente
  const [year, month, day] = reserva.clase_fecha.split('-').map(Number)
  const [hours, minutes] = reserva.hora_inicio.split(':').map(Number)
  const fechaClase = new Date(year, month - 1, day, hours, minutes)
  
  const ahora = new Date()
  const horasRestantes = (fechaClase.getTime() - ahora.getTime()) / (1000 * 60 * 60)

  return horasRestantes > 2
}

// Get status class
const getStatusClass = (estado: string) => {
  switch (estado) {
    case 'confirmada':
      return 'status-green'
    case 'pendiente':
      return 'status-yellow'
    case 'cancelada':
      return 'status-red'
    default:
      return ''
  }
}

// Get status icon
const getStatusIcon = (estado: string) => {
  switch (estado) {
    case 'confirmada':
      return '🟢'
    case 'pendiente':
      return '🟡'
    case 'cancelada':
      return '🔴'
    default:
      return '⚪'
  }
}

// Get status texto
const getStatusTexto = (estado: string) => {
  switch (estado) {
    case 'confirmada':
      return 'Confirmada'
    case 'pendiente':
      return 'Pendiente'
    case 'cancelada':
      return 'Cancelada'
    default:
      return estado
  }
}

// Cancelar reserva
const cancelarReserva = async (reserva: Reserva) => {
  if (!esCancelable(reserva)) {
    alert('Esta reserva no puede ser cancelada (falta menos de 2 horas para la clase)')
    return
  }

  const confirmar = confirm(
    `¿Estás seguro de cancelar la reserva del ${formatearFechaCompleta(reserva.clase_fecha)} a las ${reserva.hora_inicio}?\n\n` +
    `Se devolverá 1 clase a tu paquete.`
  )

  if (!confirmar) return

  isCancelling.value = true

  try {
    console.log('🗑️ Cancelando reserva:', reserva.id)

    // PASO 1: Actualizar estado de la reserva
    const { error: updateError } = await supabase
      .from('mis_reservas')
      .update({ estado: 'cancelada' })
      .eq('id', reserva.id)

    if (updateError) {
      throw new Error(`Error al cancelar reserva: ${updateError.message}`)
    }

    console.log('✅ Reserva cancelada')

    // PASO 2: Devolver clase al paquete
    const { data: paqueteData, error: paqueteErrorGet } = await supabase
      .from('mis_paquetes')
      .select('clases_restantes')
      .eq('id', reserva.mi_paquete_id)
      .single()

    if (paqueteErrorGet) {
      console.error('⚠️ Error al obtener paquete:', paqueteErrorGet)
    } else if (paqueteData) {
      const { error: paqueteErrorUpdate } = await supabase
        .from('mis_paquetes')
        .update({ clases_restantes: paqueteData.clases_restantes + 1 })
        .eq('id', reserva.mi_paquete_id)

      if (paqueteErrorUpdate) {
        console.error('⚠️ Error al devolver clase:', paqueteErrorUpdate)
      } else {
        console.log('✅ Clase devuelta al paquete')
      }
    }

    // PASO 3: Actualizar capacidad de la clase
    const { data: claseData } = await supabase
      .from('clases')
      .select('capacidad_actual')
      .eq('id', reserva.clase_id)
      .single()

    if (claseData && claseData.capacidad_actual > 0) {
      const { error: capacidadError } = await supabase
        .from('clases')
        .update({ capacidad_actual: claseData.capacidad_actual - 1 })
        .eq('id', reserva.clase_id)

      if (capacidadError) {
        console.error('⚠️ Error al actualizar capacidad:', capacidadError)
      }
    }

    // PASO 4: Actualizar UI
    reservas.value = reservas.value.filter(r => r.id !== reserva.id)

    alert('✅ Reserva cancelada exitosamente. La clase ha sido devuelta a tu paquete.')

  } catch (err) {
    console.error('❌ Error al cancelar:', err)
    const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
    alert(`❌ Error al cancelar la reserva: ${errorMessage}`)
  } finally {
    isCancelling.value = false
  }
}

// Cargar al montar
onMounted(() => {
  cargarReservas()
})
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

/* Loading */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  padding: 60px 20px;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 5px solid #3A3A3A;
  border-top-color: #FFBB41;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-container p {
  color: #D1D5DB;
}

/* Error */
.error-container {
  text-align: center;
  padding: 40px 20px;
}

.error-container p {
  color: #F44336;
  margin-bottom: 20px;
}

.btn-retry {
  padding: 10px 20px;
  background: #FFBB41;
  color: #1E1E1E;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
}

.btn-retry:hover {
  opacity: 0.9;
}

/* Empty */
.empty-container {
  text-align: center;
  padding: 60px 20px;
}

.empty-container p {
  color: #999;
  font-size: 18px;
  margin-bottom: 20px;
}

.btn-calendario {
  display: inline-block;
  padding: 12px 24px;
  background: #FFBB41;
  color: #1E1E1E;
  text-decoration: none;
  border-radius: 5px;
  font-weight: bold;
  transition: all 0.3s ease;
}

.btn-calendario:hover {
  opacity: 0.9;
  transform: scale(1.02);
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