import { defineStore } from 'pinia'

export type UserRole = 'guest' | 'cliente' | 'instructor' | 'admin'

interface User {
  id: string
  email: string
  role: UserRole
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
    role: 'guest' as UserRole,
    isAuthenticated: false
  }),

  actions: {
    loginMock(role: UserRole) {
      this.user = {
        id: 'mock-id',
        email: `${role}@correo.com`,
        role
      }

      this.role = role
      this.isAuthenticated = role !== 'guest'
    },

    logout() {
      this.user = null
      this.role = 'guest'
      this.isAuthenticated = false
    }
  }
})
