import { defineStore } from 'pinia'

export type UserRole = 'guest' | 'cliente' | 'instructor' | 'admin'

interface User {
  id: string
  email: string
  nombre: string
  telefono?: string
  role: UserRole
}

interface AuthState {
  user: User | null
  role: UserRole
  isAuthenticated: boolean
}

const STORAGE_KEY = 'cssp_auth_session'

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    role: 'guest',
    isAuthenticated: false
  }),

  getters: {
    // Verificadores de rol
    isGuest: (state) => state.role === 'guest',
    isCliente: (state) => state.role === 'cliente',
    isInstructor: (state) => state.role === 'instructor',
    isAdmin: (state) => state.role === 'admin',

    // Información del usuario
    userName: (state) => state.user?.nombre || 'Invitado',
    userEmail: (state) => state.user?.email || '',
    userId: (state) => state.user?.id || '',

    // Verificador de autenticación
    hasAccess: (state) => (requiredRole: UserRole) => {
      if (!state.isAuthenticated) return false
      if (requiredRole === 'guest') return true
      
      // Admin tiene acceso a todo
      if (state.role === 'admin') return true
      
      // Verificar rol específico
      return state.role === requiredRole
    }
  },

  actions: {
    /**
     * Login Mock para desarrollo
     * Simula un login con diferentes roles
     */
    loginMock(role: UserRole) {
      if (role === 'guest') {
        this.logout()
        return
      }

      const mockUsers = {
        cliente: {
          id: 'cliente-001',
          email: 'cliente@cssp.com',
          nombre: 'Juan Pérez',
          telefono: '6671234567',
          role: 'cliente' as UserRole
        },
        instructor: {
          id: 'instructor-001',
          email: 'instructor@cssp.com',
          nombre: 'María García',
          telefono: '6677654321',
          role: 'instructor' as UserRole
        },
        admin: {
          id: 'admin-001',
          email: 'admin@cssp.com',
          nombre: 'Carlos Admin',
          telefono: '6679876543',
          role: 'admin' as UserRole
        }
      }

      const user = mockUsers[role]
      if (user) {
        this.setUser(user)
      }
    },

    /**
     * Establecer usuario autenticado
     */
    setUser(user: User) {
      this.user = user
      this.role = user.role
      this.isAuthenticated = true
      
      // Guardar en localStorage
      this.saveSession()
    },

    /**
     * Cerrar sesión
     */
    logout() {
      this.user = null
      this.role = 'guest'
      this.isAuthenticated = false
      
      // Limpiar localStorage
      this.clearSession()
    },

    /**
     * Guardar sesión en localStorage
     */
    saveSession() {
      try {
        const sessionData = {
          user: this.user,
          role: this.role,
          isAuthenticated: this.isAuthenticated,
          timestamp: Date.now()
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(sessionData))
      } catch (error) {
        console.error('Error al guardar sesión:', error)
      }
    },

    /**
     * Recuperar sesión desde localStorage
     */
    loadSession() {
      try {
        const sessionData = localStorage.getItem(STORAGE_KEY)
        if (!sessionData) return false

        const parsed = JSON.parse(sessionData)
        
        // Verificar que la sesión no tenga más de 7 días
        const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000
        const isExpired = Date.now() - parsed.timestamp > SEVEN_DAYS
        
        if (isExpired) {
          this.clearSession()
          return false
        }

        // Restaurar sesión
        this.user = parsed.user
        this.role = parsed.role
        this.isAuthenticated = parsed.isAuthenticated

        return true
      } catch (error) {
        console.error('Error al cargar sesión:', error)
        this.clearSession()
        return false
      }
    },

    /**
     * Limpiar sesión del localStorage
     */
    clearSession() {
      try {
        localStorage.removeItem(STORAGE_KEY)
      } catch (error) {
        console.error('Error al limpiar sesión:', error)
      }
    },

    /**
     * Inicializar store (llamar al iniciar la app)
     */
    init() {
      this.loadSession()
    }
  }
})