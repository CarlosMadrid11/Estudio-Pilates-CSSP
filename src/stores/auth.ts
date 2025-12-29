import { defineStore } from 'pinia'
import { supabase } from '@/lib/supabase'

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
  isInitialized: boolean // ← NUEVO: para evitar loops
}

const STORAGE_KEY = 'cssp_auth_session'

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    role: 'guest',
    isAuthenticated: false,
    isInitialized: false
  }),

  getters: {
    isGuest: (state) => state.role === 'guest',
    isCliente: (state) => state.role === 'cliente',
    isInstructor: (state) => state.role === 'instructor',
    isAdmin: (state) => state.role === 'admin',
    userName: (state) => state.user?.nombre || 'Invitado',
    userEmail: (state) => state.user?.email || '',
    userId: (state) => state.user?.id || '',
    hasAccess: (state) => (requiredRole: UserRole) => {
      if (!state.isAuthenticated) return false
      if (requiredRole === 'guest') return true
      if (state.role === 'admin') return true
      return state.role === requiredRole
    }
  },

  actions: {
    /**
     * Login con Supabase Auth
     */
    async login(email: string, password: string) {
      try {
        console.log('🔐 Login:', email)

        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password: password
        })

        if (authError) throw new Error(authError.message)
        if (!authData.user) throw new Error('No se recibió información del usuario')

        console.log('✅ Auth OK:', authData.user.id)

        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authData.user.id)
          .single()

        if (profileError || !profileData) {
          throw new Error('No se encontró el perfil del usuario')
        }

        console.log('✅ Profile OK')

        const user: User = {
          id: authData.user.id,
          email: authData.user.email || email,
          nombre: profileData.nombre_completo,
          telefono: profileData.telefono,
          role: profileData.rol as UserRole
        }

        this.setUser(user)
        console.log('✅✅✅ LOGIN COMPLETO')
        
        return { success: true, user }

      } catch (error) {
        console.error('❌ Error login:', error)
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
        return { success: false, error: errorMessage }
      }
    },

    /**
     * Logout
     */
    async logout() {
      try {
        console.log('🚪 Logout...')
        await supabase.auth.signOut()
      } catch (error) {
        console.error('❌ Error logout:', error)
      } finally {
        this.user = null
        this.role = 'guest'
        this.isAuthenticated = false
        this.clearSession()
        console.log('✅ Sesión cerrada')
      }
    },

    /**
     * Establecer usuario
     */
    setUser(user: User) {
      this.user = user
      this.role = user.role
      this.isAuthenticated = true
      this.saveSession()
    },

    /**
     * Recuperar sesión de Supabase (solo una vez)
     */
    async restoreSession() {
      // ✅ IMPORTANTE: Evitar llamadas múltiples
      if (this.isInitialized) {
        console.log('ℹ️ Store ya inicializado, saltando...')
        return this.isAuthenticated
      }

      try {
        console.log('🔄 Restaurando sesión...')

        const { data: { session }, error } = await supabase.auth.getSession()

        if (error || !session) {
          console.log('ℹ️ No hay sesión activa')
          this.isInitialized = true
          return false
        }

        console.log('✅ Sesión encontrada')

        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()

        if (profileError || !profileData) {
          console.error('❌ Error profile:', profileError)
          await this.logout()
          this.isInitialized = true
          return false
        }

        const user: User = {
          id: session.user.id,
          email: session.user.email || '',
          nombre: profileData.nombre_completo,
          telefono: profileData.telefono,
          role: profileData.rol as UserRole
        }

        this.setUser(user)
        this.isInitialized = true
        console.log('✅ Sesión restaurada:', user.email)
        
        return true

      } catch (error) {
        console.error('❌ Error restaurar sesión:', error)
        await this.logout()
        this.isInitialized = true
        return false
      }
    },

    /**
     * Guardar en localStorage (backup)
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
        console.error('Error guardar sesión:', error)
      }
    },

    /**
     * Limpiar localStorage
     */
    clearSession() {
      try {
        localStorage.removeItem(STORAGE_KEY)
      } catch (error) {
        console.error('Error limpiar sesión:', error)
      }
    },

    /**
     * Inicializar store (llamar SOLO UNA VEZ en App.vue)
     */
    async init() {
      console.log('🚀 Init Auth Store...')
      
      // ✅ SOLO restaurar sesión una vez
      await this.restoreSession()

      // ✅ Listener SIN llamar restoreSession (evita loops)
      supabase.auth.onAuthStateChange((event, session) => {
        console.log('🔔 Auth state change:', event)
        
        // NO llamar restoreSession aquí, solo actualizar estado básico
        if (event === 'SIGNED_OUT') {
          this.user = null
          this.role = 'guest'
          this.isAuthenticated = false
          this.clearSession()
        }
        // Para SIGNED_IN, el login() ya maneja el estado
      })
    },

    /**
     * Login Mock (mantener para desarrollo)
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
    }
  }
})