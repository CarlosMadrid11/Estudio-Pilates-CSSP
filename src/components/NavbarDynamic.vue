<template>
  <nav class="bg-cssp-yellow shadow-lg">
    <div class="w-full px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        
        <!-- Logo -->
        <div class="shrink-0 flex items-center">
          <router-link to="/" class="text-2xl font-extrabold text-gray-900 flex items-center gap-2 rounded p-1 hover:bg-yellow-400 transition">
            <span class="text-3xl">🏋️‍♂️</span> CSSP
          </router-link>
        </div>

        <!-- Enlaces principales - Dinámicos según el rol -->
        <div class="flex items-center space-x-6" id="Links">
          
          <!-- Links para GUEST -->
          <template v-if="authStore.isGuest">
            <router-link to="/planes" class="nav-link">
              Planes
            </router-link>
            
            <router-link to="/ayuda" class="nav-link">
              Ayuda
            </router-link>
            
            <a href="#" class="text-gray-500 cursor-not-allowed px-3 py-2 rounded-md text-sm font-medium">
              Visitante
            </a>
          </template>

          <!-- Links para CLIENTE -->
          <template v-if="authStore.isCliente">
            <router-link to="/dashboard-cliente" class="nav-link">
              Dashboard
            </router-link>

            <router-link to="/mis-reservas" class="nav-link">
              Mis Reservas
            </router-link>
            
            <router-link to="/calendario-cliente" class="nav-link">
              Calendario
            </router-link>
            
            <router-link to="/metodo-pago" class="nav-link">
              Método de pago
            </router-link>

            <a href="#" class="text-gray-500 cursor-not-allowed px-3 py-2 rounded-md text-sm font-medium">
              Cliente
            </a>

            <div class="flex items-center">
              <i class="bi bi-person-circle text-gray-800" style="font-size: 28px;"></i>
            </div>
          </template>

          <!-- Links para ADMIN -->
          <template v-if="authStore.isAdmin">
            <router-link to="/gestion-clientes" class="nav-link">
              Gestión de Clientes
            </router-link>

            <router-link to="/reportes-ventas" class="nav-link">
              Reportes de ventas
            </router-link>

            <a href="#" class="text-gray-500 cursor-not-allowed px-3 py-2 rounded-md text-sm font-medium">
              Administrador
            </a>

            <div class="flex items-center">
              <i class="bi bi-person-circle text-gray-800" style="font-size: 28px;"></i>
            </div>
          </template>

        </div>

        <!-- Botón de acción según el rol -->
        <div class="flex items-center">
          <!-- Botón Login para GUEST -->
          <router-link 
            v-if="authStore.isGuest"
            to="/login" 
            class="bg-white text-gray-900 font-semibold py-2 px-4 border border-transparent rounded-lg shadow-md hover:bg-gray-100 transition duration-300 transform hover:scale-[1.02] active:scale-95"
          >
            Iniciar sesión
          </router-link>

          <!-- Botón Logout para usuarios autenticados -->
          <button
            v-if="authStore.isAuthenticated"
            @click="handleLogout"
            class="bg-red-500 text-white font-semibold py-2 px-4 border border-transparent rounded-lg shadow-md hover:bg-red-600 transition duration-300 transform hover:scale-[1.02] active:scale-95"
          >
            Cerrar sesión
          </button>
        </div>
        
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

const handleLogout = () => {
  authStore.logout()
  router.push('/')
  console.log('🚪 Sesión cerrada')
}
</script>

<style scoped>
/* Navbar principal */
.bg-cssp-yellow {
  background-color: #f1c40f;
}

.shadow-lg {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

nav {
  width: 100%;
  margin: 0;
  padding: 0;
}

/* Contenedor del navbar */
.w-full {
  width: 100%;
}

.px-4 {
  padding-left: 1rem;
  padding-right: 1rem;
}

.flex {
  display: flex;
}

.justify-between {
  justify-content: space-between;
}

.items-center {
  align-items: center;
}

.h-16 {
  height: 4rem;
}

/* Logo */
.shrink-0 {
  flex-shrink: 0;
}

.text-2xl {
  font-size: 1.5rem;
  line-height: 2rem;
}

.font-extrabold {
  font-weight: 800;
}

.text-gray-900 {
  color: rgb(17, 24, 39);
}

.gap-2 {
  gap: 0.5rem;
}

.rounded {
  border-radius: 0.25rem;
}

.p-1 {
  padding: 0.25rem;
}

.hover\:bg-yellow-400:hover {
  background-color: #facc15;
}

.transition {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

.text-3xl {
  font-size: 1.875rem;
  line-height: 2.25rem;
}

/* Links */
.space-x-6 > * + * {
  margin-left: 1.5rem;
}

#Links {
  gap: 1.5rem;
  color: rgb(4, 10, 10);
}

.nav-link {
  color: rgb(31, 41, 55);
  padding: 0.5rem 0.75rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 150ms ease-in-out;
  text-decoration: none;
  display: inline-block;
}

.nav-link:hover {
  background-color: #eab308;
  color: rgb(17, 24, 39);
}

.nav-link.router-link-active {
  background-color: #ca8a04;
  color: rgb(17, 24, 39);
  font-weight: 700;
}

/* Badge de rol */
.text-gray-500 {
  color: rgb(107, 114, 128);
}

.cursor-not-allowed {
  cursor: not-allowed;
}

.px-3 {
  padding-left: 0.75rem;
  padding-right: 0.75rem;
}

.py-2 {
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
}

.rounded-md {
  border-radius: 0.375rem;
}

.text-sm {
  font-size: 0.875rem;
  line-height: 1.25rem;
}

.font-medium {
  font-weight: 500;
}

/* Icono de persona */
.text-gray-800 {
  color: rgb(31, 41, 55);
}

/* Botones */
.bg-white {
  background-color: white;
}

.font-semibold {
  font-weight: 600;
}

.py-2 {
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
}

.px-4 {
  padding-left: 1rem;
  padding-right: 1rem;
}

.border {
  border-width: 1px;
}

.border-transparent {
  border-color: transparent;
}

.rounded-lg {
  border-radius: 0.5rem;
}

.shadow-md {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.hover\:bg-gray-100:hover {
  background-color: rgb(243, 244, 246);
}

.hover\:scale-\[1\.02\]:hover {
  transform: scale(1.02);
}

.active\:scale-95:active {
  transform: scale(0.95);
}

/* Botón de logout */
.bg-red-500 {
  background-color: rgb(239, 68, 68);
}

.text-white {
  color: white;
}

.hover\:bg-red-600:hover {
  background-color: rgb(220, 38, 38);
}

/* Responsive */
@media (min-width: 640px) {
  .sm\:px-6 {
    padding-left: 1.5rem;
    padding-right: 1.5rem;
  }
}

@media (min-width: 1024px) {
  .lg\:px-8 {
    padding-left: 2rem;
    padding-right: 2rem;
  }
}
</style>