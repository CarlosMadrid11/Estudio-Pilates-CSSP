<template>
  <div id="app" class="min-h-screen flex flex-col">
    <!-- Navbar -->
    <header>
      <!-- Aquí va a ir el Navbar dinámico -->
    </header>

    <!-- Contenido principal -->
    <main class="flex-1">
      <RouterView />
    </main>

    <!-- Footer -->
    <footer>
      <!-- Footer reutilizable -->
    </footer>
  </div>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<style scoped>
/* Por ahora vacío */
</style>
