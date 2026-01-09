<template>
  <div>
    <div class="crear-clase-view">
      <div class="container">
        <!-- ENCABEZADO -->
        <div class="header">
          <h1>📅 Crear Clases</h1>
          <p class="subtitle">Genera tus clases de forma individual o masiva</p>
        </div>

        <!-- LOADING -->
        <div v-if="cargando" class="loading">
          <div class="spinner"></div>
          <p>Procesando...</p>
        </div>

        <!-- FORMULARIO -->
        <div v-else class="formulario">
          <!-- PANEL DE CONFIGURACIÓN -->
          <div class="seccion config-panel">
            <h2>⚙️ Configuración General</h2>
            
            <div class="form-row">
              <div class="form-group">
                <label>Cupo Máximo por Clase</label>
                <input 
                  v-model.number="config.cupoMaximo" 
                  type="number" 
                  min="1" 
                  max="15"
                  placeholder="Ej: 10"
                  class="input"
                />
                <small>Mínimo 1, máximo 15 personas</small>
              </div>
            </div>
          </div>

          <!-- SELECCIÓN DE FECHA -->
          <div class="seccion">
            <h2>📆 Fecha</h2>
            
            <div class="form-group">
              <label>Fecha de la clase</label>
              <input 
                v-model="formulario.fecha" 
                type="date" 
                :min="fechaMinima"
                :max="fechaMaxima"
                class="input"
              />
              <small>Máximo 3 semanas en el futuro</small>
            </div>
          </div>

          <!-- RANGOS HORARIOS -->
          <div class="seccion">
            <h2>🕐 Rangos Horarios</h2>
            <p class="info-text">Define uno o más rangos. Se generarán clases de 1 hora automáticamente.</p>

            <div class="rangos-lista">
              <div 
                v-for="(rango, index) in formulario.rangos" 
                :key="index"
                class="rango-item"
              >
                <div class="rango-numero">{{ index + 1 }}</div>
                
                <div class="form-row">
                  <div class="form-group">
                    <label>Hora Inicio</label>
                    <input 
                      v-model="rango.horaInicio" 
                      type="time" 
                      min="06:00" 
                      max="21:00"
                      step="900"
                      class="input"
                    />
                  </div>

                  <div class="form-group">
                    <label>Hora Fin</label>
                    <input 
                      v-model="rango.horaFin" 
                      type="time" 
                      min="06:00" 
                      max="21:00"
                      step="900"
                      class="input"
                    />
                  </div>

                  <div class="form-group clases-generadas">
                    <label>Clases</label>
                    <div class="badge-info">
                      {{ calcularClasesPorRango(rango) }}
                    </div>
                  </div>
                </div>

                <button 
                  v-if="formulario.rangos.length > 1"
                  class="btn-eliminar-rango"
                  @click="eliminarRango(index)"
                >
                  🗑️
                </button>
              </div>
            </div>

            <button class="btn-agregar-rango" @click="agregarRango">
              ➕ Agregar otro rango horario
            </button>
          </div>

          <!-- RECURRENCIA -->
          <div class="seccion">
            <h2>🔄 Recurrencia</h2>
            
            <div class="recurrencia-toggle">
              <label class="checkbox-label">
                <input 
                  v-model="formulario.repetir" 
                  type="checkbox"
                  class="checkbox"
                />
                <span>Repetir semanalmente</span>
              </label>
            </div>

            <div v-if="formulario.repetir" class="form-group">
              <label>¿Cuántas semanas repetir?</label>
              <input 
                v-model.number="formulario.numSemanas" 
                type="number" 
                min="1" 
                max="12"
                placeholder="Ej: 4"
                class="input"
              />
              <small>Máximo 12 semanas</small>
            </div>
          </div>

          <!-- PREVIEW -->
          <div v-if="preview.length > 0" class="seccion preview-section">
            <h2>👁️ Vista Previa</h2>
            <p class="preview-total">
              Se crearán <strong>{{ preview.length }} clases</strong>
            </p>

            <div class="preview-lista">
              <div 
                v-for="(clase, index) in preview" 
                :key="index"
                class="preview-item"
              >
                <div class="preview-fecha">
                  {{ formatearFecha(clase.fecha) }}
                </div>
                <div class="preview-hora">
                  {{ clase.horaInicio }} - {{ clase.horaFin }}
                </div>
                <div class="preview-cupo">
                  👥 {{ clase.cupo }}
                </div>
              </div>
            </div>
          </div>

          <!-- ADVERTENCIAS -->
          <div v-if="advertencias.length > 0" class="advertencias">
            <div 
              v-for="(advertencia, index) in advertencias" 
              :key="index"
              class="advertencia-item"
            >
              ⚠️ {{ advertencia }}
            </div>
          </div>

          <!-- BOTONES -->
          <div class="botones">
            <button 
              class="btn-secondary" 
              @click="limpiarFormulario"
              :disabled="guardando"
            >
              🔄 Limpiar
            </button>
            
            <button 
              class="btn-preview" 
              @click="generarPreview"
              :disabled="!formularioValido || guardando"
            >
              👁️ Generar Vista Previa
            </button>
            
            <button 
              class="btn-primary" 
              @click="confirmarCreacion"
              :disabled="preview.length === 0 || guardando"
            >
              {{ guardando ? 'Guardando...' : '✅ Crear Clases' }}
            </button>
          </div>
        </div>
      </div>

      <!-- MODAL DE CONFIRMACIÓN -->
      <Teleport to="body">
        <div v-if="mostrarConfirmacion" class="modal" @click.self="cerrarConfirmacion">
          <div class="modal-content">
            <button class="btn-close" @click="cerrarConfirmacion">✕</button>
            
            <h2>⚠️ Confirmar Creación</h2>
            
            <div class="confirmacion-mensaje">
              <p>Estás a punto de crear <strong>{{ preview.length }} clases</strong>.</p>
              <p>Esta acción no se puede deshacer fácilmente.</p>
            </div>

            <div class="confirmacion-detalle">
              <div class="detalle-item">
                <span class="label">📅 Fechas:</span>
                <span class="valor">{{ rangoFechas }}</span>
              </div>
              <div class="detalle-item">
                <span class="label">👥 Cupo por clase:</span>
                <span class="valor">{{ config.cupoMaximo }} personas</span>
              </div>
            </div>

            <div class="modal-buttons">
              <button class="btn-secondary" @click="cerrarConfirmacion">
                Cancelar
              </button>
              <button class="btn-success" @click="crearClases">
                ✅ Sí, Crear
              </button>
            </div>
          </div>
        </div>
      </Teleport>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

// ============================================
// TYPES
// ============================================

interface RangoHorario {
  horaInicio: string
  horaFin: string
}

interface ClasePreview {
  fecha: string
  horaInicio: string
  horaFin: string
  cupo: number
}

interface ConfigGeneral {
  cupoMaximo: number
}

// ============================================
// STATE
// ============================================

const authStore = useAuthStore()
const router = useRouter()

const cargando = ref(false)
const guardando = ref(false)
const mostrarConfirmacion = ref(false)
const instructorId = ref<string | null>(null)

// Configuración general
const config = ref<ConfigGeneral>({
  cupoMaximo: 15
})

// Formulario
const formulario = ref({
  fecha: '',
  rangos: [
    { horaInicio: '', horaFin: '' }
  ] as RangoHorario[],
  repetir: false,
  numSemanas: 1
})

// Preview y advertencias
const preview = ref<ClasePreview[]>([])
const advertencias = ref<string[]>([])

// ============================================
// COMPUTED
// ============================================

const fechaMinima = computed(() => {
  const hoy = new Date()
  hoy.setDate(hoy.getDate() + 1) // Mínimo mañana
  return hoy.toISOString().split('T')[0]
})

const fechaMaxima = computed(() => {
  const hoy = new Date()
  hoy.setDate(hoy.getDate() + 21) // Máximo 3 semanas
  return hoy.toISOString().split('T')[0]
})

const formularioValido = computed(() => {
  // Validar configuración
  if (config.value.cupoMaximo < 1 || config.value.cupoMaximo > 30) return false
  
  // Validar fecha
  if (!formulario.value.fecha) return false
  
  // Validar al menos un rango válido
  const rangoValido = formulario.value.rangos.some(rango => {
    return rango.horaInicio && rango.horaFin && rango.horaInicio < rango.horaFin
  })
  
  if (!rangoValido) return false
  
  // Si hay recurrencia, validar semanas
  if (formulario.value.repetir) {
    if (formulario.value.numSemanas < 1 || formulario.value.numSemanas > 12) return false
  }
  
  return true
})

const rangoFechas = computed(() => {
  if (preview.value.length === 0) return ''
  
  const fechas = [...new Set(preview.value.map(c => c.fecha))].sort()
  const primera = formatearFecha(fechas[0])
  const ultima = formatearFecha(fechas[fechas.length - 1])
  
  if (primera === ultima) return primera
  return `${primera} - ${ultima}`
})

// ============================================
// METHODS
// ============================================

// Cargar instructor_id
const cargarInstructorId = async () => {
  cargando.value = true
  try {
    console.log('🔍 Cargando instructor_id...')
    console.log('👤 Auth Store userId:', authStore.userId)
    console.log('✅ Auth Store isAuthenticated:', authStore.isAuthenticated)
    console.log('🎭 Auth Store role:', authStore.role)
    
    if (!authStore.userId) {
      throw new Error('No hay usuario autenticado')
    }
    
    if (authStore.role !== 'instructor') {
      throw new Error('El usuario no tiene rol de instructor')
    }
    
    const { data, error } = await supabase
      .from('instructores')
      .select('id')
      .eq('profile_id', authStore.userId)
      .single()
    
    console.log('📊 Respuesta de Supabase:', { data, error })
    
    if (error) {
      console.error('❌ Error de Supabase:', error)
      throw new Error(`Error de base de datos: ${error.message}`)
    }
    
    if (!data) {
      throw new Error('No se encontró registro de instructor en la base de datos')
    }
    
    instructorId.value = data.id
    console.log('✅ Instructor ID cargado:', instructorId.value)
    
  } catch (error) {
    console.error('❌ Error completo:', error)
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
    alert(`Error al cargar información del instructor:\n\n${errorMessage}\n\nPor favor, contacta al administrador.`)
    router.push('/calendario-instructor')
  } finally {
    cargando.value = false
  }
}

// Calcular cuántas clases genera un rango
const calcularClasesPorRango = (rango: RangoHorario): string => {
  if (!rango.horaInicio || !rango.horaFin) return '0 clases'
  
  const [hi, mi] = rango.horaInicio.split(':').map(Number)
  const [hf, mf] = rango.horaFin.split(':').map(Number)
  
  const minInicio = hi * 60 + mi
  const minFin = hf * 60 + mf
  const duracion = minFin - minInicio
  
  if (duracion < 60) return '⚠️ Mínimo 1 hora'
  
  const numClases = Math.floor(duracion / 60)
  return `${numClases} clase${numClases !== 1 ? 's' : ''}`
}

// Agregar rango
const agregarRango = () => {
  formulario.value.rangos.push({ horaInicio: '', horaFin: '' })
}

// Eliminar rango
const eliminarRango = (index: number) => {
  formulario.value.rangos.splice(index, 1)
}

// Generar vista previa
const generarPreview = () => {
  preview.value = []
  advertencias.value = []
  
  if (!formularioValido.value) {
    advertencias.value.push('Completa todos los campos requeridos')
    return
  }
  
  const clases: ClasePreview[] = []
  const fechaBase = new Date(formulario.value.fecha + 'T00:00:00')
  
  // Calcular número de semanas
  const numSemanas = formulario.value.repetir ? formulario.value.numSemanas : 1
  
  // Por cada semana
  for (let semana = 0; semana < numSemanas; semana++) {
    const fecha = new Date(fechaBase)
    fecha.setDate(fecha.getDate() + (semana * 7))
    const fechaStr = fecha.toISOString().split('T')[0]
    
    // Por cada rango horario
    for (const rango of formulario.value.rangos) {
      if (!rango.horaInicio || !rango.horaFin) continue
      
      const [hi, mi] = rango.horaInicio.split(':').map(Number)
      const [hf, mf] = rango.horaFin.split(':').map(Number)
      
      let horaActual = hi * 60 + mi
      const horaFinal = hf * 60 + mf
      
      // Generar clases de 1 hora
      while (horaActual + 60 <= horaFinal) {
        const horaInicioStr = `${String(Math.floor(horaActual / 60)).padStart(2, '0')}:${String(horaActual % 60).padStart(2, '0')}`
        const horaFinStr = `${String(Math.floor((horaActual + 60) / 60)).padStart(2, '0')}:${String((horaActual + 60) % 60).padStart(2, '0')}`
        
        clases.push({
          fecha: fechaStr,
          horaInicio: horaInicioStr,
          horaFin: horaFinStr,
          cupo: config.value.cupoMaximo
        })
        
        horaActual += 60
      }
    }
  }
  
  preview.value = clases
  
  if (clases.length === 0) {
    advertencias.value.push('No se generaron clases. Verifica los rangos horarios.')
  }
}

// Confirmar creación
const confirmarCreacion = () => {
  if (preview.value.length === 0) {
    alert('Primero genera la vista previa')
    return
  }
  
  mostrarConfirmacion.value = true
}

// Cerrar confirmación
const cerrarConfirmacion = () => {
  mostrarConfirmacion.value = false
}

// Crear clases en BD
const crearClases = async () => {
  if (!instructorId.value) {
    alert('Error: No se encontró el ID del instructor')
    return
  }
  
  guardando.value = true
  
  try {
    // Validar solapamiento
    const tieneSolapamiento = await verificarSolapamiento()
    
    if (tieneSolapamiento) {
      advertencias.value.push('Algunas clases se solapan con clases existentes. Por favor revisa.')
      guardando.value = false
      cerrarConfirmacion()
      return
    }
    
    // Insertar clases
    const clasesParaInsertar = preview.value.map(clase => ({
      instructor_id: instructorId.value,
      fecha: clase.fecha,
      hora_inicio: clase.horaInicio,
      hora_fin: clase.horaFin,
      capacidad_maxima: clase.cupo,
      capacidad_actual: 0
    }))
    
    const { error } = await supabase
      .from('clases')
      .insert(clasesParaInsertar)
    
    if (error) throw error
    
    alert(`✅ Se crearon ${preview.value.length} clases exitosamente`)
    limpiarFormulario()
    cerrarConfirmacion()
    router.push('/calendario-instructor')
    
  } catch (error) {
    console.error('Error al crear clases:', error)
    alert('Error al crear las clases. Intenta de nuevo.')
  } finally {
    guardando.value = false
  }
}

// Verificar solapamiento
const verificarSolapamiento = async (): Promise<boolean> => {
  if (!instructorId.value) return false
  
  try {
    // Obtener fechas únicas del preview
    const fechas = [...new Set(preview.value.map(c => c.fecha))]
    
    // Consultar clases existentes del instructor en esas fechas
    const { data, error } = await supabase
      .from('clases')
      .select('fecha, hora_inicio, hora_fin')
      .eq('instructor_id', instructorId.value)
      .in('fecha', fechas)
    
    if (error) throw error
    if (!data || data.length === 0) return false
    
    // Verificar solapamiento
    for (const clasePreview of preview.value) {
      for (const claseExistente of data) {
        if (clasePreview.fecha !== claseExistente.fecha) continue
        
        // Verificar si los horarios se solapan
        const inicioPreview = clasePreview.horaInicio
        const finPreview = clasePreview.horaFin
        const inicioExistente = claseExistente.hora_inicio
        const finExistente = claseExistente.hora_fin
        
        if (
          (inicioPreview >= inicioExistente && inicioPreview < finExistente) ||
          (finPreview > inicioExistente && finPreview <= finExistente) ||
          (inicioPreview <= inicioExistente && finPreview >= finExistente)
        ) {
          return true // Hay solapamiento
        }
      }
    }
    
    return false
    
  } catch (error) {
    console.error('Error al verificar solapamiento:', error)
    return true // Por seguridad, reportar solapamiento si hay error
  }
}

// Limpiar formulario
const limpiarFormulario = () => {
  formulario.value = {
    fecha: '',
    rangos: [{ horaInicio: '', horaFin: '' }],
    repetir: false,
    numSemanas: 1
  }
  preview.value = []
  advertencias.value = []
}

// Formatear fecha
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
  cargarInstructorId()
})
</script>

<style scoped>
/* Estilos similares a RegistroAsistenciaView */
.crear-clase-view {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  min-height: 100vh;
}

.container {
  max-width: 1000px;
  margin: 0 auto;
  background: white;
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.header {
  margin-bottom: 30px;
}

h1 {
  color: #667eea;
  margin-bottom: 10px;
  font-size: 2em;
}

.subtitle {
  color: #666;
  font-size: 0.95em;
}

.loading {
  text-align: center;
  padding: 60px 20px;
}

.spinner {
  width: 50px;
  height: 50px;
  margin: 0 auto 20px;
  border: 5px solid #f3f3f3;
  border-top: 5px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.seccion {
  background: #f8f9fa;
  padding: 25px;
  border-radius: 12px;
  margin-bottom: 20px;
}

.seccion h2 {
  color: #667eea;
  margin-bottom: 15px;
  font-size: 1.3em;
}

.config-panel {
  border-left: 5px solid #667eea;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin-bottom: 15px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
  font-size: 14px;
}

.input {
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.3s ease;
}

.input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

small {
  color: #666;
  font-size: 12px;
  margin-top: 5px;
}

.info-text {
  color: #666;
  font-size: 14px;
  margin-bottom: 15px;
}

.rangos-lista {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 15px;
}

.rango-item {
  position: relative;
  background: white;
  padding: 20px;
  border-radius: 10px;
  border-left: 4px solid #667eea;
}

.rango-numero {
  position: absolute;
  top: 15px;
  left: 15px;
  width: 30px;
  height: 30px;
  background: #667eea;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 14px;
}

.rango-item .form-row {
  margin-left: 45px;
  margin-bottom: 0;
}

.clases-generadas .badge-info {
  padding: 12px;
  background: #e3f2fd;
  color: #1976d2;
  border-radius: 8px;
  font-weight: 600;
  text-align: center;
  font-size: 14px;
}

.btn-eliminar-rango {
  position: absolute;
  top: 15px;
  right: 15px;
  width: 35px;
  height: 35px;
  background: #ffebee;
  color: #c62828;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.3s ease;
}

.btn-eliminar-rango:hover {
  background: #ffcdd2;
}

.btn-agregar-rango {
  width: 100%;
  padding: 12px;
  background: white;
  border: 2px dashed #667eea;
  color: #667eea;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.3s ease;
}

.btn-agregar-rango:hover {
  background: #f0f4ff;
}

.recurrencia-toggle {
  margin-bottom: 15px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  font-weight: 600;
  color: #333;
}

.checkbox {
  width: 20px;
  height: 20px;
  cursor: pointer;
}

.preview-section {
  border-left: 5px solid #4caf50;
}

.preview-total {
  color: #4caf50;
  font-weight: 700;
  font-size: 16px;
  margin-bottom: 15px;
}

.preview-lista {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 10px;
  max-height: 400px;
  overflow-y: auto;
}

.preview-item {
  background: white;
  padding: 12px;
  border-radius: 8px;
  border-left: 3px solid #4caf50;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
}

.preview-fecha {
  font-weight: 600;
  color: #333;
}

.preview-hora {
  color: #666;
}

.preview-cupo {
  color: #4caf50;
  font-weight: 600;
}

.advertencias {
  background: #fff3cd;
  border-left: 4px solid #ffc107;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.advertencia-item {
  color: #856404;
  font-size: 14px;
  margin-bottom: 5px;
}

.botones {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.botones button {
  padding: 14px 24px;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-size: 15px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-secondary {
  background: #e0e0e0;
  color: #666;
}

.btn-secondary:hover {
  background: #d0d0d0;
}

.btn-preview {
  background: #2196f3;
  color: white;
}

.btn-preview:hover:not(:disabled) {
  background: #1976d2;
}

.btn-primary {
  background: #667eea;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #5568d3;
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Modal (igual que RegistroAsistenciaView) */
.modal {
  display: flex;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  z-index: 1000;
  animation: fadeIn 0.3s;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-content {
  position: relative;
  background: white;
  padding: 30px;
  max-width: 500px;
  width: 100%;
  border-radius: 15px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s;
}

@keyframes slideUp {
  from {
    transform: translateY(50px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.btn-close {
  position: absolute;
  top: 15px;
  right: 15px;
  width: 35px;
  height: 35px;
  padding: 0;
  background: #e0e0e0;
  color: #666;
  font-size: 20px;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-close:hover {
  background: #d0d0d0;
}

.modal h2 {
  color: #667eea;
  margin-bottom: 20px;
}

.confirmacion-mensaje {
  background: #fff3cd;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.confirmacion-mensaje p {
  color: #856404;
  margin: 5px 0;
}

.confirmacion-detalle {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.detalle-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #e0e0e0;
}

.detalle-item:last-child {
  border-bottom: none;
}

.label {
  font-weight: 600;
  color: #555;
}

.valor {
  color: #333;
}

.modal-buttons {
  display: flex;
  gap: 12px;
}

.modal-buttons button {
  flex: 1;
  padding: 14px;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-size: 15px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-success {
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
  color: white;
}

.btn-success:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(17, 153, 142, 0.3);
}

@media (max-width: 768px) {
  .container {
    padding: 15px;
  }

  .botones {
    flex-direction: column;
  }

  .preview-lista {
    grid-template-columns: 1fr;
  }
}
</style>