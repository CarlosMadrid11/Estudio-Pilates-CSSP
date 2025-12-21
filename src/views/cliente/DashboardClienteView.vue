<template>
  <div>
    <NavBarLogueadoView />
  
    <div class="dashboard-cliente-view">
      <div class="container">

        <!-- Información personal -->
        <div class="card">
          <h2>Información Personal</h2>
          <div class="info-item"><strong>Nombre:</strong> Juan Pérez</div>
          <div class="info-item"><strong>Correo:</strong> juanperez@gmail.com</div>
          <div class="info-item"><strong>Teléfono:</strong> 55-1234-5678</div>
        </div>

        <!-- Saldo de clases -->
        <div class="card">
          <h2>Saldo de Clases</h2>
          <div class="info-item"><strong>Paquete Actual:</strong> Mensual</div>
          <div class="info-item"><strong>Clases Disponibles:</strong> 5</div>
          <div class="info-item"><strong>Vigencia:</strong> 15 Feb 2025</div>
        </div>

        <!-- Grid con dos tablas -->
        <div class="grid">

          <!-- Próximas Reservas -->
          <div class="card">
            <h2>Próximas Reservas</h2>
            <table>
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Hora</th>
                  <th>Sala</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>12 Feb 2025</td>
                  <td>10:00 AM</td>
                  <td>Salon A</td>
                </tr>
                <tr>
                  <td>15 Feb 2025</td>
                  <td>12:00 PM</td>
                  <td>Salon B</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Historial -->
          <div class="card">
            <h2>Historial de Clases</h2>
            <table>
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Hora</th>
                  <th>Instructor(a)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>05 Feb 2025</td>
                  <td>09:00 AM</td>
                  <td>Mariana</td>
                </tr>
                <tr>
                  <td>08 Feb 2025</td>
                  <td>10:00 AM</td>
                  <td>Paola</td>
                </tr>
              </tbody>
            </table>
          </div>

        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import NavBarLogueadoView from '@/ComponentesReutilizables/NavBarLogueadoView.vue'
</script>

<style scoped>
.dashboard-cliente-view {
  background: #2C2C2C;
  min-height: 100vh;
  padding: 40px 20px;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
}

/* Cards */
.card {
  background: #3A3A3A;
  border-radius: 8px;
  padding: 30px;
  margin-bottom: 20px;
  border: 1px solid #4A4A4A;
}

h2 {
  color: #FFBB41;
  font-size: 22px;
  margin: 0 0 20px 0;
}

/* Info Items */
.info-item {
  padding: 10px 0;
  border-bottom: 1px solid #4A4A4A;
  font-size: 15px;
  color: white;
}

.info-item:last-child {
  border-bottom: none;
}

.info-item strong {
  color: #D1D5DB;
  margin-right: 10px;
}

/* Grid for tables */
.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-top: 20px;
}

/* Tables */
table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 15px;
}

thead {
  background: #2C2C2C;
}

th {
  color: #FFBB41;
  text-align: left;
  padding: 12px;
  font-weight: bold;
  font-size: 14px;
}

td {
  padding: 12px;
  border-bottom: 1px solid #4A4A4A;
  font-size: 14px;
  color: #D1D5DB;
}

tbody tr:last-child td {
  border-bottom: none;
}

tbody tr:hover {
  background: #454545;
}

/* Responsive */
@media (max-width: 768px) {
  .grid {
    grid-template-columns: 1fr;
  }
  
  .card {
    padding: 20px;
  }
}
</style>