<template>
  <div class="planes-view">
    <!-- Hero Section -->
    <section class="hero">
      <h1>Pilates Core Strong Studio</h1>
      <p>Elije el plan que mejor se adapte a tus necesidades...</p>
    </section>

    <!-- Loading State -->
    <section v-if="isLoading" class="loading-container">
      <div class="spinner"></div>
      <p>Cargando planes...</p>
    </section>

    <!-- Error State -->
    <section v-else-if="error" class="error-container">
      <p>❌ Error al cargar los planes: {{ error }}</p>
      <button @click="fetchPaquetes" class="retry-btn">Reintentar</button>
    </section>

    <!-- Plans Container -->
    <section v-else class="plans-container">
      <div 
        v-for="(paquete, index) in paquetes" 
        :key="paquete.id"
        class="plan"
        :class="{ 'best-option': paquete.destacado }"
      >
        <div v-if="paquete.destacado" class="badge">MEJOR OPCIÓN</div>
        
        <h2>{{ paquete.nombre }}</h2>
        <p>{{ paquete.num_clases }} clases</p>
        <p>Vigencia de {{ paquete.vigencia_dias }} días</p>
        <p class="price">${{ formatearPrecio(paquete.precio) }} MXN</p>
        
        <!-- Mostrar ahorro si aplica -->
        <p v-if="paquete.ahorro && paquete.ahorro > 0" class="ahorro">
          Ahorra ${{ formatearPrecio(paquete.ahorro) }} MXN
        </p>
        
        <button @click="comprarPlan(paquete)">Comprar ahora</button>
        <a href="#" @click.prevent="verInfo(paquete)" class="info-link">Ver más información*</a>
      </div>
    </section>

    <!-- Mensaje si no hay paquetes -->
    <section v-if="!isLoading && !error && paquetes.length === 0" class="empty-container">
      <p>No hay paquetes disponibles en este momento.</p>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth'

// Types
interface Paquete {
  id: string
  nombre: string
  descripcion: string | null
  precio: number
  num_clases: number
  vigencia_dias: number
  activo: boolean
  destacado?: boolean
  ahorro?: number
}

// Router y Store
const router = useRouter()
const authStore = useAuthStore()

// Estado
const paquetes = ref<Paquete[]>([])
const isLoading = ref(true)
const error = ref<string | null>(null)

// Fetch de paquetes desde Supabase
const fetchPaquetes = async () => {
  isLoading.value = true
  error.value = null
  
  try {
    console.log('📦 Obteniendo paquetes...')
    
    const { data, error: fetchError } = await supabase
      .from('paquetes')
      .select('*')
      .eq('activo', true)
      .order('num_clases', { ascending: true })

    if (fetchError) {
      console.error('❌ Error al obtener paquetes:', fetchError)
      throw new Error(fetchError.message)
    }

    if (!data || data.length === 0) {
      console.warn('⚠️ No se encontraron paquetes activos')
      paquetes.value = []
      return
    }

    console.log('✅ Paquetes obtenidos:', data)

    // Calcular ahorro y determinar destacado
    const paquetesConAhorro = calcularAhorros(data)
    
    paquetes.value = paquetesConAhorro

  } catch (err) {
    console.error('❌ Error en fetchPaquetes:', err)
    error.value = err instanceof Error ? err.message : 'Error desconocido'
  } finally {
    isLoading.value = false
  }
}

// Calcular ahorros (comparando con precio por clase del paquete base)
const calcularAhorros = (paquetesRaw: any[]): Paquete[] => {
  if (paquetesRaw.length === 0) return []

  // Ordenar por número de clases
  const sorted = [...paquetesRaw].sort((a, b) => a.num_clases - b.num_clases)
  
  // El paquete más pequeño es la referencia (sin descuento)
  const paqueteBase = sorted[0]
  const precioClaseBase = paqueteBase.precio / paqueteBase.num_clases

  return sorted.map((paquete, index) => {
    const precioClaseActual = paquete.precio / paquete.num_clases
    const precioSinDescuento = precioClaseBase * paquete.num_clases
    const ahorro = Math.round(precioSinDescuento - paquete.precio)

    // El paquete del medio será el destacado
    const destacado = index === Math.floor(sorted.length / 2)

    return {
      ...paquete,
      ahorro: ahorro > 0 ? ahorro : 0,
      destacado
    }
  })
}

// Formatear precio con comas
const formatearPrecio = (precio: number): string => {
  return precio.toLocaleString('es-MX', { 
    minimumFractionDigits: 2,
    maximumFractionDigits: 2 
  })
}

// Comprar plan
const comprarPlan = (paquete: Paquete) => {
  console.log('💳 Comprando paquete:', paquete)
  
  // Si no está autenticado, redirigir al login
  if (!authStore.isAuthenticated) {
    alert('Debes iniciar sesión para comprar un paquete')
    router.push('/login')
    return
  }

  // TODO: Implementar flujo de compra (FASE 3 avanzada)
  alert(
    `¡Has seleccionado el ${paquete.nombre}!\n\n` +
    `📦 ${paquete.num_clases} clases\n` +
    `⏰ Vigencia: ${paquete.vigencia_dias} días\n` +
    `💰 Precio: $${formatearPrecio(paquete.precio)} MXN\n` +
    (paquete.ahorro && paquete.ahorro > 0 ? `✨ Ahorras: $${formatearPrecio(paquete.ahorro)} MXN` : '') +
    `\n\n🚧 Función de compra en desarrollo...`
  )
  
  // router.push('/metodo-pago')
}

// Ver información
const verInfo = (paquete: Paquete) => {
  console.log('ℹ️ Ver info de:', paquete)
  
  alert(
    `Información del ${paquete.nombre}:\n\n` +
    `✓ ${paquete.num_clases} clases\n` +
    `✓ Vigencia: ${paquete.vigencia_dias} días\n` +
    `✓ Precio: $${formatearPrecio(paquete.precio)} MXN\n` +
    (paquete.ahorro && paquete.ahorro > 0 ? `✓ Ahorras: $${formatearPrecio(paquete.ahorro)} MXN\n` : '') +
    (paquete.descripcion ? `\n${paquete.descripcion}` : '')
  )
}

// Cargar paquetes al montar el componente
onMounted(() => {
  fetchPaquetes()
})
</script>

<style scoped>
.planes-view {
  margin: 0;
  padding: 0;
  font-family: Arial, Helvetica, sans-serif;
  background-color: #000;
  color: white;
  min-height: 100vh;
}

/* Hero Section */
.hero {
  position: relative;
  text-align: center;
  padding: 150px 20px;
  overflow: hidden;
}

.hero::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: url('/Pilates-Kensington-London.jpg') center/cover no-repeat;
  filter: brightness(0.4);
  z-index: -1;
}

.hero h1 {
  font-size: 60px;
  margin: 0;
  font-weight: bold;
}

.hero p {
  font-size: 22px;
  margin-top: 20px;
}

/* Loading State */
.loading-container {
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
  border: 5px solid #333;
  border-top-color: #f4b43a;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-container p {
  font-size: 18px;
  color: #999;
}

/* Error State */
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 20px;
}

.error-container p {
  font-size: 18px;
  color: #ff6b6b;
}

.retry-btn {
  padding: 12px 24px;
  font-size: 16px;
  background: #f4b43a;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  color: black;
  font-weight: bold;
}

.retry-btn:hover {
  opacity: 0.9;
}

/* Empty State */
.empty-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
}

.empty-container p {
  font-size: 18px;
  color: #999;
}

/* Plans Container */
.plans-container {
  display: flex;
  justify-content: center;
  gap: 40px;
  margin: 50px 0;
  padding: 0 20px 50px 20px;
  flex-wrap: wrap;
}

.plan {
  background: #111;
  border: 3px solid #222;
  width: 320px;
  padding: 30px;
  text-align: center;
  border-radius: 10px;
  transition: transform 0.3s ease;
}

.plan:hover {
  transform: translateY(-5px);
}

.plan.best-option {
  border-color: #f4b43a;
  position: relative;
  transform: scale(1.05);
}

.plan.best-option:hover {
  transform: scale(1.08) translateY(-5px);
}

.badge {
  background: #f4b43a;
  color: black;
  padding: 10px 0;
  font-weight: bold;
  position: absolute;
  top: -20px;
  left: 0;
  right: 0;
  border-radius: 5px 5px 0 0;
}

.plan h2 {
  font-size: 32px;
  margin-top: 20px;
}

.plan p {
  margin: 12px 0;
  font-size: 16px;
  color: #ccc;
}

.price {
  font-size: 28px;
  font-weight: bold;
  margin-top: 15px;
  color: white !important;
}

.ahorro {
  color: #4caf50 !important;
  font-weight: 600;
  font-size: 18px;
}

.plan button {
  margin-top: 20px;
  padding: 12px 20px;
  font-size: 16px;
  background: #f4b43a;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  color: black;
  font-weight: bold;
  width: 100%;
  transition: all 0.3s ease;
}

.plan button:hover {
  opacity: 0.9;
  transform: scale(1.02);
}

.info-link {
  margin-top: 15px;
  display: block;
  color: #999;
  text-decoration: none;
  font-size: 14px;
  transition: color 0.3s ease;
}

.info-link:hover {
  color: #f4b43a;
}

/* Responsive */
@media (max-width: 768px) {
  .hero h1 {
    font-size: 36px;
  }
  
  .hero p {
    font-size: 18px;
  }
  
  .plans-container {
    flex-direction: column;
    align-items: center;
  }

  .plan.best-option {
    transform: scale(1);
  }

  .plan.best-option:hover {
    transform: translateY(-5px);
  }
}
</style>