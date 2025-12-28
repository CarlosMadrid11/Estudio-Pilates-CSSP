<template>
  <!-- Estructura actual del app -->
  <div id="app">
    <!-- Navbar Dinámico -->
    <NavbarDynamic v-if="shouldShowNavbar" />
    
    <!-- Vista actual -->
    <router-view />
    
    <!-- Footer -->
    <Footer v-if="shouldShowFooter" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import NavbarDynamic from '@/components/NavbarDynamic.vue'
import Footer from '@/components/Footer.vue'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const authStore = useAuthStore()

// Inicializar sesión al cargar la app
onMounted(() => {
  authStore.init()
})

// Determinar si se debe mostrar el navbar
// Por ahora siempre true, luego ajustaremos según la ruta
const shouldShowNavbar = computed(() => {
  // Rutas donde NO queremos navbar (por ejemplo, login podría no tenerlo)
  const routesWithoutNavbar: string[] = []
  return !routesWithoutNavbar.includes(route.name as string)
})

// Determinar si se debe mostrar el footer
const shouldShowFooter = computed(() => {
  // Por ahora siempre mostramos el footer en todas las vistas
  return true
})
</script>

<style>
/* Reset global */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  overflow-x: hidden;
}

#app {
  width: 100%;
  min-height: 100vh;
  margin: 0;
  padding-top: 64px; /* Espacio para el navbar fixed */
  font-family: Arial, Helvetica, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  display: flex;
  flex-direction: column;
}

/* Estilos globales para router-view */
.router-view {
  width: 100%;
  margin: 0;
  padding: 0;
  flex: 1;
}
</style>