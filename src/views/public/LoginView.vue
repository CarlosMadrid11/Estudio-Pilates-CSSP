<template>
  <div>


    <div class="login-view">
      <!-- Contenedor del formulario de login -->
      <div class="login-container">
        <div class="form-box">
          <h3>Usuario</h3>
          <input 
            v-model="usuario" 
            type="text" 
            class="input-field" 
            placeholder="Introduce tu usuario"
            @keyup.enter="iniciarSesion"
          >

          <h3>Contraseña</h3>
          <input 
            v-model="password" 
            type="password" 
            class="input-field" 
            placeholder="Introduce tu contraseña"
            @keyup.enter="iniciarSesion"
          >

          <button @click="iniciarSesion" class="btn">Iniciar sesión</button>

          <div class="link">
            ¿No tienes una cuenta? <router-link to="/registrarse">Regístrate aquí</router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">

import { ref } from 'vue'

// Estado para el formulario
const usuario = ref('')
const password = ref('')

const iniciarSesion = () => {
  if (!usuario.value || !password.value) {
    alert('Por favor completa todos los campos')
    return
  }

  console.log('Iniciando sesión con:', {
    usuario: usuario.value,
    password: password.value
  })

  // Aquí conectarías con tu backend
  alert(`Bienvenido ${usuario.value}!`)
  
  // Redirigir después del login
  // router.push('/')
}
</script>

<style scoped>
.login-view {
  margin: 0;
  padding: 0;
  font-family: Arial, Helvetica, sans-serif;
  background: #eeefb6;
  min-height: 100vh;
}

/* Contenedor principal del login */
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 20px;
}

.form-box {
  width: 400px;
  padding: 40px 40px 60px 40px;
  background: #3d3d3d;
  border: 2px solid #000;
  box-sizing: border-box;
  color: white;
  border-radius: 8px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

h3 {
  font-weight: normal;
  margin-bottom: 8px;
  font-size: 16px;
}

/* Inputs */
.input-field {
  width: 100%;
  padding: 12px;
  background: #353535;
  border: none;
  color: white;
  margin-bottom: 25px;
  font-size: 14px;
  border-radius: 4px;
}

.input-field::placeholder {
  color: #999;
}

.input-field:focus {
  outline: none;
  background: #404040;
}

/* Botón */
.btn {
  width: 60%;
  display: block;
  margin: 20px auto;
  padding: 15px 0;
  text-align: center;
  background: white;
  color: black;
  border: none;
  cursor: pointer;
  font-size: 17px;
  font-weight: 600;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.btn:hover {
  background: #f0f0f0;
  transform: scale(1.02);
}

.btn:active {
  transform: scale(0.98);
}

.link {
  text-align: center;
  margin-top: 20px;
  font-size: 14px;
  color: #ccc;
}

.link a {
  color: #49a7ff;
  text-decoration: none;
  font-weight: 500;
}

.link a:hover {
  text-decoration: underline;
}

/* Responsive */
@media (max-width: 500px) {
  .form-box {
    width: 100%;
    max-width: 400px;
    padding: 30px 20px 40px 20px;
  }
  
  .btn {
    width: 80%;
  }
}
</style>