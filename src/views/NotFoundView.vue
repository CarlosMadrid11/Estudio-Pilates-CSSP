<template>
  <div class="not-found-container">
    <div class="content">
      <!-- Animación de error -->
      <div class="error-animation">
        <div class="error-number">404</div>
        <div class="error-emoji">😕</div>
      </div>

      <!-- Mensaje -->
      <h1 class="error-title">Página no encontrada</h1>
      <p class="error-description">
        Lo sentimos, la página que buscas no existe o fue movida.
      </p>

      <!-- Botones de acción -->
      <div class="actions">
        <button @click="goBack" class="btn-secondary">
          ← Volver atrás
        </button>
        <button @click="goHome" class="btn-primary">
          🏠 Ir al inicio
        </button>
        <button 
          v-if="authStore.isAuthenticated"
          @click="goDashboard"
          class="btn-accent"
        >
          📊 Mi Dashboard
        </button>
      </div>

      <!-- Sugerencias según rol -->
      <div class="suggestions" v-if="hasSuggestions">
        <h3>¿Buscabas algo de esto?</h3>
        <div class="suggestion-links">
          <!-- Links para guest -->
          <router-link v-if="!authStore.isAuthenticated" to="/planes" class="suggestion-link">
            💳 Ver Planes
          </router-link>
          <router-link v-if="!authStore.isAuthenticated" to="/login" class="suggestion-link">
            🔐 Iniciar Sesión
          </router-link>

          <!-- Links para cliente -->
          <router-link v-if="authStore.isCliente" to="/calendario-cliente" class="suggestion-link">
            📅 Reservar Clase
          </router-link>
          <router-link v-if="authStore.isCliente" to="/mis-reservas" class="suggestion-link">
            📋 Mis Reservas
          </router-link>

          <!-- Links para instructor -->
          <router-link v-if="authStore.isInstructor" to="/calendario-instructor" class="suggestion-link">
            📅 Mi Calendario
          </router-link>
          <router-link v-if="authStore.isInstructor" to="/registro-asistencia" class="suggestion-link">
            ✓ Registro Asistencia
          </router-link>

          <!-- Links para admin -->
          <router-link v-if="authStore.isAdmin" to="/gestion-clientes" class="suggestion-link">
            👥 Gestión Clientes
          </router-link>
        </div>
      </div>

      <!-- Info técnica (opcional) -->
      <div class="tech-info" v-if="showTechInfo">
        <p class="tech-detail">Ruta intentada: <code>{{ $route.fullPath }}</code></p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

// Computed
const hasSuggestions = computed(() => {
  return authStore.isAuthenticated || !authStore.isAuthenticated
})

const showTechInfo = computed(() => {
  // Mostrar info técnica solo en desarrollo
  return import.meta.env.DEV
})

// Métodos de navegación
const goBack = () => {
  router.back()
}

const goHome = () => {
  router.push('/')
}

const goDashboard = () => {
  const dashboards = {
    cliente: '/dashboard-cliente',
    instructor: '/calendario-instructor',
    admin: '/gestion-clientes',
    guest: '/'
  }
  router.push(dashboards[authStore.role] || '/')
}
</script>

<style scoped>
.not-found-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  animation: gradientShift 15s ease infinite;
  background-size: 200% 200%;
}

@keyframes gradientShift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.content {
  text-align: center;
  color: white;
  max-width: 600px;
  width: 100%;
  background: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 3rem 2rem;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: fadeInUp 0.6s ease;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Error Animation */
.error-animation {
  position: relative;
  margin-bottom: 2rem;
}

.error-number {
  font-size: 8rem;
  font-weight: 900;
  line-height: 1;
  margin: 0;
  text-shadow: 4px 4px 8px rgba(0, 0, 0, 0.3);
  animation: bounce 2s ease infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-20px); }
}

.error-emoji {
  font-size: 4rem;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation: rotate 3s ease infinite;
}

@keyframes rotate {
  0%, 100% { transform: translate(-50%, -50%) rotate(0deg); }
  50% { transform: translate(-50%, -50%) rotate(15deg); }
}

/* Text */
.error-title {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 1rem;
}

.error-description {
  font-size: 1.125rem;
  margin-bottom: 2rem;
  opacity: 0.9;
  line-height: 1.6;
}

/* Actions */
.actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 2rem;
}

.actions button {
  padding: 0.875rem 1.5rem;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.btn-primary {
  background: linear-gradient(135deg, #FFBB41 0%, #FFA500 100%);
  color: #1E1E1E;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(255, 187, 65, 0.4);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  backdrop-filter: blur(10px);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}

.btn-accent {
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
  color: white;
}

.btn-accent:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(17, 153, 142, 0.4);
}

/* Suggestions */
.suggestions {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
}

.suggestions h3 {
  font-size: 1.25rem;
  margin-bottom: 1rem;
  opacity: 0.9;
}

.suggestion-links {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.suggestion-link {
  color: white;
  text-decoration: none;
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  backdrop-filter: blur(5px);
}

.suggestion-link:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.05);
}

/* Tech Info */
.tech-info {
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 0.875rem;
  opacity: 0.7;
}

.tech-detail {
  margin: 0.5rem 0;
}

code {
  background: rgba(0, 0, 0, 0.3);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
}

/* Responsive */
@media (max-width: 640px) {
  .content {
    padding: 2rem 1.5rem;
  }

  .error-number {
    font-size: 5rem;
  }

  .error-emoji {
    font-size: 2.5rem;
  }

  .error-title {
    font-size: 1.5rem;
  }

  .error-description {
    font-size: 1rem;
  }

  .actions {
    flex-direction: column;
  }

  .actions button {
    width: 100%;
  }

  .suggestion-links {
    flex-direction: column;
  }

  .suggestion-link {
    width: 100%;
    text-align: center;
  }
}
</style>