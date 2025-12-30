<template>
  <div>
    <div class="dashboard-cliente-view">
      <div class="container">

        <!-- Loading State -->
        <div v-if="isLoading" class="loading-container">
          <div class="spinner"></div>
          <p>Cargando información...</p>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="error-container">
          <p>❌ Error: {{ error }}</p>
          <button @click="cargarDatos" class="retry-btn">Reintentar</button>
        </div>

        <!-- Dashboard Content -->
        <template v-else>
          <!-- Información personal -->
          <div class="card">
            <h2>Información Personal</h2>
            <div class="info-item">
              <strong>Nombre:</strong> {{ clienteInfo.nombre }}
            </div>
            <div class="info-item">
              <strong>Correo:</strong> {{ clienteInfo.email }}
            </div>
            <div class="info-item">
              <strong>Teléfono:</strong> {{ clienteInfo.telefono }}
            </div>
          </div>

          <!-- Paquetes Activos -->
          <div v-if="paquetesActivos.length > 0" class="card">
            <h2>Mis Paquetes Activos</h2>
            
            <!-- Si tiene UN solo paquete -->
            <template v-if="paquetesActivos.length === 1">
              <div class="info-item">
                <strong>Paquete Actual:</strong> {{ paquetesActivos[0].paquete_nombre }}
              </div>
              <div class="info-item">
                <strong>Clases Disponibles:</strong> 
                {{ paquetesActivos[0].clases_restantes }} de {{ paquetesActivos[0].clases_totales }}
              </div>
              <div class="info-item">
                <strong>Vigencia:</strong> {{ formatearFecha(paquetesActivos[0].fecha_vencimiento) }}
                <span :class="getEstadoClass(paquetesActivos[0])">
                  {{ getEstadoTexto(paquetesActivos[0]) }}
                </span>
              </div>
            </template>

            <!-- Si tiene MÚLTIPLES paquetes -->
            <template v-else>
              <div class="info-item">
                <strong>Total de Paquetes Activos:</strong> {{ paquetesActivos.length }}
              </div>
              <div class="info-item">
                <strong>Clases Disponibles (Total):</strong> {{ totalClasesDisponibles }}
              </div>
              
              <!-- Lista de paquetes -->
              <div class="paquetes-lista">
                <div 
                  v-for="paquete in paquetesActivos" 
                  :key="paquete.id"
                  class="paquete-item"
                >
                  <div class="paquete-nombre">{{ paquete.paquete_nombre }}</div>
                  <div class="paquete-detalle">
                    {{ paquete.clases_restantes }}/{{ paquete.clases_totales }} clases
                    • Vence: {{ formatearFecha(paquete.fecha_vencimiento) }}
                    <span :class="getEstadoClass(paquete)">
                      {{ getEstadoTexto(paquete) }}
                    </span>
                  </div>
                </div>
              </div>
            </template>
          </div>

          <!-- Sin Paquetes -->
          <div v-else class="card no-paquetes">
            <h2>Saldo de Clases</h2>
            <p>No tienes paquetes activos</p>
            <router-link to="/planes" class="btn-comprar">
              Ver Paquetes Disponibles
            </router-link>
          </div>

          <!-- Grid con dos tablas -->
          <div class="grid">

            <!-- Próximas Reservas (Hardcoded por ahora) -->
            <div class="card">
              <h2>Próximas Reservas</h2>
              <div class="placeholder">
                <p>🚧 Módulo en desarrollo</p>
                <p>Aquí verás tus próximas clases reservadas</p>
              </div>
              <!-- 
              <table>
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Hora</th>
                    <th>Sala</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colspan="3" class="no-data">Sin reservas próximas</td>
                  </tr>
                </tbody>
              </table>
              -->
            </div>

            <!-- Historial (Hardcoded por ahora) -->
            <div class="card">
              <h2>Historial de Clases</h2>
              <div class="placeholder">
                <p>🚧 Módulo en desarrollo</p>
                <p>Aquí verás tu historial de clases</p>
              </div>
              <!--
              <table>
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Hora</th>
                    <th>Instructor(a)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colspan="3" class="no-data">Sin historial</td>
                  </tr>
                </tbody>
              </table>
              -->
            </div>

          </div>
        </template>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onActivated } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { supabase } from '@/lib/supabase'

// Store
const authStore = useAuthStore()

// Types
interface ClienteInfo {
  nombre: string
  email: string
  telefono: string
}

interface PaqueteActivo {
  id: string
  paquete_nombre: string
  clases_totales: number
  clases_restantes: number
  fecha_compra: string
  fecha_vencimiento: string
  activo: boolean
}

// Estado
const isLoading = ref(true)
const error = ref<string | null>(null)
const clienteInfo = ref<ClienteInfo>({
  nombre: '',
  email: '',
  telefono: ''
})
const paquetesActivos = ref<PaqueteActivo[]>([])

// Computed
const totalClasesDisponibles = computed(() => {
  return paquetesActivos.value.reduce((total, paquete) => {
    return total + paquete.clases_restantes
  }, 0)
})

// Cargar datos del cliente
const cargarDatos = async () => {
  isLoading.value = true
  error.value = null

  try {
    console.log('📊 Cargando dashboard...')

    // PASO 1: Info personal (del auth store)
    clienteInfo.value = {
      nombre: authStore.userName,
      email: authStore.userEmail,
      telefono: authStore.user?.telefono || 'No especificado'
    }

    console.log('✅ Info personal cargada:', clienteInfo.value)

    // PASO 2: Obtener cliente_id
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

    // PASO 3: Obtener paquetes activos
    const { data: paquetesData, error: paquetesError } = await supabase
      .from('mis_paquetes')
      .select(`
        id,
        clases_totales,
        clases_restantes,
        fecha_compra,
        fecha_vencimiento,
        activo,
        paquetes (
          nombre
        )
      `)
      .eq('cliente_id', clienteId)
      .eq('activo', true)
      .gt('clases_restantes', 0)
      .gte('fecha_vencimiento', new Date().toISOString())
      .order('fecha_vencimiento', { ascending: true })

    if (paquetesError) {
      console.error('❌ Error al obtener paquetes:', paquetesError)
      throw new Error('Error al cargar paquetes')
    }

    console.log('✅ Paquetes obtenidos:', paquetesData)

    // Mapear datos
    paquetesActivos.value = (paquetesData || []).map((item) => {
      // Type assertion para el objeto paquetes
      const paqueteInfo = item.paquetes as unknown as { nombre: string } | null
      
      return {
        id: item.id,
        paquete_nombre: paqueteInfo?.nombre || 'Paquete',
        clases_totales: item.clases_totales,
        clases_restantes: item.clases_restantes,
        fecha_compra: item.fecha_compra,
        fecha_vencimiento: item.fecha_vencimiento,
        activo: item.activo
      }
    })

    console.log('✅ Dashboard cargado completamente')

  } catch (err) {
    console.error('❌ Error en cargarDatos:', err)
    error.value = err instanceof Error ? err.message : 'Error desconocido'
  } finally {
    isLoading.value = false
  }
}

// Formatear fecha
const formatearFecha = (fecha: string): string => {
  const date = new Date(fecha)
  return date.toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}

// Obtener estado del paquete
const getEstadoTexto = (paquete: PaqueteActivo): string => {
  const hoy = new Date()
  const vencimiento = new Date(paquete.fecha_vencimiento)
  const diasRestantes = Math.ceil((vencimiento.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24))

  if (diasRestantes < 0) return '❌ Vencido'
  if (paquete.clases_restantes === 0) return '⚠️ Sin clases'
  if (diasRestantes <= 7) return `⚠️ ${diasRestantes} días restantes`
  return '✅ Activo'
}

const getEstadoClass = (paquete: PaqueteActivo): string => {
  const hoy = new Date()
  const vencimiento = new Date(paquete.fecha_vencimiento)
  const diasRestantes = Math.ceil((vencimiento.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24))

  if (diasRestantes < 0 || paquete.clases_restantes === 0) return 'estado-vencido'
  if (diasRestantes <= 7) return 'estado-proximo'
  return 'estado-activo'
}

// Cargar al montar
onMounted(() => {
  cargarDatos()
})

// Recargar cada vez que se activa la vista (cuando vuelves de otra ruta)
onActivated(() => {
  cargarDatos()
})
</script>

<style scoped>
.dashboard-cliente-view {
  background: #2C2C2C;
  min-height: 100vh;
  padding: 40px 20px;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
}

/* Loading & Error */
.loading-container, .error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 20px;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 5px solid #4A4A4A;
  border-top-color: #FFBB41;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-container p, .error-container p {
  color: #D1D5DB;
  font-size: 16px;
}

.retry-btn {
  padding: 10px 20px;
  background: #FFBB41;
  color: #2C2C2C;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
}

.retry-btn:hover {
  opacity: 0.9;
}

/* Cards */
.card {
  background: #3A3A3A;
  border-radius: 8px;
  padding: 30px;
  margin-bottom: 20px;
  border: 1px solid #4A4A4A;
}

h2 {
  color: #FFBB41;
  font-size: 22px;
  margin: 0 0 20px 0;
}

/* Info Items */
.info-item {
  padding: 10px 0;
  border-bottom: 1px solid #4A4A4A;
  font-size: 15px;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.info-item:last-child {
  border-bottom: none;
}

.info-item strong {
  color: #D1D5DB;
  margin-right: 10px;
}

/* Estados */
.estado-activo {
  color: #4caf50;
  font-weight: bold;
  margin-left: 10px;
}

.estado-proximo {
  color: #ffa726;
  font-weight: bold;
  margin-left: 10px;
}

.estado-vencido {
  color: #ff6b6b;
  font-weight: bold;
  margin-left: 10px;
}

/* Lista de Paquetes */
.paquetes-lista {
  margin-top: 15px;
}

.paquete-item {
  background: #2C2C2C;
  padding: 15px;
  margin-bottom: 10px;
  border-radius: 5px;
  border-left: 3px solid #FFBB41;
}

.paquete-nombre {
  color: #FFBB41;
  font-weight: bold;
  margin-bottom: 5px;
}

.paquete-detalle {
  color: #D1D5DB;
  font-size: 14px;
}

/* Sin Paquetes */
.no-paquetes {
  text-align: center;
}

.no-paquetes p {
  color: #999;
  margin: 20px 0;
}

.btn-comprar {
  display: inline-block;
  padding: 12px 24px;
  background: #FFBB41;
  color: #2C2C2C;
  text-decoration: none;
  border-radius: 5px;
  font-weight: bold;
  margin-top: 10px;
  transition: all 0.3s ease;
}

.btn-comprar:hover {
  opacity: 0.9;
  transform: scale(1.02);
}

/* Placeholder */
.placeholder {
  text-align: center;
  padding: 40px 20px;
  color: #999;
}

.placeholder p {
  margin: 10px 0;
}

/* Grid for tables */
.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-top: 20px;
}

/* Tables */
table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 15px;
}

thead {
  background: #2C2C2C;
}

th {
  color: #FFBB41;
  text-align: left;
  padding: 12px;
  font-weight: bold;
  font-size: 14px;
}

td {
  padding: 12px;
  border-bottom: 1px solid #4A4A4A;
  font-size: 14px;
  color: #D1D5DB;
}

.no-data {
  text-align: center;
  color: #999;
}

tbody tr:last-child td {
  border-bottom: none;
}

tbody tr:hover {
  background: #454545;
}

/* Responsive */
@media (max-width: 768px) {
  .grid {
    grid-template-columns: 1fr;
  }
  
  .card {
    padding: 20px;
  }
}
</style>