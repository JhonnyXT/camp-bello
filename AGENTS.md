# AGENTS.md — Camp Bello · Campaña del Soldado

Aplicación web fullstack para gestionar y visualizar en tiempo real la campaña
de puntos de equipos durante campamentos juveniles con temática militar-cristiana.

> Temática: *"Sufre penalidades como buen soldado de Jesucristo"* — 2 Tim 2:3

---

## Setup y arranque

```bash
# Arrancar TODO (frontend + API)
cd frontend
npm install
npm run start          # Vite :5173 + Express :8080 simultáneamente

# Solo frontend
npm run dev            # http://localhost:5173

# Solo API
cd api
node app.js            # http://localhost:8080
npx nodemon app.js     # con hot-reload
```

### Requisitos previos
- Node.js instalado
- MySQL corriendo localmente
- Base de datos `campBello-bd` creada
- Variables de entorno configuradas (ver `api/.env` y `frontend/.env`)

---

## Estructura del proyecto

```
codigo camp/
├── api/                          ← Backend Node.js + Express + Sequelize + MySQL
│   ├── app.js                    ← Entry point (carga .env + instancia Server)
│   ├── .env                      ← Credenciales BD y puerto (no en git)
│   ├── .env.example              ← Plantilla de variables de entorno
│   ├── database/config.js        ← Conexión Sequelize a MySQL
│   ├── models/
│   │   ├── server.js             ← Clase Server (Express, middlewares, rutas)
│   │   └── team.js               ← Modelo Sequelize: tabla Teams
│   ├── routes/teams.js           ← Rutas REST /api/teams
│   └── controllers/
│       └── team.controller.js    ← Lógica de negocio de equipos
│
└── frontend/                     ← React 18 + Vite 4 + Tailwind CSS 3
    ├── public/
    │   └── theme.mp3             ← Música de fondo del campamento
    └── src/
        ├── App.jsx               ← Router raíz (createBrowserRouter)
        ├── constants/
        │   ├── soldiers.js       ← Arquetipos de soldado y sus pasivos
        │   └── mapZones.js       ← Zonas del mapa y rangos porcentuales
        ├── utils/
        │   ├── game.js           ← Lógica: getZone, applyPassive, formatPoints
        │   ├── audio.js          ← Singleton de audio persistente
        │   └── questionBank.js   ← CRUD localStorage para bancos de eventos
        └── components/
            ├── Landing.jsx       ← Ruta /     — Pantalla de bienvenida animada
            ├── SoldierSelection.jsx ← Ruta /seleccion — Asignar soldados a equipos
            ├── CampaignMap.jsx   ← Ruta /mapa — Mapa de zonas en tiempo real
            ├── CommandPanel.jsx  ← Ruta /comando — Panel del Game Master
            ├── Layout.jsx        ← Shell legacy (rutas /admin y /vault)
            ├── Home.jsx          ← Ruta /admin — Gestión básica de equipos
            ├── CashCounter.jsx   ← Ruta /vault — Ranking animado legacy
            └── ui/               ← Sistema de diseño: Button, Card, Input
```

---

## Rutas de la aplicación

| Ruta | Componente | Descripción |
|---|---|---|
| `/` | `Landing.jsx` | Pantalla de bienvenida animada. Inicia el audio. |
| `/seleccion` | `SoldierSelection.jsx` | El Game Master asigna arquetipos de soldado a cada equipo. |
| `/mapa` | `CampaignMap.jsx` | Vista pública del mapa de campaña. Se actualiza en tiempo real vía polling + BroadcastChannel. |
| `/comando` | `CommandPanel.jsx` | Panel privado del GM (protegido con PIN). Gestiona puntos y lanza eventos. |
| `/admin` | `Home.jsx` | Gestión básica legacy (crear equipos, actualizar puntos). |
| `/vault` | `CashCounter.jsx` | Ranking animado con barras spring (pantalla legacy). |

---

## API endpoints

| Método | Ruta | Cuerpo | Descripción |
|---|---|---|---|
| `GET` | `/api/teams` | — | Lista todos los equipos (id, name, cash, color, soldierType) |
| `GET` | `/api/teams/rank` | — | Lista equipos + campo `percent` calculado respecto al líder |
| `POST` | `/api/teams` | `{name, cash, color}` | Crea un equipo nuevo |
| `PUT` | `/api/teams/:id` | `{cash?, name?, color?}` | Actualiza uno o más campos del equipo |
| `PUT` | `/api/teams/:id/soldier` | `{soldierType}` | Asigna el arquetipo de soldado al equipo |

---

## Sistema de juego — La Campaña del Soldado

### Concepto general

Cada **equipo** acumula puntos ("cash") durante el campamento.
El Game Master (GM) usa el Panel del Comandante (`/comando`) para aplicar eventos
que suman o restan puntos. El mapa (`/mapa`) refleja el progreso en tiempo real.

El avance en el mapa se basa en **posición relativa al líder**, no en puntos absolutos —
el equipo con más puntos siempre está al 100%, el resto se posiciona proporcionalmente.

---

### Zonas del mapa (5 niveles)

Las zonas se determinan en `utils/game.js → getZone(cash, maxCash)`.

| Zona | % respecto al líder | Emoji | Versículo |
|---|---|---|---|
| BASE RECLUTA | 0 % – 20 % | 🏕️ | Fil 4:13 |
| EL DESIERTO | 20 % – 40 % | 🏜️ | Sal 23:4 |
| MONTE DE PRUEBA | 40 % – 60 % | ⛰️ | Is 40:31 |
| CAMPO DE BATALLA | 60 % – 80 % | ⚔️ | Ef 6:11 |
| LA FORTALEZA | 80 % – 100 % | 🏰 | 2 Tim 2:3 |

> El equipo líder siempre aparece en LA FORTALEZA.
> Si todos tienen 0 puntos, todos están en BASE RECLUTA.

---

### Arquetipos de soldado (4 tipos)

Definidos en `frontend/src/constants/soldiers.js`. Cada equipo elige uno al inicio.

| ID | Nombre | Emoji | Pasivo en el juego |
|---|---|---|---|
| `guerrero` | GUERRERO | ⚔️ | **+10 pts extra** en misiones con toggle "física" activado |
| `estratega` | ESTRATEGIA | 🧠 | **Segunda oportunidad** en quizzes antes de recibir penalización |
| `guardian` | GUARDIÁN | 🛡️ | **Reduce −15%** en todas las penalizaciones (emboscada + fallo quiz/decisión) |
| `explorador` | EXPLORADOR | 🗺️ | **Puede relanzar la ruleta** una vez por turno |

#### Cómo se aplican los pasivos — `utils/game.js`

```js
// Aplicar el bonus de un soldado a los puntos de un evento
applyPassive(team, eventType, basePoints)

// eventType puede ser:
// 'mision-fisica'  → Guerrero +10%
// 'penalizacion'   → Guardián −15%
// 'quiz'           → Estrategia (manejo especial en QuizModal)
// 'ruleta'         → Explorador (UI en RuletaModal)
// 'bono'           → ningún pasivo aplica

// Obtener info del pasivo para mostrar badge en la UI
getPassiveInfo(team, eventType)
// Retorna: { label, color, emoji, desc } | null
```

---

### Eventos del juego (6 tipos)

Todos se activan desde `CommandPanel.jsx` y muestran overlays animados en `CampaignMap.jsx`
usando `BroadcastChannel('camp-events')`.

#### 1. EMBOSCADA 💥
- Resta puntos a uno o más equipos.
- El GM selecciona equipos y escoge −200/−100 o monto libre.
- **Pasivo Guardián**: aplica automáticamente −15% al equipo si tiene este arquetipo.
- Overlay rojo en el mapa con nombre de equipos afectados.

#### 2. BONO DE HONOR 🌟
- Suma puntos a uno o más equipos.
- Misma UI que Emboscada pero con valores positivos.
- Overlay dorado en el mapa.

#### 3. QUIZ ❓
**Banco de preguntas** — guardado en `localStorage` con clave `camp-questions`.

Flujo completo:
1. GM crea preguntas en la pestaña "Banco" (texto + tipo: múltiple/verdadero-falso + respuesta correcta).
2. GM selecciona una pregunta del banco y hace clic en "Lanzar al mapa".
3. **`/mapa`** muestra overlay azul animado con la pregunta y opciones.
4. GM vuelve al modal → marca cada equipo como ✓ o ✗.
5. **Pasivo Estrategia**: los equipos con este arquetipo tienen botón "🧠 2ª oportunidad" antes de recibir −pts.
6. GM hace clic en "Aplicar resultados" → los puntos se actualizan y el overlay cierra.

Puntos:
- Correcto → `+amount` (definido en el modal, por defecto ?)
- Incorrecto → `−amount`
- Guardián con respuesta incorrecta → `−amount × 0.85`

#### 4. DECISIÓN ⚔️
**Banco de decisiones** — guardado en `localStorage` con clave `camp-decisions`.

Flujo:
1. GM crea dilemas con título, descripción y dos opciones (cada una con delta de puntos).
2. GM lanza desde el banco → overlay en `/mapa` con el dilema.
3. GM asigna cada equipo a Opción A o Opción B.
4. **Pasivo Guardián**: si la opción elegida tiene delta negativo, se reduce el 15%.
5. GM aplica resultados.

#### 5. MISIÓN 🎯
**Banco de misiones** — guardado en `localStorage` con clave `camp-missions`.

Flujo:
1. GM crea misiones con título, descripción y toggle "¿Es física?" (para el bonus de Guerrero).
2. GM lanza desde banco → overlay verde en `/mapa`.
3. **Todos los equipos participan automáticamente.**
4. GM marca individualmente cada equipo: ✅ Superada / ❌ Fallida.
5. **Pasivo Guerrero**: si la misión es física, los equipos Guerrero reciben `+amount × 1.10`.
6. GM aplica resultados → overlay en `/mapa` muestra equipos que superaron y fallaron por separado.

#### 6. RULETA 🎲
Evento aleatorio que lanza un resultado entre una lista de eventos predefinidos.

Flujo:
1. GM selecciona el/los equipo(s) participantes.
2. Hace clic en "Girar ruleta" → overlay animado de la ruleta aparece en `/mapa`.
3. **Pasivo Explorador**: si el equipo tiene este arquetipo, hay botón "Relanzar (1 vez)" visible.
4. GM revela el resultado → se aplican puntos.

---

### Comunicación en tiempo real — BroadcastChannel

Los overlays del mapa se sincronizan con el panel del comandante usando
`BroadcastChannel('camp-events')` (sin servidor — solo funciona en la misma pestaña/mismo origen).

```js
// Tipos de mensaje que escucha CampaignMap.jsx:
'emboscada'     → overlay rojo de penalización
'bono'          → overlay dorado de bonus
'quiz-show'     → mostrar pregunta en overlay azul
'quiz-hide'     → ocultar overlay de quiz
'quiz-result'   → ocultar quiz + mostrar overlay de resultado
'decision-show' → mostrar dilema en overlay
'decision-hide' → ocultar overlay de decision
'decision'      → resultado de decision
'mision-show'   → mostrar misión en overlay
'mision-hide'   → ocultar overlay de misión
'mision'        → resultado de misión (con passTeams / failTeams)
'ruleta-spin'   → mostrar animación de ruleta
'ruleta-hide'   → ocultar ruleta
'ruleta'        → resultado final de ruleta
```

> **Importante**: el BroadcastChannel solo funciona entre pestañas del mismo origen.
> Para producción en dominios diferentes, se necesitaría WebSocket o SSE.

---

### Overlays del mapa — comportamiento

- Los overlays permanecen visibles **hasta que se cierren manualmente**.
- Formas de cerrar: clic en el fondo, botón "ESC · CERRAR", o tecla `Escape`.
- No hay auto-dismiss por tiempo (el timer de 5.5s fue eliminado).

---

### Polling y actualización de datos

`CampaignMap.jsx` hace polling a `GET /api/teams` cada 5 segundos
(configurable con `VITE_POLL_INTERVAL` en `frontend/.env`).

El panel del comandante hace polling cada 10 segundos.

---

### Autenticación del Game Master

El panel `/comando` pide un PIN de 4 dígitos al cargar.
El PIN se define en `frontend/.env` como `VITE_MASTER_PIN`.

> Esta protección es solo por UI — la API no tiene autenticación de fondo.

---

### Banco de eventos — localStorage

Los bancos de preguntas, decisiones y misiones se guardan en el navegador del GM.
**No se persisten en la base de datos** — si el GM limpia localStorage o cambia de navegador, se pierden.

```js
// Importar helpers del banco
import { getQuestions, saveQuestion, deleteQuestion } from '../utils/questionBank';
import { getDecisions, saveDecision, deleteDecision } from '../utils/questionBank';
import { getMissions,  saveMission,  deleteMission  } from '../utils/questionBank';
```

---

### Audio

Singleton en `utils/audio.js` que persiste entre cambios de ruta.
El archivo es `public/theme.mp3` (servido como asset estático por Vite).

```js
import { playAudio, toggleMute, isPlaying } from '../utils/audio';

playAudio();       // inicia reproducción (respeta autoplay policy del browser)
toggleMute();      // alterna mute, retorna el nuevo estado (true = muteado)
isPlaying();       // retorna boolean
```

---

## Variables de entorno

### `api/.env`
```
PORT=8080
DB_NAME=campBello-bd
DB_USER=root
DB_PASS=123456789
DB_HOST=localhost
```

### `frontend/.env`
```
VITE_API_URL=http://localhost:8080
VITE_POLL_INTERVAL=5000
VITE_MASTER_PIN=1234
```

---

## Stack técnico

| Capa | Tecnología | Versión |
|---|---|---|
| Frontend | React | 18.2.0 |
| Bundler | Vite | 4.4.5 |
| Routing | React Router DOM | 6.16.0 |
| Estilos | Tailwind CSS | 3.3.3 |
| HTTP client | Axios | 1.5.1 |
| Animaciones spring | @react-spring/web | 9.7.3 |
| Backend | Express | 4.18.2 |
| ORM | Sequelize | 6.33.0 |
| Base de datos | MySQL (driver mysql2) | 3.6.1 |
| Lenguaje | JavaScript ES2020+ | — |

---

## Deuda técnica conocida

- [ ] **Bancos de eventos en localStorage** — si el GM cambia de dispositivo se pierden. Migrar a tabla en BD.
- [ ] **Credenciales en `.env` pero sin rotación** — la contraseña `123456789` debe cambiarse en producción.
- [ ] **CORS abierto** — `api/models/server.js` acepta cualquier origen. Restringir con `cors({ origin: process.env.ALLOWED_ORIGIN })`.
- [ ] **Sin autenticación real** — el PIN de `/comando` es solo UI. Agregar token JWT o sesión en la API.
- [ ] **BroadcastChannel solo same-origin** — no funciona entre dispositivos distintos. Migrar a WebSocket para eventos en vivo entre pantallas físicamente separadas.
- [ ] **Sin validación de inputs en la API** — `postTeams` no valida campos antes de `Team.create()`.
- [ ] **Componentes legacy** — `components/Button.jsx` y `ButtonIcon.jsx` existen pero están deprecados. No usar.
- [ ] **`sqlite3` instalado sin uso** en `api/package.json` — desinstalar.
- [ ] **Pasivo del Explorador incompleto** — la descripción dice "elegir el siguiente evento del mapa" pero la implementación actual solo permite relanzar la ruleta. El pasivo completo está pendiente de diseñar.

---

## Para el agente: dónde buscar primero

| Necesitas... | Empieza en... |
|---|---|
| Agregar un evento nuevo al juego | `CommandPanel.jsx` (buscar `QuizModal` como referencia de patrón) |
| Modificar una zona del mapa | `frontend/src/constants/mapZones.js` |
| Cambiar un pasivo de soldado | `frontend/src/utils/game.js` → `applyPassive` |
| Agregar un arquetipo nuevo | `frontend/src/constants/soldiers.js` + `applyPassive` + `getPassiveInfo` |
| Cambiar el overlay de un evento | `CampaignMap.jsx` → sección `flashEvent` |
| Agregar un campo nuevo a Teams | `api/models/team.js` → columna → `api/controllers/team.controller.js` → endpoint |
| Ver cómo se guarda un banco de eventos | `frontend/src/utils/questionBank.js` |
| Entender el flujo completo de un evento | Leer `CommandPanel.jsx` → modal del evento → `BroadcastChannel` → `CampaignMap.jsx` |
| Configurar env vars | Skill `setup-env-vars` |
| Debuggear algo | Skill `debug-fullstack` |
