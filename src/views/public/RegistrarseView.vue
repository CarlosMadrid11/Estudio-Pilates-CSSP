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
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

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

// ============================================
// REGISTRO COMPLETO - VERSIÓN FINAL
// ============================================
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

  // Validar formulario
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
        },
        emailRedirectTo: undefined
      }
    })

    addLog('info', `🔍 Auth Error: ${authError ? authError.message : 'ninguno'}`)

    if (authError) {
      if (authError.message.includes('signup_disabled') || authError.message.includes('Signups not allowed')) {
        addLog('error', '❌ Los registros están desactivados en Supabase')
        throw new Error('Los registros públicos están temporalmente desactivados. Por favor contacta al administrador.')
      }
      throw new Error(authError.message)
    }

    if (!authData.user) {
      addLog('error', '❌ No se recibió usuario de auth')
      throw new Error('No se pudo crear el usuario en el sistema')
    }

    const userId = authData.user.id
    addLog('success', `✅ Usuario creado en auth.users con ID: ${userId}`)

    // ============================================
    // PASO 1.5: Login automático
    // ============================================
    addLog('info', '🔐 Paso 1.5: Iniciando sesión automática...')
    
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: validatedData.email,
      password: validatedData.password
    })

    if (loginError) {
      addLog('warning', `⚠️ Login automático falló: ${loginError.message}`)
      addLog('info', 'Continuando sin sesión activa...')
    } else {
      addLog('success', '✅ Sesión iniciada automáticamente')
      addLog('info', `🔍 Session user ID: ${loginData.session?.user?.id}`)
    }

    // ============================================
    // PASO 2: Esperar y verificar profile
    // ============================================
    addLog('info', '📝 Paso 2: Esperando creación de profile (2 segundos)...')
    
    // Esperar para que el trigger o sistema cree el profile
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle()

    addLog('info', `🔍 Profile encontrado: ${profileData ? 'SÍ' : 'NO'}`)

    if (!profileData) {
      addLog('warning', '⚠️ Profile no existe, creándolo manualmente...')
      
      const { error: createProfileError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          nombre_completo: validatedData.nombreCompleto,
          telefono: validatedData.telefono,
          rol: 'cliente'
        })
        .select()
        .single()

      if (createProfileError) {
        addLog('error', `❌ Error al crear profile: ${createProfileError.message}`)
        throw new Error(`Error al crear profile: ${createProfileError.message}`)
      }

      addLog('success', '✅ Profile creado manualmente')
      addLog('info', 'Esperando 1 segundo adicional...')
      await new Promise(resolve => setTimeout(resolve, 1000))
    } else {
      addLog('success', '✅ Profile existe (creado automáticamente)')
    }

    // ============================================
    // PASO 3: Verificar/Crear cliente
    // ============================================
    addLog('info', '📝 Paso 3: Verificando registro en tabla clientes...')
    
    // Primero verificar si ya existe (por si el trigger funcionó)
    const { data: existingCliente, error: checkError } = await supabase
      .from('clientes')
      .select('id')
      .eq('profile_id', userId)
      .maybeSingle()

    addLog('info', `🔍 Cliente existente: ${existingCliente ? 'SÍ (ID: ' + existingCliente.id + ')' : 'NO'}`)
    addLog('info', `🔍 Error al verificar: ${checkError ? checkError.message : 'ninguno'}`)

    if (existingCliente) {
      addLog('success', '✅ Cliente ya existe (el trigger automático funcionó)')
    } else {
      addLog('info', '⚡ Cliente no existe, creándolo manualmente...')
      
      const { data: clienteData, error: clienteError } = await supabase
        .from('clientes')
        .insert({
          profile_id: userId,
          direccion: null
        })
        .select()
        .single()

      addLog('info', `🔍 Cliente creado: ${clienteData ? 'SÍ' : 'NO'}`)
      addLog('info', `🔍 Error al crear: ${clienteError ? clienteError.message : 'ninguno'}`)

      if (clienteError) {
        addLog('error', `❌ Error al crear cliente: ${clienteError.message}`)
        addLog('error', `Code: ${clienteError.code || 'N/A'}`)
        addLog('error', `Details: ${clienteError.details || 'N/A'}`)
        
        // Última verificación por si el trigger lo creó mientras tanto
        addLog('info', '🔄 Verificando una vez más si el cliente existe...')
        const { data: retryCliente } = await supabase
          .from('clientes')
          .select('id')
          .eq('profile_id', userId)
          .maybeSingle()
        
        if (retryCliente) {
          addLog('success', '✅ Cliente existe (creado por trigger en segundo intento)')
        } else {
          // Error real - no se pudo crear
          throw new Error(`No se pudo crear el registro de cliente: ${clienteError.message}`)
        }
      } else {
        addLog('success', `✅ Cliente creado manualmente con ID: ${clienteData.id}`)
      }
    }

    // ============================================
    // PASO 4: Sincronizar Auth Store - faltaba restaurar la sesion, al momento de registrarse todavia lo detectaba como no autenticado
    // ahora si lo autentica e inicia sesion automaticamente
    // ============================================
    addLog('info', '🔄 Paso 4: Sincronizando sesión con Auth Store...')
    
    // Restaurar sesión en el store (esto actualiza isAuthenticated)
    const sessionRestored = await authStore.restoreSession()
    
    if (sessionRestored) {
      addLog('success', '✅ Auth Store sincronizado')
      addLog('info', `🔍 Usuario autenticado: ${authStore.isAuthenticated}`)
      addLog('info', `🔍 Rol: ${authStore.role}`)
    } else {
      addLog('warning', '⚠️ No se pudo sincronizar el store, intentando login manual...')
      
      // Fallback: usar el método login del store
      const loginResult = await authStore.login(validatedData.email, validatedData.password)
      
      if (loginResult.success) {
        addLog('success', '✅ Login manual exitoso')
      } else {
        addLog('error', '❌ Login manual falló, pero el usuario está creado')
      }
    }

    // ============================================
    // PASO 5: ÉXITO TOTAL
    // ============================================
    addLog('success', '✅✅✅ REGISTRO COMPLETO Y EXITOSO')
    
    alert(`¡Bienvenido ${validatedData.nombreCompleto}!\n\n✅ Tu cuenta ha sido creada exitosamente.\n✅ Serás redirigido a tu dashboard.`)
    
    // Limpiar formulario
    nombreCompleto.value = ''
    telefono.value = ''
    email.value = ''
    password.value = ''
    confirmPassword.value = ''
    
    // Pequeña pausa antes de redirigir - espera 500ms y luego redirige
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Redirigir al dashboard (ahora sí está autenticado en el store)
    router.push('/dashboard-cliente')

  } catch (error: unknown) {
    addLog('error', `❌❌❌ ERROR GENERAL: ${error}`)
    
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
    
    // Manejo específico de errores
    if (errorMessage.includes('already registered') || errorMessage.includes('User already registered')) {
      errors.email = 'Este correo ya está registrado'
      alert('❌ Este correo ya está registrado.\n\n💡 Intenta iniciar sesión en su lugar.')
    } else if (errorMessage.includes('duplicate key') || errorMessage.includes('unique')) {
      errors.email = 'Este correo ya existe en el sistema'
      alert('❌ Ya existe una cuenta con este correo electrónico.')
    } else if (errorMessage.includes('signup_disabled') || errorMessage.includes('Signups not allowed')) {
      alert('⚠️ Los registros públicos están temporalmente desactivados.\n\nPor favor contacta al administrador del sistema.')
    } else {
      alert(`❌ Error al registrar:\n\n${errorMessage}\n\n💡 Por favor intenta nuevamente o contacta soporte.`)
    }
    
    // Limpiar cualquier sesión parcial
    try {
      await supabase.auth.signOut()
      addLog('info', '🧹 Sesión parcial limpiada')
    } catch {
      addLog('warning', '⚠️ No se pudo limpiar sesión')
    }
    
  } finally {
    isLoading.value = false
    addLog('info', '🏁 Proceso de registro finalizado')
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
  line-height: 1.4;
}

.debug-log .info {
  color: #66b3ff;
}

.debug-log .success {
  color: #4caf50;
  font-weight: 500;
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
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
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
  transition: color 0.2s;
}

.link a:hover {
  text-decoration: underline;
  color: #66b3ff;
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