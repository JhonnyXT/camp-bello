# AGENTS.md — Frontend (React 18 + Vite 4 + Tailwind CSS 3)

Interfaz web de Camp Bello · Campaña del Soldado.
Para el contexto completo del juego ver `../AGENTS.md`.

---

## Arranque

```bash
cd frontend
npm install
npm run dev          # Solo frontend en http://localhost:5173
npm run start        # Frontend + API simultáneamente (concurrently)
npm run build        # Build de producción en dist/
npm run lint         # ESLint — ejecutar antes de commitear
```

---

## Rutas y componentes principales

| Ruta | Componente | Tipo | Descripción |
|---|---|---|---|
| `/` | `Landing.jsx` | Fullscreen | Animación de bienvenida, inicia música |
| `/seleccion` | `SoldierSelection.jsx` | Fullscreen | GM asigna arquetipos de soldado a equipos |
| `/mapa` | `CampaignMap.jsx` | Fullscreen | Vista pública del mapa en tiempo real |
| `/comando` | `CommandPanel.jsx` | Fullscreen | Panel privado del GM (PIN requerido) |
| `/admin` | `Home.jsx` | Con Layout | Gestión básica de equipos (legacy) |
| `/vault` | `CashCounter.jsx` | Con Layout | Ranking animado con barras spring (legacy) |

Las pantallas fullscreen van directamente como `element` en el router (sin `<Layout>`).
El `<Layout>` es solo para rutas legacy.

---

## Paleta de colores — tokens `camp-`

Definidos en `tailwind.config.js`. **Usar siempre estos, nunca colores Tailwind directos.**

| Token | Valor hex | Uso |
|---|---|---|
| `camp-carbon` | `#1a1a1a` | Fondo principal |
| `camp-hueso` | `#f5f0e8` | Texto primario |
| `camp-arena` | `#d4c5a9` | Texto secundario / subtítulos |
| `camp-dorado` | `#C8922A` | Acentos dorados / Estrategia |
| `camp-rojo` | `#A93226` | Peligro / Guerrero / Emboscada |
| `camp-verde` | `#3D5A3E` | Éxito / Guardián / Base Recluta |
| `primary-{50..900}` | sky | Acciones principales / Explorador |

Tipografías disponibles (Google Fonts, cargadas en `index.html`):
- `font-display` → Bebas Neue (títulos grandes en mayúsculas)
- `font-military` → Barlow Condensed (texto de UI del juego)
- `font-body` → Inter (texto de formularios y contenido)

---

## Animaciones disponibles (definidas en tailwind.config.js)

```jsx
animate-fade-in      // fadeIn 0.3s ease-in-out
animate-slide-in     // slideInUp 0.4s ease-out
animate-zoom-in      // zoomIn 0.3s ease-out
animate-float-up     // floatUp 1s ease-out forwards
animate-pulse-slow   // pulse 3s ease-in-out infinite
animate-glow         // glow 0.5s ease-in-out
animate-shake        // shake 0.5s ease-in-out
animate-march        // march 1s linear infinite
```

Para overlays de eventos se usa `animate-fade-in` (antes usaba `fadeInOut` con auto-dismiss — eliminado).

---

## Componentes del sistema de diseño (`components/ui/`)

**Siempre usar estos. Los de `components/` raíz son legacy.**

### `ui/Button.jsx`
```jsx
<Button variant="primary" size="md" onClick={handler}>Texto</Button>
// variant: primary | secondary | outline | ghost
// size: sm | md | lg
```

### `ui/Card.jsx`
```jsx
<Card className="p-6">contenido</Card>
```

### `ui/Input.jsx`
```jsx
<Input label="Nombre" value={v} onChange={e => setV(e.target.value)} error="opcional" />
```

---

## Sistema de constantes y utilidades

### `constants/soldiers.js`
Define los 4 arquetipos (`SOLDIERS` array + `SOLDIERS_MAP` + `STAT_KEYS`).
```js
import { SOLDIERS, SOLDIERS_MAP, STAT_KEYS } from '../constants/soldiers';
// SOLDIERS_MAP['guerrero'] → { id, name, emoji, passive, borderClass, accentColor, stats, ... }
```

### `constants/mapZones.js`
Define las 5 zonas del mapa (`MAP_ZONES` array + `ZONES_MAP`).
```js
import { MAP_ZONES, ZONES_MAP } from '../constants/mapZones';
// ZONES_MAP['fortaleza'] → { id, name, emoji, rangeLabel, bgClass, borderClass, ... }
```

### `utils/game.js`
```js
import { getZone, applyPassive, getProgressPct, formatPoints, getPassiveInfo } from '../utils/game';

getZone(cash, maxCash)               // → objeto zona según % relativo al líder
applyPassive(team, eventType, pts)   // → puntos ajustados con el pasivo del soldado
getProgressPct(cash, maxCash)        // → 0-100
formatPoints(cash)                   // → '2.500' (separador de miles es-CO)
getPassiveInfo(team, eventType)      // → { label, color, emoji, desc } | null
```

### `utils/audio.js`
```js
import { playAudio, toggleMute, isPlaying, getAudio } from '../utils/audio';
// Singleton — no se destruye al cambiar rutas
// El audio solo inicia en Landing.jsx (por política de autoplay del browser)
```

### `utils/questionBank.js`
```js
import { getQuestions, saveQuestion, deleteQuestion } from '../utils/questionBank';
import { getDecisions, saveDecision, deleteDecision } from '../utils/questionBank';
import { getMissions, saveMission, deleteMission }   from '../utils/questionBank';
// Persiste en localStorage: 'camp-questions', 'camp-decisions', 'camp-missions'
// Cada ítem requiere un campo 'id' único (usar Date.now() o crypto.randomUUID())
```

---

## Patrón de llamadas a la API

La URL base viene de `import.meta.env.VITE_API_URL` (definida en `frontend/.env`).

```jsx
import axios from 'axios';
const API = import.meta.env.VITE_API_URL;

const fetchTeams = async () => {
  try {
    const { data } = await axios.get(`${API}/api/teams`);
    setTeams(data);
  } catch (err) {
    setAlert({ show: true, message: 'Error al cargar equipos', type: 'error' });
  }
};
```

---

## Patrón de overlays del mapa (BroadcastChannel)

`CommandPanel.jsx` emite → `CampaignMap.jsx` recibe.

```js
// Emitir desde CommandPanel
const ch = new BroadcastChannel('camp-events');
ch.postMessage({ type: 'quiz-show', question: { ... } });
ch.close();

// Escuchar en CampaignMap (ya implementado en el useEffect existente)
// Tipos: 'emboscada' | 'bono' | 'quiz-show/hide/result' |
//        'decision-show/hide/decision' | 'mision-show/hide/mision' |
//        'ruleta-spin/hide/ruleta'
```

---

## Notificaciones (Alert.jsx)

```jsx
const [alert, setAlert] = useState({ show: false, message: '', type: 'success' });
// type: 'success' | 'error' | 'warning'

setAlert({ show: true, message: 'Operación exitosa', type: 'success' });

{alert.show && <Alert alert={alert} setAlert={setAlert} />}
```

---

## Variables de entorno del frontend

```
VITE_API_URL=http://localhost:8080      # URL base de la API
VITE_POLL_INTERVAL=5000                 # Intervalo de polling en /mapa (ms)
VITE_MASTER_PIN=1234                    # PIN del panel /comando
```

---

## Gotchas del frontend

- **Componentes legacy**: NO usar `components/Button.jsx` ni `components/ButtonIcon.jsx`.
  Siempre `components/ui/Button.jsx`.

- **BroadcastChannel no cruza dispositivos**: Los overlays del mapa solo funcionan si
  `/mapa` y `/comando` están abiertos en el **mismo navegador y mismo origen**.
  Para dispositivos físicamente separados se necesitaría WebSocket.

- **Bancos de eventos en localStorage**: Si el GM borra el historial del navegador o
  usa un dispositivo distinto, pierde las preguntas/decisiones/misiones creadas.

- **Audio y autoplay**: El browser bloquea audio sin interacción del usuario.
  `playAudio()` se llama solo después del primer clic en `Landing.jsx`.

- **Sin TypeScript**: Todo es `.jsx`/`.js`. No migrar sin petición explícita.
  ESLint tiene `prop-types` desactivado.

- **PIN solo en UI**: La validación de `VITE_MASTER_PIN` es solo en el cliente.
  No hay autenticación en la API.

- **Dark mode desactivado en pantallas nuevas**: Las rutas `/`, `/seleccion`, `/mapa`
  y `/comando` usan la paleta `camp-` oscura fija. El toggle de dark mode
  del `Layout.jsx` solo aplica a `/admin` y `/vault`.
