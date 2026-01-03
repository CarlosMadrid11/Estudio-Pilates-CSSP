// src/composables/useGestionClientes.ts

import { ref, computed, onMounted } from 'vue'
import { supabase } from '@/lib/supabase'

// ============================================
// TIPOS E INTERFACES
// ============================================

export interface PaqueteCliente {
  id: string
  nombre: string
  clases_totales: number
  clases_restantes: number
  fecha_compra: string
  fecha_vencimiento: string
  activo: boolean
}

export interface ReservaCliente {
  id: string
  fecha: string
  hora_inicio: string
  hora_fin: string
  estado: string
  asistio: boolean | null
}

export interface ClienteDetalle {
  id: string
  profile_id: string
  nombre_completo: string
  email: string
  telefono: string
  direccion: string
  paquetes: PaqueteCliente[]
  reservas: ReservaCliente[]
}

export interface ClienteListado {
  id: string
  nombre_completo: string
  email: string
  telefono: string
  paquetes_activos: number
  clases_disponibles: number
}