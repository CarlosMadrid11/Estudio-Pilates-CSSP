# 🧘‍♀️ Sistema de Gestión para Estudio de Pilates — CSSP

Sistema de gestión completo para estudios de Pilates, construido como **SPA profesional** usando **Vue 3 + TypeScript + Supabase**.

Este proyecto demuestra arquitectura moderna de frontend, integración con BaaS (Backend as a Service), y aplicación de mejores prácticas de desarrollo.

---

## 🎯 Objetivo del proyecto

Construir un sistema de gestión completo para estudios de Pilates que incluya:

- ✅ **Gestión de clientes:** Registro, login, compra de paquetes, reserva de clases
- ✅ **Dashboard personalizado:** Vista dinámica según rol de usuario
- ✅ **Sistema de reservas:** Calendario interactivo con validaciones de negocio
- ✅ **Panel de instructor:** Visualización de clases y registro de asistencias
- ✅ **Panel administrativo:** Gestión de clientes

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
  - SQL Functions para lógica segura

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

FASE 2: ███████████████████░  100% ✅ COMPLETADA
  ✓ Integración con Supabase
  ✓ Base de datos configurada
  ✓ RLS implementado
  ✓ RegistrarseView hace el registro --> se agrega a la bd --> autentica al usuario --> hace un login manual --> se redirige a dashboard como lo haria el login

FASE 3: ████████████████████ 100% ✅ COMPLETADA
  ✓ Sistema de compra de paquetes
  ✓ Dashboard cliente funcional
  ✓ Gestión de reservas completa
  ✓ Calendario de reservas interactivo

FASE 4: ████████████████░░░░  80% 🟡 EN PROGRESO
  ✅ CalendarioInstructorView - Completa
  ✅ RegistroAsistenciaView - Completa
  ✅ GestionClientesView - Completa
  ⏳ Mejoras pendientes (ver sección de problemas)

TOTAL:  ███████████████████░  90% del proyecto
```

**Última actualización:** 3 de Enero, 2026

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
│   ├── useMisReservas.ts
│   ├── useCalendarCliente.ts
│   ├── useCalendarioInstructor.ts
│   ├── useRegistroAsistencia.ts
│   └── useGestionClientes.ts
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
asistio     BOOLEAN DEFAULT NULL
UNIQUE (cliente_id, clase_id)
```

### Row Level Security (RLS)

**Todas las tablas tienen RLS activado** para garantizar seguridad:

| Tabla | Políticas activas |
|-------|------------------|
| profiles | SELECT, INSERT, UPDATE (own + admin) |
| clientes | SELECT, INSERT (own + admin) |
| instructores | SELECT (own) |
| paquetes | SELECT (all active) |
| mis_paquetes | SELECT, INSERT, UPDATE (own + admin) |
| clases | SELECT (all), UPDATE (system + instructor) |
| mis_reservas | SELECT, INSERT, UPDATE, DELETE (own + instructor + admin) |

**Funciones SQL de ayuda:**
```sql
-- Verificar si el usuario es admin
CREATE FUNCTION public.is_admin() RETURNS BOOLEAN

-- Obtener email de usuarios de forma segura
CREATE FUNCTION public.get_user_email(user_id UUID) RETURNS TEXT
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

### ✅ Rol: Instructor

#### 1. Calendario de clases (READ-ONLY)
- Vista de todas las clases asignadas
- Código de colores por ocupación
- Modal con lista de estudiantes registrados
- Múltiples vistas (mensual, semanal, diaria)

#### 2. Registro de asistencias
- Lista de clases pasadas con reservas
- Marcar asistencia individual (asistió/faltó)
- Guardado automático en tiempo real
- Resumen de asistencias por clase

---

### ✅ Rol: Admin

#### 1. Gestión de clientes
- Lista completa de clientes
- Búsqueda por nombre, email o teléfono
- Filtros por estado (con/sin paquetes)
- Modal con detalles completos:
  - Información personal
  - Paquetes activos e inactivos
  - Últimas 10 reservas con asistencia
- Estadísticas en tiempo real

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

## ⚠️ Problemas conocidos y mejoras pendientes

### 🔴 Problemas críticos

#### 1. Timezone en calendario de reservas
- **Estado:** Pendiente de validación
- **Síntoma:** Reserva se guarda con 1 día de diferencia (jueves → miércoles)
- **Causa:** FullCalendar interpreta fechas con hora como UTC
- **Solución aplicada:** Uso de `allDay: true` y `timeZone: 'local'`
- **Prioridad:** Alta - requiere testing exhaustivo

---

### 🟡 Mejoras planificadas (Asteriscos)

#### 2. MisReservasView - Separación de reservas pasadas
- **Descripción:** Crear sección "Reservas Pasadas" o esconderlas por defecto
- **Beneficio:** Mejor organización visual de reservas activas vs históricas
- **Prioridad:** Media

#### 3. MisReservasView - Botón "Nueva Reserva"
- **Descripción:** Agregar botón que redirija a `/calendario-cliente`
- **Beneficio:** Mejor UX, flujo más intuitivo
- **Prioridad:** Media

#### 4. Renombrar MisReservasView
- **Descripción:** Cambiar nombre a algo más intuitivo (ej: "Mis Clases")
- **Beneficio:** Nomenclatura más clara para usuarios finales
- **Prioridad:** Baja

---

## 🔧 Flujo de trabajo con Git

### Convención de branches
```
main      → Estable (producción)
develop   → Integración (desarrollo)
fix/*     → Correcciones de bugs
```

### Convención de commits (Conventional Commits)
```
fix: corrección de bug
refactor: refactorización sin cambio funcional
docs: documentación
chore: tareas de mantenimiento
```

**Ejemplo:**
```bash
git commit -m "feat: agregar gestión de clientes para admin"
git commit -m "fix: corregir timezone en calendario de reservas"
git commit -m "docs: actualizar README con estado de fase 4"
```

---

## 📚 Recursos y referencias

- [Vue 3 Documentation](https://vuejs.org/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Supabase Docs](https://supabase.com/docs)
- [Pinia Documentation](https://pinia.vuejs.org/)
- [FullCalendar Vue](https://fullcalendar.io/docs/vue)
- [Tailwind CSS](https://tailwindcss.com/docs)

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
- ✅ **SQL Functions** para lógica segura del lado del servidor
- ✅ **Manejo de timezones** en aplicaciones internacionales

---

## 👤 Autor

**Juan Carlos Quiñonez Madrid**  
📧 Email: b4rc4drid@gmail.com

---

## 📄 Licencia

Este es un **proyecto académico y de portafolio**.  
Código privado - No apto para uso comercial sin autorización.

---

## 🚀 Roadmap

### Fase 5 - Mejoras y pulido (próxima fase)
- [ ] Resolver problema de RegistrarseView
- [ ] Validar y corregir timezone definitivamente
- [ ] Implementar mejoras de MisReservasView (separación + botón)
- [ ] Renombrar vista a nombre más intuitivo
- [ ] Agregar página 404 personalizada
- [ ] Panel de usuario en navbar (dropdown con info)
- [ ] Tests básicos con Vitest

### Futuras mejoras (post-MVP)
- [ ] Notificaciones por email (Supabase Edge Functions)
- [ ] Vista para que instructor cree sus propias clases
- [ ] Reportes y estadísticas para admin (gráficos con Chart.js)
- [ ] Subscripciones en tiempo real
- [ ] Sistema de pagos (Stripe)
- [ ] Modo oscuro
- [ ] App móvil con React Native
- [ ] Internacionalización (i18n)

---

**Última actualización:** 3 de Enero, 2026