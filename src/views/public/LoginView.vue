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

          <h3>Usuario</h3>
          <input 
            v-model="usuario" 
            type="text" 
            class="input-field"
            :class="{ 'error': hasError }"
            placeholder="Introduce tu usuario"
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
            :disabled="isLoading"
          >
            {{ isLoading ? 'Iniciando...' : 'Iniciar sesión' }}
          </button>
          
          <div class="link">
            ¿No tienes una cuenta? <router-link to="/registrarse">Regístrate aquí</router-link>
          </div>

          <!-- Usuarios de prueba (temporal para desarrollo) -->
          <div class="dev-info">
            <details>
              <summary>👨‍💻 Usuarios de prueba</summary>
              <div class="test-users">
                <p><strong>Cliente:</strong> cliente / cliente123</p>
                <p><strong>Instructor:</strong> instructor / instructor123</p>
                <p><strong>Admin:</strong> admin / admin123</p>
              </div>
            </details>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import type { UserRole } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

// Estado para el formulario
const usuario = ref('')
const password = ref('')
const errorMessage = ref('')
const hasError = ref(false)
const isLoading = ref(false)

// Usuarios mock para desarrollo
const mockUsers = {
  'cliente': {
    password: 'cliente123',
    role: 'cliente' as UserRole,
    redirectTo: '/dashboard-cliente'
  },
  'instructor': {
    password: 'instructor123',
    role: 'instructor' as UserRole,
    redirectTo: '/calendario-instructor'
  },
  'admin': {
    password: 'admin123',
    role: 'admin' as UserRole,
    redirectTo: '/gestion-clientes'
  }
}

const iniciarSesion = async () => {
  // Limpiar errores previos
  errorMessage.value = ''
  hasError.value = false

  // Validar campos vacíos
  if (!usuario.value.trim() || !password.value.trim()) {
    errorMessage.value = 'Por favor completa todos los campos'
    hasError.value = true
    return
  }

  isLoading.value = true

  // Simular delay de red (opcional, para hacer más realista)
  await new Promise(resolve => setTimeout(resolve, 500))

  try {
    const userLower = usuario.value.toLowerCase().trim()
    const mockUser = mockUsers[userLower as keyof typeof mockUsers]

    // Verificar si el usuario existe
    if (!mockUser) {
      errorMessage.value = 'Usuario no encontrado'
      hasError.value = true
      return
    }

    // Verificar contraseña
    if (mockUser.password !== password.value) {
      errorMessage.value = 'Contraseña incorrecta'
      hasError.value = true
      return
    }

    // Login exitoso
    authStore.loginMock(mockUser.role)
    
    console.log(`✅ Login exitoso como ${mockUser.role}`)

    // Redirigir según el rol
    router.push(mockUser.redirectTo)

  } catch (error) {
    console.error('Error en login:', error)
    errorMessage.value = 'Error al iniciar sesión. Intenta de nuevo.'
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

/* Info de desarrollo */
.dev-info {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #555;
}

.dev-info details {
  cursor: pointer;
}

.dev-info summary {
  color: #49a7ff;
  font-size: 13px;
  user-select: none;
  padding: 8px;
  border-radius: 4px;
  transition: background 0.2s;
}

.dev-info summary:hover {
  background: rgba(73, 167, 255, 0.1);
}

.test-users {
  margin-top: 12px;
  padding: 12px;
  background: #2a2a2a;
  border-radius: 4px;
  font-size: 12px;
  line-height: 1.8;
}

.test-users p {
  margin: 4px 0;
  color: #ccc;
}

.test-users strong {
  color: #49a7ff;
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