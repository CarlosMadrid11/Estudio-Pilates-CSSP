<template>
  <div>
    <div class="mis-reservas-view">
      <div class="container">
        <div class="card">
          <!-- Header con título y botón -->
          <div class="header">
            <h1>Mis Reservas</h1>
            <router-link to="/calendario-cliente" class="btn-nueva-reserva">
              + Nueva Reserva
            </router-link>
          </div>

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

          <!-- Tabs -->
          <div v-else>
            <!-- Tabs Header -->
            <div class="tabs-header">
              <button 
                @click="tabActivo = 'proximas'"
                :class="['tab', { active: tabActivo === 'proximas' }]"
              >
                📅 Próximas
                <span class="badge" v-if="reservasProximas.length > 0">
                  {{ reservasProximas.length }}
                </span>
              </button>
              <button 
                @click="tabActivo = 'pasadas'"
                :class="['tab', { active: tabActivo === 'pasadas' }]"
              >
                📚 Historial
                <span class="badge" v-if="reservasPasadas.length > 0">
                  {{ reservasPasadas.length }}
                </span>
              </button>
              <button 
                @click="tabActivo = 'canceladas'"
                :class="['tab', { active: tabActivo === 'canceladas' }]"
              >
                🚫 Canceladas
                <span class="badge" v-if="reservasCanceladas.length > 0">
                  {{ reservasCanceladas.length }}
                </span>
              </button>
            </div>

            <!-- Tab Content: Próximas -->
            <div v-show="tabActivo === 'proximas'" class="tab-content">
              <div v-if="reservasProximas.length === 0" class="empty-state">
                <p>📅 No tienes reservas próximas</p>
                <router-link to="/calendario-cliente" class="btn-action">
                  Reservar una clase
                </router-link>
              </div>
              <div 
                v-else
                v-for="reserva in reservasProximas" 
                :key="reserva.id" 
                class="reservation-card proxima"
              >
                <h3>📅 {{ formatearFechaCompleta(reserva.clase_fecha) }}</h3>
                <p>🕐 {{ formatearHora(reserva.hora_inicio) }} - {{ formatearHora(reserva.hora_fin) }}</p>
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

            <!-- Tab Content: Pasadas -->
            <div v-show="tabActivo === 'pasadas'" class="tab-content">
              <div v-if="reservasPasadas.length === 0" class="empty-state">
                <p>📚 No tienes reservas pasadas</p>
              </div>
              <div 
                v-else
                v-for="reserva in reservasPasadas" 
                :key="reserva.id" 
                class="reservation-card pasada"
              >
                <h3>📅 {{ formatearFechaCompleta(reserva.clase_fecha) }}</h3>
                <p>🕐 {{ formatearHora(reserva.hora_inicio) }} - {{ formatearHora(reserva.hora_fin) }}</p>
                <p>👩‍🏫 Instructora: {{ reserva.instructor_nombre }}</p>
                
                <!-- Badge de asistencia -->
                <div class="asistencia-badge">
                  <span v-if="reserva.asistio === true" class="badge-asistio">
                    ✓ Asistió
                  </span>
                  <span v-else-if="reserva.asistio === false" class="badge-falto">
                    ✗ Faltó
                  </span>
                  <span v-else class="badge-pendiente">
                    ⏳ Pendiente
                  </span>
                </div>
              </div>
              <p v-if="reservasPasadas.length >= 10" class="info-limit">
                ℹ️ Mostrando las últimas 10 reservas
              </p>
            </div>

            <!-- Tab Content: Canceladas -->
            <div v-show="tabActivo === 'canceladas'" class="tab-content">
              <div v-if="reservasCanceladas.length === 0" class="empty-state">
                <p>🚫 No tienes reservas canceladas</p>
              </div>
              <div 
                v-else
                v-for="reserva in reservasCanceladas" 
                :key="reserva.id" 
                class="reservation-card cancelada"
              >
                <h3>📅 {{ formatearFechaCompleta(reserva.clase_fecha) }}</h3>
                <p>🕐 {{ formatearHora(reserva.hora_inicio) }} - {{ formatearHora(reserva.hora_fin) }}</p>
                <p>👩‍🏫 Instructora: {{ reserva.instructor_nombre }}</p>
                <p class="status-red">
                  🔴 Cancelada
                </p>
              </div>
              <p v-if="reservasCanceladas.length >= 5" class="info-limit">
                ℹ️ Mostrando las últimas 5 cancelaciones
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
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
  asistio: boolean | null
}

// Estado
const todasReservas = ref<Reserva[]>([])
const isLoading = ref(true)
const error = ref<string | null>(null)
const isCancelling = ref(false)
const tabActivo = ref<'proximas' | 'pasadas' | 'canceladas'>('proximas')

// Computed: Separar reservas por categoría
const reservasProximas = computed(() => {
  const hoy = obtenerFechaHoy()
  return todasReservas.value.filter(r => 
    (r.estado === 'confirmada' || r.estado === 'pendiente') && 
    r.clase_fecha >= hoy
  )
})

const reservasPasadas = computed(() => {
  const hoy = obtenerFechaHoy()
  return todasReservas.value
    .filter(r => 
      r.estado === 'confirmada' && 
      r.clase_fecha < hoy
    )
    .sort((a, b) => b.clase_fecha.localeCompare(a.clase_fecha))
    .slice(0, 10) // Máximo 10
})

const reservasCanceladas = computed(() => {
  return todasReservas.value
    .filter(r => r.estado === 'cancelada')
    .sort((a, b) => b.fecha_reserva.localeCompare(a.fecha_reserva))
    .slice(0, 5) // Máximo 5
})

// Helper: Obtener fecha de hoy en formato YYYY-MM-DD
const obtenerFechaHoy = (): string => {
  const hoy = new Date()
  const year = hoy.getFullYear()
  const month = String(hoy.getMonth() + 1).padStart(2, '0')
  const day = String(hoy.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// Cargar todas las reservas del cliente
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

    // PASO 2: Obtener TODAS las reservas (sin filtro de estado)
    const { data: reservasData, error: reservasError } = await supabase
      .from('mis_reservas')
      .select(`
        id,
        estado,
        fecha_reserva,
        clase_id,
        mi_paquete_id,
        asistio,
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
      .order('clases(fecha)', { ascending: false })

    if (reservasError) {
      console.error('❌ Error al obtener reservas:', reservasError)
      throw new Error('Error al cargar reservas')
    }

    console.log('✅ Reservas obtenidas:', reservasData)

    // Mapear datos
    todasReservas.value = (reservasData || [])
      .filter((r) => r.clases)
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
          mi_paquete_id: item.mi_paquete_id,
          asistio: item.asistio
        }
      })

    console.log('✅ Total reservas:', todasReservas.value.length)
    console.log('📅 Próximas:', reservasProximas.value.length)
    console.log('📚 Pasadas:', reservasPasadas.value.length)
    console.log('🚫 Canceladas:', reservasCanceladas.value.length)

  } catch (err) {
    console.error('❌ Error en cargarReservas:', err)
    error.value = err instanceof Error ? err.message : 'Error desconocido'
  } finally {
    isLoading.value = false
  }
}

// Formatear fecha sin timezone issues
const formatearFechaCompleta = (fecha: string): string => {
  if (!fecha) return ''
  
  const [year, month, day] = fecha.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  
  const hoy = new Date()
  const manana = new Date(hoy)
  manana.setDate(manana.getDate() + 1)

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

// Formatear hora (remover segundos)
const formatearHora = (hora: string): string => {
  return hora.substring(0, 5)
}

// Verificar si es cancelable
const esCancelable = (reserva: Reserva): boolean => {
  if (reserva.estado !== 'confirmada' && reserva.estado !== 'pendiente') {
    return false
  }

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
    case 'confirmada': return 'status-green'
    case 'pendiente': return 'status-yellow'
    case 'cancelada': return 'status-red'
    default: return ''
  }
}

// Get status icon
const getStatusIcon = (estado: string) => {
  switch (estado) {
    case 'confirmada': return '🟢'
    case 'pendiente': return '🟡'
    case 'cancelada': return '🔴'
    default: return '⚪'
  }
}

// Get status texto
const getStatusTexto = (estado: string) => {
  switch (estado) {
    case 'confirmada': return 'Confirmada'
    case 'pendiente': return 'Pendiente'
    case 'cancelada': return 'Cancelada'
    default: return estado
  }
}

// Cancelar reserva
const cancelarReserva = async (reserva: Reserva) => {
  if (!esCancelable(reserva)) {
    alert('Esta reserva no puede ser cancelada (falta menos de 2 horas para la clase)')
    return
  }

  const confirmar = confirm(
    `¿Estás seguro de cancelar la reserva del ${formatearFechaCompleta(reserva.clase_fecha)} a las ${formatearHora(reserva.hora_inicio)}?\n\n` +
    `Se devolverá 1 clase a tu paquete.`
  )

  if (!confirmar) return

  isCancelling.value = true

  try {
    console.log('🗑️ Cancelando reserva:', reserva.id)

    // Actualizar estado de la reserva
    const { error: updateError } = await supabase
      .from('mis_reservas')
      .update({ estado: 'cancelada' })
      .eq('id', reserva.id)

    if (updateError) {
      throw new Error(`Error al cancelar reserva: ${updateError.message}`)
    }

    // Devolver clase al paquete
    const { data: paqueteData } = await supabase
      .from('mis_paquetes')
      .select('clases_restantes')
      .eq('id', reserva.mi_paquete_id)
      .single()

    if (paqueteData) {
      await supabase
        .from('mis_paquetes')
        .update({ clases_restantes: paqueteData.clases_restantes + 1 })
        .eq('id', reserva.mi_paquete_id)
    }

    // Actualizar capacidad de la clase
    const { data: claseData } = await supabase
      .from('clases')
      .select('capacidad_actual')
      .eq('id', reserva.clase_id)
      .single()

    if (claseData && claseData.capacidad_actual > 0) {
      await supabase
        .from('clases')
        .update({ capacidad_actual: claseData.capacidad_actual - 1 })
        .eq('id', reserva.clase_id)
    }

    // Recargar reservas
    await cargarReservas()
    
    // Cambiar a tab de canceladas
    tabActivo.value = 'canceladas'

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
}

.card {
  width: 75%;
  max-width: 900px;
  background: #2C2C2C;
  padding: 40px;
  border-radius: 5px;
}

/* Header */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

h1 {
  margin: 0;
  font-size: 24px;
  font-weight: bold;
}

.btn-nueva-reserva {
  padding: 12px 24px;
  background: #FFBB41;
  color: #1E1E1E;
  text-decoration: none;
  border-radius: 5px;
  font-weight: bold;
  transition: all 0.3s ease;
}

.btn-nueva-reserva:hover {
  opacity: 0.9;
  transform: scale(1.02);
}

/* Tabs */
.tabs-header {
  display: flex;
  gap: 10px;
  margin-bottom: 25px;
  border-bottom: 2px solid #3A3A3A;
}

.tab {
  padding: 12px 20px;
  background: transparent;
  border: none;
  color: #999;
  cursor: pointer;
  font-size: 15px;
  font-weight: 600;
  position: relative;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.tab:hover {
  color: #FFBB41;
}

.tab.active {
  color: white;
}

.tab.active::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  right: 0;
  height: 2px;
  background: #FFBB41;
}

.tab .badge {
  background: #FFBB41;
  color: #1E1E1E;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: bold;
}

/* Tab Content */
.tab-content {
  animation: fadeIn 0.3s;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
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

/* Empty State */
.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.empty-state p {
  color: #999;
  font-size: 16px;
  margin-bottom: 20px;
}

.btn-action {
  display: inline-block;
  padding: 12px 24px;
  background: #FFBB41;
  color: #1E1E1E;
  text-decoration: none;
  border-radius: 5px;
  font-weight: bold;
  transition: all 0.3s ease;
}

.btn-action:hover {
  opacity: 0.9;
  transform: scale(1.02);
}

/* Reservation Cards */
.reservation-card {
  background: #3A3A3A;
  border-radius: 6px;
  padding: 20px;
  margin-bottom: 15px;
  transition: transform 0.2s;
}

.reservation-card.proxima {
  border-left: 5px solid #4CAF50;
}

.reservation-card.pasada {
  border-left: 5px solid #999;
  opacity: 0.85;
}

.reservation-card.cancelada {
  border-left: 5px solid #F44336;
  opacity: 0.7;
}

.reservation-card:hover {
  transform: translateY(-2px);
}

.reservation-card h3 {
  margin: 0 0 8px 0;
  font-size: 18px;
}

.reservation-card p {
  margin: 5px 0;
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

/* Asistencia Badges */
.asistencia-badge {
  margin-top: 10px;
}

.badge-asistio {
  display: inline-block;
  padding: 6px 12px;
  background: #4CAF50;
  color: white;
  border-radius: 5px;
  font-size: 13px;
  font-weight: bold;
}

.badge-falto {
  display: inline-block;
  padding: 6px 12px;
  background: #F44336;
  color: white;
  border-radius: 5px;
  font-size: 13px;
  font-weight: bold;
}

.badge-pendiente {
  display: inline-block;
  padding: 6px 12px;
  background: #999;
  color: white;
  border-radius: 5px;
  font-size: 13px;
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

/* Info Limit */
.info-limit {
  text-align: center;
  color: #999;
  font-size: 13px;
  margin-top: 20px;
  font-style: italic;
}

/* Responsive */
@media (max-width: 768px) {
  .card {
    width: 100%;
    padding: 20px;
  }

  .header {
    flex-direction: column;
    gap: 15px;
    align-items: flex-start;
  }

  .btn-nueva-reserva {
    width: 100%;
    text-align: center;
  }

  .tabs-header {
    flex-wrap: wrap;
  }

  .tab {
    flex: 1;
    min-width: 100px;
    justify-content: center;
  }
}
</style>