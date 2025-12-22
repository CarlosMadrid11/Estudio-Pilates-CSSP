# 🧘‍♀️ Sistema de Gestión para Estudio de Pilates — CSSP

Reestructuración y modernización de un proyecto académico para convertirlo en una **Single Page Application (SPA)** profesional, escalable y mantenible utilizando **Vue 3 + TypeScript**.

Este repositorio contiene el frontend del sistema de gestión para un estudio de pilates. El proyecto fue analizado desde cero, conservando las vistas existentes y realizando una reestructuración completa de la arquitectura, priorizando buenas prácticas, claridad y preparación para su integración con **Supabase**.

---

## 🎯 Objetivo del proyecto

* Construir una SPA profesional con **Vue 3**.
* Separar correctamente layouts, vistas, componentes y lógica.
* Implementar una arquitectura clara basada en **roles de usuario**.
* Preparar el sistema para autenticación, autorización y base de datos con **Supabase**.
* Convertir el proyecto en una pieza sólida y defendible para portafolio profesional.

> **Nota:** Este proyecto no busca únicamente que "funcione", sino demostrar criterio técnico, estructura y buenas decisiones de arquitectura.

---

## 🚀 Tecnologías utilizadas

### Frontend
* **Vue 3** (Composition API)
* **TypeScript**
* **Vue Router**
* **Pinia** (gestión de estado global)
* **TailwindCSS**
* **Bootstrap**
* **Vite**
* **Zod** (validación de formularios)
* **FullCalendar** (gestión de calendarios)

### Backend / BaaS
* **Supabase** (Auth, PostgreSQL, Storage, Row Level Security)

### Herramientas
* Git / GitHub
* ESLint / Prettier
* **Conventional Commits**

---

## 🔄 Motivo de la reestructuración

La versión original presentaba problemas comunes en proyectos académicos:
* Cuatro barras de navegación distintas (una por rol).
* Duplicación de HTML, CSS y lógica.
* Router acoplado a componentes de layout.
* Dificultad para escalar o modificar permisos.

Se decidió detener el desarrollo para reestructurar completamente el frontend antes de añadir nuevas funcionalidades.

---

## 🧱 Arquitectura del Proyecto

La aplicación sigue un patrón de **layout centralizado**:
* `App.vue` define la estructura general.
* El **Router** se encarga de renderizar vistas, no layouts.
* Los componentes reutilizables viven fuera del router.
* La lógica se separa en **stores** y **services**.

### Estructura de archivos:
```text
src
├── assets          # Recursos estáticos
├── components      # Componentes UI reutilizables
├── layouts         # Estructuras de página
├── router          # Configuración de rutas
├── stores          # Estado global (Pinia)
├── services        # Lógica de API/Supabase
├── views           # Vistas por rol
│   ├── public
│   ├── cliente
│   ├── instructor
│   └── admin
├── App.vue
└── main.ts

