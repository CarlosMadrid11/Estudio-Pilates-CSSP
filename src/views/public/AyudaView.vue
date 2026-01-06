<template>
  <div class="ayuda-view">
    <main class="main-container">
      <h1>Preguntas frecuentes</h1>
      <section class="faq">
        <h2>¿Cómo funciona la vigencia de los paquetes?</h2>
        <p>
          Después de adquirir un paquete, tendrás una cantidad de X días, en la que deberás consumir tus clases antes 
          de que el paquete expire. Por ejemplo, si compraste un <strong>Paquete Semanal</strong>, después de la compra tendrás 
          <strong>7 días</strong> para reservar tus 6 clases.
        </p>
        
        <h2>¿Cómo gasto mis clases?</h2>
        <p>
          Una vez adquirido un paquete, debes ir al apartado de 
          
          <!-- Si es guest, mostrar link que abre modal -->
          <a 
            v-if="authStore.isGuest"
            @click.prevent="handleGuestReservas"
            class="link"
            style="cursor: pointer;"
          >
            Mis reservas
          </a>
          
          <!-- Si está autenticado, link normal -->
          <router-link 
            v-else
            to="/mis-reservas" 
            class="link"
          >
            Mis reservas
          </router-link>
          
          , se te reflejará la cantidad de clases que tienes disponible, 
          deberás seleccionar en el calendario, la <strong>sucursal</strong>, el <strong>día</strong>, la <strong>hora</strong> y la 
          <strong>cama</strong> en la que deseas reservar la clase.
        </p>
        
        <h2>¿Y si no puedo asistir a una clase que reservé?</h2>
        <p>
          Después de reservar una clase, tendrás 3 horas para poder cancelar la reserva, de otra forma, se te descontará 
          de tus clases disponibles.
        </p>
      </section>
    </main>

    <!-- Modal Component -->
    <Modal
      v-model="modal.isOpen.value"
      :type="modal.config.value.type"
      :title="modal.config.value.title"
      :message="modal.config.value.message"
      :icon="modal.config.value.icon"
      :confirmText="modal.config.value.confirmText"
      :cancelText="modal.config.value.cancelText"
      :showCancel="modal.config.value.showCancel"
      @confirm="modal.confirm"
      @cancel="modal.cancel"
    />
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import { useModal } from '@/composables/useModal'
import Modal from '@/components/Modal.vue'

const authStore = useAuthStore()
const modal = useModal()

// Handler cuando guest intenta acceder a "Mis Reservas"
const handleGuestReservas = async () => {
  // Mostrar modal de advertencia con login requerido
  await modal.showLoginRequired(
    'Antes de ver tus reservas necesitas iniciar sesión. Serás redirigido al login.'
  )
  
  // La redirección a /login se hace automáticamente
  // Si el usuario cancela, simplemente se cierra el modal
}
</script>

<style scoped>
/* Estilos para el contenedor principal y el fondo */
.ayuda-view {
  margin: 0;
  padding: 0;
  font-family: Arial, sans-serif;
  min-height: 100vh;
  background: #242424; 
  color: white;
}

/* Estilos del Contenido */
.main-container {
  max-width: 900px;
  margin: 50px auto;
  padding: 0 20px;
}

.main-container h1 {
  font-size: 36px;
  margin-bottom: 40px;
}

.faq h2 {
  margin-top: 30px;
  color: white;
}

.faq p {
  margin-left: 20px;
  max-width: 800px;
  line-height: 1.6;
}

/* Link "Mis clases" */
.link {
  color: #2EA3F2;
  font-weight: bold;
  text-decoration: underline;
  cursor: pointer;
  transition: color 0.2s ease;
}

.link:hover {
  color: #7bc9ff;
}
</style>