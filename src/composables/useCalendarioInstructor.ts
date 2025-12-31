// src/composables/useCalendarioInstructor.ts

import { ref, onMounted, computed, type Ref } from 'vue'
import { Calendar, type CalendarOptions, type EventClickArg } from '@fullcalendar/core'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import esLocale from '@fullcalendar/core/locales/es'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth'

// ============================================
// TIPOS E INTERFACES
// ============================================

export interface ClaseInstructor {
  id: string
  fecha: string
  hora_inicio: string
  hora_fin: string
  capacidad_maxima: number
  capacidad_actual: number
  clientes: {
    nombre_completo: string
    telefono: string
  }[]
}

export interface EventoCalendario {
  id: string
  title: string
  start: string
  end: string
  backgroundColor: string
  borderColor: string
  extendedProps: {
    clase_id: string
    capacidad_actual: number
    capacidad_maxima: number
    clientes: any[]
  }
}

// ============================================
// COMPOSABLE PRINCIPAL
// ============================================

export function useCalendarioInstructor() {
  const authStore = useAuthStore()

  // Referencias reactivas
  const calendarEl: Ref<HTMLElement | null> = ref(null)
  let calendar: Calendar | null = null
  
  const modalDetalles = ref(false)
  const claseSeleccionada = ref<ClaseInstructor | null>(null)
  const cargandoClases = ref(false)
  const instructorId = ref<string>('')

  // ============================================
  // COMPUTED
  // ============================================

  const porcentajeOcupacion = computed((): number => {
    if (!claseSeleccionada.value) return 0
    return Math.round(
      (claseSeleccionada.value.capacidad_actual / claseSeleccionada.value.capacidad_maxima) * 100
    )
  })

  const estadoClase = computed((): string => {
    const porcentaje = porcentajeOcupacion.value
    if (porcentaje === 0) return 'Vacía'
    if (porcentaje < 50) return 'Baja ocupación'
    if (porcentaje < 100) return 'Media ocupación'
    return 'Llena'
  })

  const colorEstado = computed((): string => {
    const porcentaje = porcentajeOcupacion.value
    if (porcentaje === 0) return '#95a5a6'      // Gris
    if (porcentaje < 50) return '#3498db'       // Azul
    if (porcentaje < 100) return '#f39c12'      // Naranja
    return '#e74c3c'                             // Rojo
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
  // CARGAR CLASES DEL INSTRUCTOR
  // ============================================

  const cargarClases = async (): Promise<EventoCalendario[]> => {
    cargandoClases.value = true

    try {
      console.log('📅 Cargando clases del instructor...')

      // Obtener ID del instructor
      const idInstructor = await obtenerInstructorId()
      
      if (!idInstructor) {
        throw new Error('No se encontró información del instructor')
      }

      instructorId.value = idInstructor

      // Obtener clases del instructor con clientes reservados
      const { data: clasesData, error: clasesError } = await supabase
        .from('clases')
        .select(`
          id,
          fecha,
          hora_inicio,
          hora_fin,
          capacidad_maxima,
          capacidad_actual,
          mis_reservas (
            id,
            estado,
            clientes (
              profiles (
                nombre_completo,
                telefono
              )
            )
          )
        `)
        .eq('instructor_id', idInstructor)
        .order('fecha', { ascending: true })
        .order('hora_inicio', { ascending: true })

      if (clasesError) {
        console.error('❌ Error al obtener clases:', clasesError)
        throw clasesError
      }

      console.log('✅ Clases obtenidas:', clasesData)

      // Mapear a eventos del calendario
      const eventos: EventoCalendario[] = (clasesData || []).map((clase) => {
        const porcentaje = (clase.capacidad_actual / clase.capacidad_maxima) * 100
        
        // Determinar color según ocupación
        let backgroundColor = '#95a5a6' // Gris - vacío
        if (porcentaje > 0 && porcentaje < 50) backgroundColor = '#3498db' // Azul - baja
        if (porcentaje >= 50 && porcentaje < 100) backgroundColor = '#f39c12' // Naranja - media
        if (porcentaje === 100) backgroundColor = '#e74c3c' // Rojo - llena

        // Filtrar solo reservas confirmadas
        const reservasConfirmadas = clase.mis_reservas?.filter(
          (r: any) => r.estado === 'confirmada'
        ) || []

        // Extraer info de clientes
        const clientes = reservasConfirmadas.map((r: any) => ({
          nombre_completo: r.clientes?.profiles?.nombre_completo || 'Sin nombre',
          telefono: r.clientes?.profiles?.telefono || 'N/A'
        }))

        return {
          id: clase.id,
          title: `Clase Pilates (${clase.capacidad_actual}/${clase.capacidad_maxima})`,
          start: `${clase.fecha}T${clase.hora_inicio}`,
          end: `${clase.fecha}T${clase.hora_fin}`,
          backgroundColor,
          borderColor: backgroundColor,
          extendedProps: {
            clase_id: clase.id,
            capacidad_actual: clase.capacidad_actual,
            capacidad_maxima: clase.capacidad_maxima,
            clientes
          }
        }
      })

      console.log('✅ Eventos mapeados:', eventos)
      return eventos

    } catch (error) {
      console.error('❌ Error al cargar clases:', error)
      alert('❌ Error al cargar las clases del calendario')
      return []
    } finally {
      cargandoClases.value = false
    }
  }

  // ============================================
  // INICIALIZAR CALENDARIO
  // ============================================

  const inicializarCalendario = async (): Promise<void> => {
    if (!calendarEl.value) {
      console.error('❌ No se encontró el elemento del calendario')
      return
    }

    // Cargar eventos desde BD
    const eventos = await cargarClases()

    const calendarOptions: CalendarOptions = {
      plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
      initialView: 'dayGridMonth',
      locale: esLocale,
      
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay'
      },
      
      slotMinTime: '06:00:00',
      slotMaxTime: '21:00:00',
      allDaySlot: false,
      
      editable: false, // READ ONLY
      selectable: false,
      dayMaxEvents: true,
      
      events: eventos,
      
      // Click en evento para ver detalles
      eventClick: async (info: EventClickArg): Promise<void> => {
        await mostrarDetallesClase(info.event.id)
      }
    }

    calendar = new Calendar(calendarEl.value, calendarOptions)
    calendar.render()
  }

  // ============================================
  // MOSTRAR DETALLES DE CLASE
  // ============================================

  const mostrarDetallesClase = async (claseId: string): Promise<void> => {
    try {
      console.log('📋 Obteniendo detalles de clase:', claseId)

      const { data, error } = await supabase
        .from('clases')
        .select(`
          id,
          fecha,
          hora_inicio,
          hora_fin,
          capacidad_maxima,
          capacidad_actual,
          mis_reservas (
            id,
            estado,
            clientes (
              profiles (
                nombre_completo,
                telefono
              )
            )
          )
        `)
        .eq('id', claseId)
        .single()

      if (error || !data) {
        throw new Error('No se encontró la clase')
      }

      // Filtrar reservas confirmadas
      const reservasConfirmadas = data.mis_reservas?.filter(
        (r: any) => r.estado === 'confirmada'
      ) || []

      // Mapear clientes
      const clientes = reservasConfirmadas.map((r: any) => ({
        nombre_completo: r.clientes?.profiles?.nombre_completo || 'Sin nombre',
        telefono: r.clientes?.profiles?.telefono || 'N/A'
      }))

      claseSeleccionada.value = {
        id: data.id,
        fecha: data.fecha,
        hora_inicio: data.hora_inicio,
        hora_fin: data.hora_fin,
        capacidad_maxima: data.capacidad_maxima,
        capacidad_actual: data.capacidad_actual,
        clientes
      }

      modalDetalles.value = true

    } catch (error) {
      console.error('❌ Error al obtener detalles:', error)
      alert('❌ Error al cargar los detalles de la clase')
    }
  }

  // ============================================
  // CERRAR MODAL
  // ============================================

  const cerrarModal = (): void => {
    modalDetalles.value = false
    claseSeleccionada.value = null
  }

  // ============================================
  // CAMBIAR VISTA
  // ============================================

  const cambiarVista = (vista: string): void => {
    if (!calendar) {
      console.error('❌ El calendario no está inicializado')
      return
    }
    
    calendar.changeView(vista)
  }

  // ============================================
  // RECARGAR CLASES
  // ============================================

  const recargarClases = async (): Promise<void> => {
    if (!calendar) return

    const eventos = await cargarClases()
    
    // Limpiar eventos actuales
    calendar.getEvents().forEach(event => event.remove())
    
    // Agregar nuevos eventos
    eventos.forEach(evento => calendar?.addEvent(evento))
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

  // ============================================
  // LIFECYCLE
  // ============================================

  onMounted(() => {
    inicializarCalendario()
  })

  // ============================================
  // RETURN
  // ============================================

  return {
    // Referencias
    calendarEl,
    modalDetalles,
    claseSeleccionada,
    cargandoClases,
    
    // Computed
    porcentajeOcupacion,
    estadoClase,
    colorEstado,
    
    // Métodos
    cerrarModal,
    cambiarVista,
    recargarClases,
    formatearFecha
  }
}