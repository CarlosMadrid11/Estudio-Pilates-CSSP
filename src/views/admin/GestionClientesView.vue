<template>
  <div>
    <div class="gestion-clientes-view">
      <div class="container">
        <!-- ESTADÍSTICAS -->
        <div class="stats">
          <div class="stat-card">
            <span class="stat-number">{{ totalClientes }}</span>
            <span class="stat-label">Total Clientes</span>
          </div>
          <div class="stat-card">
            <span class="stat-number">{{ clientesActivos }}</span>
            <span class="stat-label">Con Paquetes Activos</span>
          </div>
          <div class="stat-card">
            <span class="stat-number">{{ clientesSinPaquetes }}</span>
            <span class="stat-label">Sin Paquetes</span>
          </div>
        </div>

        <div class="card">
          <h1>📋 Gestión de Clientes</h1>

          <!-- FILTROS -->
          <div class="filters">
            <input 
              type="text" 
              v-model="busqueda"
              placeholder="🔍 Buscar por nombre, teléfono o email..."
            >
            <select v-model="filtroEstado">
              <option value="todos">Todos</option>
              <option value="activos">Con paquetes activos</option>
              <option value="sin_paquetes">Sin paquetes</option>
            </select>
          </div>

          <!-- LOADING -->
          <div v-if="cargando" class="loading">
            <div class="spinner"></div>
            <p>Cargando clientes...</p>
          </div>

          <!-- SIN CLIENTES -->
          <div v-else-if="clientesFiltrados.length === 0" class="no-clientes">
            <p>😔 No se encontraron clientes</p>
          </div>

          <!-- TABLA -->
          <div v-else>
            <div class="table-header">
              <span style="width: 30%;">Nombre</span>
              <span style="width: 20%;">Email</span>
              <span style="width: 15%;">Teléfono</span>
              <span style="width: 15%;">Paquetes</span>
              <span style="width: 10%;">Clases</span>
              <span style="width: 10%;">Acciones</span>
            </div>

            <div 
              v-for="cliente in clientesFiltrados" 
              :key="cliente.id"
              class="table-row"
            >
              <span style="width: 30%;">{{ cliente.nombre_completo }}</span>
              <span style="width: 20%;" class="email">{{ cliente.email }}</span>
              <span style="width: 15%;">{{ cliente.telefono }}</span>
              <span style="width: 15%;">
                <span 
                  :class="[
                    'badge', 
                    cliente.paquetes_activos > 0 ? 'badge-green' : 'badge-gray'
                  ]"
                >
                  {{ cliente.paquetes_activos }} activo(s)
                </span>
              </span>
              <span style="width: 10%;">
                <strong>{{ cliente.clases_disponibles }}</strong>
              </span>
              <span class="action-icons" style="width: 10%;">
                <button @click="verDetalles(cliente.id)" title="Ver detalles">
                  👁️
                </button>
              </span>
            </div>
          </div>

          <p class="total-results">
            Mostrando {{ clientesFiltrados.length }} de {{ totalClientes }} clientes
          </p>
        </div>
      </div>

      <!-- MODAL DE DETALLES -->
      <Teleport to="body">
        <div v-if="modalAbierto && clienteSeleccionado" class="modal" @click.self="cerrarModal">
          <div class="modal-content">
            <button class="btn-close" @click="cerrarModal">✕</button>
            
            <h2>👤 Detalles del Cliente</h2>
            
            <!-- INFO PERSONAL -->
            <div class="info-section">
              <h3>Información Personal</h3>
              <div class="info-grid">
                <div class="info-item">
                  <span class="label">Nombre:</span>
                  <span class="value">{{ clienteSeleccionado.nombre_completo }}</span>
                </div>
                <div class="info-item">
                  <span class="label">Email:</span>
                  <span class="value">{{ clienteSeleccionado.email }}</span>
                </div>
                <div class="info-item">
                  <span class="label">Teléfono:</span>
                  <span class="value">{{ clienteSeleccionado.telefono }}</span>
                </div>
                <div class="info-item">
                  <span class="label">Dirección:</span>
                  <span class="value">{{ clienteSeleccionado.direccion }}</span>
                </div>
              </div>
            </div>

            <!-- PAQUETES -->
            <div class="info-section">
              <h3>💼 Paquetes ({{ clienteSeleccionado.paquetes.length }})</h3>
              
              <div v-if="clienteSeleccionado.paquetes.length === 0" class="empty-state">
                <p>Este cliente no tiene paquetes registrados</p>
              </div>
              
              <div v-else class="paquetes-lista">
                <div 
                  v-for="paquete in clienteSeleccionado.paquetes" 
                  :key="paquete.id"
                  class="paquete-card"
                  :class="{ 'paquete-inactivo': !paquete.activo }"
                >
                  <div class="paquete-header">
                    <span class="paquete-nombre">{{ paquete.nombre }}</span>
                    <span 
                      :class="[
                        'badge', 
                        paquete.activo ? 'badge-green' : 'badge-gray'
                      ]"
                    >
                      {{ paquete.activo ? 'Activo' : 'Inactivo' }}
                    </span>
                  </div>
                  <div class="paquete-info">
                    <div class="paquete-stat">
                      <span class="stat-label">Clases:</span>
                      <span class="stat-value">
                        {{ paquete.clases_restantes }} / {{ paquete.clases_totales }}
                      </span>
                    </div>
                    <div class="paquete-stat">
                      <span class="stat-label">Comprado:</span>
                      <span class="stat-value">{{ formatearFecha(paquete.fecha_compra) }}</span>
                    </div>
                    <div class="paquete-stat">
                      <span class="stat-label">Vence:</span>
                      <span class="stat-value">{{ formatearFecha(paquete.fecha_vencimiento) }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- RESERVAS -->
            <div class="info-section">
              <h3>📅 Últimas Reservas ({{ clienteSeleccionado.reservas.length }})</h3>
              
              <div v-if="clienteSeleccionado.reservas.length === 0" class="empty-state">
                <p>Este cliente no tiene reservas registradas</p>
              </div>
              
              <div v-else class="reservas-lista">
                <div 
                  v-for="reserva in clienteSeleccionado.reservas" 
                  :key="reserva.id"
                  class="reserva-card"
                >
                  <div class="reserva-fecha">
                    <span class="fecha-dia">{{ formatearFechaCompleta(reserva.fecha) }}</span>
                    <span class="fecha-hora">
                      {{ reserva.hora_inicio.substring(0, 5) }} - {{ reserva.hora_fin.substring(0, 5) }}
                    </span>
                  </div>
                  <div class="reserva-estado">
                    <span 
                      :class="[
                        'badge',
                        reserva.estado === 'confirmada' ? 'badge-green' :
                        reserva.estado === 'cancelada' ? 'badge-red' :
                        'badge-gray'
                      ]"
                    >
                      {{ reserva.estado }}
                    </span>
                    <span 
                      v-if="reserva.asistio !== null"
                      :class="[
                        'badge',
                        reserva.asistio ? 'badge-green' : 'badge-red'
                      ]"
                    >
                      {{ reserva.asistio ? '✅ Asistió' : '❌ No asistió' }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- BOTONES -->
            <div class="modal-buttons">
              <button class="btn-primary" @click="cerrarModal">
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </Teleport>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useGestionClientes } from '@/composables/useGestionClientes'

const {
  cargando,
  busqueda,
  filtroEstado,
  clientesFiltrados,
  totalClientes,
  clientesActivos,
  clientesSinPaquetes,
  clienteSeleccionado,
  modalAbierto,
  verDetalles,
  cerrarModal,
  formatearFecha,
  formatearFechaCompleta
} = useGestionClientes()
</script>

<style scoped>
/* ============================================
   ESTILOS GENERALES
   ============================================ */

.gestion-clientes-view {
  width: 100%;
  min-height: 100vh;
  background: linear-gradient(135deg, #66ea99 0%, #b7ecdc 100%);
  padding: 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

/* ============================================
   ESTADÍSTICAS
   ============================================ */

.stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: white;
  padding: 25px;
  border-radius: 15px;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stat-number {
  font-size: 36px;
  font-weight: 700;
  color: #667eea;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
  color: #666;
  text-align: center;
}

/* ============================================
   CARD PRINCIPAL
   ============================================ */

.card {
  background: white;
  padding: 40px;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

h1 {
  margin: 0 0 30px 0;
  font-size: 28px;
  font-weight: bold;
  color: #667eea;
}

/* ============================================
   FILTROS
   ============================================ */

.filters {
  display: flex;
  gap: 15px;
  margin-bottom: 30px;
  flex-wrap: wrap;
}

.filters input,
.filters select {
  flex: 1;
  min-width: 200px;
  background: #f8f9fa;
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  color: #333;
  font-size: 14px;
  transition: border-color 0.3s;
}

.filters input:focus,
.filters select:focus {
  outline: none;
  border-color: #667eea;
}

/* ============================================
   LOADING
   ============================================ */

.loading {
  text-align: center;
  padding: 60px 20px;
}

.spinner {
  width: 50px;
  height: 50px;
  margin: 0 auto 20px;
  border: 5px solid #f3f3f3;
  border-top: 5px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading p {
  color: #666;
}

.no-clientes {
  text-align: center;
  padding: 60px 20px;
  color: #999;
  font-size: 16px;
}

/* ============================================
   TABLA
   ============================================ */

.table-header,
.table-row {
  display: flex;
  justify-content: space-between;
  padding: 16px 0;
  border-bottom: 1px solid #e0e0e0;
  font-size: 14px;
  align-items: center;
}

.table-header {
  font-weight: 700;
  color: #667eea;
  border-bottom: 2px solid #667eea;
}

.table-row {
  transition: background 0.3s;
}

.table-row:hover {
  background: #f8f9fa;
}

.email {
  color: #666;
  font-size: 13px;
}

.badge {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  display: inline-block;
}

.badge-green {
  background: #d4edda;
  color: #155724;
}

.badge-yellow {
  background: #fff3cd;
  color: #856404;
}

.badge-red {
  background: #f8d7da;
  color: #721c24;
}

.badge-gray {
  background: #e9ecef;
  color: #495057;
}

.action-icons button {
  background: none;
  border: 2px solid #667eea;
  color: #667eea;
  padding: 6px 12px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.3s;
}

.action-icons button:hover {
  background: #667eea;
  color: white;
  transform: scale(1.1);
}

.total-results {
  margin-top: 20px;
  text-align: center;
  color: #999;
  font-size: 14px;
}

/* ============================================
   MODAL
   ============================================ */

.modal {
  display: flex;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  z-index: 1000;
  animation: fadeIn 0.3s;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-content {
  position: relative;
  background: white;
  padding: 40px;
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s;
}

@keyframes slideUp {
  from {
    transform: translateY(50px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.btn-close {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 40px;
  height: 40px;
  padding: 0;
  background: #e0e0e0;
  color: #666;
  font-size: 24px;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-close:hover {
  background: #d0d0d0;
  transform: rotate(90deg);
}

.modal h2 {
  color: #667eea;
  margin-bottom: 30px;
  padding-right: 50px;
  font-size: 24px;
}

/* ============================================
   SECCIONES DE INFO
   ============================================ */

.info-section {
  margin-bottom: 30px;
}

.info-section h3 {
  color: #667eea;
  margin-bottom: 15px;
  font-size: 18px;
  border-bottom: 2px solid #e0e0e0;
  padding-bottom: 10px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.label {
  font-size: 12px;
  color: #999;
  font-weight: 600;
  text-transform: uppercase;
}

.value {
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

.empty-state {
  text-align: center;
  padding: 30px;
  color: #999;
  background: #f8f9fa;
  border-radius: 10px;
}

/* ============================================
   PAQUETES
   ============================================ */

.paquetes-lista {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.paquete-card {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
  border-left: 4px solid #667eea;
}

.paquete-inactivo {
  opacity: 0.6;
  border-left-color: #999;
}

.paquete-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.paquete-nombre {
  font-size: 16px;
  font-weight: 700;
  color: #333;
}

.paquete-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
}

.paquete-stat {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

/* ============================================
   RESERVAS
   ============================================ */

.reservas-lista {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.reserva-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f8f9fa;
  padding: 15px;
  border-radius: 10px;
  border-left: 4px solid #667eea;
}

.reserva-fecha {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.fecha-dia {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  text-transform: capitalize;
}

.fecha-hora {
  font-size: 13px;
  color: #666;
}

.reserva-estado {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

/* ============================================
   BOTONES MODAL
   ============================================ */

.modal-buttons {
  margin-top: 30px;
  display: flex;
  justify-content: center;
}

.btn-primary {
  padding: 14px 40px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

/* ============================================
   RESPONSIVE
   ============================================ */

@media (max-width: 768px) {
  .stats {
    grid-template-columns: 1fr;
  }

  .card {
    padding: 20px;
  }

  .filters {
    flex-direction: column;
  }

  .filters input,
  .filters select {
    width: 100%;
  }

  .table-header,
  .table-row {
    font-size: 12px;
    padding: 12px 0;
  }

  .modal-content {
    padding: 25px;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }
}
</style>