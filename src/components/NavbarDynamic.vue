<template>
  <!-- Navbar dinámico con dropdown de usuario -->
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

            <router-link to="/planes" class="nav-link">
              Planes
            </router-link>
          </template>

          <!-- Links para ADMIN -->
          <template v-if="authStore.isAdmin">
            <router-link to="/gestion-clientes" class="nav-link">
              Gestión de Clientes
            </router-link>
          </template>

          <!-- Links para INSTRUCTOR -->
          <template v-if="authStore.isInstructor">
            <router-link to="/calendario-instructor" class="nav-link">
              Calendario
            </router-link>

            <router-link to="/registro-asistencia" class="nav-link">
              Registro asistencia
            </router-link>
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

          <!-- Dropdown para usuarios autenticados -->
          <div v-if="authStore.isAuthenticated" class="relative">
            <!-- Trigger del dropdown -->
            <button
              @click.stop="toggleDropdown"
              class="flex items-center gap-3 px-4 h-full rounded-lg bg-yellow-400 hover:bg-white transition duration-200"
            >
              <!-- Avatar con iniciales -->
              <div class="w-12 h-12 rounded-full bg-gray-800 text-white flex items-center justify-center font-semibold text-base">
                {{ userInitials }}
              </div>
              
              <!-- Nombre (oculto en pantallas pequeñas) -->
              <span class="font-medium text-gray-900 hidden lg:block">
                {{ authStore.userName }}
              </span>
              
              <!-- Chevron icon -->
              <svg 
                class="w-4 h-4 text-gray-900 transition-transform duration-200"
                :class="{ 'rotate-180': isDropdownOpen }"
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            <!-- Menu dropdown -->
            <div 
              v-if="isDropdownOpen"
              ref="dropdownRef"
              class="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50"
            >
              <!-- Header con info del usuario -->
              <div class="px-4 py-3 border-b border-gray-200">
                <p class="font-semibold text-gray-900">{{ authStore.userName }}</p>
                <p class="text-sm text-gray-600 truncate">{{ authStore.userEmail }}</p>
                <span 
                  :class="roleColor" 
                  class="inline-block text-xs px-2 py-1 rounded-full mt-2 font-medium"
                >
                  {{ roleLabel }}
                </span>
              </div>
              
              <!-- Opciones del menú -->
              <div class="py-1">
                <router-link 
                  v-for="option in menuOptions" 
                  :key="option.route"
                  :to="option.route"
                  @click="closeDropdown"
                  class="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition duration-150"
                >
                  <span class="text-lg">{{ option.icon }}</span>
                  <span class="text-sm font-medium">{{ option.label }}</span>
                </router-link>
              </div>
              
              <!-- Logout -->
              <div class="border-t border-gray-200 py-1">
                <button 
                  @click="handleLogout"
                  class="w-full flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 transition duration-150"
                >
                  <span class="text-lg">🚪</span>
                  <span class="text-sm font-medium">Cerrar Sesión</span>
                </button>
              </div>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

// Estado del dropdown
const isDropdownOpen = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)

// Calcular iniciales del usuario
const userInitials = computed(() => {
  const name = authStore.userName
  if (!name || name === 'Invitado') return 'U'
  
  return name
    .split(' ')
    .map(word => word[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
})

// Configuración de badges por rol
const roleConfig = {
  cliente: { label: 'Cliente', color: 'bg-blue-100 text-blue-800' },
  instructor: { label: 'Instructor', color: 'bg-purple-100 text-purple-800' },
  admin: { label: 'Administrador', color: 'bg-red-100 text-red-800' },
  guest: { label: 'Invitado', color: 'bg-gray-100 text-gray-800' }
}

const roleLabel = computed(() => roleConfig[authStore.role].label)
const roleColor = computed(() => roleConfig[authStore.role].color)

// Opciones del menú según rol
const menuOptions = computed(() => {
  const base = [
    { icon: '👤', label: 'Mi Cuenta', route: '/mi-cuenta' },
    { icon: '❓', label: 'Ayuda', route: '/ayuda' }
  ]
  
  // Agregar opción específica según rol al inicio
  if (authStore.role === 'cliente') {
    base.unshift({ icon: '📊', label: 'Mi Dashboard', route: '/dashboard-cliente' })
  } else if (authStore.role === 'instructor') {
    base.unshift({ icon: '📅', label: 'Mi Calendario', route: '/calendario-instructor' })
  } else if (authStore.role === 'admin') {
    base.unshift({ icon: '👥', label: 'Gestión de Clientes', route: '/gestion-clientes' })
  }
  
  return base
})

// Toggle dropdown
const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value
}

// Cerrar dropdown
const closeDropdown = () => {
  isDropdownOpen.value = false
}

// Cerrar al hacer click fuera
const handleClickOutside = (event: MouseEvent) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    closeDropdown()
  }
}

// Logout
const handleLogout = () => {
  authStore.logout()
  closeDropdown()
  router.push('/')
  console.log('🚪 Sesión cerrada')
}

// Event listeners
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
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
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1000;
  background-color: #f1c40f;
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

.h-full {
  height: 100%;
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

.gap-3 {
  gap: 0.75rem;
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

/* Colores del botón dropdown */
.bg-yellow-400 {
  background-color: #facc15;
}

.hover\:bg-white:hover {
  background-color: white;
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

/* Dropdown específico */
.relative {
  position: relative;
}

.absolute {
  position: absolute;
}

.right-0 {
  right: 0;
}

.mt-2 {
  margin-top: 0.5rem;
}

.w-64 {
  width: 16rem;
}

.bg-white {
  background-color: white;
}

.rounded-lg {
  border-radius: 0.5rem;
}

.shadow-xl {
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.border {
  border-width: 1px;
}

.border-gray-200 {
  border-color: rgb(229, 231, 235);
}

.py-2 {
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
}

.py-3 {
  padding-top: 0.75rem;
  padding-bottom: 0.75rem;
}

.z-50 {
  z-index: 50;
}

/* Avatar */
.w-10 {
  width: 2.5rem;
}

.h-10 {
  height: 2.5rem;
}

.w-12 {
  width: 3rem;
}

.h-12 {
  height: 3rem;
}

.rounded-full {
  border-radius: 9999px;
}

.bg-gray-800 {
  background-color: rgb(31, 41, 55);
}

.text-white {
  color: white;
}

.justify-center {
  justify-content: center;
}

.font-semibold {
  font-weight: 600;
}

.text-sm {
  font-size: 0.875rem;
  line-height: 1.25rem;
}

.text-base {
  font-size: 1rem;
  line-height: 1.5rem;
}

/* Chevron */
.w-4 {
  width: 1rem;
}

.h-4 {
  height: 1rem;
}

.rotate-180 {
  transform: rotate(180deg);
}

/* Header del dropdown */
.px-4 {
  padding-left: 1rem;
  padding-right: 1rem;
}

.py-3 {
  padding-top: 0.75rem;
  padding-bottom: 0.75rem;
}

.border-b {
  border-bottom-width: 1px;
}

.text-gray-600 {
  color: rgb(75, 85, 99);
}

.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.inline-block {
  display: inline-block;
}

.text-xs {
  font-size: 0.75rem;
  line-height: 1rem;
}

.px-2 {
  padding-left: 0.5rem;
  padding-right: 0.5rem;
}

.py-1 {
  padding-top: 0.25rem;
  padding-bottom: 0.25rem;
}

.mt-2 {
  margin-top: 0.5rem;
}

.font-medium {
  font-weight: 500;
}

/* Opciones del menú */
.gap-3 {
  gap: 0.75rem;
}

.text-gray-700 {
  color: rgb(55, 65, 81);
}

.hover\:bg-gray-50:hover {
  background-color: rgb(249, 250, 251);
}

.text-lg {
  font-size: 1.125rem;
  line-height: 1.75rem;
}

/* Botón logout */
.border-t {
  border-top-width: 1px;
}

.text-red-600 {
  color: rgb(220, 38, 38);
}

.hover\:bg-red-50:hover {
  background-color: rgb(254, 242, 242);
}

/* Badges de rol */
.bg-blue-100 {
  background-color: rgb(219, 234, 254);
}

.text-blue-800 {
  color: rgb(30, 64, 175);
}

.bg-purple-100 {
  background-color: rgb(243, 232, 255);
}

.text-purple-800 {
  color: rgb(107, 33, 168);
}

.bg-red-100 {
  background-color: rgb(254, 226, 226);
}

.text-red-800 {
  color: rgb(153, 27, 27);
}

.bg-gray-100 {
  background-color: rgb(243, 244, 246);
}

.text-gray-800 {
  color: rgb(31, 41, 55);
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
  
  .lg\:block {
    display: block;
  }
}

.hidden {
  display: none;
}

/* Animaciones suaves */
.duration-150 {
  transition-duration: 150ms;
}

.duration-200 {
  transition-duration: 200ms;
}

.duration-300 {
  transition-duration: 300ms;
}
</style>