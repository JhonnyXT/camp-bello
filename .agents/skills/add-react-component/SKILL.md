---
name: add-react-component
description: Crea un nuevo componente React para Codigo Camp siguiendo el sistema de diseño del proyecto. Usar cuando el usuario pida crear un componente, elemento UI, card, botón, input, badge, tabla, pantalla o cualquier interfaz visual nueva.
---

# Add React Component — Codigo Camp

## When to Use
- El usuario pide crear un componente, widget, elemento de UI o pantalla nueva
- El usuario pide agregar una vista, página o sección al frontend
- El usuario pide un botón, card, input, modal, badge, tabla u otro elemento visual

## Gotchas
- Los componentes legacy `components/Button.jsx` y `components/ButtonIcon.jsx` están
  **deprecados** — no crear código basado en ellos ni en su estilo
- Nuevos componentes UI (reutilizables) van en `frontend/src/components/ui/`
- Nuevas páginas/vistas completas van en `frontend/src/components/`
- Todo el código es JavaScript — NO usar TypeScript ni agregar tipos
- Las pantallas fullscreen (`/`, `/seleccion`, `/mapa`, `/comando`) usan la paleta `camp-*` oscura — **no** usan el `<Layout>` ni su paleta `gray/primary`
- El patrón de Alert usa `type` y `msg` como props directas — no `alert={alert}` ni `setAlert`
- La URL de la API viene de `import.meta.env.VITE_API_URL` — no hardcodear `localhost:8080`

## Instructions

### Paso 1 — Definir el tipo de componente

Determina si es:
- **Componente UI reutilizable** (Button, Card, Badge, Input, Dropdown, etc.)
  → Crear en `frontend/src/components/ui/NombreComponente.jsx`
- **Vista fullscreen del juego** (pantalla completa con tema `camp-*`)
  → Crear en `frontend/src/components/NombreVista.jsx` y registrar en `App.jsx` **directamente** (sin `<Layout>`)
- **Vista legacy con Layout** (panel administrativo con paleta `gray/primary`)
  → Crear en `frontend/src/components/NombreVista.jsx` y registrar como hijo de `<Layout>` en `App.jsx`

### Paso 2 — Plantilla base para pantalla fullscreen del juego

```jsx
// frontend/src/components/NuevaPantalla.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Alert from './Alert';

export const NuevaPantalla = () => {
  const navigate = useNavigate();
  const [data,  setData]  = useState([]);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/teams`);
        setData(data);
      } catch {
        setAlert({ type: 'error', msg: 'Error al cargar datos' });
      }
    };
    fetch();
  }, []);

  return (
    <div className="min-h-screen bg-camp-carbon text-camp-hueso">
      {alert && <Alert type={alert.type} msg={alert.msg} />}
      {/* contenido */}
    </div>
  );
};
```

### Paso 3 — Colores del sistema

Las pantallas del juego usan la paleta `camp-*`. Las páginas del Layout usan `primary-*`.

```
Pantallas del juego (camp-*):
  bg-camp-carbon       → fondo principal
  text-camp-hueso      → texto primario
  text-camp-arena      → texto secundario
  text-camp-dorado     → acentos dorados
  text-camp-rojo       → peligro / error
  text-camp-verde      → éxito / positivo
  primary-{50..900}    → acciones / Explorador

Páginas del Layout:
  primary-{50..900}    → acciones principales
  secondary-{50..900}  → textos secundarios
```

### Paso 4 — Dark mode (solo para componentes del Layout)

Las pantallas fullscreen del juego no requieren dark mode (son siempre oscuras).
Solo las vistas bajo `<Layout>` lo necesitan:

```jsx
bg-white dark:bg-gray-800    // superficie principal
text-gray-900 dark:text-gray-100
border-gray-200 dark:border-gray-700
```

### Paso 5 — Animaciones disponibles

```jsx
<div className="animate-fade-in">      // fadeIn 0.3s
<div className="animate-slide-in">     // slideInUp 0.4s
<div className="animate-zoom-in">      // zoomIn 0.3s
<div className="animate-pulse-slow">   // pulse 3s
<div className="animate-shake">        // shake 0.5s
<div className="animate-glow">         // glow 0.5s
<div className="animate-march">        // march 1s (emojis de soldados)
```

### Paso 6 — Si es una nueva vista fullscreen

Registrar en `frontend/src/App.jsx` **fuera** del bloque con `element: <Layout />`:

```jsx
// En createBrowserRouter — pantallas fullscreen SIN Layout:
{ path: '/nueva-ruta', element: <NuevaPantalla /> },
```

Actualizar `frontend/AGENTS.md` sección "Rutas y componentes".

### Paso 7 — Si necesita llamadas a la API

```jsx
import axios from 'axios';
import Alert from './Alert'; // ajustar ruta relativa

const [alert, setAlert] = useState(null);

const fetchData = async () => {
  try {
    const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/teams`);
    setData(data);
  } catch {
    setAlert({ type: 'error', msg: 'Error al cargar datos' });
  }
};

// En el JSX:
{alert && <Alert type={alert.type} msg={alert.msg} />}
```

### Paso 8 — Exports

Siempre usar **named exports**:

```jsx
// ✅ Correcto
export const MiComponente = () => { ... }

// ❌ Incorrecto
export default MiComponente;
```
