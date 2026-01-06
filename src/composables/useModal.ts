// src/composables/useModal.ts

import { ref } from 'vue'
import { useRouter } from 'vue-router'

export interface ModalConfig {
  type?: 'info' | 'success' | 'warning' | 'error' | 'confirm'
  title?: string
  message?: string
  icon?: string
  confirmText?: string
  cancelText?: string
  showCancel?: boolean
  redirectTo?: string
  redirectDelay?: number
}

export function useModal() {
  const router = useRouter()
  
  const isOpen = ref(false)
  const config = ref<ModalConfig>({
    type: 'info',
    title: '',
    message: '',
    icon: 'ℹ️',
    confirmText: 'Aceptar',
    cancelText: 'Cancelar',
    showCancel: false,
    redirectTo: undefined,
    redirectDelay: 2000
  })

  // Resolver/Rechazar promesa
  let resolvePromise: ((value: boolean) => void) | null = null

  // Abrir modal
  const openModal = (newConfig: ModalConfig): Promise<boolean> => {
    config.value = { ...config.value, ...newConfig }
    isOpen.value = true

    return new Promise((resolve) => {
      resolvePromise = resolve
    })
  }

  // Cerrar modal
  const closeModal = () => {
    isOpen.value = false
    if (resolvePromise) {
      resolvePromise(false)
      resolvePromise = null
    }
  }

  // Confirmar
  const confirm = () => {
    isOpen.value = false
    if (resolvePromise) {
      resolvePromise(true)
      resolvePromise = null
    }

    // Si hay redirección configurada
    if (config.value.redirectTo) {
      setTimeout(() => {
        router.push(config.value.redirectTo!)
      }, config.value.redirectDelay || 0)
    }
  }

  // Cancelar
  const cancel = () => {
    closeModal()
  }

  // ============================================
  // MÉTODOS DE CONVENIENCIA
  // ============================================

  // Modal de información
  const showInfo = (title: string, message: string, options?: Partial<ModalConfig>) => {
    return openModal({
      type: 'info',
      icon: 'ℹ️',
      title,
      message,
      showCancel: false,
      ...options
    })
  }

  // Modal de éxito
  const showSuccess = (title: string, message: string, options?: Partial<ModalConfig>) => {
    return openModal({
      type: 'success',
      icon: '✅',
      title,
      message,
      showCancel: false,
      ...options
    })
  }

  // Modal de advertencia
  const showWarning = (title: string, message: string, options?: Partial<ModalConfig>) => {
    return openModal({
      type: 'warning',
      icon: '⚠️',
      title,
      message,
      showCancel: false,
      ...options
    })
  }

  // Modal de error
  const showError = (title: string, message: string, options?: Partial<ModalConfig>) => {
    return openModal({
      type: 'error',
      icon: '❌',
      title,
      message,
      showCancel: false,
      ...options
    })
  }

  // Modal de confirmación
  const showConfirm = (title: string, message: string, options?: Partial<ModalConfig>) => {
    return openModal({
      type: 'confirm',
      icon: '❓',
      title,
      message,
      showCancel: true,
      confirmText: 'Confirmar',
      cancelText: 'Cancelar',
      ...options
    })
  }

  // Modal para redirigir a login (TU CASO ESPECÍFICO)
  const showLoginRequired = (message?: string) => {
    return openModal({
      type: 'warning',
      icon: '🔐',
      title: 'Inicio de sesión requerido',
      message: message || 'Para acceder a esta sección necesitas iniciar sesión. Serás redirigido al login.',
      confirmText: 'Ir a Login',
      showCancel: true,
      cancelText: 'Cancelar',
      redirectTo: '/login',
      redirectDelay: 500
    })
  }

  return {
    // Estado
    isOpen,
    config,
    
    // Métodos básicos
    openModal,
    closeModal,
    confirm,
    cancel,
    
    // Métodos de conveniencia
    showInfo,
    showSuccess,
    showWarning,
    showError,
    showConfirm,
    showLoginRequired
  }
}