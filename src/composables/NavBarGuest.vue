<template>
  <nav class="navbar-guest">
    <div class="navbar-container">
      <!-- Logo -->
      <div class="navbar-logo">
        <router-link to="/" class="logo-link">
          <span class="logo-icon">🏋️‍♂️</span>
          <span class="logo-text">CSSP</span>
        </router-link>
      </div>

      <!-- Enlaces principales -->
      <div class="navbar-links">
        <router-link to="/planes" class="nav-link">
          Planes
        </router-link>
        
        <router-link to="/ayuda" class="nav-link">
          Ayuda
        </router-link>
        
        <span class="nav-badge">
          Visitante
        </span>
      </div>

      <!-- Botón iniciar sesión -->
      <div class="navbar-actions">
        <router-link to="/login" class="btn-login">
          Iniciar sesión
        </router-link>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
// No se necesita lógica por ahora
// Este navbar es completamente estático para usuarios guest
</script>

<style scoped>
.navbar-guest {
  width: 100%;
  background-color: #f1c40f;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin: 0;
  padding: 0;
  position: sticky;
  top: 0;
  z-index: 1000;
}

.navbar-container {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 64px;
  padding: 0 24px;
}

/* Logo */
.navbar-logo {
  display: flex;
  align-items: center;
}

.logo-link {
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  color: #1a1a1a;
  font-size: 24px;
  font-weight: 800;
  padding: 8px 12px;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.logo-link:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.logo-icon {
  font-size: 28px;
}

.logo-text {
  font-weight: 800;
  letter-spacing: 1px;
}

/* Enlaces */
.navbar-links {
  display: flex;
  align-items: center;
  gap: 24px;
}

.nav-link {
  text-decoration: none;
  color: #1a1a1a;
  font-size: 16px;
  font-weight: 500;
  padding: 8px 16px;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.nav-link:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.nav-link.router-link-active {
  background-color: rgba(0, 0, 0, 0.1);
  font-weight: 600;
}

.nav-badge {
  color: #666;
  font-size: 14px;
  padding: 6px 12px;
  background-color: rgba(0, 0, 0, 0.05);
  border-radius: 20px;
  font-weight: 500;
}

/* Botón login */
.navbar-actions {
  display: flex;
  align-items: center;
}

.btn-login {
  background-color: white;
  color: #1a1a1a;
  font-weight: 600;
  padding: 10px 24px;
  border-radius: 8px;
  text-decoration: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  font-size: 15px;
}

.btn-login:hover {
  background-color: #f5f5f5;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.btn-login:active {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* Responsive */
@media (max-width: 768px) {
  .navbar-container {
    padding: 0 16px;
    height: 56px;
  }

  .navbar-links {
    gap: 12px;
  }

  .nav-link {
    font-size: 14px;
    padding: 6px 12px;
  }

  .nav-badge {
    display: none;
  }

  .logo-text {
    font-size: 20px;
  }

  .btn-login {
    padding: 8px 16px;
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  .navbar-links {
    gap: 8px;
  }

  .nav-link {
    padding: 6px 8px;
  }
}
</style>