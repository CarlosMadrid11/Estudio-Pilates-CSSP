# 🧘‍♀️ Sistema de Gestión para Estudio de Pilates — CSSP

Reestructuración y modernización de un proyecto académico para convertirlo en una **SPA profesional**, escalable y mantenible usando **Vue 3 + TypeScript**.

Este repositorio contiene el frontend del sistema de gestión para un estudio de pilates. El proyecto fue **analizado desde cero**, conservando las vistas funcionales y **reestructurando completamente la arquitectura**, priorizando buenas prácticas, legibilidad y preparación para integración con Supabase.

---

## 🎯 Objetivo del proyecto

* Construir una SPA profesional con Vue 3.
* Separar correctamente **layout, vistas, componentes y lógica**.
* Preparar el sistema para **roles de usuario** (guest, cliente, instructor, administrador).
* Dejar una base sólida para integrar Supabase (auth, DB y RLS).
* Convertir el proyecto en una pieza defendible de portafolio.

Este proyecto **no busca solo “que funcione”**, sino demostrar criterio técnico y arquitectura limpia.

---

## 🚀 Tecnologías utilizadas

### Frontend

* Vue 3 (Composition API)
* TypeScript
* Vue Router
* Pinia (estado global)
* TailwindCSS + Bootstrap
* Vite
* Zod (validación de formularios)
* FullCalendar (gestión de calendarios)

### Backend / BaaS

* Supabase (Auth, PostgreSQL, Storage, RLS)

### Herramientas

* Git y GitHub
* Prettier / ESLint
* Conventional Commits

---

## 🔄 Motivo de la reestructuración

La versión original del proyecto presentaba varios problemas comunes en proyectos académicos:

* Duplicación de código (4 barras de navegación distintas).
* Router acoplado a componentes de layout.
* Difícil mantenimiento al agregar o cambiar roles.
* Lógica distribuida sin una estructura clara.
* Baja escalabilidad.

### Decisión clave

Antes de seguir desarrollando funcionalidades, se decidió **reestructurar completamente el frontend**, manteniendo solo lo realmente reutilizable (vistas y componentes base).

---

## 🧱 Arquitectura actual del proyecto

La aplicación sigue un patrón de **layout centralizado**, donde la estructura general vive en `App.vue` y el router solo se encarga de renderizar vistas.

Estructura general:

src
assets
components
layouts
router
stores
services
views
public
cliente
instructor
admin
App.vue
main.ts

---

## 🧭 Organización de vistas por rol

### Vistas públicas (Guest)

* Landing page
* Planes
* Ayuda
* Login
* Registro

### Cliente

* Dashboard
* Mis reservas
* Calendario del cliente
* Método de pago (placeholder)

### Instructor

* Calendario
* Registro de asistencia

### Administrador

* Gestión de clientes
* Reportes de ventas (placeholder)

Cada grupo vive en su propia carpeta dentro de `views`, lo que facilita lectura, mantenimiento y control de acceso.

---

## 🧩 Navbar dinámico (decisión clave)

En lugar de tener múltiples barras de navegación:

* Se utiliza **un solo componente Navbar**.
* El navbar **cambia dinámicamente** según el rol del usuario.
* El rol se obtiene desde el estado global (Pinia).

Esto evita duplicación de:

* HTML
* CSS
* Lógica
* Bugs

Y permite mantener todo el comportamiento del menú en un solo lugar.

---

## 🧠 Manejo de estado global (Pinia)

Pinia se utiliza para manejar:

* Sesión del usuario
* Rol actual
* Información compartida entre vistas
* Lógica de autenticación

Stores planeados:

* auth: sesión, login, logout, rol
* reservas: reservas del cliente
* clases: clases y calendarios
* usuario: perfil del usuario

La UI solo consume el estado; la lógica vive en stores y services.

---

## 🔐 Supabase (plan de integración)

Supabase se usará como Backend as a Service:

* Autenticación con email/password
* Tabla `profiles` para roles
* PostgreSQL como base de datos
* RLS para proteger datos sensibles

Plan de integración:

1. Cliente Supabase centralizado.
2. Auth sincronizada con Pinia.
3. RLS para que cada usuario solo acceda a sus datos.
4. Guards en Vue Router basados en rol.

---

## 🗄️ Modelo de datos (propuesto)

* profiles: id, email, nombre, rol
* planes: nombre, precio, duración
* clases: fecha, instructor, cupo
* reservas: cliente, clase, estado
* paquetes: cliente, plan, vigencia

---

## 🛠️ Instalación y ejecución

Requisitos:

* Node.js (versión definida en package.json)
* npm o yarn

Pasos:

1. Clonar el repositorio
2. Instalar dependencias
3. Ejecutar el servidor de desarrollo

Variables de entorno:

* VITE_SUPABASE_URL
* VITE_SUPABASE_ANON_KEY

---

## 🧪 Buenas prácticas aplicadas

* Layout único y reutilizable
* Router limpio (solo vistas)
* Separación clara de responsabilidades
* Estado centralizado
* Preparación para escalabilidad
* Código legible y defendible

---

## 🔧 Flujo de trabajo con Git

Ramas:

* main: estable
* develop: integración
* feature/*: nuevas funcionalidades
* fix/*: correcciones

Convención de commits:

* feat
* fix
* refactor
* docs
* chore

---

## ⚠️ Estado actual del proyecto

* Reestructuración del frontend completada.
* Router funcional sin errores.
* Dependencias actualizadas.
* Supabase pendiente de integración final.
* Algunas vistas aún son placeholders.

---

## 👤 Autor

Juan Carlos Quiñonez Madrid
Correo: [b4rc4drid@gmail.com](mailto:b4rc4drid@gmail.com)

---

## 📄 Licencia

Proyecto académico y privado.

---

Última actualización: 28 de Diciembre 2025 fase 1 terminada

