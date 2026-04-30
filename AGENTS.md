# AGENTS.md — Codigo Camp (La Puerta / Camp Bello)

Aplicación web fullstack para gestionar y visualizar puntuaciones de equipos
en tiempo real durante campamentos o eventos. Los equipos acumulan "cash" (puntos)
que se muestran con barras animadas y efectos de sonido en la pantalla de ranking.

---

## Setup y arranque

### Arrancar todo (frontend + API)
```bash
cd frontend
npm install
npm run start
# Lanza Vite (puerto 5173) + Express (puerto 8080) simultáneamente con concurrently
```

### Arrancar solo el frontend
```bash
cd frontend
npm run dev
# Vite en http://localhost:5173
```

### Arrancar solo la API
```bash
cd api
node app.js
# Express en http://localhost:8080
# O con hot-reload: npx nodemon app.js
```

### Prerequisitos
- Node.js instalado
- MySQL corriendo localmente
- Base de datos `campBello-bd` creada en MySQL
- Usuario `root` con contraseña `123456789` (ver Gotchas — esto debe migrarse a .env)

---

## Estructura del proyecto

```
codigo camp/
├── api/                        ← Backend Node.js + Express + Sequelize + MySQL
│   ├── app.js                  ← Entry point: instancia y lanza la clase Server
│   ├── database/
│   │   └── config.js           ← Conexión Sequelize a MySQL
│   ├── models/
│   │   ├── server.js           ← Clase Server (Express, middlewares, rutas)
│   │   └── team.js             ← Modelo Sequelize para la tabla Teams
│   ├── routes/
│   │   └── teams.js            ← Rutas REST: GET, POST, PUT /api/teams
│   └── controllers/
│       └── team.controller.js  ← Lógica de negocio de equipos
│
└── frontend/                   ← React 18 + Vite 4 + Tailwind CSS 3
    └── src/
        ├── App.jsx             ← Router raíz con rutas / y /vault
        ├── components/
        │   ├── Layout.jsx      ← Shell: header, nav, dark mode toggle
        │   ├── Home.jsx        ← Ruta /: pantalla principal con botones de acción
        │   ├── CashCounter.jsx ← Ruta /vault: animación de ranking con barras
        │   ├── Modal.jsx       ← Wrapper genérico de modal
        │   ├── AddTeamModal.jsx← Formulario para crear un equipo nuevo
        │   ├── BankModal.jsx   ← Formulario para actualizar puntos de un equipo
        │   ├── Alert.jsx       ← Toast de notificaciones
        │   └── ui/             ← Sistema de diseño (usar siempre estos)
        │       ├── Button.jsx
        │       ├── Card.jsx
        │       └── Input.jsx
        └── assets/             ← Imágenes, videos (vault-video.mp4, contador.mp4),
                                    audio (cash-counter.mp3), logos
```

---

## Stack técnico

| Capa | Tecnología | Versión |
|---|---|---|
| Frontend framework | React | 18.2.0 |
| Bundler | Vite | 4.4.5 |
| Routing | React Router DOM | 6.16.0 |
| Estilos | Tailwind CSS | 3.3.3 |
| Dark mode | Estrategia `class` de Tailwind | — |
| HTTP client | Axios | 1.5.1 |
| Animaciones | @react-spring/web | 9.7.3 |
| Video | react-player | 2.13.0 |
| Backend | Express | 4.18.2 |
| ORM | Sequelize | 6.33.0 |
| Base de datos | MySQL (driver mysql2) | 3.6.1 |
| Concurrencia dev | concurrently | 8.2.1 |
| Linting | ESLint | 8.45.0 |
| Lenguaje | JavaScript (sin TypeScript) | ES2020+ |

---

## Rutas de la aplicación

| Ruta | Componente | Descripción |
|---|---|---|
| `/` | `Home.jsx` | Pantalla principal: botones para agregar equipo y gestionar puntos |
| `/vault` | `CashCounter.jsx` | Animación de ranking: video introductorio + barras de puntos animadas |

---

## API endpoints

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/api/teams` | Lista todos los equipos |
| `GET` | `/api/teams/rank` | Lista equipos con campo `percent` calculado (para barras) |
| `POST` | `/api/teams` | Crea un equipo (`name`, `cash`, `color`) |
| `PUT` | `/api/teams/:id` | Actualiza el `cash` de un equipo |

---

## Gotchas críticos

- **Credenciales hardcodeadas:** `api/database/config.js` tiene usuario `root` y contraseña
  `123456789` directamente en el código. Si se pide trabajar con variables de entorno,
  usar la skill `setup-env-vars`.

- **URL de API hardcodeada:** Los componentes `CashCounter.jsx`, `BankModal.jsx` y
  `AddTeamModal.jsx` tienen `http://localhost:8080` hardcodeado en cada llamada Axios.
  Debe migrarse a `import.meta.env.VITE_API_URL`.

- **Sistema de componentes dual:** Existen `components/Button.jsx` y `components/ButtonIcon.jsx`
  legados (con colores hardcodeados). NO usar estos. Usar siempre `components/ui/Button.jsx`.

- **Sin script `dev` en la API:** El `package.json` de `api/` no tiene script para nodemon.
  Para hot-reload usar `npx nodemon app.js` desde la carpeta `api/`.

- **Sin TypeScript:** Todo es `.jsx`/`.js`. No migrar a TypeScript sin petición explícita.

- **Sin tests:** No hay framework de testing configurado.

- **Sin autenticación:** La app y la API son completamente públicas.

---

## Deuda técnica documentada

- [ ] Migrar credenciales de BD a `.env` → skill `setup-env-vars`
  - Afecta: `api/database/config.js:3` (password `123456789` hardcodeado)
- [ ] Centralizar URL base de API en variable de entorno → skill `setup-env-vars`
  - Afecta: `frontend/src/components/CashCounter.jsx:94`, `AddTeamModal.jsx:37`, `BankModal.jsx:31,52`
- [ ] Agregar validación de inputs en controladores → ver `api/controllers/team.controller.js`
  - `getTeams` y `getRank` no tienen try/catch
  - `postTeams` no valida campos antes de llamar `Team.create()`
- [ ] Restringir CORS → `api/models/server.js:36` — cambiar `cors()` por `cors({ origin: 'http://localhost:5173' })`
- [ ] Agregar script `dev` con nodemon en `api/package.json` → actualmente requiere `npx nodemon app.js`
- [ ] Configurar framework de testing → skill `setup-testing` (Vitest recomendado)
- [ ] Eliminar componentes legacy → `frontend/src/components/Button.jsx` y `ButtonIcon.jsx`
- [ ] `sqlite3` instalado sin uso en `api/package.json` → desinstalar con `npm uninstall sqlite3`
- [ ] Dark mode no persiste entre recargas → `isDarkMode` solo en memoria en `Layout.jsx`
- [ ] `frontend/La Puerta.bat` es un artefacto Windows huérfano → eliminar o mover a `scripts/`
- [ ] `frontend/README.md` es el README por defecto de Vite → actualizar con info del proyecto

---

## Comandos más usados

| Comando | Desde | Para qué |
|---|---|---|
| `npm run start` | `frontend/` | Lanza frontend (5173) + API (8080) simultáneamente |
| `npm run dev` | `frontend/` | Solo el frontend Vite |
| `node app.js` | `api/` | Solo la API Express |
| `npx nodemon app.js` | `api/` | API con hot-reload |
| `npm run lint` | `frontend/` | Verifica ESLint — correr antes de commitear |
| `npm run build` | `frontend/` | Build de producción en `dist/` |

---

## Para el agente: dónde buscar primero

| Necesitas... | Empieza en... |
|---|---|
| Agregar un endpoint nuevo | `api/routes/teams.js` (referencia de patrón) → skill `add-api-endpoint` |
| Agregar un componente UI | `frontend/src/components/ui/Button.jsx` (referencia) → skill `add-react-component` |
| Agregar una entidad de BD | `api/models/team.js` (referencia) → skill `add-sequelize-model` |
| Debuggear un error | Empezar en `api/models/server.js`, luego `controllers/` → skill `debug-fullstack` |
| Configurar variables de entorno | `api/database/config.js` (credenciales actuales) → skill `setup-env-vars` |
| Entender el flujo de datos | `frontend/src/components/BankModal.jsx` (ejemplo completo: fetch + state + UI) |
| Entender las animaciones | `frontend/src/components/CashCounter.jsx` (react-spring + ReactPlayer) |
| Registrar una nueva ruta Express | `api/models/server.js` constructor + método `routes()` |
| Ver los tokens de color disponibles | `frontend/tailwind.config.js` (primary + secondary) |
| Ver los componentes UI disponibles | `frontend/src/components/ui/` (Button, Card, Input) |
