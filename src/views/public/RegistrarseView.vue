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

          <!-- PANEL DE DEBUG (Temporal) -->
          <div v-if="debugInfo" class="debug-panel">
            <h4>🔍 Debug Info:</h4>
            <pre>{{ debugInfo }}</pre>
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

// DEBUG temporal
const debugInfo = ref<string>('')

// Schema de validación con Zod
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

// Función para validar un campo específico
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

// Función para limpiar errores
const clearErrors = () => {
  Object.keys(errors).forEach(key => {
    errors[key as keyof typeof errors] = ''
  })
}

// Lógica para registrar usuario con Supabase
const registrarUsuario = async () => {
  clearErrors()
  debugInfo.value = ''
  
  const formData = {
    nombreCompleto: nombreCompleto.value.trim(),
    telefono: telefono.value.trim(),
    email: email.value.trim(),
    password: password.value,
    confirmPassword: confirmPassword.value
  }

  // Validar todos los campos con Zod usando safeParse
  const validationResult = registroSchema.safeParse(formData)
  
  if (!validationResult.success) {
    const zodErrors = validationResult.error.issues
    zodErrors.forEach((err) => {
      const field = err.path[0] as keyof typeof errors
      if (field in errors) {
        errors[field] = err.message
      }
    })
    alert('Por favor corrige los errores en el formulario')
    return
  }

  const validatedData = validationResult.data
  isLoading.value = true

  try {
    console.log('🚀 Iniciando registro...')
    
    // PASO 1: Crear usuario en Supabase Auth
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

    console.log('✅ Auth Data:', authData)
    console.log('❌ Auth Error:', authError)

    if (authError) {
      throw new Error(authError.message)
    }

    if (!authData.user) {
      throw new Error('No se pudo crear el usuario en auth.users')
    }

    console.log('✅ Usuario creado en auth.users con ID:', authData.user.id)

    // ESPERAR un momento para que el trigger cree el profile
    await new Promise(resolve => setTimeout(resolve, 1000))

    // PASO 2: Verificar que se creó el profile
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single()

    console.log('✅ Profile Data:', profileData)
    console.log('❌ Profile Error:', profileError)

    if (profileError || !profileData) {
      throw new Error('El profile no se creó automáticamente. Verifica el trigger.')
    }

    console.log('✅ Profile verificado correctamente')

    // PASO 3: Crear registro en tabla clientes
    // IMPORTANTE: Usamos el ID del profile, no del auth.user
    const { data: clienteData, error: clienteError } = await supabase
      .from('clientes')
      .insert({
        profile_id: profileData.id,
        direccion: null
      })
      .select()
      .single()

    console.log('✅ Cliente Data:', clienteData)
    console.log('❌ Cliente Error:', clienteError)

    if (clienteError) {
      console.error('❌ Error al crear cliente:', clienteError)
      // Mostrar error específico
      debugInfo.value = `Error en clientes: ${JSON.stringify(clienteError, null, 2)}`
      throw new Error(`No se pudo crear el registro de cliente: ${clienteError.message}`)
    }

    if (!clienteData) {
      throw new Error('No se devolvió data del cliente creado')
    }

    console.log('✅ Cliente creado exitosamente con ID:', clienteData.id)

    // PASO 4: Éxito total
    alert(`¡Registro exitoso! Bienvenido ${validatedData.nombreCompleto}. Ahora puedes iniciar sesión.`)
    router.push('/login')

  } catch (error: unknown) {
    console.error('❌ Error en el registro:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
    
    if (errorMessage.includes('already registered') || errorMessage.includes('User already registered')) {
      errors.email = 'Este correo ya está registrado'
      alert('Este correo ya está registrado. Intenta iniciar sesión.')
    } else if (errorMessage.includes('email')) {
      errors.email = 'Error con el correo electrónico'
      alert(`Error: ${errorMessage}`)
    } else {
      alert(`Error al registrar: ${errorMessage}`)
      debugInfo.value = errorMessage
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
  width: 400px;
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

/* DEBUG PANEL */
.debug-panel {
  background: #1a1a1a;
  border: 2px solid #ff6b6b;
  border-radius: 4px;
  padding: 15px;
  margin: 20px 0;
  max-height: 200px;
  overflow-y: auto;
}

.debug-panel h4 {
  margin: 0 0 10px 0;
  color: #ff6b6b;
  font-size: 14px;
}

.debug-panel pre {
  margin: 0;
  font-size: 11px;
  color: #fff;
  white-space: pre-wrap;
  word-wrap: break-word;
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
    max-width: 400px;
    padding: 30px 20px 40px 20px;
  }
  
  .btn {
    width: 80%;
  }
}
</style>