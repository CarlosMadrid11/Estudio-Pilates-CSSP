<template>
  <div class="planes-view">
    <!-- Hero Section -->
    <section class="hero">
      <h1>Pilates Core Strong Studio</h1>
      <p>Elije el plan que mejor se adapte a tus necesidades...</p>
    </section>

    <!-- Plans Container -->
    <section class="plans-container">
      <!-- Plan Semanal -->
      <div class="plan">
        <h2>Semanal</h2>
        <p>7 clases</p>
        <p>Vigencia de 7 días</p>
        <p class="price">$249 MXN</p>
        <button @click="comprarPlan('semanal')">Comprar ahora</button>
        <a href="#" @click.prevent="verInfo('semanal')" class="info-link">Ver más información*</a>
      </div>

      <!-- Plan Mensual - MEJOR OPCIÓN -->
      <div class="plan best-option">
        <div class="badge">MEJOR OPCIÓN</div>
        <h2>Mensual</h2>
        <p>28 clases</p>
        <p>Vigencia de 28 días</p>
        <p class="price">$849 MXN</p>
        <p>Ahorra $147 MXN</p>
        <button @click="comprarPlan('mensual')">Comprar ahora</button>
        <a href="#" @click.prevent="verInfo('mensual')" class="info-link">Ver más información*</a>
      </div>

      <!-- Plan Anual -->
      <div class="plan">
        <h2>Anual</h2>
        <p>365 clases</p>
        <p>Vigencia de 365 días</p>
        <p class="price">$9,999 MXN</p>
        <p>Ahorra $1,189 MXN</p>
        <button @click="comprarPlan('anual')">Comprar ahora</button>
        <a href="#" @click.prevent="verInfo('anual')" class="info-link">Ver más información*</a>
      </div>
    </section>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

interface Plan {
  nombre: string
  clases: number
  vigencia: string
  precio: number
  ahorro?: number
}

interface Planes {
  semanal: Plan
  mensual: Plan
  anual: Plan
}

export default defineComponent({
  name: 'PlanesView',
  data() {
    return {
      planes: {
        semanal: {
          nombre: 'Plan Semanal',
          clases: 7,
          vigencia: '7 días',
          precio: 249
        },
        mensual: {
          nombre: 'Plan Mensual',
          clases: 28,
          vigencia: '28 días',
          precio: 849,
          ahorro: 147
        },
        anual: {
          nombre: 'Plan Anual',
          clases: 365,
          vigencia: '365 días',
          precio: 9999,
          ahorro: 1189
        }
      } as Planes
    }
  },
  methods: {
    comprarPlan(tipoPlan: keyof Planes) {
      const plan = this.planes[tipoPlan]
      console.log('Comprando plan:', plan)
      alert(`¡Has seleccionado el ${plan.nombre}!\nPrecio: $${plan.precio} MXN`)
      // this.$router.push('/pagos')
    },
    
    verInfo(tipoPlan: keyof Planes) {
      const plan = this.planes[tipoPlan]
      console.log('Ver información de:', plan)
      alert(`Información del ${plan.nombre}:\n\n` +
            `✓ ${plan.clases} clases\n` +
            `✓ Vigencia: ${plan.vigencia}\n` +
            `✓ Precio: $${plan.precio} MXN` +
            (plan.ahorro ? `\n✓ Ahorras: $${plan.ahorro} MXN` : ''))
    }
  }
})
</script>

<style scoped>
.planes-view {
  margin: 0;
  padding: 0;
  font-family: Arial, Helvetica, sans-serif;
  background-color: #000;
  color: white;
  min-height: 100vh;
}

/* Hero Section */
.hero {
  position: relative;
  text-align: center;
  padding: 150px 20px;
  overflow: hidden;
}

.hero::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: url('/Pilates-Kensington-London.jpg') center/cover no-repeat;
  filter: brightness(0.4);
  z-index: -1;
}

.hero h1 {
  font-size: 60px;
  margin: 0;
  font-weight: bold;
}

.hero p {
  font-size: 22px;
  margin-top: 20px;
}

/* Plans Container */
.plans-container {
  display: flex;
  justify-content: center;
  gap: 40px;
  margin: 50px 0;
  padding: 0 20px;
}

.plan {
  background: #111;
  border: 3px solid #222;
  width: 320px;
  padding: 30px;
  text-align: center;
  border-radius: 10px;
}

.plan.best-option {
  border-color: #f4b43a;
  position: relative;
}

.badge {
  background: #f4b43a;
  color: black;
  padding: 10px 0;
  font-weight: bold;
  position: absolute;
  top: -20px;
  left: 0;
  right: 0;
}

.plan h2 {
  font-size: 32px;
  margin-top: 20px;
}

.plan p {
  margin: 12px 0;
  font-size: 16px;
  color: #ccc;
}

.price {
  font-size: 22px;
  font-weight: bold;
  margin-top: 15px;
  color: white !important;
}

.plan button {
  margin-top: 20px;
  padding: 12px 20px;
  font-size: 16px;
  background: #f4b43a;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  color: black;
  font-weight: bold;
}

.plan button:hover {
  opacity: 0.9;
  transform: scale(1.02);
  transition: all 0.3s ease;
}

.info-link {
  margin-top: 15px;
  display: block;
  color: #999;
  text-decoration: none;
  font-size: 14px;
}

.info-link:hover {
  color: #f4b43a;
}

/* Responsive */
@media (max-width: 768px) {
  .hero h1 {
    font-size: 36px;
  }
  
  .plans-container {
    flex-direction: column;
    align-items: center;
  }
}
</style>