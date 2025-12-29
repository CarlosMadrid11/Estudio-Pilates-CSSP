<template> 
  <div>
    <div class="registro-view">
      <div class="login-container">
        <div class="form-box">
          <h2 class="title">Crear Cuenta</h2>
          
          <h3>Nombre Completo</h3>
          <input 
            v-model="nombreCompleto" 
            type="text" 
            class="input-field" 
            :class="{ 'error': errors.nombreCompleto }"
            placeholder="Ingresa tu nombre completo"
            @blur="validateField('nombreCompleto')"
            :disabled="isLoading"
          >
          <p v-if="errors.nombreCompleto" class="error-message">{{ errors.nombreCompleto }}</p>

          <h3>Teléfono</h3>
          <input 
            v-model="telefono" 
            type="tel" 
            class="input-field" 
            :class="{ 'error': errors.telefono }"
            placeholder="Ej: 6671234567"
            maxlength="15"
            @blur="validateField('telefono')"
            :disabled="isLoading"
          >
          <p v-if="errors.telefono" class="error-message">{{ errors.telefono }}</p>

          <h3>Correo Electrónico</h3>
          <input 
            v-model="email" 
            type="email" 
            class="input-field" 
            :class="{ 'error': errors.email }"
            placeholder="ejemplo@correo.com"
            @blur="validateField('email')"
            :disabled="isLoading"
          >
          <p v-if="errors.email" class="error-message">{{ errors.email }}</p>

          <h3>Contraseña</h3>
          <input 
            v-model="password" 
            type="password" 
            class="input-field" 
            :class="{ 'error': errors.password }"
            placeholder="Mínimo 8 caracteres"
            @blur="validateField('password')"
            :disabled="isLoading"
          >
          <p v-if="errors.password" class="error-message">{{ errors.password }}</p>
          
          <h3>Confirmar Contraseña</h3>
          <input 
            v-model="confirmPassword" 
            type="password" 
            class="input-field" 
            :class="{ 'error': errors.confirmPassword }"
            placeholder="Repite la contraseña"
            @blur="validateField('confirmPassword')"
            :disabled="isLoading"
          >
          <p v-if="errors.confirmPassword" class="error-message">{{ errors.confirmPassword }}</p>

          <!-- PANEL DE DEBUG -->
          <div v-if="debugLogs.length > 0" class="debug-panel">
            <h4>🔍 Debug Logs:</h4>
            <div class="debug-log" v-for="(log, index) in debugLogs" :key="index">
              <span :class="log.type">{{ log.message }}</span>
            </div>
          </div>

          <button 
            @click="registrarUsuario" 
            class="btn"
            :disabled="isLoading"
          >
            {{ isLoading ? 'Registrando...' : 'Registrarme' }}
          </button>

          <div class="link">
            ¿Ya tienes una cuenta? <router-link to="/login">Inicia sesión aquí</router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { z } from 'zod'
import { supabase } from '@/lib/supabase'

const router = useRouter()

// Debug logs
interface DebugLog {
  type: 'info' | 'success' | 'error' | 'warning'
  message: string
}
const debugLogs = ref<DebugLog[]>([])

const addLog = (type: DebugLog['type'], message: string) => {
  debugLogs.value.push({ type, message })
  console.log(`[${type.toUpperCase()}] ${message}`)
}

// Schema de validación
const registroSchema = z.object({
  nombreCompleto: z.string()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres')
    .regex(
      /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/, 
      'El nombre solo puede contener letras y espacios'
    ),
  
  telefono: z.string()
    .min(10, 'El teléfono debe tener al menos 10 dígitos')
    .max(15, 'El teléfono no puede exceder 15 dígitos')
    .regex(/^\d+$/, 'El teléfono solo debe contener números'),
  
  email: z.string()
    .min(5, 'El correo es demasiado corto')
    .email('Correo electrónico inválido')
    .transform((val) => val.trim().toLowerCase()),
  
  password: z.string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .regex(/[A-Z]/, 'Debe contener al menos una letra mayúscula')
    .regex(/[a-z]/, 'Debe contener al menos una letra minúscula')
    .regex(/[0-9]/, 'Debe contener al menos un número'),
  
  confirmPassword: z.string()
}).refine(
  (data) => data.password === data.confirmPassword, 
  {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword']
  }
)

// Estado del formulario
const nombreCompleto = ref('')
const telefono = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const isLoading = ref(false)

// Errores de validación
const errors = reactive({
  nombreCompleto: '',
  telefono: '',
  email: '',
  password: '',
  confirmPassword: ''
})

// Validar campo
const validateField = (field: string) => {
  const data = {
    nombreCompleto: nombreCompleto.value.trim(),
    telefono: telefono.value.trim(),
    email: email.value.trim(),
    password: password.value,
    confirmPassword: confirmPassword.value
  }

  try {
    registroSchema.parse(data)
    errors[field as keyof typeof errors] = ''
  } catch (e) {
    if (e && typeof e === 'object' && 'errors' in e) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const zodErrors = (e as any).errors
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const fieldError = zodErrors.find((err: any) => err.path[0] === field)
      if (fieldError) {
        errors[field as keyof typeof errors] = fieldError.message
      } else {
        errors[field as keyof typeof errors] = ''
      }
    }
  }
}

// Limpiar errores
const clearErrors = () => {
  Object.keys(errors).forEach(key => {
    errors[key as keyof typeof errors] = ''
  })
}

// REGISTRO CON DEBUG EXTREMO
const registrarUsuario = async () => {
  clearErrors()
  debugLogs.value = []
  
  addLog('info', '🚀 Iniciando proceso de registro...')
  
  const formData = {
    nombreCompleto: nombreCompleto.value.trim(),
    telefono: telefono.value.trim(),
    email: email.value.trim(),
    password: password.value,
    confirmPassword: confirmPassword.value
  }

  addLog('info', `📧 Email: ${formData.email}`)
  addLog('info', `👤 Nombre: ${formData.nombreCompleto}`)

  // Validar
  const validationResult = registroSchema.safeParse(formData)
  
  if (!validationResult.success) {
    addLog('error', '❌ Validación falló')
    const zodErrors = validationResult.error.issues
    zodErrors.forEach((err) => {
      const field = err.path[0] as keyof typeof errors
      if (field in errors) {
        errors[field] = err.message
        addLog('error', `❌ ${field}: ${err.message}`)
      }
    })
    alert('Por favor corrige los errores en el formulario')
    return
  }

  addLog('success', '✅ Validación correcta')

  const validatedData = validationResult.data
  isLoading.value = true

  try {
    // ============================================
    // PASO 1: Crear usuario en Supabase Auth
    // ============================================
    addLog('info', '📝 Paso 1: Creando usuario en auth.users...')
    
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: validatedData.email,
      password: validatedData.password,
      options: {
        data: {
          nombre_completo: validatedData.nombreCompleto,
          telefono: validatedData.telefono,
          rol: 'cliente'
        }
      }
    })

    addLog('info', `🔍 Auth Data: ${JSON.stringify(authData, null, 2)}`)
    addLog('info', `🔍 Auth Error: ${JSON.stringify(authError, null, 2)}`)

    if (authError) {
      addLog('error', `❌ Error en auth: ${authError.message}`)
      throw new Error(authError.message)
    }

    if (!authData.user) {
      addLog('error', '❌ No se recibió usuario de auth')
      throw new Error('No se pudo crear el usuario en auth.users')
    }

    const userId = authData.user.id
    addLog('success', `✅ Usuario creado con ID: ${userId}`)

    // ============================================
    // PASO 2: Verificar/Crear profile
    // ============================================
    addLog('info', '📝 Paso 2: Verificando profile...')
    
    // Esperar un poco por el trigger
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    const { data: existingProfile, error: checkProfileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle()

    addLog('info', `🔍 Profile existente: ${JSON.stringify(existingProfile, null, 2)}`)
    addLog('info', `🔍 Error al verificar: ${JSON.stringify(checkProfileError, null, 2)}`)

    if (existingProfile) {
      addLog('success', '✅ Profile ya existe (trigger funcionó)')
    } else {
      addLog('warning', '⚠️ Profile no existe, creándolo manualmente...')
      
      const { data: newProfile, error: createProfileError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          nombre_completo: validatedData.nombreCompleto,
          telefono: validatedData.telefono,
          rol: 'cliente'
        })
        .select()
        .single()

      addLog('info', `🔍 Nuevo profile: ${JSON.stringify(newProfile, null, 2)}`)
      addLog('info', `🔍 Error al crear: ${JSON.stringify(createProfileError, null, 2)}`)

      if (createProfileError) {
        addLog('error', `❌ Error al crear profile: ${createProfileError.message}`)
        throw new Error(`Error al crear profile: ${createProfileError.message}`)
      }

      addLog('success', '✅ Profile creado manualmente')
    }

    // ============================================
    // PASO 3: Crear cliente
    // ============================================
    addLog('info', '📝 Paso 3: Creando registro en clientes...')
    addLog('info', `🔍 Usando profile_id: ${userId}`)
    
    // Verificar sesión actual
    const { data: { session } } = await supabase.auth.getSession()
    addLog('info', `🔍 Sesión actual: ${session ? 'Existe' : 'No existe'}`)
    if (session) {
      addLog('info', `🔍 Session user ID: ${session.user.id}`)
      addLog('info', `🔍 ¿Session user = profile_id?: ${session.user.id === userId}`)
    }
    
    const { data: clienteData, error: clienteError } = await supabase
      .from('clientes')
      .insert({
        profile_id: userId,
        direccion: null
      })
      .select()
      .single()

    addLog('info', `🔍 Cliente Data: ${JSON.stringify(clienteData, null, 2)}`)
    addLog('info', `🔍 Cliente Error: ${JSON.stringify(clienteError, null, 2)}`)

    if (clienteError) {
      addLog('error', `❌ ERROR AL CREAR CLIENTE: ${clienteError.message}`)
      addLog('error', `❌ Code: ${clienteError.code}`)
      addLog('error', `❌ Details: ${clienteError.details}`)
      addLog('error', `❌ Hint: ${clienteError.hint}`)
      
      // No hacer throw, mostrar el error pero continuar
      alert(`⚠️ Usuario creado pero con problema en cliente:\n${clienteError.message}\n\nPuedes iniciar sesión de todos modos.`)
      router.push('/login')
      return
    }

    if (!clienteData) {
      addLog('error', '❌ No se devolvió data del cliente')
      alert('⚠️ Usuario creado pero sin confirmar cliente. Intenta iniciar sesión.')
      router.push('/login')
      return
    }

    addLog('success', `✅ Cliente creado con ID: ${clienteData.id}`)

    // ============================================
    // PASO 4: ÉXITO TOTAL
    // ============================================
    addLog('success', '✅✅✅ REGISTRO COMPLETO')
    alert(`¡Registro exitoso! Bienvenido ${validatedData.nombreCompleto}. Ahora puedes iniciar sesión.`)
    
    // Limpiar formulario
    nombreCompleto.value = ''
    telefono.value = ''
    email.value = ''
    password.value = ''
    confirmPassword.value = ''
    
    // Redirigir
    router.push('/login')

  } catch (error: unknown) {
    addLog('error', `❌❌❌ ERROR GENERAL: ${error}`)
    
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
    
    if (errorMessage.includes('already registered') || errorMessage.includes('User already registered')) {
      errors.email = 'Este correo ya está registrado'
      alert('Este correo ya está registrado. Intenta iniciar sesión.')
    } else if (errorMessage.includes('duplicate key') || errorMessage.includes('unique')) {
      errors.email = 'Este correo ya existe'
      alert('Este correo ya está registrado.')
    } else {
      alert(`Error al registrar: ${errorMessage}`)
    }
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.registro-view {
  margin: 0;
  padding: 0;
  font-family: Arial, Helvetica, sans-serif;
  background: #eeefb6;
  min-height: 100vh;
}

.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 20px;
}

.form-box {
  width: 450px;
  padding: 40px 40px 60px 40px;
  background: #3d3d3d;
  border: 2px solid #000;
  box-sizing: border-box;
  color: white;
  border-radius: 8px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.title {
  text-align: center;
  margin-bottom: 30px;
  font-size: 24px;
  font-weight: 600;
  color: white;
}

h3 {
  font-weight: normal;
  margin-bottom: 8px;
  font-size: 16px;
}

.input-field {
  width: 100%;
  padding: 12px;
  background: #353535;
  border: 2px solid transparent;
  color: white;
  margin-bottom: 5px;
  font-size: 14px;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.input-field.error {
  border-color: #ff4444;
  background: #4a2c2c;
}

.input-field::placeholder {
  color: #999;
}

.input-field:focus {
  outline: none;
  background: #404040;
  border-color: #49a7ff;
}

.input-field:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-message {
  color: #ff6b6b;
  font-size: 12px;
  margin: 0 0 15px 5px;
  min-height: 18px;
}

.debug-panel {
  background: #1a1a1a;
  border: 2px solid #49a7ff;
  border-radius: 4px;
  padding: 15px;
  margin: 20px 0;
  max-height: 300px;
  overflow-y: auto;
}

.debug-panel h4 {
  margin: 0 0 10px 0;
  color: #49a7ff;
  font-size: 14px;
}

.debug-log {
  font-size: 11px;
  margin-bottom: 5px;
  font-family: monospace;
}

.debug-log .info {
  color: #66b3ff;
}

.debug-log .success {
  color: #4caf50;
}

.debug-log .error {
  color: #ff6b6b;
  font-weight: bold;
}

.debug-log .warning {
  color: #ffa726;
}

.btn {
  width: 60%;
  display: block;
  margin: 20px auto;
  padding: 15px 0;
  text-align: center;
  background: white;
  color: black;
  border: none;
  cursor: pointer;
  font-size: 17px;
  font-weight: 600;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.btn:hover:not(:disabled) {
  background: #f0f0f0;
  transform: scale(1.02);
}

.btn:active:not(:disabled) {
  transform: scale(0.98);
}

.btn:disabled {
  background: #cccccc;
  cursor: not-allowed;
  opacity: 0.6;
}

.link {
  text-align: center;
  margin-top: 20px;
  font-size: 14px;
  color: #ccc;
}

.link a {
  color: #49a7ff;
  text-decoration: none;
  font-weight: 500;
}

.link a:hover {
  text-decoration: underline;
}

@media (max-width: 500px) {
  .form-box {
    width: 100%;
    max-width: 450px;
    padding: 30px 20px 40px 20px;
  }
  
  .btn {
    width: 80%;
  }
}
</style>