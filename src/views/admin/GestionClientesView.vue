<template>
  <div>
    <NavBarAdministradorView />

    <div class="gestion-clientes-view">
      <div class="container">
        <div class="card">

          <h1>Gestión de Clientes</h1>

          <div class="filters">
            <input type="text" placeholder="Buscar por nombre, teléfono o email">
            <select>
              <option>Todos los paquetes</option>
              <option>Activos</option>
              <option>Por vencer</option>
              <option>Vencidos</option>
              <option>Sin paquete</option>
            </select>

            <select>
              <option>Ordenar A-Z</option>
              <option>Fecha de registro</option>
              <option>Clases restantes</option>
            </select>
          </div>

          <div class="table-header">
            <span style="width: 20%;">Nombre</span>
            <span style="width: 20%;">Teléfono</span>
            <span style="width: 20%;">Paquete</span>
            <span style="width: 15%;">Clases</span>
            <span style="width: 15%;">Vence</span>
            <span style="width: 10%;">Acciones</span>
          </div>

          <div class="table-row">
            <span style="width: 20%;">Ana López</span>
            <span style="width: 20%;">667-123-4567</span>
            <span style="width: 20%;">Mensual</span>
            <span style="width: 15%;">12</span>
            <span style="width: 15%;"><span class="badge badge-green">20 Ene</span></span>
            <span class="action-icons" style="width: 10%;">
              <button>👁️</button>
              <button>📝</button>
            </span>
          </div>

          <div class="table-row">
            <span style="width: 20%;">Carlos Soto</span>
            <span style="width: 20%;">667-445-3322</span>
            <span style="width: 20%;">Semanal</span>
            <span style="width: 15%;">2</span>
            <span style="width: 15%;"><span class="badge badge-yellow">Por vencer</span></span>
            <span class="action-icons" style="width: 10%;">
              <button>👁️</button>
              <button>📝</button>
            </span>
          </div>

          <div class="table-row">
            <span style="width: 20%;">Lucía Pérez</span>
            <span style="width: 20%;">667-998-2211</span>
            <span style="width: 20%;">—</span>
            <span style="width: 15%;">0</span>
            <span style="width: 15%;"><span class="badge badge-gray">Sin paquete</span></span>
            <span class="action-icons" style="width: 10%;">
              <button>👁️</button>
              <button>📝</button>
            </span>
          </div>

          <button class="add-btn">+ Registrar Nuevo Cliente</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import NavBarAdministradorView from '@/ComponentesReutilizables/NavBarAdministradorView.vue'
</script>

<style scoped>
.gestion-clientes-view {
  width: 100%;
  min-height: 100vh;
  margin: 0;
  background: #1E1E1E;
  font-family: Arial, sans-serif;
  color: white;
}

.container {
  display: flex;
  justify-content: center;
  margin-top: 40px;
  padding: 0 20px;
}

.card {
  width: 75%;
  max-width: 1100px;
  min-width: 300px;
  background: #2C2C2C;
  padding: 40px;
  border-radius: 5px;
}

h1 {
  margin: 0 0 30px 0;
  font-size: 24px;
  font-weight: bold;
}

/* Buscador y Filtros */
.filters {
  display: flex;
  gap: 15px;
  margin-bottom: 25px;
  flex-wrap: wrap;
}

.filters input, .filters select {
  background: #3A3A3A;
  padding: 10px 12px;
  border: none;
  border-radius: 3px;
  color: white;
  font-size: 14px;
}

/* Tabla */
.table-header, .table-row {
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid #444;
  font-size: 14px;
  align-items: center;
}

.table-header {
  font-weight: bold;
}

.badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  color: #000;
  font-weight: bold;
}

.badge-green { background: #4CAF50; }
.badge-yellow { background: #FFBB41; }
.badge-red { background: #F44336; }
.badge-gray { background: #aaa; }

.action-icons button {
  background: none;
  border: 1px solid #FFBB41;
  color: #FFBB41;
  padding: 4px 8px;
  border-radius: 3px;
  cursor: pointer;
  margin-left: 5px;
  font-size: 12px;
}

.action-icons button:hover {
  background: #FFBB41;
  color: black;
}

.add-btn {
  margin-top: 25px;
  background: #FFBB41;
  padding: 12px 18px;
  border: none;
  color: #000;
  font-weight: bold;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  display: inline-block;
}

.add-btn:hover {
  background: #ffc961;
  cursor: pointer;
}
</style>