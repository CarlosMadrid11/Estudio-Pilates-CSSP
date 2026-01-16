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
  isInitialized: boolean
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
        const { data: authData, error: authError } =
          await supabase.auth.signInWithPassword({
            email: email.trim().toLowerCase(),
            password
          })

        if (authError) throw new Error(authError.message)
        if (!authData.user) throw new Error('No se recibió información del usuario')

        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authData.user.id)
          .single()

        if (profileError || !profileData) {
          throw new Error('No se encontró el perfil del usuario')
        }

        const user: User = {
          id: authData.user.id,
          email: authData.user.email || email,
          nombre: profileData.nombre_completo,
          telefono: profileData.telefono,
          role: profileData.rol as UserRole
        }

        this.setUser(user)
        return { success: true, user }

      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Error desconocido'
        return { success: false, error: message }
      }
    },

    /**
     * Logout
     */
    async logout() {
      try {
        await supabase.auth.signOut()
      } catch (error) {
        console.error('Error logout:', error)
      } finally {
        this.user = null
        this.role = 'guest'
        this.isAuthenticated = false
        this.clearSession()
      }
    },

    /**
     * Setear usuario autenticado
     */
    setUser(user: User) {
      this.user = user
      this.role = user.role
      this.isAuthenticated = true
      this.saveSession()
    },

    /**
     * Restaurar sesión (una sola vez)
     */
    async restoreSession() {
      if (this.isInitialized) return this.isAuthenticated

      try {
        const { data: { session }, error } =
          await supabase.auth.getSession()

        if (error || !session) {
          this.isInitialized = true
          return false
        }

        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()

        if (profileError || !profileData) {
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
        return true

      } catch (error) {
        await this.logout()
        this.isInitialized = true
        return false
      }
    },

    /**
     * Persistencia local (backup)
     */
    saveSession() {
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            user: this.user,
            role: this.role,
            isAuthenticated: this.isAuthenticated,
            timestamp: Date.now()
          })
        )
      } catch (error) {
        console.error('Error guardar sesión:', error)
      }
    },

    clearSession() {
      try {
        localStorage.removeItem(STORAGE_KEY)
      } catch (error) {
        console.error('Error limpiar sesión:', error)
      }
    },

    /**
     * Inicialización global (App.vue)
     */
    async init() {
      await this.restoreSession()

      supabase.auth.onAuthStateChange((event) => {
        if (event === 'SIGNED_OUT') {
          this.user = null
          this.role = 'guest'
          this.isAuthenticated = false
          this.clearSession()
        }
      })
    }
  }
})
