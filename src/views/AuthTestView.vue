<template>
  <div class="auth-test">
    <div class="auth-test-container">
      <h1>🧪 Prueba de Autenticación</h1>
      <p class="subtitle">Vista temporal para probar el sistema de auth</p>

      <!-- Estado actual -->
      <div class="current-state">
        <h2>Estado Actual</h2>
        <div class="state-grid">
          <div class="state-item">
            <span class="label">Usuario:</span>
            <span class="value">{{ authStore.userName }}</span>
          </div>
          <div class="state-item">
            <span class="label">Email:</span>
            <span class="value">{{ authStore.userEmail || 'Sin email' }}</span>
          </div>
          <div class="state-item">
            <span class="label">Rol:</span>
            <span class="value role-badge" :class="`role-${authStore.role}`">
              {{ authStore.role }}
            </span>
          </div>
          <div class="state-item">
            <span class="label">Autenticado:</span>
            <span class="value">{{ authStore.isAuthenticated ? '✅ Sí' : '❌ No' }}</span>
          </div>
        </div>
      </div>

      <!-- Botones de login mock -->
      <div class="login-options">
        <h2>Probar Roles</h2>
        <p class="description">Haz clic en un rol para simular login</p>
        
        <div class="button-grid">
          <button 
            @click="handleLogin('cliente')" 
            class="role-button cliente"
            :disabled="authStore.isCliente"
          >
            👤 Login como Cliente
          </button>
          
          <button 
            @click="handleLogin('instructor')" 
            class="role-button instructor"
            :disabled="authStore.isInstructor"
          >
            🏋️ Login como Instructor
          </button>
          
          <button 
            @click="handleLogin('admin')" 
            class="role-button admin"
            :disabled="authStore.isAdmin"
          >
            ⚙️ Login como Admin
          </button>
          
          <button 
            @click="handleLogout" 
            class="role-button logout"
            :disabled="authStore.isGuest"
          >
            🚪 Cerrar Sesión
          </button>
        </div>
      </div>

      <!-- Verificadores de acceso -->
      <div class="access-check">
        <h2>Verificar Acceso</h2>
        <div class="access-grid">
          <div class="access-item">
            <span>¿Es Guest?</span>
            <span>{{ authStore.isGuest ? '✅' : '❌' }}</span>
          </div>
          <div class="access-item">
            <span>¿Es Cliente?</span>
            <span>{{ authStore.isCliente ? '✅' : '❌' }}</span>
          </div>
          <div class="access-item">
            <span>¿Es Instructor?</span>
            <span>{{ authStore.isInstructor ? '✅' : '❌' }}</span>
          </div>
          <div class="access-item">
            <span>¿Es Admin?</span>
            <span>{{ authStore.isAdmin ? '✅' : '❌' }}</span>
          </div>
        </div>
      </div>

      <!-- Información adicional -->
      <div class="info-box">
        <h3>ℹ️ Información</h3>
        <ul>
          <li>La sesión se guarda en localStorage</li>
          <li>La sesión expira después de 7 días</li>
          <li>Recarga la página para verificar que se mantiene la sesión</li>
          <li>Esta vista es temporal solo para pruebas</li>
        </ul>
      </div>

      <!-- Botón para volver -->
      <div class="back-button">
        <router-link to="/" class="btn-back">
          ← Volver al inicio
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import type { UserRole } from '@/stores/auth'

const authStore = useAuthStore()

const handleLogin = (role: UserRole) => {
  authStore.loginMock(role)
  console.log(`✅ Login como ${role}`)
}

const handleLogout = () => {
  authStore.logout()
  console.log('🚪 Sesión cerrada')
}
</script>

<style scoped>
.auth-test {
  min-height: calc(100vh - 64px);
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40px 20px;
}

.auth-test-container {
  max-width: 900px;
  margin: 0 auto;
}

h1 {
  color: white;
  font-size: 42px;
  margin: 0 0 10px 0;
  text-align: center;
}

.subtitle {
  color: rgba(255, 255, 255, 0.8);
  text-align: center;
  margin: 0 0 40px 0;
  font-size: 18px;
}

h2 {
  color: white;
  font-size: 24px;
  margin: 0 0 20px 0;
}

h3 {
  margin: 0 0 15px 0;
  color: #333;
}

.current-state,
.login-options,
.access-check,
.info-box {
  background: white;
  border-radius: 12px;
  padding: 30px;
  margin-bottom: 30px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.state-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.state-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.label {
  font-size: 14px;
  color: #666;
  font-weight: 500;
}

.value {
  font-size: 18px;
  color: #333;
  font-weight: 600;
}

.role-badge {
  display: inline-block;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 14px;
  width: fit-content;
}

.role-badge.role-guest {
  background: #e0e0e0;
  color: #666;
}

.role-badge.role-cliente {
  background: #e3f2fd;
  color: #1976d2;
}

.role-badge.role-instructor {
  background: #fff3e0;
  color: #f57c00;
}

.role-badge.role-admin {
  background: #fce4ec;
  color: #c2185b;
}

.description {
  color: #666;
  margin: 0 0 20px 0;
}

.button-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
}

.role-button {
  padding: 15px 25px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.role-button:not(:disabled):hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.role-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.role-button.cliente {
  background: #2196f3;
  color: white;
}

.role-button.instructor {
  background: #ff9800;
  color: white;
}

.role-button.admin {
  background: #e91e63;
  color: white;
}

.role-button.logout {
  background: #f44336;
  color: white;
}

.access-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 15px;
}

.access-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: #f5f5f5;
  border-radius: 6px;
  font-size: 15px;
}

.info-box {
  background: #fff9c4;
  border-left: 4px solid #fbc02d;
}

.info-box ul {
  margin: 0;
  padding-left: 20px;
  color: #333;
}

.info-box li {
  margin-bottom: 8px;
}

.back-button {
  text-align: center;
}

.btn-back {
  display: inline-block;
  padding: 12px 30px;
  background: white;
  color: #667eea;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.btn-back:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

@media (max-width: 768px) {
  h1 {
    font-size: 32px;
  }

  .state-grid,
  .button-grid,
  .access-grid {
    grid-template-columns: 1fr;
  }
}
</style>