<template>
  <div class="navbar-view">
    <nav class="bg-cssp-yellow shadow-lg">
      <div class="w-full px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          
          <!-- Logo -->
          <div class="shrink-0 flex items-center">
            <router-link to="/" class="text-2xl font-extrabold text-gray-900 flex items-center gap-2 rounded p-1 hover:bg-yellow-400 transition">
              <span class="text-3xl">🏋️‍♂️</span> CSSP
            </router-link>
          </div>

          <!-- Enlaces principales -->
          <div class="flex items-center space-x-6" id="Links">
            
            <router-link to="/planes" class="nav-link">
              Planes
            </router-link>
            
            <router-link to="/ayuda" class="nav-link">
              Ayuda
            </router-link>
            
            <a href="#" class="text-gray-500 cursor-not-allowed px-3 py-2 rounded-md text-sm font-medium">
              Visitante sin loguear
            </a>
          </div>

          <!-- Botón iniciar sesión -->
          <div class="flex items-center">
            <router-link 
              to="/login" 
              class="bg-white text-gray-900 font-semibold py-2 px-4 border border-transparent rounded-lg shadow-md hover:bg-gray-100 transition duration-300 transform hover:scale-[1.02] active:scale-95"
            >
              Iniciar sesión
            </router-link>
          </div>
          
        </div>
      </div>
    </nav>
    
    <!-- Contenedor principal de la landing page -->
    <div class="contenedor-principal">

      <!-- Sección Hero -->
      <div class="hero-principal">
        <h1>Pilates Core Strong Studio</h1>
        <h2>Clases de pilates</h2>
        <p class="subtitulo-principal">Tu elijes el lugar y la hora...</p>

        <!-- <a class="boton-paquetes-principal">Ver paquetes</a> -->
         <router-link to="/planes" class="boton-paquetes-principal">Ver paquetes</router-link>

      </div>

      <!-- Sección inferior -->
      <div class="info-principal">
        <div class="texto-info-principal">
          <p>
            Ofrecemos clases por paquetes, a precios accesibles, en las que tu puedes elegir
            la sucursal, el día, la hora y la cama que quieras tomar las clases. Según se
            adapten a tus necesidades
          </p>
          <a href="#" class="boton-info-principal">Ver mas información</a>
        </div>

        <div class="imagen-info-principal">
          <img src="@/assets/Pilates.jpg" alt="Clases de pilates">
        </div>
      </div>

      <!-- Sección de Calendario -->
      <div class="calendario-principal">
        
        <div class="calendario-imagen-principal">
          <img src="@/assets/calendario.jpg" alt="Calendario">
        </div>

        <div class="calendario-texto-principal">
          <h3>Agenda tus clases de forma rápida y sencilla</h3>

          <a href="#" class="calendario-boton-principal">Ver calendario</a>
        </div>

      </div>

      <!-- Sección Sucursales -->
      <div class="sucursales-principal">

        <h2 class="sucursales-titulo-principal">Sucursales</h2>

        <div class="sucursales-contenido-principal">

          <div class="sucursales-mapa-principal">
            <img src="@/assets/mapa.jpg" alt="Mapa de sucursal">
          </div>

          <div class="sucursales-texto-principal">
            <p>Agricultores 24, Tierra Blanca, 80030 Culiacán Rosales, Sin.</p>

            <a href="https://maps.app.goo.gl/VSSwsVEhbAibZqxn8" target="_blank" class="sucursales-link-principal">
              Ver en Google Maps
            </a>
          </div>

        </div>

        <div class="sucursales-contenido-principal">

          <div class="sucursales-mapa-principal">
            <img src="@/assets/mapa2.jpg" alt="Mapa de sucursal">
          </div>

          <div class="sucursales-texto-principal">
            <p>Av Dr Ruperto Paliza 399-505, Miguel Alemán, 80200 Culiacán Rosales, Sin.</p>

            <a href="https://maps.app.goo.gl/mr8krHpmXFm8St3R7" target="_blank" class="sucursales-link-principal">
              Ver en Google Maps
            </a>
          </div>

        </div>

        <div class="sucursales-contenido-principal">

          <div class="sucursales-mapa-principal">
            <img src="@/assets/mapa3.jpg" alt="Mapa de sucursal">
          </div>

          <div class="sucursales-texto-principal">
            <p>Fco. Labastida Ochoa, Francisco Labastida Ochoa, 80199 Culiacán Rosales, Sin.</p>

            <a href="https://maps.app.goo.gl/NarLGBoWsC2NAYMZ7" target="_blank" class="sucursales-link-principal">
              Ver en Google Maps
            </a>
          </div>

        </div>

      </div>

    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, onUnmounted } from 'vue';

export default defineComponent({
  name: 'NavBarView',
  setup() {
    // Para manejar el estado del dropdown
    const isDropdownOpen = ref(false);

    const toggleDropdown = () => {
      isDropdownOpen.value = !isDropdownOpen.value;
    };

    // Lógica para cerrar el dropdown al hacer clic fuera
    const closeDropdown = (event: MouseEvent) => {
      const dropdownButton = document.getElementById('dropdownButton');
      const dropdownMenu = document.getElementById('dropdownMenu');

      if (dropdownButton && dropdownMenu) {
        if (!dropdownButton.contains(event.target as Node) && !dropdownMenu.contains(event.target as Node)) {
          isDropdownOpen.value = false;
        }
      }
    };

    onMounted(() => {
      document.addEventListener('click', closeDropdown);
    });

    onUnmounted(() => {
      document.removeEventListener('click', closeDropdown);
    });

    return {
      isDropdownOpen,
      toggleDropdown
    };
  }
});
</script>

<style scoped>
.navbar-view {
  width: 100% !important; 
  height: 100% !important;
}

/* Estilos del contenedor principal */
.contenedor-principal {
  width: 100%;
  margin: 0;
  padding: 0;
  font-family: Arial, sans-serif;
}

/* Sección Hero */
.hero-principal {
  background-color: #333333;
  color: white;
  text-align: center;
  padding: 80px 20px;
}

.hero-principal h1 {
  font-size: 48px;
  font-weight: bold;
  margin-bottom: 10px;
}

.hero-principal h2 {
  font-size: 36px;
  margin-bottom: 20px;
}

.subtitulo-principal {
  font-size: 20px;
  margin-bottom: 30px;
}

.boton-paquetes-principal {
  display: inline-block;
  background-color: #f1c40f;
  color: black;
  padding: 15px 40px;
  text-decoration: none;
  font-weight: bold;
  border-radius: 4px;
  font-size: 18px;
}

/* Sección inferior */
.info-principal {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #020726;
  padding: 60px 50px;
  color: white;
}

.texto-info-principal {
  width: 50%;
  font-size: 18px;
  line-height: 1.5;
}

.boton-info-principal {
  display: inline-block;
  margin-top: 20px;
  padding: 12px 30px;
  border: 2px solid white;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  font-size: 16px;
}

.imagen-info-principal {
  width: 45%;
}

.imagen-info-principal img {
  width: 100%;
  border-radius: 10px;
}

/* Sección Calendario */
.calendario-principal {
  display: flex;
  width: 100%;
  background-color: #333333;
}

.calendario-imagen-principal {
  width: 50%;
}

.calendario-imagen-principal img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.calendario-texto-principal {
  width: 50%;
  background-color: #020726;
  color: white;
  padding: 60px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.calendario-texto-principal h3 {
  font-size: 24px;
  margin-bottom: 30px;
  line-height: 1.4;
}

.calendario-boton-principal {
  display: inline-block;
  padding: 12px 30px;
  border: 2px solid white;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  font-size: 16px;
  width: fit-content;
}

/* Sección Sucursales */
.sucursales-principal {
  width: 100%;
  background-color: #333333;
  color: white;
  padding: 50px 40px;
}

.sucursales-titulo-principal {
  font-size: 52px;
  margin-bottom: 30px;
  text-align: center;
}

.sucursales-contenido-principal {
  display: flex;
  width: 100%;
  max-width: 1100px;
  margin: 0 auto 30px auto;
  border-radius: 10px;
  overflow: hidden;
}

.sucursales-mapa-principal {
  width: 45%;
}

.sucursales-mapa-principal img {
  width: 100%;
  height: 350px;
  object-fit: cover;
}

.sucursales-texto-principal {
  width: 55%;
  background-color: #020726;
  padding: 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  font-size: 18px;
  line-height: 1.4;
}

.sucursales-link-principal {
  margin-top: 20px;
  font-size: 17px;
  color: #4fa3ff;
  text-decoration: underline;
  width: fit-content;
}
</style>