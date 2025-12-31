// src/composables/useRegistroAsistencia.ts

import { ref, computed, onMounted } from 'vue'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth'

// ============================================
// TIPOS E INTERFACES
// ============================================

export interface ReservaAsistencia {
  id: string
  cliente_nombre: string
  cliente_telefono: string
  asistio: boolean | null
}

export interface ClaseAsistencia {
  id: string
  fecha: string
  hora_inicio: string
  hora_fin: string
  capacidad_actual: number
  reservas: ReservaAsistencia[]
}

// ============================================
// COMPOSABLE PRINCIPAL
// ============================================

export function useRegistroAsistencia() {
  const authStore = useAuthStore()

  // Referencias reactivas
  const cargando = ref(false)
  const clasesPasadas = ref<ClaseAsistencia[]>([])
  const claseSeleccionada = ref<ClaseAsistencia | null>(null)
  const guardando = ref(false)
  const instructorId = ref<string>('')

  // ============================================
  // COMPUTED
  // ============================================

  const totalAsistencias = computed((): number => {
    if (!claseSeleccionada.value) return 0
    return claseSeleccionada.value.reservas.filter(r => r.asistio === true).length
  })

  const totalFaltas = computed((): number => {
    if (!claseSeleccionada.value) return 0
    return claseSeleccionada.value.reservas.filter(r => r.asistio === false).length
  })

  const totalPendientes = computed((): number => {
    if (!claseSeleccionada.value) return 0
    return claseSeleccionada.value.reservas.filter(r => r.asistio === null).length
  })

  const todosMarcados = computed((): boolean => {
    if (!claseSeleccionada.value) return false
    return claseSeleccionada.value.reservas.every(r => r.asistio !== null)
  })

  // ============================================
  // OBTENER INSTRUCTOR ID
  // ============================================

  const obtenerInstructorId = async (): Promise<string | null> => {
    try {
      const { data, error } = await supabase
        .from('instructores')
        .select('id')
        .eq('profile_id', authStore.userId)
        .single()

      if (error || !data) {
        console.error('❌ Error al obtener instructor:', error)
        return null
      }

      return data.id
    } catch (error) {
      console.error('❌ Error:', error)
      return null
    }
  }

  // ============================================
  // CARGAR CLASES PASADAS
  // ============================================

  const cargarClasesPasadas = async (): Promise<void> => {
    cargando.value = true

    try {
      console.log('📚 Cargando clases pasadas...')

      // Obtener ID del instructor
      const idInstructor = await obtenerInstructorId()
      
      if (!idInstructor) {
        throw new Error('No se encontró información del instructor')
      }

      instructorId.value = idInstructor

      // Fecha de hoy
      const hoy = new Date().toISOString().split('T')[0]

      // Obtener clases pasadas con reservas confirmadas
      const { data: clasesData, error: clasesError } = await supabase
        .from('clases')
        .select(`
          id,
          fecha,
          hora_inicio,
          hora_fin,
          capacidad_actual,
          mis_reservas (
            id,
            estado,
            asistio,
            clientes (
              profiles (
                nombre_completo,
                telefono
              )
            )
          )
        `)
        .eq('instructor_id', idInstructor)
        .lt('fecha', hoy)
        .order('fecha', { ascending: false })
        .order('hora_inicio', { ascending: false })
        .limit(20)

      if (clasesError) {
        console.error('❌ Error al obtener clases:', clasesError)
        throw clasesError
      }

      console.log('✅ Clases obtenidas:', clasesData)

      // Mapear a estructura local
      clasesPasadas.value = ((clasesData || []) as Record<string, unknown>[]).map((clase) => {
        const misReservas = clase.mis_reservas as Record<string, unknown>[] | undefined
        
        // Filtrar solo reservas confirmadas
        const reservasConfirmadas = (misReservas || []).filter(
          (r) => r.estado === 'confirmada'
        )

        // Mapear reservas
        const reservas: ReservaAsistencia[] = reservasConfirmadas.map((r) => {
          const clienteData = r.clientes as Record<string, unknown> | undefined
          const profilesData = clienteData?.profiles as Record<string, unknown> | undefined
          
          return {
            id: r.id as string,
            cliente_nombre: (profilesData?.nombre_completo as string) || 'Sin nombre',
            cliente_telefono: (profilesData?.telefono as string) || 'N/A',
            asistio: r.asistio as boolean | null
          }
        })

        return {
          id: clase.id as string,
          fecha: clase.fecha as string,
          hora_inicio: clase.hora_inicio as string,
          hora_fin: clase.hora_fin as string,
          capacidad_actual: clase.capacidad_actual as number,
          reservas
        }
      })

      // Filtrar solo clases con reservas
      clasesPasadas.value = clasesPasadas.value.filter(c => c.reservas.length > 0)

      console.log('✅ Clases procesadas:', clasesPasadas.value.length)

    } catch (error) {
      console.error('❌ Error al cargar clases:', error)
      alert('❌ Error al cargar las clases pasadas')
    } finally {
      cargando.value = false
    }
  }

  // ============================================
  // SELECCIONAR CLASE
  // ============================================

  const seleccionarClase = (clase: ClaseAsistencia): void => {
    claseSeleccionada.value = clase
  }

  const cerrarDetalles = (): void => {
    claseSeleccionada.value = null
  }

  // ============================================
  // MARCAR ASISTENCIA
  // ============================================

  const marcarAsistencia = async (reservaId: string, asistio: boolean): Promise<void> => {
    if (!claseSeleccionada.value) return

    try {
      console.log(`📝 Marcando asistencia: ${reservaId} = ${asistio}`)

      const { error } = await supabase
        .from('mis_reservas')
        .update({ asistio })
        .eq('id', reservaId)

      if (error) {
        console.error('❌ Error al marcar asistencia:', error)
        throw error
      }

      // Actualizar localmente
      const reserva = claseSeleccionada.value.reservas.find(r => r.id === reservaId)
      if (reserva) {
        reserva.asistio = asistio
      }

      console.log('✅ Asistencia marcada correctamente')

    } catch (error) {
      console.error('❌ Error:', error)
      alert('❌ Error al marcar la asistencia')
    }
  }

  // ============================================
  // GUARDAR TODAS LAS ASISTENCIAS
  // ============================================

  const guardarTodasAsistencias = async (): Promise<void> => {
    if (!claseSeleccionada.value || !todosMarcados.value) {
      alert('⚠️ Debes marcar la asistencia de todos los estudiantes')
      return
    }

    guardando.value = true

    try {
      console.log('💾 Guardando todas las asistencias...')

      // Ya están guardadas individualmente, solo confirmamos
      alert(
        `✅ Asistencias guardadas correctamente!\n\n` +
        `✅ Asistencias: ${totalAsistencias.value}\n` +
        `❌ Faltas: ${totalFaltas.value}\n` +
        `Total: ${claseSeleccionada.value.reservas.length}`
      )

      // Recargar clases
      await cargarClasesPasadas()
      cerrarDetalles()

    } catch (error) {
      console.error('❌ Error:', error)
      alert('❌ Error al guardar las asistencias')
    } finally {
      guardando.value = false
    }
  }

  // ============================================
  // FORMATEAR FECHA
  // ============================================

  const formatearFecha = (fecha: string): string => {
    const date = new Date(fecha + 'T00:00:00')
    return date.toLocaleDateString('es-MX', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatearFechaCorta = (fecha: string): string => {
    const date = new Date(fecha + 'T00:00:00')
    return date.toLocaleDateString('es-MX', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  // ============================================
  // LIFECYCLE
  // ============================================

  onMounted(() => {
    cargarClasesPasadas()
  })

  // ============================================
  // RETURN
  // ============================================

  return {
    // Estado
    cargando,
    guardando,
    clasesPasadas,
    claseSeleccionada,
    
    // Computed
    totalAsistencias,
    totalFaltas,
    totalPendientes,
    todosMarcados,
    
    // Métodos
    seleccionarClase,
    cerrarDetalles,
    marcarAsistencia,
    guardarTodasAsistencias,
    formatearFecha,
    formatearFechaCorta,
    cargarClasesPasadas
  }
}