import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import type { UserRole } from '@/stores/auth'

// Public
import LandingPageView from '@/views/public/LandingPageView.vue'
import PlanesView from '@/views/public/PlanesView.vue'
import AyudaView from '@/views/public/AyudaView.vue'
import LoginView from '@/views/public/LoginView.vue'
import RegistrarseView from '@/views/public/RegistrarseView.vue'

// Cliente
import DashboardClienteView from '@/views/cliente/DashboardClienteView.vue'
import MisReservasView from '@/views/cliente/MisReservasView.vue'
import CalendarioClienteView from '@/views/cliente/CalendarioClienteView.vue'
import MetodoPagoView from '@/views/cliente/MetodoPagoView.vue'

// Instructor
import CalendarioInstructorView from '@/views/instructor/CalendarioInstructorView.vue'
import RegistroAsistenciaView from '@/views/instructor/RegistroAsistenciaView.vue'

// Admin
import GestionClientesView from '@/views/admin/GestionClientesView.vue'
import ReportesVentasView from '@/views/admin/ReportesVentasView.vue'

// Testing
import AuthTestView from '@/views/AuthTestView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // Public
    {
      path: '/',
      name: 'landing',
      component: LandingPageView,
      meta: { requiresAuth: false, allowedRoles: ['guest', 'cliente', 'instructor', 'admin'] }
    },
    {
      path: '/planes',
      name: 'planes',
      component: PlanesView,
      meta: { requiresAuth: false, allowedRoles: ['guest', 'cliente', 'instructor', 'admin'] }
    },
    {
      path: '/ayuda',
      name: 'ayuda',
      component: AyudaView,
      meta: { requiresAuth: false, allowedRoles: ['guest', 'cliente', 'instructor', 'admin'] }
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { requiresAuth: false, allowedRoles: ['guest'], redirectIfAuth: true }
    },
    {
      path: '/registrarse',
      name: 'registrarse',
      component: RegistrarseView,
      meta: { requiresAuth: false, allowedRoles: ['guest'], redirectIfAuth: true }
    },

    // Cliente
    {
      path: '/dashboard-cliente',
      name: 'dashboard-cliente',
      component: DashboardClienteView,
      meta: { requiresAuth: true, allowedRoles: ['cliente', 'admin'] }
    },
    {
      path: '/mis-reservas',
      name: 'mis-reservas',
      component: MisReservasView,
      meta: { requiresAuth: true, allowedRoles: ['cliente', 'admin'] }
    },
    {
      path: '/calendario-cliente',
      name: 'calendario-cliente',
      component: CalendarioClienteView,
      meta: { requiresAuth: true, allowedRoles: ['cliente', 'admin'] }
    },
    {
      path: '/metodo-pago',
      name: 'metodo-pago',
      component: MetodoPagoView,
      meta: { requiresAuth: true, allowedRoles: ['cliente', 'admin'] }
    },

    // Instructor
    {
      path: '/calendario-instructor',
      name: 'calendario-instructor',
      component: CalendarioInstructorView,
      meta: { requiresAuth: true, allowedRoles: ['instructor', 'admin'] }
    },
    {
      path: '/registro-asistencia',
      name: 'registro-asistencia',
      component: RegistroAsistenciaView,
      meta: { requiresAuth: true, allowedRoles: ['instructor', 'admin'] }
    },

    // Admin
    {
      path: '/gestion-clientes',
      name: 'gestion-clientes',
      component: GestionClientesView,
      meta: { requiresAuth: true, allowedRoles: ['admin'] }
    },
    {
      path: '/reportes-ventas',
      name: 'reportes-ventas',
      component: ReportesVentasView,
      meta: { requiresAuth: true, allowedRoles: ['admin'] }
    },

    // Testing (accesible para todos durante desarrollo)
    {
      path: '/test-auth',
      name: 'test-auth',
      component: AuthTestView,
      meta: { requiresAuth: false, allowedRoles: ['guest', 'cliente', 'instructor', 'admin'] }
    }
  ]
})

// Navigation Guards - Protección de rutas
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  // Obtener metadata de la ruta
  const requiresAuth = to.meta.requiresAuth as boolean
  const allowedRoles = to.meta.allowedRoles as UserRole[]
  const redirectIfAuth = to.meta.redirectIfAuth as boolean
  
  const isAuthenticated = authStore.isAuthenticated
  const userRole = authStore.role

  // CASO 1: Ruta requiere NO estar autenticado (login, registro)
  if (redirectIfAuth && isAuthenticated) {
    console.log(`🚫 Ya estás autenticado como ${userRole}, redirigiendo...`)
    // Redirigir al dashboard según el rol
    const dashboards = {
      cliente: '/dashboard-cliente',
      instructor: '/calendario-instructor',
      admin: '/gestion-clientes',
      guest: '/'
    }
    next(dashboards[userRole])
    return
  }

  // CASO 2: Ruta requiere autenticación
  if (requiresAuth && !isAuthenticated) {
    console.log('🚫 Acceso denegado: No estás autenticado')
    next('/login')
    return
  }

  // CASO 3: Verificar si el rol tiene permiso
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    console.log(`🚫 Acceso denegado: Rol ${userRole} no permitido para esta ruta`)
    
    // Redirigir al dashboard correspondiente según el rol
    const dashboards = {
      cliente: '/dashboard-cliente',
      instructor: '/calendario-instructor',
      admin: '/gestion-clientes',
      guest: '/login'
    }
    
    next(dashboards[userRole])
    return
  }

  // CASO 4: Todo está bien, permitir acceso
  console.log(`✅ Acceso permitido a ${to.path} (rol: ${userRole})`)
  next()
})

export default router