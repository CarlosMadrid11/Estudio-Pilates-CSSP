import { ref, onMounted, computed, type Ref } from 'vue'
import { Calendar, type CalendarOptions } from '@fullcalendar/core'
import type { DateClickArg } from '@fullcalendar/interaction'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import esLocale from '@fullcalendar/core/locales/es'

// ============================================
// TIPOS E INTERFACES
// ============================================

export interface HorarioDisponible {
  valor: string  // "09:00"
  texto: string  // "9:00 AM"
  disponible: boolean
}

export interface ReservaCliente {
  fecha: string
  hora: string
  tipoClase: string
}

// ============================================
// HORARIOS DISPONIBLES (HARDCODED)
// ============================================

const horariosDelDia: HorarioDisponible[] = [
  { valor: '06:00', texto: '6:00 AM', disponible: true },
  { valor: '07:00', texto: '7:00 AM', disponible: true },
  { valor: '08:00', texto: '8:00 AM', disponible: true },
  { valor: '09:00', texto: '9:00 AM', disponible: true },
  { valor: '10:00', texto: '10:00 AM', disponible: true },
  { valor: '11:00', texto: '11:00 AM', disponible: true },
  { valor: '12:00', texto: '12:00 PM', disponible: true },
  { valor: '13:00', texto: '1:00 PM', disponible: true },
  { valor: '14:00', texto: '2:00 PM', disponible: true },
  { valor: '15:00', texto: '3:00 PM', disponible: true },
  { valor: '16:00', texto: '4:00 PM', disponible: true },
  { valor: '17:00', texto: '5:00 PM', disponible: true },
  { valor: '18:00', texto: '6:00 PM', disponible: true },
  { valor: '19:00', texto: '7:00 PM', disponible: true },
  { valor: '20:00', texto: '8:00 PM', disponible: true }
]

// Simular horarios ocupados (esto vendrá de tu API más adelante)
const horariosOcupados: Record<string, string[]> = {
  '2024-12-05': ['09:00', '11:00', '15:00'],
  '2024-12-06': ['10:00', '14:00', '17:00'],
  '2024-12-07': ['08:00', '12:00', '16:00']
}

// ============================================
// COMPOSABLE PRINCIPAL
// ============================================

export function useCalendarCliente() {
  // Referencias reactivas
  const calendarEl: Ref<HTMLElement | null> = ref(null)
  let calendar: Calendar | null = null
  
  const modalAbierto = ref(false)
  const fechaSeleccionada = ref('')
  const horaSeleccionada = ref('')
  const cargandoHorarios = ref(false)

  // ============================================
  // COMPUTED - HORARIOS DISPONIBLES
  // ============================================

  const horariosDisponibles = computed((): HorarioDisponible[] => {
    if (!fechaSeleccionada.value) return []

    const ocupados = horariosOcupados[fechaSeleccionada.value] || []
    
    return horariosDelDia.map(horario => ({
      ...horario,
      disponible: !ocupados.includes(horario.valor)
    }))
  })

  const hayHorariosDisponibles = computed((): boolean => {
    return horariosDisponibles.value.some(h => h.disponible)
  })

  // ============================================
  // FORMATEO DE FECHA
  // ============================================

  const formatearFecha = (fecha: string): string => {
    const date = new Date(fecha + 'T00:00:00')
    const opciones: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }
    return date.toLocaleDateString('es-MX', opciones)
  }

  const fechaFormateada = computed((): string => {
    return fechaSeleccionada.value ? formatearFecha(fechaSeleccionada.value) : ''
  })

  // ============================================
  // INICIALIZACIÓN DEL CALENDARIO
  // ============================================
  
  const inicializarCalendario = (): void => {
    if (!calendarEl.value) {
      console.error('No se encontró el elemento del calendario')
      return
    }

    const calendarOptions: CalendarOptions = {
      plugins: [dayGridPlugin, interactionPlugin],
      initialView: 'dayGridMonth',
      locale: esLocale,
      
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth'
      },
      
      // Deshabilitar días pasados
      validRange: {
        start: new Date().toISOString().split('T')[0]
      },
      
      // Solo permitir selección
      selectable: true,
      selectMirror: true,
      
      // Deshabilitar arrastrar
      editable: false,
      
      // Marcar días con disponibilidad (opcional, visual)
      events: [
        // Puedes agregar marcadores visuales de disponibilidad aquí
      ],
      
      // Click en un día
      dateClick: (info: DateClickArg): void => {
        // Solo permitir días futuros o hoy
        const fechaClick = new Date(info.dateStr + 'T00:00:00')
        const hoy = new Date()
        hoy.setHours(0, 0, 0, 0)
        
        if (fechaClick >= hoy) {
          fechaSeleccionada.value = info.dateStr
          horaSeleccionada.value = ''
          abrirModal()
        } else {
          alert('⚠️ No puedes reservar en fechas pasadas')
        }
      }
    }

    calendar = new Calendar(calendarEl.value, calendarOptions)
    calendar.render()
  }

  // ============================================
  // GESTIÓN DEL MODAL
  // ============================================
  
  const abrirModal = (): void => {
    cargandoHorarios.value = true
    modalAbierto.value = true
    
    // Simular carga de horarios (aquí llamarías a tu API)
    setTimeout(() => {
      cargandoHorarios.value = false
    }, 500)
  }

  const cerrarModal = (): void => {
    modalAbierto.value = false
    fechaSeleccionada.value = ''
    horaSeleccionada.value = ''
  }

  // ============================================
  // CONFIRMAR RESERVA
  // ============================================
  
  const confirmarReserva = (): void => {
    if (!horaSeleccionada.value) {
      alert('⚠️ Por favor selecciona una hora')
      return
    }

    const reserva: ReservaCliente = {
      fecha: fechaSeleccionada.value,
      hora: horaSeleccionada.value,
      tipoClase: 'Pilates' // Esto lo puedes personalizar
    }

    console.log('Reserva a confirmar:', reserva)
    
    // Aquí harías la llamada a tu API para guardar la reserva
    // Ejemplo:
    // await api.crearReserva(reserva)
    
    alert(`✅ Reserva confirmada para el ${fechaFormateada.value} a las ${horaSeleccionada.value}`)
    
    // Marcar el horario como ocupado localmente (temporal)
    if (!horariosOcupados[fechaSeleccionada.value]) {
      horariosOcupados[fechaSeleccionada.value] = []
    }
    horariosOcupados[fechaSeleccionada.value].push(horaSeleccionada.value)
    
    cerrarModal()
    
    // Opcional: Navegar de vuelta a MisReservas
    // router.push('/mis-reservas')
  }

  // ============================================
  // CARGAR HORARIOS DESDE API (PARA FUTURO)
  // ============================================
  
  const cargarHorariosDisponibles = async (fecha: string): Promise<void> => {
    try {
      cargandoHorarios.value = true
      
      // Aquí llamarías a tu API
      // const response = await api.getHorariosDisponibles(fecha)
      // horariosOcupados[fecha] = response.ocupados
      
      console.log('Cargando horarios para:', fecha)
      
    } catch (error) {
      console.error('Error al cargar horarios:', error)
      alert('❌ Error al cargar horarios disponibles')
    } finally {
      cargandoHorarios.value = false
    }
  }

  // ============================================
  // LIFECYCLE HOOK
  // ============================================
  
  onMounted(() => {
    inicializarCalendario()
  })

  // ============================================
  // RETORNAR API DEL COMPOSABLE
  // ============================================
  
  return {
    // Referencias
    calendarEl,
    modalAbierto,
    fechaSeleccionada,
    horaSeleccionada,
    cargandoHorarios,
    
    // Computed
    horariosDisponibles,
    hayHorariosDisponibles,
    fechaFormateada,
    
    // Métodos
    abrirModal,
    cerrarModal,
    confirmarReserva,
    cargarHorariosDisponibles
  }
}