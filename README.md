# Camp Bello — Campaña del Soldado

> *"Sufre penalidades como buen soldado de Jesucristo"* — 2 Timoteo 2:3

Aplicación web fullstack para gestionar en tiempo real la campaña de puntos de equipos durante campamentos juveniles con temática militar-cristiana. Los equipos avanzan por un mapa de 5 zonas según sus puntos, eligen un arquetipo de soldado con habilidades únicas, y el Game Master orquesta eventos interactivos en vivo.

---

## Pantallas principales

| Ruta | Pantalla | Quién la usa |
|---|---|---|
| `/` | Landing animada con música | Todos los participantes |
| `/seleccion` | Asignación de arquetipo a equipos | Game Master (antes del juego) |
| `/mapa` | Mapa de campaña en tiempo real | Pantalla pública / proyector |
| `/comando` | Panel del Game Master (PIN requerido) | Solo el Game Master |

---

## Stack

- **Frontend**: React 18 · Vite 4 · Tailwind CSS 3 · React Router DOM 6 · Axios
- **Backend**: Node.js · Express 4 · Sequelize 6 · MySQL
- **Comunicación en tiempo real**: BroadcastChannel API (mismo dispositivo) + polling cada 5s
- **Audio**: Singleton persistente entre rutas (`public/theme.mp3`)
- **Bancos de eventos**: localStorage del navegador del GM

---

## Setup rápido

### Requisitos
- Node.js ≥ 18
- MySQL corriendo localmente
- Base de datos `campBello-bd` creada en MySQL

### 1. Variables de entorno

```bash
# api/.env
PORT=8080
DB_NAME=campBello-bd
DB_USER=root
DB_PASS=tu_contraseña
DB_HOST=localhost

# frontend/.env
VITE_API_URL=http://localhost:8080
VITE_POLL_INTERVAL=5000
VITE_MASTER_PIN=1234
```

### 2. Arrancar todo

```bash
cd frontend
npm install
npm run start        # Lanza frontend (:5173) + API (:8080) simultáneamente
```

### Solo frontend
```bash
cd frontend && npm run dev
```

### Solo API
```bash
cd api && node app.js
# Con hot-reload:
cd api && npx nodemon app.js
```

---

## Cómo funciona el juego

### Zonas del mapa

Los equipos avanzan por 5 zonas según su **porcentaje respecto al líder** (no por puntos absolutos). El equipo con más puntos siempre está al 100%.

| Zona | Rango | Emoji |
|---|---|---|
| BASE RECLUTA | 0 % – 20 % | 🏕️ |
| EL DESIERTO | 20 % – 40 % | 🏜️ |
| MONTE DE PRUEBA | 40 % – 60 % | ⛰️ |
| CAMPO DE BATALLA | 60 % – 80 % | ⚔️ |
| LA FORTALEZA | 80 % – 100 % | 🏰 |

### Arquetipos de soldado

Cada equipo elige uno antes de comenzar desde `/seleccion`:

| Arquetipo | Pasivo |
|---|---|
| ⚔️ GUERRERO | +10 % en misiones físicas |
| 🧠 ESTRATEGIA | Segunda oportunidad en quizzes |
| 🛡️ GUARDIÁN | −15 % en todas las penalizaciones |
| 🗺️ EXPLORADOR | Puede relanzar la ruleta una vez |

### Eventos del juego (desde `/comando`)

| Evento | Efecto |
|---|---|
| 💥 Emboscada | Resta puntos a equipo(s) seleccionados |
| 🌟 Bono de Honor | Suma puntos a equipo(s) seleccionados |
| ❓ Quiz | Pregunta con banco, overlay en el mapa, GM marca quién acertó |
| ⚔️ Decisión | Dilema con dos opciones, GM asigna qué eligió cada equipo |
| 🎯 Misión | Reto colectivo, GM marca cada equipo como superado/fallido |
| 🎲 Ruleta | Evento aleatorio con animación en el mapa |

Todos los eventos se reflejan en tiempo real en `/mapa` mediante overlays animados que se cierran manualmente (clic, botón o tecla `ESC`).

---

## Flujo recomendado de una sesión

```
1. Crear equipos en /admin (si no existen)
2. Abrir /seleccion — asignar arquetipo a cada equipo
3. Proyectar /mapa en pantalla grande
4. Abrir /comando en el dispositivo del Game Master (ingresar PIN)
5. Gestionar puntos y lanzar eventos durante el campamento
```

---

## API endpoints

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/teams` | Lista todos los equipos |
| GET | `/api/teams/rank` | Equipos con % calculado respecto al líder |
| POST | `/api/teams` | Crea equipo (`name`, `cash`, `color`) |
| PUT | `/api/teams/:id` | Actualiza `cash`, `name` y/o `color` |
| PUT | `/api/teams/:id/soldier` | Asigna arquetipo (`soldierType`) |

---

## Estructura del proyecto

```
codigo camp/
├── api/                    ← Express + Sequelize + MySQL
│   ├── app.js
│   ├── .env                ← Credenciales (no en git)
│   ├── database/config.js
│   ├── models/
│   ├── routes/
│   └── controllers/
└── frontend/               ← React 18 + Vite + Tailwind
    ├── public/theme.mp3    ← Música de fondo
    └── src/
        ├── App.jsx
        ├── constants/      ← soldiers.js, mapZones.js
        ├── utils/          ← game.js, audio.js, questionBank.js
        └── components/     ← Landing, SoldierSelection, CampaignMap, CommandPanel
```

---

## Para desarrolladores

- Todo el código es **JavaScript puro** (`.jsx`/`.js`), sin TypeScript.
- Estilos exclusivamente con **Tailwind CSS** y la paleta `camp-*`.
- Named exports en todos los componentes React nuevos.
- Los bancos de eventos (preguntas, decisiones, misiones) se guardan en `localStorage` del GM — no en la base de datos.
- El PIN de `/comando` es solo validación en el cliente.
- Ver [`AGENTS.md`](AGENTS.md) para contexto completo del sistema y guía para agentes de IA.
