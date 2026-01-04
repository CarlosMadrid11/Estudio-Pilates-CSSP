<!-- TestTimezone.vue -->
<template>
  <div class="test-container">
    <h2>🧪 Test de Timezone</h2>
    
    <div class="test-section">
      <h3>Tu timezone local:</h3>
      <p>{{ timezoneInfo }}</p>
    </div>

    <div class="test-section">
      <h3>Fecha seleccionada:</h3>
      <input type="date" v-model="fechaTest" />
      <p>String: {{ fechaTest }}</p>
    </div>

    <div class="test-section">
      <h3>Conversiones:</h3>
      <pre>{{ conversiones }}</pre>
    </div>

    <button @click="probarGuardar">Probar Guardar en Supabase</button>
    <div v-if="resultado">
      <h3>Resultado guardado:</h3>
      <pre>{{ resultado }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'


const fechaTest = ref('2026-01-09')
const resultado = ref(null)

const timezoneInfo = computed(() => {
  const offset = new Date().getTimezoneOffset()
  const hours = Math.abs(offset / 60)
  const sign = offset > 0 ? '-' : '+'
  return `GMT${sign}${hours} (${Intl.DateTimeFormat().resolvedOptions().timeZone})`
})

const conversiones = computed(() => {
  return {
    'String original': fechaTest.value,
    'new Date(string)': new Date(fechaTest.value).toISOString(),
    'new Date(string).toLocaleDateString': new Date(fechaTest.value).toLocaleDateString('es-MX'),
    'String directo (correcto)': fechaTest.value
  }
})

const probarGuardar = async () => {
  // Aquí probarías insertar en una tabla de prueba
  console.log('Guardando:', fechaTest.value)
  resultado.value = {
    enviado: fechaTest.value,
    timestamp: new Date().toISOString()
  }
}
</script>

<style scoped>
.test-container {
  padding: 40px;
  background: #2C2C2C;
  color: white;
  max-width: 800px;
  margin: 40px auto;
}

.test-section {
  margin: 20px 0;
  padding: 20px;
  background: #3A3A3A;
  border-radius: 8px;
}

pre {
  background: #1E1E1E;
  padding: 10px;
  border-radius: 4px;
  overflow-x: auto;
}

input[type="date"] {
  padding: 8px;
  font-size: 16px;
  margin: 10px 0;
}

button {
  padding: 12px 24px;
  background: #FFBB41;
  color: black;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
}
</style>