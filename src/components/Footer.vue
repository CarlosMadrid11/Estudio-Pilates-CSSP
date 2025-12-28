<template>
<footer class="footer">
<div class="footer-container">
    <!-- Logo -->
    <div class="footer-logo">
    <span class="logo-icon">🏋️‍♂️</span>
    <span class="logo-text">CSSP</span>
    </div>

    <!-- Texto informativo -->
    <div class="footer-info">
    <p class="info-text">
        Proyecto autodidacta desarrollado con fines educativos y de aprendizaje.
    </p>
    </div>

    <!-- Links -->
    <div class="footer-links">
    <a 
        href="https://github.com/CarlosMadrid11/Estudio-Pilates-CSSP" 
        target="_blank"
        rel="noopener noreferrer"
        class="github-link"
    >
        <svg class="github-icon" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
        </svg>
        Ver en GitHub
    </a>

    <router-link to="/ayuda" class="footer-link">
        Ayuda
    </router-link>
    </div>

    <!-- Copyright -->
    <div class="footer-copyright">
    <p>&copy; {{ currentYear }} CSSP. Proyecto educativo.</p>
    </div>
</div>
</footer>
</template>

<script setup lang="ts">
import { computed } from 'vue'

// Definir el nombre del componente (multi-word para ESLint)
// defineOptions es un macro, no se importa
defineOptions({
  name: 'AppFooter'
})

const currentYear = computed(() => new Date().getFullYear())
</script>

<style scoped>
.footer {
  width: 100%;
  background: linear-gradient(to bottom, #1f2937, #111827);
  color: #d1d5db;
  margin-top: auto;
  border-top: 1px solid #374151;
}

.footer-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2.5rem 1.5rem 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
}

/* Logo */
.footer-logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.5rem;
  font-weight: 800;
  color: #f1c40f;
}

.logo-icon {
  font-size: 1.75rem;
}

.logo-text {
  letter-spacing: 1px;
}

/* Info */
.footer-info {
  text-align: center;
  max-width: 600px;
}

.info-text {
  font-size: 0.875rem;
  color: #9ca3af;
  line-height: 1.5;
  margin: 0;
}

/* Links */
.footer-links {
  display: flex;
  align-items: center;
  gap: 2rem;
  flex-wrap: wrap;
  justify-content: center;
}

.github-link,
.footer-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #d1d5db;
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  transition: all 0.3s ease;
}

.github-link:hover,
.footer-link:hover {
  color: #f1c40f;
  background-color: rgba(241, 196, 15, 0.1);
}

.github-icon {
  width: 1.25rem;
  height: 1.25rem;
}

/* Copyright */
.footer-copyright {
  width: 100%;
  text-align: center;
  padding-top: 1rem;
  border-top: 1px solid #374151;
}

.footer-copyright p {
  font-size: 0.75rem;
  color: #6b7280;
  margin: 0;
}

/* Responsive */
@media (max-width: 640px) {
  .footer-container {
    padding: 2rem 1rem 1rem;
    gap: 1.25rem;
  }

  .footer-logo {
    font-size: 1.25rem;
  }

  .logo-icon {
    font-size: 1.5rem;
  }

  .info-text {
    font-size: 0.813rem;
  }

  .footer-links {
    gap: 1rem;
    flex-direction: column;
  }
}
</style>