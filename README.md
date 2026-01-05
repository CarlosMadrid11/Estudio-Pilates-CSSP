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
- Seguridad a nivel de base de datos (RLS + Triggers)
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
  - SQL Functions y Triggers para lógica segura

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

FASE 2: ████████████████████ 100% ✅ COMPLETADA
  ✓ Integración con Supabase
  ✓ Base de datos configurada
  ✓ RLS implementado
  ✓ Trigger automático para crear cliente
  ✓ RegistrarseView con auto-login

FASE 3: ████████████████████ 100% ✅ COMPLETADA
  ✓ Sistema de compra de paquetes
  ✓ Dashboard cliente funcional
  ✓ Gestión de reservas completa
  ✓ Calendario de reservas interactivo

FASE 4: ████████████████████ 100% ✅ COMPLETADA
  ✓ CalendarioInstructorView - Completa
  ✓ RegistroAsistenciaView - Completa
  ✓ GestionClientesView - Completa
  ✓ MisReservasView mejorada (tabs + historial)
  ✓ Bug timezone RESUELTO

FASE 5: ░░░░░░░░░░░░░░░░░░░░ 0% ⏳ PRÓXIMA FASE
  ⏳ Página 404 personalizada
  ⏳ Panel de usuario en navbar
  ⏳ Vista "Mi Cuenta"
  ⏳ Notificaciones visuales
  ⏳ Vista Crear Clase (Instructor)

TOTAL:  ███████████████████░ 95% del proyecto
```

**Última actualización:** 5 de Enero, 2026

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
│   │   └── CalendarioClienteView.vue
│   ├── instructor/     # Vistas de instructor
│   │   ├── CalendarioInstructorView.vue
│   │   └── RegistroAsistenciaView.vue
│   └── admin/          # Vistas de administrador
│       └── GestionClientesView.vue
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
    ├── clientes (1:1 si rol='cliente') ← Trigger automático
    │   ├── mis_paquetes (1:N) - Paquetes comprados
    │   └── mis_reservas (1:N) - Reservas de clases
    └── instructores (1:1 si rol='instructor')
        └── clases (1:N) - Clases impartidas
```

### Tablas principales

#### `profiles`
```sql
id              UUID (PK, FK auth.users)
nombre_completo VARCHAR(100)
telefono        VARCHAR(15)
rol             VARCHAR(20) DEFAULT 'cliente'
created_at      TIMESTAMP
```

#### `clientes`
```sql
id          UUID (PK)
profile_id  UUID (FK profiles) UNIQUE
direccion   VARCHAR(255)
created_at  TIMESTAMP
```

#### `paquetes`
```sql
id            UUID (PK)
nombre        VARCHAR(50) UNIQUE
descripcion   TEXT
precio        DECIMAL(10,2)
num_clases    INTEGER
vigencia_dias INTEGER
activo        BOOLEAN DEFAULT true
created_at    TIMESTAMP
```

#### `mis_paquetes`
```sql
id                UUID (PK)
cliente_id        UUID (FK clientes)
paquete_id        UUID (FK paquetes)
clases_totales    INTEGER
clases_restantes  INTEGER
fecha_compra      TIMESTAMP
fecha_vencimiento DATE
activo            BOOLEAN DEFAULT true
```

#### `clases`
```sql
id               UUID (PK)
instructor_id    UUID (FK instructores)
fecha            DATE
hora_inicio      TIME
hora_fin         TIME
capacidad_maxima INTEGER
capacidad_actual INTEGER DEFAULT 0
created_at       TIMESTAMP
```

#### `mis_reservas`
```sql
id            UUID (PK)
cliente_id    UUID (FK clientes)
clase_id      UUID (FK clases)
mi_paquete_id UUID (FK mis_paquetes)
fecha_reserva TIMESTAMP
estado        VARCHAR(20) DEFAULT 'confirmada'
asistio       BOOLEAN DEFAULT NULL
created_at    TIMESTAMP
UNIQUE (cliente_id, clase_id)
```

---

## ⚙️ Triggers y Funciones SQL

### 🔧 Trigger: Crear Cliente Automáticamente

**Propósito:** Cuando se crea un perfil con `rol='cliente'`, automáticamente crear el registro en `clientes`.

```sql
-- Función que ejecuta el trigger
CREATE OR REPLACE FUNCTION public.handle_new_profile()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.rol = 'cliente' THEN
    INSERT INTO public.clientes (profile_id, direccion)
    VALUES (NEW.id, NULL);
    
    RAISE NOTICE 'Cliente creado para profile_id: %', NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger
CREATE TRIGGER on_profile_created
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_profile();
```

**¿Por qué `SECURITY DEFINER`?**
- Se ejecuta con permisos de admin/postgres
- Ignora políticas RLS que bloquearían la inserción
- Esencial para que el registro público funcione

---

### 📊 Función: Verificar si es Admin

```sql
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid() AND rol = 'admin'
  );
$$;
```

**Uso en políticas RLS:**
```sql
CREATE POLICY "Admins pueden ver todo"
ON public.clientes FOR SELECT
USING (public.is_admin());
```

---

### 📧 Función: Obtener Email de Usuario

```sql
CREATE OR REPLACE FUNCTION public.get_user_email(user_id UUID)
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT email::text
  FROM auth.users
  WHERE id = user_id;
$$;
```

**¿Por qué necesaria?**
- La tabla `auth.users` no es accesible por RLS
- Permite obtener emails de forma segura
- Usado en vistas administrativas

---

## 🔐 Políticas RLS (Row Level Security)

### Tabla: `profiles`

```sql
-- Usuarios ven su propio perfil
CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = id);

-- Usuarios actualizan su propio perfil
CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id);

-- Admins ven todos los perfiles
CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
USING (public.is_admin());

-- Sistema puede insertar (registro)
CREATE POLICY "System can insert profiles"
ON public.profiles FOR INSERT
WITH CHECK (true);
```

---

### Tabla: `clientes`

```sql
-- Clientes ven su info
CREATE POLICY "Clientes pueden ver su propia info"
ON public.clientes FOR SELECT
USING (profile_id = auth.uid());

-- Sistema crea clientes (trigger)
CREATE POLICY "System can create clientes"
ON public.clientes FOR INSERT
WITH CHECK (true);

-- Admins gestionan clientes
CREATE POLICY "Admins pueden gestionar clientes"
ON public.clientes FOR ALL
USING (public.is_admin());
```

---

### Tabla: `mis_reservas`

```sql
-- Clientes ven sus reservas
CREATE POLICY "Clientes pueden ver sus reservas"
ON public.mis_reservas FOR SELECT
USING (
  cliente_id IN (
    SELECT id FROM public.clientes
    WHERE profile_id = auth.uid()
  )
);

-- Clientes crean reservas
CREATE POLICY "Clientes pueden crear reservas"
ON public.mis_reservas FOR INSERT
WITH CHECK (
  cliente_id IN (
    SELECT id FROM public.clientes
    WHERE profile_id = auth.uid()
  )
);

-- Instructores ven reservas de sus clases
CREATE POLICY "Instructores pueden ver reservas de sus clases"
ON public.mis_reservas FOR SELECT
USING (
  clase_id IN (
    SELECT c.id FROM public.clases c
    JOIN public.instructores i ON i.id = c.instructor_id
    WHERE i.profile_id = auth.uid()
  )
);

-- Instructores actualizan asistencia
CREATE POLICY "Instructores pueden actualizar asistencia"
ON public.mis_reservas FOR UPDATE
USING (
  clase_id IN (
    SELECT c.id FROM public.clases c
    JOIN public.instructores i ON i.id = c.instructor_id
    WHERE i.profile_id = auth.uid()
  )
);
```

---

### Tabla: `clases`

```sql
-- Todos ven clases disponibles
CREATE POLICY "Anyone can view classes"
ON public.clases FOR SELECT
USING (true);

-- Sistema actualiza capacidad
CREATE POLICY "System can update class capacity"
ON public.clases FOR UPDATE
USING (true);

-- Instructores crean sus clases (FUTURO)
CREATE POLICY "Instructores pueden crear sus clases"
ON public.clases FOR INSERT
WITH CHECK (
  instructor_id IN (
    SELECT id FROM public.instructores
    WHERE profile_id = auth.uid()
  )
);
```

---

## 🎯 Funcionalidades implementadas

### ✅ Rol: Cliente

#### 1. Dashboard personalizado
- Información del perfil
- Paquetes activos con clases restantes
- Estados visuales (activo/por vencer/vencido)
- Próximas reservas

#### 2. Sistema de compra de paquetes
- Catálogo de paquetes disponibles
- Compra con validación de usuario
- Cálculo automático de vencimiento
- Confirmación y redirección

#### 3. Gestión de reservas con tabs
- **Tab Próximas:** Reservas activas
- **Tab Historial:** Últimas 10 reservas pasadas con badges de asistencia
- **Tab Canceladas:** Últimas 5 reservas canceladas
- Botón "+ Nueva Reserva"
- Cancelación con devolución de clase

#### 4. Calendario de reservas
- Calendario interactivo mensual
- Selección de fecha y horario
- Validaciones:
  - Paquete activo requerido
  - No reservas duplicadas
  - Control de capacidad
  - Fechas pasadas bloqueadas
- Transacción completa al reservar
- **Manejo correcto de timezones** ✅

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
- Solo últimas 20 clases con reservas

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
git clone https://github.com/CarlosMadrid11/cssp.git
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

## ⚠️ Problemas resueltos

### ✅ Timezone en calendario de reservas
- **Estado:** ✅ RESUELTO
- **Síntoma:** Reserva se guardaba con 1-2 días de diferencia
- **Causa:** `new Date('YYYY-MM-DD')` se interpreta como UTC
- **Solución:** Parseo manual de fechas sin conversión de timezone

```typescript
// ✅ Correcto
const [year, month, day] = fecha.split('-').map(Number)
const date = new Date(year, month - 1, day)
```

### ✅ RegistrarseView no autenticaba
- **Estado:** ✅ RESUELTO
- **Solución:** Sincronizar Auth Store después del registro
- **Resultado:** Usuario queda autenticado y redirigido correctamente

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
refactor: refactorización
docs: documentación
chore: tareas de mantenimiento
```

**Ejemplo:**
```bash
git commit -m "feat: agregar tabs en MisReservasView"
git commit -m "fix: corregir timezone en calendario"
git commit -m "docs: actualizar README con triggers"
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
- ✅ **Triggers y Funciones SQL** para lógica segura
- ✅ **Validaciones de negocio** en frontend y backend
- ✅ **UX profesional** con feedback visual y estados de carga
- ✅ **Git workflow** con conventional commits
- ✅ **Manejo de timezones** en aplicaciones internacionales

---

## 👤 Autor

**Juan Carlos Quiñonez Madrid**  
📧 Email: b4rc4drid@gmail.com  
🔗 GitHub: [CarlosMadrid11](https://github.com/CarlosMadrid11)

---

## 📄 Licencia

Este es un **proyecto académico y de portafolio**.  
Código privado - No apto para uso comercial sin autorización.

---

## 🚀 Roadmap

### Fase 5 - Mejoras finales (próxima fase)
- [ ] Página 404 personalizada
- [ ] Panel de usuario en navbar (dropdown)
- [ ] Vista "Mi Cuenta" (editar perfil)
- [ ] Notificaciones visuales (reemplazar alerts)
- [ ] Vista para que instructor cree clases
- [ ] Testing completo

### Futuras mejoras (post-MVP)
- [ ] Notificaciones por email (Supabase Edge Functions)

---

**Última actualización:** 5 de Enero, 2026  
**Estado:** 95% completado | Fase 4 ✅ | Listo para Fase 5 