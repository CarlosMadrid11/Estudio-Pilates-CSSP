<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="modelValue" class="modal-overlay" @click.self="handleClose">
        <Transition name="modal-scale">
          <div v-if="modelValue" class="modal-container" :class="modalClass">
            <!-- Close button -->
            <button 
              v-if="showClose" 
              class="modal-close" 
              @click="handleClose"
              aria-label="Cerrar"
            >
              ✕
            </button>

            <!-- Icon -->
            <div v-if="icon" class="modal-icon" :class="`icon-${type}`">
              {{ icon }}
            </div>

            <!-- Title -->
            <h2 v-if="title" class="modal-title">
              {{ title }}
            </h2>

            <!-- Content -->
            <div class="modal-content">
              <slot>
                <p v-if="message">{{ message }}</p>
              </slot>
            </div>

            <!-- Actions -->
            <div v-if="showActions" class="modal-actions">
              <button 
                v-if="showCancel"
                class="modal-btn modal-btn-cancel" 
                @click="handleCancel"
              >
                {{ cancelText }}
              </button>
              <button 
                class="modal-btn modal-btn-confirm" 
                :class="`btn-${type}`"
                @click="handleConfirm"
                :disabled="loading"
              >
                <span v-if="loading" class="spinner-small"></span>
                {{ loading ? loadingText : confirmText }}
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue'

// Props
interface Props {
  modelValue: boolean
  type?: 'info' | 'success' | 'warning' | 'error' | 'confirm'
  title?: string
  message?: string
  icon?: string
  confirmText?: string
  cancelText?: string
  loadingText?: string
  showCancel?: boolean
  showClose?: boolean
  showActions?: boolean
  loading?: boolean
  size?: 'small' | 'medium' | 'large'
}

const props = withDefaults(defineProps<Props>(), {
  type: 'info',
  confirmText: 'Aceptar',
  cancelText: 'Cancelar',
  loadingText: 'Procesando...',
  showCancel: false,
  showClose: true,
  showActions: true,
  loading: false,
  size: 'medium'
})

// Emits
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'confirm': []
  'cancel': []
  'close': []
}>()

// Computed
const modalClass = computed(() => {
  return [
    `modal-${props.type}`,
    `modal-${props.size}`
  ]
})

// Methods
const handleClose = () => {
  if (!props.loading) {
    emit('update:modelValue', false)
    emit('close')
  }
}

const handleConfirm = () => {
  if (!props.loading) {
    emit('confirm')
  }
}

const handleCancel = () => {
  if (!props.loading) {
    emit('update:modelValue', false)
    emit('cancel')
  }
}
</script>

<style scoped>
/* Overlay */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 1rem;
}

/* Container */
.modal-container {
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  position: relative;
  max-height: 90vh;
  overflow-y: auto;
  width: 100%;
}

/* Sizes */
.modal-small {
  max-width: 400px;
}

.modal-medium {
  max-width: 500px;
}

.modal-large {
  max-width: 700px;
}

/* Close Button */
.modal-close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: rgba(0, 0, 0, 0.1);
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  transition: all 0.2s ease;
  z-index: 1;
}

.modal-close:hover {
  background: rgba(0, 0, 0, 0.2);
  color: #333;
  transform: rotate(90deg);
}

/* Icon */
.modal-icon {
  text-align: center;
  font-size: 4rem;
  margin: 2rem 0 1rem;
}

.icon-info { color: #3B82F6; }
.icon-success { color: #10B981; }
.icon-warning { color: #F59E0B; }
.icon-error { color: #EF4444; }
.icon-confirm { color: #8B5CF6; }

/* Title */
.modal-title {
  text-align: center;
  font-size: 1.5rem;
  font-weight: 700;
  color: #1F2937;
  margin: 0 2rem 1rem;
}

/* Content */
.modal-content {
  padding: 0 2rem 1.5rem;
  text-align: center;
  color: #4B5563;
  line-height: 1.6;
}

.modal-content p {
  margin: 0;
  font-size: 1rem;
}

/* Actions */
.modal-actions {
  display: flex;
  gap: 0.75rem;
  padding: 0 2rem 2rem;
  justify-content: center;
}

.modal-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.modal-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.modal-btn-cancel {
  background: #E5E7EB;
  color: #4B5563;
}

.modal-btn-cancel:hover:not(:disabled) {
  background: #D1D5DB;
}

.modal-btn-confirm {
  color: white;
}

.btn-info {
  background: #3B82F6;
}

.btn-info:hover:not(:disabled) {
  background: #2563EB;
}

.btn-success {
  background: #10B981;
}

.btn-success:hover:not(:disabled) {
  background: #059669;
}

.btn-warning {
  background: #F59E0B;
}

.btn-warning:hover:not(:disabled) {
  background: #D97706;
}

.btn-error {
  background: #EF4444;
}

.btn-error:hover:not(:disabled) {
  background: #DC2626;
}

.btn-confirm {
  background: #8B5CF6;
}

.btn-confirm:hover:not(:disabled) {
  background: #7C3AED;
}

/* Spinner */
.spinner-small {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Transitions */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-scale-enter-active,
.modal-scale-leave-active {
  transition: all 0.3s ease;
}

.modal-scale-enter-from,
.modal-scale-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

/* Responsive */
@media (max-width: 640px) {
  .modal-container {
    margin: 1rem;
  }

  .modal-small,
  .modal-medium,
  .modal-large {
    max-width: 100%;
  }

  .modal-icon {
    font-size: 3rem;
    margin: 1.5rem 0 0.75rem;
  }

  .modal-title {
    font-size: 1.25rem;
    margin: 0 1.5rem 0.75rem;
  }

  .modal-content {
    padding: 0 1.5rem 1rem;
    font-size: 0.9375rem;
  }

  .modal-actions {
    flex-direction: column;
    padding: 0 1.5rem 1.5rem;
  }

  .modal-btn {
    width: 100%;
  }
}
</style>