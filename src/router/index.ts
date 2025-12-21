import { createRouter, createWebHistory } from 'vue-router'

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

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // Public
    {
      path: '/',
      name: 'landing',
      component: LandingPageView
    },
    {
      path: '/planes',
      name: 'planes',
      component: PlanesView
    },
    {
      path: '/ayuda',
      name: 'ayuda',
      component: AyudaView
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView
    },
    {
      path: '/registro',
      name: 'registro',
      component: RegistrarseView
    },

    // Cliente
    {
      path: '/dashboard',
      name: 'dashboard-cliente',
      component: DashboardClienteView
    },
    {
      path: '/mis-reservas',
      name: 'mis-reservas',
      component: MisReservasView
    },
    {
      path: '/calendario-cliente',
      name: 'calendario-cliente',
      component: CalendarioClienteView
    },
    {
      path: '/metodo-pago',
      name: 'metodo-pago',
      component: MetodoPagoView
    },

    // Instructor
    {
      path: '/calendario-instructor',
      name: 'calendario-instructor',
      component: CalendarioInstructorView
    },
    {
      path: '/registro-asistencia',
      name: 'registro-asistencia',
      component: RegistroAsistenciaView
    },

    // Admin
    {
      path: '/gestion-clientes',
      name: 'gestion-clientes',
      component: GestionClientesView
    },
    {
      path: '/reportes-ventas',
      name: 'reportes-ventas',
      component: ReportesVentasView
    }
  ]
})

export default router
