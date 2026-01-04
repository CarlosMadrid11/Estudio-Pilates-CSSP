// src/composables/useCalendarCliente.ts

import { ref, onMounted, computed, type Ref } from 'vue'
import { Calendar, type CalendarOptions } from '@fullcalendar/core'
import type { DateClickArg } from '@fullcalendar/interaction'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import esLocale from '@fullcalendar/core/locales/es'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

// ============================================
// TIPOS E INTERFACES
// ============================================

export interface HorarioDisponible {
  valor: string
  texto: string
  disponible: boolean
  clase_id?: string
  capacidad_actual?: number
  capacidad_maxima?: number
}

// ============================================
// HELPER: Comparar fechas sin timezone issues
// ============================================

/**
 * Compara dos fechas en formato string YYYY-MM-DD
 * Retorna true si fecha1 >= fecha2
 */
const compararFechas = (fecha1: string, fecha2: string): boolean => {
  return fecha1 >= fecha2
}

/**
 * Obtiene fecha de hoy en formato YYYY-MM-DD (sin timezone)
 */
const obtenerFechaHoy = (): string => {
  const hoy = new Date()
  const year = hoy.getFullYear()
  const month = String(hoy.getMonth() + 1).padStart(2, '0')
  const day = String(hoy.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// ============================================
// COMPOSABLE PRINCIPAL
// ============================================

export function useCalendarCliente() {
  const authStore = useAuthStore()
  const router = useRouter()

  // Referencias reactivas
  const calendarEl: Ref<HTMLElement | null> = ref(null)
  let calendar: Calendar | null = null
  
  const modalAbierto = ref(false)
  const fechaSeleccionada = ref('')
  const horaSeleccionada = ref('')
  const cargandoHorarios = ref(false)
  const horariosDisponibles = ref<HorarioDisponible[]>([])

  // IDs necesarios
  const clienteId = ref<string>('')
  const paqueteActivoId = ref<string>('')

  // ============================================
  // COMPUTED
  // ============================================

  const hayHorariosDisponibles = computed((): boolean => {
    return horariosDisponibles.value.some(h => h.disponible)
  })

  const fechaFormateada = computed((): string => {
    if (!fechaSeleccionada.value) return ''
    
    // ✅ CORRECCIÓN: Parseamos manualmente para evitar timezone
    const [year, month, day] = fechaSeleccionada.value.split('-')
    const date = new Date(Number(year), Number(month) - 1, Number(day))
    
    return date.toLocaleDateString('es-MX', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  })

  // ============================================
  // INICIALIZACIÓN DEL CALENDARIO
  // ============================================
  
  const inicializarCalendario = (): void => {
    if (!calendarEl.value) {
      console.error('❌ No se encontró el elemento del calendario')
      return
    }

    const calendarOptions: CalendarOptions = {
      plugins: [dayGridPlugin, interactionPlugin],
      initialView: 'dayGridMonth',
      locale: esLocale,
      timeZone: 'local',  // ✅ IMPORTANTE: Mantener timezone local
      
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: ''
      },
      
      height: 'auto',
      selectable: true,
      selectMirror: true,
      dayMaxEvents: true,
      weekends: true,
      
      // ✅ CORRECCIÓN: Usar string directo sin conversión
      validRange: {
        start: obtenerFechaHoy()  // ← Función helper sin timezone
      },
      
      // Click en un día
      dateClick: (info: DateClickArg): void => {
        // ✅ CORRECCIÓN: Comparar strings directamente, sin Date()
        const fechaClick = info.dateStr  // Ya viene como '2026-01-09'
        const hoy = obtenerFechaHoy()
        
        console.log('📅 Click en fecha:', fechaClick)
        console.log('📅 Hoy es:', hoy)
        console.log('📅 ¿Válida?:', compararFechas(fechaClick, hoy))
        
        if (compararFechas(fechaClick, hoy)) {
          fechaSeleccionada.value = fechaClick  // ← String puro, sin conversión
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
  // ABRIR MODAL Y CARGAR HORARIOS
  // ============================================
  
  const abrirModal = async (): Promise<void> => {
    modalAbierto.value = true
    await cargarHorariosDisponibles(fechaSeleccionada.value)
  }

  const cerrarModal = (): void => {
    modalAbierto.value = false
    fechaSeleccionada.value = ''
    horaSeleccionada.value = ''
    horariosDisponibles.value = []
  }

  // ============================================
  // CARGAR HORARIOS DESDE SUPABASE
  // ============================================
  
  const cargarHorariosDisponibles = async (fecha: string): Promise<void> => {
    cargandoHorarios.value = true
    horariosDisponibles.value = []

    try {
      console.log('📅 Cargando horarios para:', fecha)
      console.log('📅 Tipo de dato:', typeof fecha)
      console.log('📅 Valor exacto:', JSON.stringify(fecha))

      // ✅ CORRECTO: fecha es string '2026-01-09', Supabase lo maneja correctamente
      const { data: clasesData, error: clasesError } = await supabase
        .from('clases')
        .select(`
          id,
          fecha,
          hora_inicio,
          hora_fin,
          capacidad_maxima,
          capacidad_actual,
          instructores (
            profiles (
              nombre_completo
            )
          )
        `)
        .eq('fecha', fecha)  // ← String directo, sin conversión
        .order('hora_inicio', { ascending: true })

      if (clasesError) {
        console.error('❌ Error al obtener clases:', clasesError)
        throw clasesError
      }

      console.log('✅ Clases obtenidas:', clasesData)

      // Mapear a horarios disponibles
      if (clasesData && clasesData.length > 0) {
        horariosDisponibles.value = clasesData.map((clase) => {
          const disponible = (clase.capacidad_actual || 0) < clase.capacidad_maxima
          
          return {
            valor: `${clase.hora_inicio}-${clase.hora_fin}`,
            texto: `${clase.hora_inicio.substring(0, 5)} - ${clase.hora_fin.substring(0, 5)}`,
            disponible,
            clase_id: clase.id,
            capacidad_actual: clase.capacidad_actual || 0,
            capacidad_maxima: clase.capacidad_maxima
          }
        })
      }

      console.log('✅ Horarios procesados:', horariosDisponibles.value)

    } catch (error) {
      console.error('❌ Error al cargar horarios:', error)
      alert('❌ Error al cargar horarios disponibles')
    } finally {
      cargandoHorarios.value = false
    }
  }

  // ============================================
  // CONFIRMAR RESERVA
  // ============================================
  
  const confirmarReserva = async (): Promise<void> => {
    if (!horaSeleccionada.value) {
      alert('⚠️ Por favor selecciona una hora')
      return
    }

    try {
      console.log('📝 Confirmando reserva...')
      console.log('📅 Fecha seleccionada:', fechaSeleccionada.value)
      console.log('🕐 Hora seleccionada:', horaSeleccionada.value)

      // PASO 1: Obtener cliente_id
      const { data: clienteData, error: clienteError } = await supabase
        .from('clientes')
        .select('id')
        .eq('profile_id', authStore.userId)
        .single()

      if (clienteError || !clienteData) {
        throw new Error('No se encontró información del cliente')
      }

      clienteId.value = clienteData.id
      console.log('✅ Cliente ID:', clienteId.value)

      // PASO 2: Verificar paquete activo con clases
      // ✅ CORRECCIÓN: Comparar fecha sin hora
      const hoy = obtenerFechaHoy()
      
      const { data: paqueteData, error: paqueteError } = await supabase
        .from('mis_paquetes')
        .select('id, clases_restantes, fecha_vencimiento')
        .eq('cliente_id', clienteId.value)
        .eq('activo', true)
        .gt('clases_restantes', 0)
        .gte('fecha_vencimiento', hoy)  // ← String YYYY-MM-DD
        .order('fecha_vencimiento', { ascending: true })
        .limit(1)
        .single()

      if (paqueteError || !paqueteData) {
        console.warn('⚠️ No hay paquete activo:', paqueteError)
        alert('❌ No tienes un paquete activo con clases disponibles.\n\nPor favor compra un paquete en la sección de Planes.')
        router.push('/planes')
        return
      }

      paqueteActivoId.value = paqueteData.id
      console.log('✅ Paquete activo:', paqueteActivoId.value)
      console.log('📊 Clases restantes:', paqueteData.clases_restantes)

      // PASO 3: Obtener clase_id
      const horarioObj = horariosDisponibles.value.find(h => h.valor === horaSeleccionada.value)
      
      if (!horarioObj || !horarioObj.clase_id) {
        throw new Error('No se encontró la clase seleccionada')
      }

      const claseId = horarioObj.clase_id
      console.log('✅ Clase ID:', claseId)

      // PASO 4: Verificar reserva duplicada
      const { data: reservaDuplicada } = await supabase
        .from('mis_reservas')
        .select('id')
        .eq('cliente_id', clienteId.value)
        .eq('clase_id', claseId)
        .maybeSingle()

      if (reservaDuplicada) {
        alert('⚠️ Ya tienes una reserva para esta clase')
        return
      }

      // PASO 5: Verificar capacidad
      if (horarioObj.capacidad_actual && horarioObj.capacidad_maxima) {
        if (horarioObj.capacidad_actual >= horarioObj.capacidad_maxima) {
          alert('❌ Esta clase ya está llena')
          await cargarHorariosDisponibles(fechaSeleccionada.value)
          return
        }
      }

      // PASO 6: Crear reserva
      // ✅ CORRECCIÓN: fecha_reserva con timestamp correcto
      const ahora = new Date()
      const timestampReserva = ahora.toISOString()
      
      console.log('💾 Creando reserva...')
      console.log('  - cliente_id:', clienteId.value)
      console.log('  - clase_id:', claseId)
      console.log('  - mi_paquete_id:', paqueteActivoId.value)
      console.log('  - fecha_reserva:', timestampReserva)

      const { error: insertError } = await supabase
        .from('mis_reservas')
        .insert({
          cliente_id: clienteId.value,
          clase_id: claseId,
          mi_paquete_id: paqueteActivoId.value,
          fecha_reserva: timestampReserva,  // ← Timestamp con hora
          estado: 'confirmada'
        })

      if (insertError) {
        console.error('❌ Error al crear reserva:', insertError)
        throw new Error(`Error: ${insertError.message}`)
      }

      console.log('✅ Reserva creada exitosamente')

      // PASO 7: Actualizar capacidad de clase
      const { data: claseActualData } = await supabase
        .from('clases')
        .select('capacidad_actual')
        .eq('id', claseId)
        .single()

      if (claseActualData) {
        const nuevaCapacidad = (claseActualData.capacidad_actual || 0) + 1
        console.log('📊 Actualizando capacidad:', nuevaCapacidad)
        
        await supabase
          .from('clases')
          .update({ capacidad_actual: nuevaCapacidad })
          .eq('id', claseId)
      }

      // PASO 8: Descontar clase del paquete
      const nuevasClasesRestantes = paqueteData.clases_restantes - 1
      console.log('📦 Actualizando paquete: clases restantes =', nuevasClasesRestantes)
      
      await supabase
        .from('mis_paquetes')
        .update({ clases_restantes: nuevasClasesRestantes })
        .eq('id', paqueteActivoId.value)

      // PASO 9: Éxito
      console.log('✅✅✅ RESERVA COMPLETADA EXITOSAMENTE')
      
      alert(
        `✅ ¡Reserva confirmada!\n\n` +
        `📅 Fecha: ${fechaFormateada.value}\n` +
        `🕐 Hora: ${horarioObj.texto}\n\n` +
        `Te quedan ${nuevasClasesRestantes} clases en tu paquete.`
      )

      cerrarModal()
      router.push('/mis-reservas')

    } catch (error) {
      console.error('❌❌❌ Error al confirmar:', error)
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      alert(`❌ Error al confirmar la reserva:\n\n${errorMessage}`)
    }
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
    calendarEl,
    modalAbierto,
    fechaSeleccionada,
    horaSeleccionada,
    cargandoHorarios,
    horariosDisponibles,
    hayHorariosDisponibles,
    fechaFormateada,
    cerrarModal,
    confirmarReserva
  }
}