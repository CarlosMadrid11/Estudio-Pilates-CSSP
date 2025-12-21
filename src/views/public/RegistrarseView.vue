<template>
  <div>
    <NavBarView />

    <div class="registro-view">
      <div class="login-container">
        <div class="form-box">
          
          <h3>Nombre Completo</h3>
          <input 
            v-model="nombreCompleto" 
            type="text" 
            class="input-field" 
            :class="{ 'error': errors.nombreCompleto }"
            placeholder="Ingresa tu nombre completo"
            @blur="validateField('nombreCompleto')"
          >
          <p v-if="errors.nombreCompleto" class="error-message">{{ errors.nombreCompleto }}</p>

          <h3>Teléfono</h3>
          <input 
            v-model="telefono" 
            type="tel" 
            class="input-field" 
            :class="{ 'error': errors.telefono }"
            placeholder="Ej: 6671234567"
            @blur="validateField('telefono')"
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
          >
          <p v-if="errors.email" class="error-message">{{ errors.email }}</p>

          <h3>Usuario</h3>
          <input 
            v-model="usuario" 
            type="text" 
            class="input-field" 
            :class="{ 'error': errors.usuario }"
            placeholder="Elige un nombre de usuario"
            @blur="validateField('usuario')"
          >
          <p v-if="errors.usuario" class="error-message">{{ errors.usuario }}</p>

          <h3>Contraseña</h3>
          <input 
            v-model="password" 
            type="password" 
            class="input-field" 
            :class="{ 'error': errors.password }"
            placeholder="Mínimo 8 caracteres"
            @blur="validateField('password')"
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
          >
          <p v-if="errors.confirmPassword" class="error-message">{{ errors.confirmPassword }}</p>

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
import NavBarView from '@/ComponentesReutilizables/NavBarView.vue'
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { z } from 'zod'
import { supabase } from '@/lib/supabaseClient' // Asegúrate de tener tu cliente de Supabase configurado

const router = useRouter()

// Schema de validación con Zod
const registroSchema = z.object({
  nombreCompleto: z.string()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El nombre solo puede contener letras y espacios'),
  
  telefono: z.string()
    .min(10, 'El teléfono debe tener 10 dígitos')
    .max(10, 'El teléfono debe tener 10 dígitos')
    .regex(/^\d+$/, 'El teléfono solo debe contener números'),
  
  email: z.string()
    .email('Correo electrónico inválido')
    .min(5, 'El correo es demasiado corto')
    .max(100, 'El correo es demasiado largo'),
  
  usuario: z.string()
    .min(4, 'El usuario debe tener al menos 4 caracteres')
    .max(30, 'El usuario no puede exceder 30 caracteres')
    .regex(/^[a-zA-Z0-9_]+$/, 'El usuario solo puede contener letras, números y guiones bajos'),
  
  password: z.string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .max(100, 'La contraseña es demasiado larga')
    .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
    .regex(/[a-z]/, 'Debe contener al menos una minúscula')
    .regex(/[0-9]/, 'Debe contener al menos un número'),
  
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword']
})

// Estado del formulario
const nombreCompleto = ref('')
const telefono = ref('')
const email = ref('')
const usuario = ref('')
const password = ref('')
const confirmPassword = ref('')
const isLoading = ref(false)

// Errores de validación
const errors = reactive({
  nombreCompleto: '',
  telefono: '',
  email: '',
  usuario: '',
  password: '',
  confirmPassword: ''
})

// Función para validar un campo específico
const validateField = (field: string) => {
  const data = {
    nombreCompleto: nombreCompleto.value,
    telefono: telefono.value,
    email: email.value,
    usuario: usuario.value,
    password: password.value,
    confirmPassword: confirmPassword.value
  }

  try {
    registroSchema.parse(data)
    errors[field as keyof typeof errors] = ''
  } catch (error) {
    if (error instanceof z.ZodError) {
      const fieldError = error.errors.find(err => err.path[0] === field)
      if (fieldError) {
        errors[field as keyof typeof errors] = fieldError.message
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

// Lógica para registrar usuario
const registrarUsuario = async () => {
  clearErrors()
  
  const formData = {
    nombreCompleto: nombreCompleto.value,
    telefono: telefono.value,
    email: email.value,
    usuario: usuario.value,
    password: password.value,
    confirmPassword: confirmPassword.value
  }

  // Validar todos los campos con Zod
  try {
    registroSchema.parse(formData)
  } catch (error) {
    if (error instanceof z.ZodError) {
      error.errors.forEach(err => {
        const field = err.path[0] as keyof typeof errors
        errors[field] = err.message
      })
      alert('Por favor corrige los errores en el formulario')
      return
    }
  }

  isLoading.value = true

  try {
    // 1. Crear usuario en Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email.value,
      password: password.value
    })

    if (authError) {
      throw new Error(authError.message)
    }

    // 2. Insertar datos del cliente en la tabla 'cliente'
    const { error: insertError } = await supabase
      .from('cliente')
      .insert([
        {
          nombre_completo: nombreCompleto.value,
          telefono: telefono.value,
          correo: email.value,
          contraseña: password.value, // NOTA: Considera NO guardar la contraseña aquí si usas Supabase Auth
          user_id: authData.user?.id // Relacionar con el usuario de Auth
        }
      ])

    if (insertError) {
      throw new Error(insertError.message)
    }

    alert(`¡Registro exitoso! Hemos enviado un correo de verificación a ${email.value}`)
    router.push('/login')

  } catch (error: any) {
    console.error('Error en el registro:', error)
    
    if (error.message.includes('already registered')) {
      errors.email = 'Este correo ya está registrado'
    } else {
      alert(`Error al registrar: ${error.message}`)
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

.error-message {
  color: #ff6b6b;
  font-size: 12px;
  margin: 0 0 15px 5px;
  min-height: 18px;
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