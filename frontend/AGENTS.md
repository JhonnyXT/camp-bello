# AGENTS.md — Frontend (React 18 + Vite 4 + Tailwind CSS 3)

Interfaz web de Codigo Camp. Permite gestionar equipos y ver su ranking animado.

---

## Arranque

```bash
# Desde la carpeta frontend/
npm install
npm run dev         # Solo el frontend en http://localhost:5173
npm run start       # Frontend + API simultáneamente (usa concurrently)
npm run build       # Build de producción en dist/
npm run lint        # ESLint
```

---

## Rutas de la aplicación

| Ruta | Componente | Descripción |
|---|---|---|
| `/` | `Home.jsx` | Pantalla principal: botones Agregar Equipo y Gestionar Puntos |
| `/vault` | `CashCounter.jsx` | Ranking animado: video intro + barras de puntos con animación spring |

**Implementación del router** (`App.jsx`):
```jsx
// Usa createBrowserRouter (API de objetos de React Router DOM v6)
const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,          // shell permanente
    children: [
      { index: true, element: <Home /> },
      { path: "vault", element: <CashCounter /> },
    ],
  },
]);
```

---

## Sistema de diseño — paleta de colores

Definida en `tailwind.config.js`. **Siempre usar estas clases, nunca colores Tailwind directos.**

| Token | Descripción | Uso típico |
|---|---|---|
| `primary-{50..900}` | Azul cielo (sky) | Acciones principales, enlaces activos |
| `secondary-{50..900}` | Slate gris | Textos secundarios, fondos neutros |

Ejemplo:
```jsx
// ✅ Correcto — usa el sistema de tokens
<button className="bg-primary-600 hover:bg-primary-700 text-white">
// ❌ Incorrecto — evita colores Tailwind directos
<button className="bg-sky-600 hover:bg-sky-700 text-white">
```

---

## Dark mode

Estrategia: `class` de Tailwind (toggle en el elemento `html`).

El estado `isDarkMode` vive en `Layout.jsx` y manipula `document.documentElement.classList`.

**Todo componente nuevo debe incluir variantes `dark:`:**
```jsx
// Patrón obligatorio para nuevos componentes
<div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
```

---

## Animaciones disponibles

Definidas en `tailwind.config.js` — listas para usar:

```jsx
<div className="animate-fade-in">   // fadeIn 0.3s ease-in-out
<div className="animate-slide-in">  // slideIn 0.3s ease-in-out
```

Para animaciones complejas (barras de ranking) se usa `@react-spring/web`:
```jsx
import { useSpring, animated } from '@react-spring/web';
const props = useSpring({ width: `${percent}%`, from: { width: '0%' } });
<animated.div style={props} />
```

---

## Componentes del sistema de diseño (`components/ui/`)

**Siempre usar estos. Los de `components/` raíz son legacy y no deben usarse.**

### `ui/Button.jsx`
```jsx
// Variantes: primary | secondary | outline | ghost
// Tamaños: sm | md | lg
<Button variant="primary" size="md" onClick={handler}>
  Texto
</Button>
```

### `ui/Card.jsx`
```jsx
<Card className="p-6">contenido</Card>
// Fondo: bg-white dark:bg-gray-800, bordes, sombra incluidos
```

### `ui/Input.jsx`
```jsx
<Input
  label="Nombre del equipo"
  value={value}
  onChange={(e) => setValue(e.target.value)}
  error="Campo requerido"   // opcional
/>
```

---

## Patrón de modales

`Modal.jsx` es el wrapper genérico. **No crear nuevos wrappers de modal.**

```jsx
// En Home.jsx — patrón de uso del modal
const [modal, setModal] = useState(false);
const [modalSelected, setModalSelected] = useState(null); // 1 o 2

<Modal
  modal={modal}
  setModal={setModal}
  label="Título del modal"
  content={modalSelected === 1 ? <AddTeamModal /> : <BankModal />}
/>
```

El modal cierra con: tecla Escape, click en overlay, o botón X.
Bloquea `document.body.style.overflow` mientras está abierto.

---

## Notificaciones (Alert)

```jsx
// En cualquier componente que haga llamadas a la API
const [alert, setAlert] = useState({ show: false, message: '', type: 'success' });

// Mostrar:
setAlert({ show: true, message: 'Equipo creado exitosamente', type: 'success' });
setAlert({ show: true, message: 'Error al conectar', type: 'error' });

// En el JSX:
{alert.show && <Alert alert={alert} setAlert={setAlert} />}
```

---

## Llamadas a la API (Axios)

URL base actual (hardcodeada — pendiente migrar a .env): `http://localhost:8080`

**Patrón de uso en componentes:**
```jsx
import axios from 'axios';

// Dentro del componente
const handleSubmit = async () => {
    try {
        const { data } = await axios.post('http://localhost:8080/api/teams', {
            name, cash, color
        });
        setAlert({ show: true, message: data.msg, type: 'success' });
    } catch (error) {
        setAlert({ show: true, message: 'Error al crear equipo', type: 'error' });
    }
};
```

---

## Assets disponibles en `src/assets/`

| Archivo | Uso |
|---|---|
| `background.jpg` | Fondo de pantalla |
| `logo-camp.png` | Logo principal en el header |
| `logo-contracorriente.png` | Logo secundario |
| `vault-video.mp4` | Video de introducción en `/vault` |
| `contador.mp4` | Video alternativo |
| `cash-counter.mp3` | Sonido que acompaña la animación de barras |
| `safe_box.svg` | Icono de caja fuerte |

---

## Manejo de estado

Sin librería global. Todo es `useState` local. No introducir Redux ni Zustand
sin petición explícita del usuario.

---

## Gotchas del frontend

- **NO usar** `components/Button.jsx` ni `components/ButtonIcon.jsx` — son legacy
  con colores hardcodeados. Usar siempre `components/ui/Button.jsx`.

- **URL hardcodeada:** `http://localhost:8080` aparece en `CashCounter.jsx`,
  `BankModal.jsx` y `AddTeamModal.jsx`. Usar la skill `setup-env-vars` para migrarlo.

- **Sin TypeScript:** Todo es `.jsx`. No migrar sin petición explícita. ESLint tiene
  `prop-types` desactivado — no es necesario agregar PropTypes.

- **Sin estado global:** No hay Context API, Redux ni Zustand. Estado 100% local.

- **Dark mode es estado local:** `isDarkMode` vive en `Layout.jsx` — no es persistente
  entre recargas de página.

- **Vite sin proxy configurado:** Si cambias el puerto de la API, debes actualizar
  la URL hardcodeada en los 3 componentes (o mejor, usar la variable de entorno).
