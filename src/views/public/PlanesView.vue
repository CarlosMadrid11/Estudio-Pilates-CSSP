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
        v-for="paquete in paquetes" 
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

  <Modal
    v-model="modal.isOpen.value"
    :type="modal.config.value.type"
    :title="modal.config.value.title"
    :message="modal.config.value.message"
    :icon="modal.config.value.icon"
    :confirmText="modal.config.value.confirmText"
    :cancelText="modal.config.value.cancelText"
    :showCancel="modal.config.value.showCancel"
    @confirm="modal.confirm"
    @cancel="modal.cancel"
  />
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth'
import { useModal } from '@/composables/useModal'
import Modal from '@/components/Modal.vue'

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

// Router y Store y modal
const authStore = useAuthStore()
const modal = useModal()

// Estado
const paquetes = ref<Paquete[]>([])
const isLoading = ref(true)
const error = ref<string | null>(null)

// ✅ Timeout de 10 segundos
const TIMEOUT_MS = 10000

// Fetch de paquetes desde Supabase con timeout
const fetchPaquetes = async () => {
  isLoading.value = true
  error.value = null
  
  try {
    console.log('📦 Obteniendo paquetes...')
    
    // Promesa de la consulta a Supabase
    const fetchPromise = supabase
      .from('paquetes')
      .select('*')
      .eq('activo', true)
      .order('num_clases', { ascending: true })
    
    // Promesa de timeout que rechaza después de 10 segundos
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error('La solicitud tardó demasiado. Por favor, verifica tu conexión e intenta de nuevo.'))
      }, TIMEOUT_MS)
    })
    
    // Race: la primera promesa que se resuelva/rechace gana
    const result = await Promise.race([fetchPromise, timeoutPromise])
    
    // Extraer data y error del resultado
    const { data, error: fetchError } = result as Awaited<typeof fetchPromise>

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
    error.value = err instanceof Error ? err.message : 'Error desconocido al cargar los paquetes'
  } finally {
    isLoading.value = false
  }
}

// Ejecutar al montar el componente
onMounted(() => {
  fetchPaquetes()
})

// Calcular ahorros (comparando con precio por clase del paquete base)
const calcularAhorros = (paquetesRaw: Paquete[]): Paquete[] => {
  if (paquetesRaw.length === 0) return []

  // Ordenar por número de clases
  const sorted = [...paquetesRaw].sort((a, b) => a.num_clases - b.num_clases)
  
  // El paquete más pequeño es la referencia (sin descuento)
  const paqueteBase = sorted[0]
  const precioClaseBase = paqueteBase.precio / paqueteBase.num_clases

  return sorted.map((paquete, index) => {
    // Calcular precio sin descuento basado en precio por clase del paquete base
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
const comprarPlan = async (paquete: Paquete) => {
  console.log('💳 Iniciando compra de paquete:', paquete)

  // Verificar autenticación
  if (!authStore.isAuthenticated) {
    await modal.showLoginRequired(
      'Antes de comprar un paquete necesitas iniciar sesión. Serás redirigido al login.'
    )
    return
  }

  // Verificar que sea un cliente
  if (authStore.role !== 'cliente') {
    await modal.showError(
      'Acceso Denegado',
      'Solo los usuarios con rol de cliente pueden comprar paquetes. Por favor, contacta al administrador si crees que es un error.'
    )
    return
  }

  // Confirmar compra con modal
  const confirmar = await modal.showConfirm(
    'Confirmar Compra',
    `¿Confirmas la compra del ${paquete.nombre}?

📦 ${paquete.num_clases} clases
⏰ Vigencia: ${paquete.vigencia_dias} días
💰 Precio: $${formatearPrecio(paquete.precio)} MXN` +
    (paquete.ahorro && paquete.ahorro > 0 ? `
✨ Ahorras: $${formatearPrecio(paquete.ahorro)} MXN` : ''),
    {
      confirmText: 'Sí, comprar',
      cancelText: 'Cancelar',
      type: 'confirm'
    }
  )

  if (!confirmar) {
    console.log('❌ Compra cancelada por el usuario')
    return
  }

  try {
    console.log('🔍 Obteniendo cliente_id...')
    
    // PASO 1: Obtener el cliente_id del usuario autenticado
    const { data: clienteData, error: clienteError } = await supabase
      .from('clientes')
      .select('id')
      .eq('profile_id', authStore.userId)
      .single()

    if (clienteError || !clienteData) {
      console.error('❌ Error al obtener cliente:', clienteError)
      throw new Error('No se encontró tu información de cliente')
    }

    const clienteId = clienteData.id
    console.log('✅ Cliente ID obtenido:', clienteId)

    // PASO 2: Calcular fecha de vencimiento
    const fechaCompra = new Date()
    const fechaVencimiento = new Date()
    fechaVencimiento.setDate(fechaVencimiento.getDate() + paquete.vigencia_dias)

    console.log('📅 Fecha compra:', fechaCompra.toISOString())
    console.log('📅 Fecha vencimiento:', fechaVencimiento.toISOString())

    // PASO 3: Crear registro en mis_paquetes
    console.log('💾 Insertando en mis_paquetes...')
    
    const { data: miPaqueteData, error: insertError } = await supabase
      .from('mis_paquetes')
      .insert({
        cliente_id: clienteId,
        paquete_id: paquete.id,
        clases_totales: paquete.num_clases,
        clases_restantes: paquete.num_clases,
        fecha_compra: fechaCompra.toISOString(),
        fecha_vencimiento: fechaVencimiento.toISOString(),
        activo: true
      })
      .select()
      .single()

    if (insertError) {
      console.error('❌ Error al insertar paquete:', insertError)
      throw new Error(`Error al registrar la compra: ${insertError.message}`)
    }

    console.log('✅ Paquete comprado exitosamente:', miPaqueteData)

    // PASO 4: Mostrar éxito con redirección automática
    await modal.showSuccess(
      '¡Compra Exitosa!',
      `Has adquirido el ${paquete.nombre}. Tienes ${paquete.num_clases} clases disponibles hasta el ${fechaVencimiento.toLocaleDateString('es-MX')}.`,
      {
        confirmText: 'Ir al Dashboard',
        redirectTo: '/dashboard-cliente',
        redirectDelay: 1000
      }
    )

  } catch (err) {
    console.error('❌ Error en comprarPlan:', err)
    const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
    await modal.showError(
      'Error al Comprar',
      `No se pudo completar tu compra: ${errorMessage}. Por favor intenta nuevamente.`
    )
  }
}

// Ver información
const verInfo = async (paquete: Paquete) => {
  console.log('ℹ️ Ver info de:', paquete)
  
  await modal.showInfo(
    paquete.nombre,
    `📦 ${paquete.num_clases} clases
⏰ Vigencia: ${paquete.vigencia_dias} días
💰 Precio: $${formatearPrecio(paquete.precio)} MXN` +
    (paquete.ahorro && paquete.ahorro > 0 ? `
✨ Ahorras: $${formatearPrecio(paquete.ahorro)} MXN` : '') +
    (paquete.descripcion ? `

${paquete.descripcion}` : '')
  )
}
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