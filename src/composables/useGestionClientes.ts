// src/composables/useGestionClientes.ts

import { ref, computed, onMounted } from 'vue'
import { supabase } from '@/lib/supabase'

// ============================================
// TIPOS E INTERFACES
// ============================================

export interface PaqueteCliente {
  id: string
  nombre: string
  clases_totales: number
  clases_restantes: number
  fecha_compra: string
  fecha_vencimiento: string
  activo: boolean
}

export interface ReservaCliente {
  id: string
  fecha: string
  hora_inicio: string
  hora_fin: string
  estado: string
  asistio: boolean | null
}

export interface ClienteDetalle {
  id: string
  profile_id: string
  nombre_completo: string
  email: string
  telefono: string
  direccion: string
  paquetes: PaqueteCliente[]
  reservas: ReservaCliente[]
}

export interface ClienteListado {
  id: string
  nombre_completo: string
  email: string
  telefono: string
  paquetes_activos: number
  clases_disponibles: number
}

// ============================================
// COMPOSABLE PRINCIPAL
// ============================================

export function useGestionClientes() {
  // Estado
  const cargando = ref(false)
  const clientes = ref<ClienteListado[]>([])
  const clienteSeleccionado = ref<ClienteDetalle | null>(null)
  const modalAbierto = ref(false)
  const busqueda = ref('')
  const filtroEstado = ref<'todos' | 'activos' | 'sin_paquetes'>('todos')

  // ============================================
  // COMPUTED
  // ============================================

  const clientesFiltrados = computed((): ClienteListado[] => {
    let resultado = clientes.value

    // Filtrar por búsqueda
    if (busqueda.value.trim()) {
      const termino = busqueda.value.toLowerCase()
      resultado = resultado.filter(c => 
        c.nombre_completo.toLowerCase().includes(termino) ||
        c.email.toLowerCase().includes(termino) ||
        c.telefono.includes(termino)
      )
    }

    // Filtrar por estado
    if (filtroEstado.value === 'activos') {
      resultado = resultado.filter(c => c.paquetes_activos > 0)
    } else if (filtroEstado.value === 'sin_paquetes') {
      resultado = resultado.filter(c => c.paquetes_activos === 0)
    }

    return resultado
  })

  const totalClientes = computed(() => clientes.value.length)
  const clientesActivos = computed(() => clientes.value.filter(c => c.paquetes_activos > 0).length)
  const clientesSinPaquetes = computed(() => clientes.value.filter(c => c.paquetes_activos === 0).length)

  // ============================================
  // CARGAR CLIENTES
  // ============================================

  const cargarClientes = async (): Promise<void> => {
    cargando.value = true

    try {
      console.log('📋 Cargando clientes...')

      const { data: clientesData, error } = await supabase
        .from('clientes')
        .select(`
          id,
          profile_id,
          direccion,
          profiles (
            nombre_completo,
            email,
            telefono
          ),
          mis_paquetes (
            id,
            activo,
            clases_restantes
          )
        `)
        .order('profiles(nombre_completo)', { ascending: true })

      if (error) {
        console.error('❌ Error al cargar clientes:', error)
        throw error
      }

      console.log('✅ Clientes obtenidos:', clientesData)

      // Mapear datos
      clientes.value = ((clientesData || []) as Record<string, unknown>[]).map((cliente) => {
        const profileData = cliente.profiles as unknown as Record<string, unknown> | undefined
        const paquetesData = (cliente.mis_paquetes as unknown as Record<string, unknown>[] | undefined) || []

        const paquetesActivos = paquetesData.filter(p => p.activo === true)
        const clasesDisponibles = paquetesActivos.reduce(
          (sum, p) => sum + ((p.clases_restantes as number) || 0), 
          0
        )

        return {
          id: cliente.id as string,
          nombre_completo: (profileData?.nombre_completo as string) || 'Sin nombre',
          email: (profileData?.email as string) || 'Sin email',
          telefono: (profileData?.telefono as string) || 'N/A',
          paquetes_activos: paquetesActivos.length,
          clases_disponibles: clasesDisponibles
        }
      })

      console.log('✅ Clientes procesados:', clientes.value.length)

    } catch (error) {
      console.error('❌ Error:', error)
      alert('❌ Error al cargar los clientes')
    } finally {
      cargando.value = false
    }
  }

  // ============================================
  // VER DETALLES DE CLIENTE
  // ============================================

  const verDetalles = async (clienteId: string): Promise<void> => {
    try {
      console.log('📋 Cargando detalles del cliente:', clienteId)

      // Obtener info del cliente
      const { data: clienteData, error: clienteError } = await supabase
        .from('clientes')
        .select(`
          id,
          profile_id,
          direccion,
          profiles (
            nombre_completo,
            email,
            telefono
          )
        `)
        .eq('id', clienteId)
        .single()

      if (clienteError || !clienteData) {
        throw new Error('No se encontró el cliente')
      }

      const profileData = clienteData.profiles as unknown as Record<string, unknown> | undefined

      // Obtener paquetes
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
        .order('fecha_compra', { ascending: false })

      if (paquetesError) {
        console.error('⚠️ Error al cargar paquetes:', paquetesError)
      }

      const paquetes: PaqueteCliente[] = ((paquetesData || []) as Record<string, unknown>[]).map((p) => {
        const paqueteInfo = p.paquetes as unknown as Record<string, unknown> | undefined
        
        return {
          id: p.id as string,
          nombre: (paqueteInfo?.nombre as string) || 'Paquete',
          clases_totales: p.clases_totales as number,
          clases_restantes: p.clases_restantes as number,
          fecha_compra: p.fecha_compra as string,
          fecha_vencimiento: p.fecha_vencimiento as string,
          activo: p.activo as boolean
        }
      })

      // Obtener reservas (últimas 10)
      const { data: reservasData, error: reservasError } = await supabase
        .from('mis_reservas')
        .select(`
          id,
          estado,
          asistio,
          clases (
            fecha,
            hora_inicio,
            hora_fin
          )
        `)
        .eq('cliente_id', clienteId)
        .order('clases(fecha)', { ascending: false })
        .limit(10)

      if (reservasError) {
        console.error('⚠️ Error al cargar reservas:', reservasError)
      }

      const reservas: ReservaCliente[] = ((reservasData || []) as Record<string, unknown>[]).map((r) => {
        const claseData = r.clases as unknown as Record<string, unknown> | undefined
        
        return {
          id: r.id as string,
          fecha: (claseData?.fecha as string) || '',
          hora_inicio: (claseData?.hora_inicio as string) || '',
          hora_fin: (claseData?.hora_fin as string) || '',
          estado: r.estado as string,
          asistio: r.asistio as boolean | null
        }
      })

      clienteSeleccionado.value = {
        id: clienteData.id,
        profile_id: clienteData.profile_id,
        nombre_completo: (profileData?.nombre_completo as string) || 'Sin nombre',
        email: (profileData?.email as string) || 'Sin email',
        telefono: (profileData?.telefono as string) || 'N/A',
        direccion: clienteData.direccion || 'N/A',
        paquetes,
        reservas
      }

      modalAbierto.value = true

    } catch (error) {
      console.error('❌ Error:', error)
      alert('❌ Error al cargar los detalles del cliente')
    }
  }

  // ============================================
  // CERRAR MODAL
  // ============================================

  const cerrarModal = (): void => {
    modalAbierto.value = false
    clienteSeleccionado.value = null
  }

  // ============================================
  // FORMATEAR FECHA
  // ============================================

  const formatearFecha = (fecha: string): string => {
    const [year, month, day] = fecha.split('T')[0].split('-')
    const date = new Date(Number(year), Number(month) - 1, Number(day))
    return date.toLocaleDateString('es-MX', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  const formatearFechaCompleta = (fecha: string): string => {
    const [year, month, day] = fecha.split('T')[0].split('-')
    const date = new Date(Number(year), Number(month) - 1, Number(day))
    return date.toLocaleDateString('es-MX', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  // ============================================
  // LIFECYCLE
  // ============================================

  onMounted(() => {
    cargarClientes()
  })

  // ============================================
  // RETURN
  // ============================================

  return {
    // Estado
    cargando,
    clientes,
    clienteSeleccionado,
    modalAbierto,
    busqueda,
    filtroEstado,

    // Computed
    clientesFiltrados,
    totalClientes,
    clientesActivos,
    clientesSinPaquetes,

    // Métodos
    cargarClientes,
    verDetalles,
    cerrarModal,
    formatearFecha,
    formatearFechaCompleta
  }
}