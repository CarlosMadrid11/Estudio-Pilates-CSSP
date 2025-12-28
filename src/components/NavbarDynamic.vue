<template> <!-- Solo guest y cliente por ahora -->
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
nav {
  width: 100%;
  margin: 0;
  padding: 0;
}

.nav-link {
  @apply text-gray-800 hover:bg-yellow-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition duration-150;
}

.nav-link.router-link-active {
  @apply bg-yellow-600 text-gray-900 font-bold;
}

#Links {
  gap: 1.5rem;
  color: rgb(4, 10, 10);
}
</style>