import { ref, onMounted, type Ref } from 'vue'
import { Calendar, type CalendarOptions, type EventClickArg, type EventDropArg } from '@fullcalendar/core'
import type { DateClickArg, EventResizeDoneArg } from '@fullcalendar/interaction'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import esLocale from '@fullcalendar/core/locales/es'

// ============================================
// TIPOS E INTERFACES
// ============================================

interface TipoClase {
  [key: string]: string
}

export interface Formulario {
  titulo: string
  fecha: string
  hora: string
  tipo: string
}

export interface EventoCalendario {
  title: string
  start: string
  end: string
  backgroundColor: string
  extendedProps: {
    tipo: string
  }
}

interface EventoGuardado {
  title: string
  start: string | null
  end: string | null
  backgroundColor: string
  tipo: string
}

// ============================================
// CONSTANTES
// ============================================

// Colores para cada tipo de clase
const colores: TipoClase = {
  mat: '#4facfe',
  reformer: '#667eea',
  cadillac: '#f093fb',
  privada: '#11998e',
  grupal: '#fa709a'
}

// Eventos de ejemplo iniciales
const eventosIniciales: EventoCalendario[] = [
  {
    title: 'María González - Mat Pilates',
    start: '2024-12-05T09:00:00',
    end: '2024-12-05T10:00:00',
    backgroundColor: colores.mat,
    extendedProps: { tipo: 'mat' }
  },
  {
    title: 'Juan Pérez - Reformer',
    start: '2024-12-05T11:00:00',
    end: '2024-12-05T12:00:00',
    backgroundColor: colores.reformer,
    extendedProps: { tipo: 'reformer' }
  },
  {
    title: 'Ana López - Clase Privada',
    start: '2024-12-06T15:00:00',
    end: '2024-12-06T16:00:00',
    backgroundColor: colores.privada,
    extendedProps: { tipo: 'privada' }
  },
  {
    title: 'Grupo Principiantes',
    start: '2024-12-06T17:00:00',
    end: '2024-12-06T18:00:00',
    backgroundColor: colores.grupal,
    extendedProps: { tipo: 'grupal' }
  }
]

// ============================================
// COMPOSABLE PRINCIPAL
// ============================================

export function useCalendar() {
  // Referencias reactivas
  const calendarEl: Ref<HTMLElement | null> = ref(null)
  let calendar: Calendar | null = null
  
  const modalAbierto = ref(false)
  const formulario = ref<Formulario>({
    titulo: '',
    fecha: '',
    hora: '',
    tipo: ''
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
      plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
      initialView: 'dayGridMonth',
      locale: esLocale,
      
      // Configuración de la barra de herramientas
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay'
      },
      
      // Configuración de horarios
      slotMinTime: '06:00:00',
      slotMaxTime: '21:00:00',
      allDaySlot: false,
      
      // Habilitar interacciones
      editable: true,
      selectable: true,
      selectMirror: true,
      dayMaxEvents: true,
      
      // Eventos iniciales
      events: eventosIniciales,
      
      // ============================================
      // MANEJADORES DE EVENTOS
      // ============================================
      
      // Click en un evento existente
      eventClick: (info: EventClickArg): void => {
        const inicio = info.event.start?.toLocaleString('es-MX') || 'N/A'
        const fin = info.event.end?.toLocaleString('es-MX') || 'N/A'
        
        alert(
          `📋 Detalles de la cita:\n\n` +
          `Cliente: ${info.event.title}\n` +
          `Inicio: ${inicio}\n` +
          `Fin: ${fin}`
        )
      },
      
      // Click en un día del calendario
      dateClick: (info: DateClickArg): void => {
        formulario.value.fecha = info.dateStr
        abrirModal()
      },
      
      // Cuando se arrastra y suelta un evento
      eventDrop: (info: EventDropArg): void => {
        console.log('Evento movido:', info.event.title, 'a', info.event.start)
        // Aquí podrías hacer una llamada a tu API para actualizar en el backend
      },
      
      // Cuando se redimensiona un evento
      eventResize: (info: EventResizeDoneArg): void => {
        console.log('Evento redimensionado:', info.event.title)
        // Aquí podrías hacer una llamada a tu API para actualizar en el backend
      }
    }

    calendar = new Calendar(calendarEl.value, calendarOptions)
    calendar.render()
  }

  // ============================================
  // GESTIÓN DEL MODAL
  // ============================================
  
  const abrirModal = (): void => {
    modalAbierto.value = true
    
    // Si no hay fecha seleccionada, poner la de hoy
    if (!formulario.value.fecha) {
      const hoy = new Date().toISOString().split('T')[0]
      formulario.value.fecha = hoy
    }
  }

  const cerrarModal = (): void => {
    modalAbierto.value = false
    
    // Resetear el formulario
    formulario.value = {
      titulo: '',
      fecha: '',
      hora: '',
      tipo: ''
    }
  }

  // ============================================
  // GESTIÓN DE CITAS
  // ============================================
  
  const guardarCita = (tipoTexto: string): void => {
    if (!calendar) {
      console.error('El calendario no está inicializado')
      return
    }

    // Validar que todos los campos estén llenos
    if (!formulario.value.titulo || !formulario.value.fecha || 
        !formulario.value.hora || !formulario.value.tipo) {
      alert('⚠️ Por favor completa todos los campos')
      return
    }

    // Calcular hora de inicio y fin
    const horaParts = formulario.value.hora.split(':')
    const horaInicio = parseInt(horaParts[0] || '00', 10)
    const minutosInicio = horaParts[1] || '00'
    const horaFin = (horaInicio + 1).toString().padStart(2, '0')

    // Crear el nuevo evento
    const nuevoEvento: EventoCalendario = {
      title: `${formulario.value.titulo} - ${tipoTexto}`,
      start: `${formulario.value.fecha}T${formulario.value.hora}:00`,
      end: `${formulario.value.fecha}T${horaFin}:${minutosInicio}:00`,
      backgroundColor: colores[formulario.value.tipo],
      extendedProps: { 
        tipo: formulario.value.tipo 
      }
    }

    // Agregar al calendario
    calendar.addEvent(nuevoEvento)
    
    // Cerrar modal y mostrar confirmación
    cerrarModal()
    alert('✅ Cita agregada correctamente!')
    
    // Aquí podrías hacer una llamada a tu API para guardar en el backend
    console.log('Nuevo evento creado:', nuevoEvento)
  }

  // ============================================
  // CAMBIO DE VISTAS
  // ============================================
  
  const cambiarVista = (vista: string): void => {
    if (!calendar) {
      console.error('El calendario no está inicializado')
      return
    }
    
    calendar.changeView(vista)
  }

  // ============================================
  // GUARDAR EVENTOS (PARA BACKEND)
  // ============================================
  
  const guardarEventos = (): EventoGuardado[] => {
    if (!calendar) {
      console.error('El calendario no está inicializado')
      return []
    }
    
    const eventos: EventoGuardado[] = calendar.getEvents().map(evento => ({
      title: evento.title,
      start: evento.start?.toISOString() || null,
      end: evento.end?.toISOString() || null,
      backgroundColor: evento.backgroundColor || '',
      tipo: evento.extendedProps.tipo || ''
    }))
    
    console.log('Eventos para guardar:', eventos)
    // Aquí harías la llamada a tu API para persistir los datos
    
    return eventos
  }

  // ============================================
  // ELIMINAR EVENTO
  // ============================================
  
  const eliminarEvento = (eventoId: string): void => {
    if (!calendar) {
      console.error('El calendario no está inicializado')
      return
    }
    
    const evento = calendar.getEventById(eventoId)
    if (evento) {
      evento.remove()
      console.log('Evento eliminado:', eventoId)
      // Aquí podrías hacer una llamada a tu API para eliminar del backend
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
    formulario,
    
    // Métodos
    abrirModal,
    cerrarModal,
    guardarCita,
    cambiarVista,
    guardarEventos,
    eliminarEvento,
    
    // Constantes útiles
    colores
  }
}