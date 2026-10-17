# PulseMarket

Aplicación de gestión de ventas construida con Next.js, TypeScript, Prisma y
PostgreSQL. Incluye login OAuth con Google y GitHub, un panel con métricas,
tablero Kanban persistente y catálogo paginado con acciones de servidor.

## Desarrollo local

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000). Para generar la versión de
producción ejecuta `npm run build` y luego `npm start`.

Configura `.env.local` con los valores de `.env.example`, reemplazando la URL de
PostgreSQL, el secreto de NextAuth y las credenciales OAuth de Google y GitHub.
Después prepara la base de datos y los datos de ejemplo:

```bash
npm run db:generate
npm run db:push
npm run db:seed
npm run test:unit
npm run test:e2e
```

El seed inserta hasta 10,515 registros de ejemplo y se puede volver a ejecutar:
usa identificadores dedicados y no elimina datos existentes. No ejecutes `db:push`
contra una base de datos compartida sin revisar primero los cambios de esquema.
Las pruebas E2E requieren una base de datos preparada y Chromium instalado con
`npx playwright install chromium`.
Las pruebas E2E requieren una base de datos preparada y Chromium instalado con
`npx playwright install chromium`.

GitHub Actions ejecuta la comprobación de tipos, pruebas unitarias, pruebas E2E
con PostgreSQL y la compilación. El despliegue a producción debe configurarse por
separado con un proveedor y credenciales de despliegue.

## Estructura

```text
pulsemarket/
├── .github/
│   └── workflows/
│       └── ci-cd.yml
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   └── login/
│   │   │       └── page.tsx
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── kanban/
│   │   │   │   ├── page.tsx
│   │   │   │   └── actions.ts
│   │   │   └── products/
│   │   │       ├── page.tsx
│   │   │       └── actions.ts
│   │   ├── api/
│   │   │   └── auth/
│   │   │       └── [...nextauth]/
│   │   │           └── route.ts
│   │   ├── globals.css
│   │   └── layout.tsx
│   ├── components/
│   │   ├── ui/
│   │   │   └── skeleton.tsx
│   │   ├── dashboard/
│   │   │   └── kpi-cards.tsx
│   │   ├── kanban/
│   │   │   └── kanban-board.tsx
│   │   └── products/
│   │       ├── product-table.tsx
│   │       ├── product-management.tsx
│   │       └── bulk-update-modal.tsx
│   ├── lib/
│   │   ├── auth.ts
│   │   ├── db.ts
│   │   ├── utils.ts
│   │   ├── metrics.ts
│   │   └── validators/
│   │       └── schemas.ts
│   ├── proxy.ts
│   ├── services/
│   │   └── analytics.ts
│   └── types/
│       └── next-auth.d.ts
├── tests/
│   ├── unit/
│   │   ├── metrics.test.ts
│   │   ├── validators.test.ts
│   │   └── utils.test.ts
│   └── e2e/
│       ├── auth.spec.ts
│       ├── product.spec.ts
│       ├── kanban.spec.ts
│       └── global-setup.ts
├── .eslintrc.json
├── next.config.js
├── package.json
├── prisma.config.ts
├── playwright.config.ts
├── tsconfig.json
└── vitest.config.ts
```

## ¿Para qué sirve cada parte?

### Automatización y datos

- `.github/workflows/`: contiene flujos automatizados que GitHub Actions ejecuta
  ante cambios en el repositorio.
- `.github/workflows/ci-cd.yml`: es el pipeline para instalar dependencias,
  comprobar tipos, ejecutar pruebas y construir la aplicación en GitHub Actions.
- `prisma/`: reúne el esquema de datos y las tareas de inicialización de la base.
- `prisma/schema.prisma`: definirá los modelos y relaciones de usuarios,
  productos, ventas, clientes y tareas del Kanban.
- `prisma/seed.ts`: permitirá cargar datos de ejemplo o datos masivos de
  desarrollo; inserta de forma idempotente 10,515 registros sin borrar datos.
- `prisma.config.ts`: configura la ruta del esquema y el comando que ejecuta
  Prisma para el seed.

### Aplicación (`src/`)

- `src/app/`: contiene las rutas, páginas y layouts de Next.js App Router.
- `src/app/(auth)/`: agrupa páginas relacionadas con el acceso y la sesión.
- `src/app/(auth)/login/`: alberga la pantalla de inicio de sesión.
- `src/app/(auth)/login/page.tsx`: será la página de login y la interfaz para los
  proveedores OAuth de Google y GitHub.
- `src/app/(dashboard)/`: agrupa las páginas privadas del panel.
- `src/app/(dashboard)/layout.tsx`: compartirá la estructura del panel, como
  navegación, barra lateral y encabezado.
- `src/app/(dashboard)/page.tsx`: será la página principal con métricas y
  analítica.
- `src/app/(dashboard)/kanban/`: contiene la ruta del tablero de tareas.
- `src/app/(dashboard)/kanban/page.tsx`: muestra el tablero y permite arrastrar
  tareas para persistir su estado.
- `src/app/(dashboard)/kanban/actions.ts`: verifica la sesión y guarda cambios de
  estado y posición de las tareas.
- `src/app/(dashboard)/products/`: contiene las rutas del catálogo de productos.
- `src/app/(dashboard)/products/page.tsx`: mostrará el catálogo, su paginación y
  las acciones de servidor relacionadas.
- `src/app/(dashboard)/products/actions.ts`: pagina, crea, actualiza en lote y
  marca productos como eliminados sin borrarlos físicamente.
- `src/app/api/`: reúne endpoints HTTP de la aplicación.
- `src/app/api/auth/`: reserva las rutas de API para autenticación.
- `src/app/api/auth/[...nextauth]/`: aloja la ruta dinámica de NextAuth.
- `src/app/api/auth/[...nextauth]/route.ts`: expondrá los métodos HTTP que
  gestione NextAuth.
- `src/app/globals.css`: contendrá los estilos globales y las directivas de
  Tailwind CSS.
- `src/app/layout.tsx`: definirá el layout raíz compartido por las páginas.
- `src/components/`: reúne componentes reutilizables de la interfaz.
- `src/components/ui/`: contiene elementos visuales genéricos; `skeleton.tsx`
  implementa un indicador de carga.
- `src/components/dashboard/`: contiene tarjetas KPI y componentes de gráficos
  del panel; `kpi-cards.tsx` muestra métricas y su estado de carga.
- `src/components/kanban/`: contiene columnas y tarjetas del tablero Kanban;
  `kanban-board.tsx` permite avanzar tareas y guardar el cambio en la base de
  datos.
- `src/components/products/`: contiene formularios y tablas de productos;
  `product-table.tsx` presenta los productos y permite cambiar de página,
  `product-management.tsx` crea productos y abre el ajuste masivo y
  `bulk-update-modal.tsx` aplica cambios de precio por categoría.
- `src/lib/`: agrupa utilidades e integraciones compartidas por distintas áreas.
- `src/lib/auth.ts`: configura NextAuth, los proveedores OAuth y la validación de
  sesión en el servidor.
- `src/lib/db.ts`: exporta una instancia compartida del cliente Prisma.
- `src/lib/utils.ts`: exporta utilidades para combinar clases CSS y formatear
  moneda.
- `src/lib/metrics.ts`: contiene cálculos financieros puros para ingresos,
  crecimiento, promedios y redondeo.
- `src/lib/validators/`: agrupa validadores de datos de entrada.
- `src/lib/validators/schemas.ts`: define los esquemas Zod para productos,
  tareas y operaciones por lote.
- `src/proxy.ts`: realiza comprobaciones tempranas de sesión y redirige las rutas
  privadas; las acciones de servidor también comprueban autorización.
- `src/types/next-auth.d.ts`: agrega el identificador de usuario al tipo de
  sesión de NextAuth.
- `src/services/`: contiene servicios de dominio y lógica reutilizable.
- `src/services/analytics.ts`: consulta las ventas y calcula métricas y
  variaciones de ingresos.

### Pruebas

- `tests/`: contiene las pruebas automatizadas del proyecto.
- `tests/unit/`: agrupa pruebas unitarias rápidas de funciones y validaciones.
- `tests/unit/metrics.test.ts`: contiene diez pruebas de cálculos de métricas
  financieras.
- `tests/unit/validators.test.ts`: prueba los esquemas y límites de validación.
- `tests/unit/utils.test.ts`: verifica la combinación de clases y el formato de
  moneda.
- `tests/e2e/`: agrupa pruebas end-to-end que recorren la aplicación.
- `tests/e2e/auth.spec.ts`: prueba la pantalla de login, los proveedores OAuth y
  las redirecciones de usuarios no autenticados.
- `tests/e2e/product.spec.ts`: prueba la creación de productos y el modal de
  ajuste masivo.
- `tests/e2e/kanban.spec.ts`: prueba arrastrar tareas y persistir el cambio.
- `tests/e2e/global-setup.ts`: crea el estado de sesión de prueba con un token
  firmado para no depender de proveedores OAuth externos.

### Configuración del proyecto

- `.eslintrc.json`: configurará las reglas de lint para mantener consistente el
  código.
- `next.config.js`: contendrá las opciones de configuración de Next.js.
- `package.json`: declarará el nombre del proyecto, sus dependencias y comandos
  de desarrollo y preparación de la base de datos.
- `prisma.config.ts`: declara el comando de Prisma Seed.
- `playwright.config.ts`: configurará la ejecución de las pruebas end-to-end con
  Playwright.
- `tsconfig.json`: configurará TypeScript y las opciones de comprobación de
  tipos.
- `vitest.config.ts`: configura Vitest, el alias `@/` y las pruebas unitarias.
