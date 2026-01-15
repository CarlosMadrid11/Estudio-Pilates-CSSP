<template>
  <div>
    <div class="login-view">
      <!-- Contenedor del formulario de login -->
      <div class="login-container">
        <div class="form-box">
          <h2 class="title">Iniciar Sesión</h2>
          
          <!-- Mensaje de error general -->
          <div v-if="errorMessage" class="error-banner">
            {{ errorMessage }}
          </div>

          <h3>Correo Electrónico</h3>
          <input 
            v-model="email" 
            type="email" 
            class="input-field"
            :class="{ 'error': hasError }"
            placeholder="ejemplo@correo.com"
            @keyup.enter="iniciarSesion"
            :disabled="isLoading"
          >
          
          <h3>Contraseña</h3>
          <input 
            v-model="password" 
            type="password" 
            class="input-field"
            :class="{ 'error': hasError }"
            placeholder="Introduce tu contraseña"
            @keyup.enter="iniciarSesion"
            :disabled="isLoading"
          >
          
          <button 
            @click="iniciarSesion" 
            class="btn"
            :disabled="isLoading || !isFormValid"
          >
            {{ isLoading ? 'Iniciando...' : 'Iniciar sesión' }}
          </button>
          
          <div class="link">
            ¿No tienes una cuenta? <router-link to="/registrarse">Regístrate aquí</router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { supabase } from '@/lib/supabase'
import type { UserRole } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

// Estado para el formulario
const email = ref('')
const password = ref('')
const errorMessage = ref('')
const hasError = ref(false)
const isLoading = ref(false)

// Validación del formato de email
const isEmailValid = computed(() => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email.value.trim())
})

// Validación completa del formulario (CA05)
const isFormValid = computed(() => {
  return email.value.trim() !== '' && 
         password.value.trim() !== '' && 
         isEmailValid.value
})

const iniciarSesion = async () => {
  // Verificar validación antes de proceder
  if (!isFormValid.value) {
    return
  }

  // Limpiar errores previos
  errorMessage.value = ''
  hasError.value = false

  isLoading.value = true

  try {
    // PASO 1: Autenticar con Supabase
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: email.value.trim(),
      password: password.value
    })

    if (authError) {
      throw new Error(authError.message)
    }

    if (!authData.user) {
      throw new Error('No se pudo iniciar sesión')
    }

    // PASO 2: Obtener el perfil del usuario (para saber su rol)
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('nombre_completo, telefono, rol')
      .eq('id', authData.user.id)
      .single()

    if (profileError || !profileData) {
      throw new Error('No se pudo obtener la información del perfil')
    }

    // PASO 3: Guardar en el auth store
    authStore.setUser({
      id: authData.user.id,
      email: authData.user.email || '',
      nombre: profileData.nombre_completo,
      telefono: profileData.telefono,
      role: profileData.rol as UserRole
    })

    console.log(`✅ Login exitoso como ${profileData.rol}`)

    // PASO 4: Redirigir según el rol
    const redirectMap = {
      cliente: '/dashboard-cliente',
      instructor: '/calendario-instructor',
      admin: '/gestion-clientes',
      guest: '/'
    }

    const redirectTo = redirectMap[profileData.rol as UserRole]
    router.push(redirectTo)

  } catch (error: unknown) {
    console.error('Error en login:', error)
    
    const errorMsg = error instanceof Error ? error.message : 'Error desconocido'
    
    // Manejar errores específicos de Supabase
    if (errorMsg.includes('Invalid login credentials')) {
      errorMessage.value = 'Correo o contraseña incorrectos'
    } else if (errorMsg.includes('Email not confirmed')) {
      errorMessage.value = 'Por favor confirma tu correo electrónico'
    } else if (errorMsg.includes('perfil')) {
      errorMessage.value = 'Tu cuenta no está configurada correctamente. Contacta soporte.'
    } else {
      errorMessage.value = 'Error al iniciar sesión. Intenta de nuevo.'
    }
    
    hasError.value = true
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.login-view {
  margin: 0;
  padding: 0;
  font-family: Arial, Helvetica, sans-serif;
  background: #eeefb6;
  min-height: 100vh;
}

/* Contenedor principal del login */
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

/* Banner de error */
.error-banner {
  background: #ff4444;
  color: white;
  padding: 12px;
  border-radius: 4px;
  margin-bottom: 20px;
  font-size: 14px;
  text-align: center;
  animation: shake 0.3s;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

h3 {
  font-weight: normal;
  margin-bottom: 8px;
  font-size: 16px;
}

/* Inputs */
.input-field {
  width: 100%;
  padding: 12px;
  background: #353535;
  border: 2px solid transparent;
  color: white;
  margin-bottom: 25px;
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

/* Botón */
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

/* Responsive */
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