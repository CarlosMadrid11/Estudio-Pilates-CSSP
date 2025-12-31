# 🧘‍♀️ Sistema de Gestión para Estudio de Pilates — CSSP

Sistema de gestión completo para estudios de Pilates, construido como **SPA profesional** usando **Vue 3 + TypeScript + Supabase**.

Este proyecto demuestra arquitectura moderna de frontend, integración con BaaS (Backend as a Service), y aplicación de mejores prácticas de desarrollo.

---

## 🎯 Objetivo del proyecto

Construir un sistema de gestión completo para estudios de Pilates que incluya:

- ✅ **Gestión de clientes:** Registro, login, compra de paquetes, reserva de clases
- ✅ **Dashboard personalizado:** Vista dinámica según rol de usuario
- ✅ **Sistema de reservas:** Calendario interactivo con validaciones de negocio
- ⏳ **Panel de instructor:** Visualización de clases y registro de asistencias
- ⏳ **Panel administrativo:** Gestión de clientes y reportes

**Este proyecto no busca solo "que funcione"**, sino demostrar:
- Arquitectura limpia y escalable
- Integración profesional con servicios backend
- Seguridad a nivel de base de datos (RLS)
- Código mantenible y defendible en entrevistas técnicas

---

## 🚀 Tecnologías utilizadas

### Frontend
- **Vue 3** (Composition API) - Framework progresivo
- **TypeScript** - Tipado estático
- **Vite** - Build tool y dev server
- **Vue Router** - Enrutamiento con guards
- **Pinia** - Estado global
- **Tailwind CSS** - Utilidades de estilo
- **Zod** - Validación de formularios
- **FullCalendar** - Gestión de calendarios interactivos

### Backend (BaaS)
- **Supabase**
  - Auth (autenticación con email/password)
  - PostgreSQL (base de datos relacional)
  - Row Level Security (RLS)
  - Real-time subscriptions (futuro)

### Herramientas de desarrollo
- Git y GitHub (control de versiones)
- ESLint + Prettier (linting y formateo)
- Conventional Commits (estándares de commits)

---

## 📊 Estado actual del proyecto

```
FASE 1: ████████████████████ 100% ✅ COMPLETADA
  ✓ Arquitectura frontend base
  ✓ Sistema de autenticación
  ✓ Navegación dinámica por roles
  ✓ Layout centralizado

FASE 2: ███████████████████░  95% 🟡 CASI COMPLETA
  ✓ Integración con Supabase
  ✓ Base de datos configurada
  ✓ RLS implementado
  ⚠ RegistrarseView con problema conocido

FASE 3: ████████████████████ 100% ✅ COMPLETADA
  ✓ Sistema de compra de paquetes
  ✓ Dashboard cliente funcional
  ✓ Gestión de reservas completa
  ✓ Calendario de reservas interactivo

FASE 4: ░░░░░░░░░░░░░░░░░░░░   0% ⏳ PENDIENTE
  ⏳ Panel de instructor
  ⏳ Panel administrativo

TOTAL:  ██████████████░░░░░░  70% del proyecto
```

**Última actualización:** 30 de Diciembre, 2025

---

## 🏗️ Arquitectura del sistema

### Estructura de carpetas

```
src/
├── assets/              # Recursos estáticos
├── components/          # Componentes reutilizables
│   ├── NavbarDynamic.vue
│   └── Footer.vue
├── composables/         # Lógica reutilizable (Composition API)
│   ├── usePlanes.ts
│   ├── useDashboard.ts
│   ├── useMisReservas.ts
│   └── useCalendarCliente.ts
├── lib/                 # Configuraciones externas
│   └── supabase.ts     # Cliente de Supabase
├── stores/              # Estado global (Pinia)
│   └── auth.ts         # Store de autenticación
├── views/               # Vistas organizadas por rol
│   ├── public/         # Vistas públicas (guest)
│   │   ├── LandingPageView.vue
│   │   ├── PlanesView.vue
│   │   ├── LoginView.vue
│   │   └── RegistrarseView.vue
│   ├── cliente/        # Vistas de cliente
│   │   ├── DashboardClienteView.vue
│   │   ├── MisReservasView.vue
│   │   ├── CalendarioClienteView.vue
│   │   └── MetodoPagoView.vue
│   ├── instructor/     # Vistas de instructor
│   │   ├── CalendarioInstructorView.vue
│   │   └── RegistroAsistenciaView.vue
│   └── admin/          # Vistas de administrador
│       ├── GestionClientesView.vue
│       └── ReportesVentasView.vue
├── router/
│   └── index.ts        # Configuración de rutas + guards
└── App.vue             # Layout principal
```

### Decisiones arquitectónicas clave

#### 1. **Navbar dinámico centralizado**
En lugar de múltiples navbars, se usa **un solo componente** que cambia según el rol:

```typescript
type UserRole = 'guest' | 'cliente' | 'instructor' | 'admin'
```

**Beneficios:**
- ✅ Cero duplicación de código
- ✅ Mantenimiento en un solo lugar
- ✅ Comportamiento consistente

#### 2. **Composables para lógica de negocio**
Separación clara entre lógica y presentación:

```typescript
// En lugar de lógica en el componente
const { paquetes, comprarPaquete, cargando } = usePlanes()
```

**Beneficios:**
- ✅ Reutilización de código
- ✅ Testing simplificado
- ✅ Mejor organización

#### 3. **Auth Store como fuente de verdad**
Estado global de autenticación con Pinia:

```typescript
interface AuthState {
  user: User | null
  role: UserRole
  isAuthenticated: boolean
  isInitialized: boolean
}
```

**Beneficios:**
- ✅ Sesión persistente
- ✅ Guards reactivos
- ✅ Estado sincronizado

---

## 🔐 Sistema de roles y permisos

### Jerarquía de roles

```
guest → Solo vistas públicas (landing, planes, login)
  ↓
cliente → Vistas de cliente (dashboard, reservas, calendario)
  ↓
instructor → Vistas de instructor (calendario, asistencias)
  ↓
admin → Acceso total (gestión, reportes, configuración)
```

### Protección de rutas

Implementado con **Navigation Guards** en Vue Router:

```typescript
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  // Verificar autenticación
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return next('/login')
  }
  
  // Verificar rol
  if (to.meta.allowedRoles) {
    if (!authStore.hasAccess(to.meta.allowedRoles[0])) {
      return next(getDashboardByRole(authStore.role))
    }
  }
  
  next()
})
```

---

## 🗄️ Modelo de datos (Supabase)

### Esquema relacional

```
auth.users (Supabase Auth)
└── profiles (1:1) - Información del perfil
    ├── clientes (1:1 si rol='cliente')
    │   ├── mis_paquetes (1:N) - Paquetes comprados
    │   └── mis_reservas (1:N) - Reservas de clases
    └── instructores (1:1 si rol='instructor')
        └── clases (1:N) - Clases impartidas
```

### Tablas principales

#### `profiles`
```sql
id          UUID (FK auth.users)
nombre_completo  VARCHAR(100)
telefono    VARCHAR(15)
rol         VARCHAR(20) DEFAULT 'cliente'
```

#### `clientes`
```sql
id          UUID (PK)
profile_id  UUID (FK profiles) UNIQUE
direccion   VARCHAR(255)
```

#### `paquetes`
```sql
id          UUID (PK)
nombre      VARCHAR(50) UNIQUE
descripcion TEXT
precio      DECIMAL(10,2)
num_clases  INTEGER
vigencia_dias INTEGER
activo      BOOLEAN DEFAULT true
```

#### `mis_paquetes`
```sql
id          UUID (PK)
cliente_id  UUID (FK clientes)
paquete_id  UUID (FK paquetes)
clases_totales    INTEGER
clases_restantes  INTEGER
fecha_compra      TIMESTAMP
fecha_vencimiento TIMESTAMP
activo      BOOLEAN DEFAULT true
```

#### `clases`
```sql
id          UUID (PK)
instructor_id UUID (FK instructores)
fecha       DATE
hora_inicio TIME
hora_fin    TIME
capacidad_maxima  INTEGER
capacidad_actual  INTEGER DEFAULT 0
```

#### `mis_reservas`
```sql
id          UUID (PK)
cliente_id  UUID (FK clientes)
clase_id    UUID (FK clases)
mi_paquete_id UUID (FK mis_paquetes)
fecha_reserva TIMESTAMP
estado      VARCHAR(20) DEFAULT 'confirmada'
UNIQUE (cliente_id, clase_id)
```

### Row Level Security (RLS)

**Todas las tablas tienen RLS activado** para garantizar seguridad:

| Tabla | Políticas activas |
|-------|------------------|
| profiles | SELECT, INSERT, UPDATE (own) |
| clientes | SELECT, INSERT (own) |
| paquetes | SELECT (all active) |
| mis_paquetes | SELECT, INSERT, UPDATE (own) |
| clases | SELECT (all), UPDATE (system) |
| mis_reservas | SELECT, INSERT, UPDATE, DELETE (own) |

**Ejemplo de política:**
```sql
CREATE POLICY "Clientes pueden ver sus propias reservas"
ON public.mis_reservas FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.clientes
    WHERE clientes.id = mis_reservas.cliente_id
    AND clientes.profile_id = auth.uid()
  )
);
```

---

## 🎯 Funcionalidades implementadas

### ✅ Rol: Cliente

#### 1. Dashboard personalizado
- Información del perfil
- Paquetes activos con clases restantes
- Próximas reservas
- Indicadores visuales de estado

#### 2. Sistema de compra de paquetes
- Catálogo de paquetes disponibles
- Compra con validación de usuario
- Cálculo automático de vencimiento
- Confirmación y redirección

#### 3. Gestión de reservas
- Ver todas las reservas (activas y canceladas)
- Filtrado por estado
- Cancelación con:
  - Liberación de capacidad
  - Devolución de clase al paquete
  - Actualización visual inmediata

#### 4. Calendario de reservas
- Calendario interactivo mensual
- Selección de fecha y horario
- Validaciones:
  - Paquete activo requerido
  - No reservas duplicadas
  - Control de capacidad
  - Fechas pasadas bloqueadas
- Transacción completa al reservar

---

## 🛠️ Instalación y ejecución

### Requisitos previos
- Node.js 18+
- npm o yarn
- Cuenta de Supabase (para desarrollo)

### Pasos de instalación

1. **Clonar el repositorio**
```bash
git clone https://github.com/tu-usuario/cssp.git
cd cssp
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
cp .env.example .env
```

Editar `.env`:
```env
VITE_SUPABASE_URL=tu_url_de_supabase
VITE_SUPABASE_ANON_KEY=tu_anon_key
```

4. **Ejecutar en desarrollo**
```bash
npm run dev
```

5. **Build para producción**
```bash
npm run build
```

---

## 🧪 Testing y validación

### Usuario de prueba

```
Email: carlos.test@gmail.com
Password: Carlos123!
Rol: cliente
```

### Flujo de prueba completo

1. ✅ Login con usuario de prueba
2. ✅ Ver dashboard con información real
3. ✅ Navegar a Planes y comprar paquete
4. ✅ Verificar paquete aparece en dashboard
5. ✅ Ir a Calendario y reservar clase
6. ✅ Ver reserva en Mis Reservas
7. ✅ Cancelar reserva
8. ✅ Verificar clase devuelta al paquete
9. ✅ Logout

---

## ⚠️ Problemas conocidos

### 1. RegistrarseView incompleto (Fase 2) 🔴
- **Estado:** Pendiente de corrección
- **Síntoma:** Registro se crea en `auth.users` y `profiles`, pero no en `clientes`
- **Workaround:** Crear usuarios manualmente desde Supabase Dashboard
- **Prioridad:** Alta (antes de producción)

### 2. Supabase signups bloqueados 🟡
- **Estado:** Configuración intencional de desarrollo
- **Causa:** Settings de Supabase Auth
- **Workaround:** Dashboard manual con "Auto Confirm User"
- **Impacto:** Solo desarrollo

---

## 🔧 Flujo de trabajo con Git

### Convención de branches
```
main      → Estable (producción)
develop   → Integración (desarrollo)
feature/* → Nuevas funcionalidades
fix/*     → Correcciones de bugs
```

### Convención de commits (Conventional Commits)
```
feat: nueva funcionalidad
fix: corrección de bug
refactor: refactorización sin cambio funcional
docs: documentación
chore: tareas de mantenimiento
```

**Ejemplo:**
```bash
git commit -m "feat: agregar sistema de reservas en calendario"
git commit -m "fix: corregir políticas RLS de mis_reservas"
```

---

## 📚 Recursos y referencias

- [Vue 3 Documentation](https://vuejs.org/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Supabase Docs](https://supabase.com/docs)
- [Pinia Documentation](https://pinia.vuejs.org/)
- [FullCalendar Vue](https://fullcalendar.io/docs/vue)

---

## 🎓 Habilidades demostradas en este proyecto

- ✅ **Vue 3 Composition API** avanzado con composables
- ✅ **TypeScript** con tipos complejos e interfaces
- ✅ **Integración BaaS** (Supabase Auth + DB + RLS)
- ✅ **Arquitectura escalable** con separación de responsabilidades
- ✅ **Estado global** con Pinia
- ✅ **Seguridad** con Row Level Security
- ✅ **Validaciones de negocio** en frontend y backend
- ✅ **UX profesional** con feedback visual y estados de carga
- ✅ **Git workflow** con conventional commits

---

## 👤 Autor

**Juan Carlos Quiñonez Madrid**  
📧 Email: b4rc4drid@gmail.com  
💼 LinkedIn: [tu-perfil](#)  
🌐 Portfolio: [tu-portfolio](#)  

---

## 📄 Licencia

Este es un **proyecto académico y de portafolio**.  
Código privado - No apto para uso comercial sin autorización.

---

## 🚀 Roadmap

### Próximas funcionalidades (Fase 4)
- [ ] Panel de instructor
  - [ ] Calendario de clases asignadas
  - [ ] Registro de asistencias
  - [ ] Lista de clientes por clase
- [ ] Panel administrativo
  - [ ] Gestión de clientes
  - [ ] Reportes de ventas
  - [ ] Dashboard de métricas

### Mejoras futuras (Fase 5)
- [ ] Notificaciones por email (Supabase Edge Functions)
- [ ] Subscripciones en tiempo real
- [ ] App móvil con React Native
- [ ] Sistema de pagos (Stripe)
- [ ] Modo oscuro
- [ ] Internacionalización (i18n)

---

**¿Preguntas o sugerencias?** Contacta al desarrollador.

**Última actualización:** 30 de Diciembre, 2025