<template>
  <div class="landing-page">
    <!-- NOTA: El navbar será dinámico en App.vue, aquí solo va el contenido -->
    
    <!-- Sección Hero -->
    <div class="hero-principal">
      <h1>Pilates Core Strong Studio</h1>
      <h2>Clases de pilates</h2>
      <p class="subtitulo-principal">Tu eliges el lugar y la hora...</p>
      <router-link to="/planes" class="boton-paquetes-principal">
        Ver paquetes
      </router-link>
    </div>

    <!-- Sección inferior -->
    <div class="info-principal">
      <div class="texto-info-principal">
        <p>
          Ofrecemos clases por paquetes, a precios accesibles, en las que tú puedes elegir
          la sucursal, el día, la hora y la cama que quieras tomar las clases. Según se
          adapten a tus necesidades.
        </p>
        <router-link to="/ayuda" class="boton-info-principal">
          Ver más información
        </router-link>
      </div>

      <div class="imagen-info-principal">
        <img :src="pilatesImg" alt="Clases de pilates">
      </div>
    </div>

    <!-- Sección de Calendario -->
    <div class="calendario-principal">
      <div class="calendario-imagen-principal">
        <img :src="calendarioImg" alt="Calendario">
      </div>
      <div class="calendario-texto-principal">
        <h3>Agenda tus clases de forma rápida y sencilla</h3>
        <router-link to="/login" class="calendario-boton-principal">
          Iniciar sesión para agendar
        </router-link>
      </div>
    </div>

    <!-- Sección Sucursales -->
    <div class="sucursales-principal">
      <h2 class="sucursales-titulo-principal">Sucursales</h2>
      
      <div class="sucursales-contenido-principal">
        <div class="sucursales-mapa-principal">
          <img :src="mapa1Img" alt="Mapa de sucursal">
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
          <img :src="mapa2Img" alt="Mapa de sucursal">
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
          <img :src="mapa3Img" alt="Mapa de sucursal">
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
</template>

<script setup lang="ts">
import { ref } from 'vue'

// Placeholders temporales - Reemplaza con tus rutas correctas
const pilatesImg = ref('https://placehold.co/600x400/333/FFF?text=Pilates')
const calendarioImg = ref('https://placehold.co/600x400/333/FFF?text=Calendario')
const mapa1Img = ref('https://placehold.co/600x400/333/FFF?text=Mapa+1')
const mapa2Img = ref('https://placehold.co/600x400/333/FFF?text=Mapa+2')
const mapa3Img = ref('https://placehold.co/600x400/333/FFF?text=Mapa+3')

// NOTA: Para usar tus imágenes reales, descomenta estas líneas
// y ajusta los nombres según tus archivos:
/*
import pilatesImgFile from '@/assets/pilates.jpg'
import calendarioImgFile from '@/assets/calendario.jpg'
import mapa1ImgFile from '@/assets/mapa.jpg'
import mapa2ImgFile from '@/assets/mapa2.jpg'
import mapa3ImgFile from '@/assets/mapa3.jpg'

pilatesImg.value = pilatesImgFile
calendarioImg.value = calendarioImgFile
mapa1Img.value = mapa1ImgFile
mapa2Img.value = mapa2ImgFile
mapa3Img.value = mapa3ImgFile
*/
</script>

<style scoped>
/* Reset para eliminar margins y paddings heredados */
.landing-page {
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
  margin: 0;
}

.hero-principal h1 {
  font-size: 48px;
  font-weight: bold;
  margin: 0 0 10px 0;
}

.hero-principal h2 {
  font-size: 36px;
  margin: 0 0 20px 0;
}

.subtitulo-principal {
  font-size: 20px;
  margin: 0 0 30px 0;
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
  transition: all 0.3s ease;
}

.boton-paquetes-principal:hover {
  background-color: #f39c12;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

/* Sección inferior */
.info-principal {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #020726;
  padding: 60px 50px;
  color: white;
  margin: 0;
}

.texto-info-principal {
  width: 50%;
  font-size: 18px;
  line-height: 1.5;
}

.texto-info-principal p {
  margin: 0 0 20px 0;
}

.boton-info-principal {
  display: inline-block;
  padding: 12px 30px;
  border: 2px solid white;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  font-size: 16px;
  transition: all 0.3s ease;
}

.boton-info-principal:hover {
  background-color: white;
  color: #020726;
}

.imagen-info-principal {
  width: 45%;
}

.imagen-info-principal img {
  width: 100%;
  border-radius: 10px;
  display: block;
}

/* Sección Calendario */
.calendario-principal {
  display: flex;
  width: 100%;
  background-color: #333333;
  margin: 0;
}

.calendario-imagen-principal {
  width: 50%;
}

.calendario-imagen-principal img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
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
  margin: 0 0 30px 0;
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
  transition: all 0.3s ease;
}

.calendario-boton-principal:hover {
  background-color: white;
  color: #020726;
}

/* Sección Sucursales */
.sucursales-principal {
  width: 100%;
  background-color: #333333;
  color: white;
  padding: 50px 40px;
  margin: 0;
}

.sucursales-titulo-principal {
  font-size: 52px;
  margin: 0 0 30px 0;
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

.sucursales-contenido-principal:last-child {
  margin-bottom: 0;
}

.sucursales-mapa-principal {
  width: 45%;
}

.sucursales-mapa-principal img {
  width: 100%;
  height: 350px;
  object-fit: cover;
  display: block;
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

.sucursales-texto-principal p {
  margin: 0;
}

.sucursales-link-principal {
  margin-top: 20px;
  font-size: 17px;
  color: #4fa3ff;
  text-decoration: underline;
  width: fit-content;
  transition: color 0.3s ease;
}

.sucursales-link-principal:hover {
  color: #7bb9ff;
}

/* Responsive */
@media (max-width: 768px) {
  .hero-principal h1 {
    font-size: 32px;
  }

  .hero-principal h2 {
    font-size: 24px;
  }

  .info-principal {
    flex-direction: column;
    padding: 40px 20px;
  }

  .texto-info-principal,
  .imagen-info-principal {
    width: 100%;
  }

  .imagen-info-principal {
    margin-top: 30px;
  }

  .calendario-principal {
    flex-direction: column;
  }

  .calendario-imagen-principal,
  .calendario-texto-principal {
    width: 100%;
  }

  .calendario-texto-principal {
    padding: 40px 20px;
  }

  .sucursales-titulo-principal {
    font-size: 36px;
  }

  .sucursales-contenido-principal {
    flex-direction: column;
  }

  .sucursales-mapa-principal,
  .sucursales-texto-principal {
    width: 100%;
  }

  .sucursales-mapa-principal img {
    height: 250px;
  }
}
</style>