<template>
  <div>
    <div class="crear-instructor-view">
      <div class="container">
        <!-- CARD PRINCIPAL -->
        <div class="card">
          <h1>👨‍🏫 Crear Instructor</h1>
          <p class="subtitle">Agrega nuevos miembros al equipo de instructores</p>

          <!-- FORMULARIO -->
          <div class="form-section">
            <div class="form-group">
              <label>Nombre Completo *</label>
              <input 
                v-model="formulario.nombreCompleto" 
                type="text" 
                class="input-field"
                :class="{ 'error': errores.nombreCompleto }"
                placeholder="Ej: María García López"
                @blur="validarCampo('nombreCompleto')"
                :disabled="creando"
              />
              <p v-if="errores.nombreCompleto" class="error-message">{{ errores.nombreCompleto }}</p>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Correo Electrónico *</label>
                <input 
                  v-model="formulario.email" 
                  type="email" 
                  class="input-field"
                  :class="{ 'error': errores.email }"
                  placeholder="ejemplo@correo.com"
                  @blur="validarCampo('email')"
                  :disabled="creando"
                />
                <p v-if="errores.email" class="error-message">{{ errores.email }}</p>
              </div>

              <div class="form-group">
                <label>Teléfono *</label>
                <input 
                  v-model="formulario.telefono" 
                  type="tel" 
                  class="input-field"
                  :class="{ 'error': errores.telefono }"
                  placeholder="6671234567"
                  maxlength="10"
                  @blur="validarCampo('telefono')"
                  :disabled="creando"
                />
                <p v-if="errores.telefono" class="error-message">{{ errores.telefono }}</p>
              </div>
            </div>

            <div class="form-group">
              <label>Contraseña *</label>
              <div class="password-input-wrapper">
                <input 
                  v-model="formulario.password" 
                  :type="mostrarPassword ? 'text' : 'password'"
                  class="input-field"
                  :class="{ 'error': errores.password }"
                  placeholder="Mínimo 6 caracteres"
                  @blur="validarCampo('password')"
                  :disabled="creando"
                />
                <button 
                  type="button"
                  class="btn-toggle-password"
                  @click="mostrarPassword = !mostrarPassword"
                >
                  {{ mostrarPassword ? '👁️' : '👁️‍🗨️' }}
                </button>
              </div>
              <p v-if="errores.password" class="error-message">{{ errores.password }}</p>
            </div>

            <div class="form-buttons">
              <button 
                @click="limpiarFormulario"
                class="btn-secondary"
                :disabled="creando"
              >
                Limpiar
              </button>
              <button 
                @click="crearInstructor"
                class="btn-primary"
                :disabled="creando"
              >
                {{ creando ? 'Creando...' : '✅ Crear Instructor' }}
              </button>
            </div>
          </div>
        </div>

        <!-- TABLA DE INSTRUCTORES -->
        <div class="card">
          <h2>📋 Instructores Registrados</h2>

          <!-- BUSCADOR -->
          <div class="search-bar">
            <input 
              type="text" 
              v-model="busqueda"
              placeholder="🔍 Buscar por nombre o email..."
            />
          </div>

          <!-- LOADING -->
          <div v-if="cargando" class="loading">
            <div class="spinner"></div>
            <p>Cargando instructores...</p>
          </div>

          <!-- SIN INSTRUCTORES -->
          <div v-else-if="instructoresFiltrados.length === 0" class="no-data">
            <p>😔 No se encontraron instructores</p>
          </div>

          <!-- TABLA -->
          <div v-else>
            <div class="table-header">
              <span style="width: 30%;">Nombre</span>
              <span style="width: 30%;">Email</span>
              <span style="width: 20%;">Teléfono</span>
              <span style="width: 20%;">Fecha Registro</span>
            </div>

            <div 
              v-for="instructor in instructoresFiltrados" 
              :key="instructor.id"
              class="table-row"
            >
              <span style="width: 30%;">{{ instructor.nombre_completo }}</span>
              <span style="width: 30%;" class="email">{{ instructor.email }}</span>
              <span style="width: 20%;">{{ instructor.telefono }}</span>
              <span style="width: 20%;">{{ formatearFecha(instructor.created_at) }}</span>
            </div>
          </div>

          <p class="total-results">
            Mostrando {{ instructoresFiltrados.length }} de {{ instructores.length }} instructores
          </p>
        </div>
      </div>

      <!-- MODAL DE ÉXITO -->
      <Teleport to="body">
        <div v-if="mostrarModalExito" class="modal" @click.self="cerrarModalExito">
          <div class="modal-content success-modal">
            <button class="btn-close" @click="cerrarModalExito">✕</button>
            
            <div class="success-icon">✅</div>
            <h2>¡Instructor Creado Exitosamente!</h2>
            
            <div class="instructor-info">
              <div class="info-item">
                <span class="label">Nombre:</span>
                <span class="value">{{ instructorCreado.nombre }}</span>
              </div>
              <div class="info-item">
                <span class="label">Email:</span>
                <span class="value">{{ instructorCreado.email }}</span>
              </div>
              <div class="info-item">
                <span class="label">Teléfono:</span>
                <span class="value">{{ instructorCreado.telefono }}</span>
              </div>
            </div>

            <div class="modal-buttons">
              <button class="btn-primary-large" @click="cerrarModalExito">
                Entendido
              </button>
            </div>
          </div>
        </div>
      </Teleport>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { supabase } from '@/lib/supabase'
import { z } from 'zod'

// ============================================
// TYPES
// ============================================

interface Instructor {
  id: string
  nombre_completo: string
  email: string
  telefono: string
  created_at: string
}

interface InstructorCreado {
  nombre: string
  email: string
  telefono: string
}

// ============================================
// STATE
// ============================================

const creando = ref(false)
const cargando = ref(false)
const mostrarPassword = ref(false)
const mostrarModalExito = ref(false)
const busqueda = ref('')

const instructores = ref<Instructor[]>([])
const instructorCreado = ref<InstructorCreado>({
  nombre: '',
  email: '',
  telefono: ''
})

const formulario = reactive({
  nombreCompleto: '',
  email: '',
  telefono: '',
  password: ''
})

const errores = reactive({
  nombreCompleto: '',
  email: '',
  telefono: '',
  password: ''
})

// ============================================
// VALIDACIÓN CON ZOD
// ============================================

const instructorSchema = z.object({
  nombreCompleto: z.string()
    .trim()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres')
    .regex(
      /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/, 
      'El nombre solo puede contener letras y espacios'
    ),
  
  email: z.string()
    .trim()
    .email('Correo electrónico inválido')
    .transform((val) => val.trim().toLowerCase()),
  
  telefono: z.string()
    .trim()
    .length(10, 'El teléfono debe tener exactamente 10 dígitos')
    .regex(/^\d+$/, 'El teléfono solo debe contener números'),
  
  password: z.string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
})

// ============================================
// COMPUTED
// ============================================

const instructoresFiltrados = computed(() => {
  if (!busqueda.value.trim()) return instructores.value
  
  const termino = busqueda.value.toLowerCase()
  return instructores.value.filter(instructor => 
    instructor.nombre_completo.toLowerCase().includes(termino) ||
    instructor.email.toLowerCase().includes(termino)
  )
})

// ============================================
// METHODS
// ============================================

// Validar campo individual
const validarCampo = (campo: keyof typeof errores) => {
  const data = {
    nombreCompleto: formulario.nombreCompleto.trim(),
    email: formulario.email.trim(),
    telefono: formulario.telefono.trim(),
    password: formulario.password
  }

  try {
    instructorSchema.parse(data)
    errores[campo] = ''
  } catch (e) {
    if (e && typeof e === 'object' && 'errors' in e) {
      const zodErrors = (e as { errors: Array<{ path: Array<string>; message: string }> }).errors
      const fieldError = zodErrors.find(err => err.path[0] === campo)
      if (fieldError) {
        errores[campo] = fieldError.message
      } else {
        errores[campo] = ''
      }
    }
  }
}

// Limpiar errores
const limpiarErrores = () => {
  Object.keys(errores).forEach(key => {
    errores[key as keyof typeof errores] = ''
  })
}

// Limpiar formulario
const limpiarFormulario = () => {
  formulario.nombreCompleto = ''
  formulario.email = ''
  formulario.telefono = ''
  formulario.password = ''
  limpiarErrores()
}

// Cargar instructores
const cargarInstructores = async () => {
  cargando.value = true
  try {
    const { data, error } = await supabase
      .from('instructores')
      .select(`
        id,
        profile_id,
        created_at,
        profiles:profile_id (
          nombre_completo,
          id
        )
      `)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    
    // Obtener emails de los instructores
    const instructoresConEmail: Instructor[] = []
    
    for (const instructor of (data || [])) {
      if (!instructor.profiles) continue
      
      const profileData = Array.isArray(instructor.profiles) 
        ? instructor.profiles[0] 
        : instructor.profiles
      
      if (!profileData || !profileData.id) continue
      
      // Obtener email del usuario
      const { data: userData } = await supabase
        .rpc('get_user_email', { user_id: profileData.id })
      
      // Obtener teléfono del profile
      const { data: profileTelefono } = await supabase
        .from('profiles')
        .select('telefono')
        .eq('id', profileData.id)
        .single()
      
      instructoresConEmail.push({
        id: instructor.id,
        nombre_completo: profileData.nombre_completo,
        email: userData || 'No disponible',
        telefono: profileTelefono?.telefono || 'No disponible',
        created_at: instructor.created_at
      })
    }
    
    instructores.value = instructoresConEmail
    
  } catch (error) {
    console.error('Error al cargar instructores:', error)
    alert('Error al cargar la lista de instructores')
  } finally {
    cargando.value = false
  }
}

// Crear instructor
const crearInstructor = async () => {
  limpiarErrores()
  
  const data = {
    nombreCompleto: formulario.nombreCompleto.trim(),
    email: formulario.email.trim(),
    telefono: formulario.telefono.trim(),
    password: formulario.password
  }
  
  // Validar
  const validationResult = instructorSchema.safeParse(data)
  
  if (!validationResult.success) {
    const zodErrors = validationResult.error.issues
    zodErrors.forEach((err) => {
      const field = err.path[0] as keyof typeof errores
      if (field in errores) {
        errores[field] = err.message
      }
    })
    alert('Por favor corrige los errores en el formulario')
    return
  }
  
  const validatedData = validationResult.data
  creando.value = true
  
  try {
    console.log('🚀 Iniciando creación de instructor...')
    
    // PASO 1: Crear usuario en auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: validatedData.email,
      password: validatedData.password,
      options: {
        data: {
          nombre_completo: validatedData.nombreCompleto,
          telefono: validatedData.telefono,
          rol: 'instructor'
        },
        emailRedirectTo: undefined
      }
    })
    
    if (authError) {
      if (authError.message.includes('already registered') || authError.message.includes('User already registered')) {
        errores.email = 'Este correo ya está registrado'
        throw new Error('Este correo electrónico ya está registrado en el sistema')
      }
      throw new Error(authError.message)
    }
    
    if (!authData.user) {
      throw new Error('No se pudo crear el usuario')
    }
    
    const userId = authData.user.id
    console.log('✅ Usuario creado en auth:', userId)
    
    // PASO 2: Esperar y verificar/crear profile
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle()
    
    if (!profileData) {
      console.log('⚠️ Profile no existe, creándolo...')
      
      const { error: createProfileError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          nombre_completo: validatedData.nombreCompleto,
          telefono: validatedData.telefono,
          rol: 'instructor'
        })
      
      if (createProfileError) {
        throw new Error(`Error al crear profile: ${createProfileError.message}`)
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
    
    console.log('✅ Profile verificado/creado')
    
    // PASO 3: Crear instructor
    const { data: existingInstructor } = await supabase
      .from('instructores')
      .select('id')
      .eq('profile_id', userId)
      .maybeSingle()
    
    if (existingInstructor) {
      console.log('✅ Instructor ya existe (trigger funcionó)')
    } else {
      console.log('⚡ Creando instructor manualmente...')
      
      const { error: instructorError } = await supabase
        .from('instructores')
        .insert({
          profile_id: userId
        })
      
      if (instructorError) {
        // Verificar una vez más
        const { data: retryInstructor } = await supabase
          .from('instructores')
          .select('id')
          .eq('profile_id', userId)
          .maybeSingle()
        
        if (!retryInstructor) {
          throw new Error(`No se pudo crear el instructor: ${instructorError.message}`)
        }
      }
    }
    
    console.log('✅✅✅ INSTRUCTOR CREADO EXITOSAMENTE')
    
    // Guardar datos para el modal
    instructorCreado.value = {
      nombre: validatedData.nombreCompleto,
      email: validatedData.email,
      telefono: validatedData.telefono
    }
    
    // Mostrar modal de éxito
    mostrarModalExito.value = true
    
    // Limpiar formulario
    limpiarFormulario()
    
    // Recargar lista
    await cargarInstructores()
    
  } catch (error: unknown) {
    console.error('❌ Error al crear instructor:', error)
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
    alert(`Error al crear instructor:\n\n${errorMessage}`)
  } finally {
    creando.value = false
  }
}

// Cerrar modal
const cerrarModalExito = () => {
  mostrarModalExito.value = false
}

// Formatear fecha
const formatearFecha = (fecha: string): string => {
  return new Date(fecha).toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// ============================================
// LIFECYCLE
// ============================================

onMounted(() => {
  cargarInstructores()
})
</script>

<style scoped>
.crear-instructor-view {
  width: 100%;
  min-height: 100vh;
  background: linear-gradient(135deg, #66ea99 0%, #b7ecdc 100%);
  padding: 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.card {
  background: white;
  padding: 40px;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

h1 {
  margin: 0 0 10px 0;
  font-size: 28px;
  font-weight: bold;
  color: #667eea;
}

.subtitle {
  margin: 0 0 30px 0;
  color: #666;
  font-size: 14px;
}

h2 {
  margin: 0 0 20px 0;
  font-size: 22px;
  font-weight: 600;
  color: #667eea;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
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

.input-field {
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  font-size: 14px;
  transition: all 0.3s;
  background: #f8f9fa;
}

.input-field:focus {
  outline: none;
  border-color: #667eea;
  background: white;
}

.input-field.error {
  border-color: #dc3545;
  background: #fff5f5;
}

.input-field:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-message {
  color: #dc3545;
  font-size: 12px;
  margin-top: 5px;
}

.password-input-wrapper {
  position: relative;
}

.btn-toggle-password {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  font-size: 18px;
  padding: 4px 8px;
  transition: opacity 0.3s;
}

.btn-toggle-password:hover {
  opacity: 0.7;
}

.form-buttons {
  display: flex;
  gap: 15px;
  justify-content: flex-end;
  margin-top: 10px;
}

.btn-secondary {
  padding: 12px 24px;
  background: #e0e0e0;
  color: #666;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-size: 15px;
  font-weight: 600;
  transition: all 0.3s;
}

.btn-secondary:hover:not(:disabled) {
  background: #d0d0d0;
}

.btn-primary {
  padding: 12px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-size: 15px;
  font-weight: 600;
  transition: all 0.3s;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.search-bar {
  margin-bottom: 20px;
}

.search-bar input {
  width: 100%;
  padding: 12px 16px;
  background: #f8f9fa;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  font-size: 14px;
  transition: border-color 0.3s;
}

.search-bar input:focus {
  outline: none;
  border-color: #667eea;
}

.loading {
  text-align: center;
  padding: 40px;
}

.spinner {
  width: 40px;
  height: 40px;
  margin: 0 auto 15px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.no-data {
  text-align: center;
  padding: 40px;
  color: #999;
}

.table-header,
.table-row {
  display: flex;
  justify-content: space-between;
  padding: 16px 0;
  border-bottom: 1px solid #e0e0e0;
  font-size: 14px;
  align-items: center;
}

.table-header {
  font-weight: 700;
  color: #667eea;
  border-bottom: 2px solid #667eea;
}

.table-row:hover {
  background: #f8f9fa;
}

.email {
  color: #666;
  font-size: 13px;
}

.total-results {
  margin-top: 15px;
  text-align: center;
  color: #999;
  font-size: 14px;
}

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
  padding: 40px;
  max-width: 600px;
  width: 100%;
  border-radius: 20px;
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

.success-modal {
  text-align: center;
}

.success-icon {
  font-size: 64px;
  margin-bottom: 20px;
}

.modal-content h2 {
  color: #28a745;
  margin-bottom: 30px;
}

.btn-close {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 40px;
  height: 40px;
  background: #e0e0e0;
  color: #666;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  font-size: 20px;
  transition: all 0.3s;
}

.btn-close:hover {
  background: #d0d0d0;
  transform: rotate(90deg);
}

.instructor-info {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 25px;
  text-align: left;
}

.info-item {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid #e0e0e0;
}

.info-item:last-child {
  border-bottom: none;
}

.label {
  font-weight: 600;
  color: #666;
}

.value {
  color: #333;
}

.modal-buttons {
  display: flex;
  justify-content: center;
}

.btn-primary-large {
  padding: 14px 40px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-primary-large:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

@media (max-width: 768px) {
  .card {
    padding: 20px;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .form-buttons {
    flex-direction: column;
  }

  .table-header,
  .table-row {
    font-size: 12px;
    padding: 12px 0;
  }
}
</style>