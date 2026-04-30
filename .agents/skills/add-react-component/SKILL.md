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
- **Siempre** incluir soporte dark mode con variantes `dark:`

## Instructions

### Paso 1 — Definir el tipo de componente

Determina si es:
- **Componente UI reutilizable** (Button, Card, Badge, Input, Dropdown, etc.)
  → Crear en `frontend/src/components/ui/NombreComponente.jsx`
- **Vista o página** (pantalla completa con lógica propia)
  → Crear en `frontend/src/components/NombreVista.jsx` y registrar en `App.jsx`

### Paso 2 — Usar la plantilla del sistema de diseño

```jsx
// frontend/src/components/ui/NombreComponente.jsx

// Objetos de variantes para clases Tailwind
const variants = {
  primary: 'bg-primary-600 hover:bg-primary-700 text-white',
  secondary: 'bg-secondary-600 hover:bg-secondary-700 text-white',
  outline: 'border-2 border-primary-600 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-950',
  ghost: 'text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-950/20',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
};

export const NombreComponente = ({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}) => {
  return (
    <div
      className={`
        ${variants[variant]}
        ${sizes[size]}
        rounded-lg transition-colors duration-200
        bg-white dark:bg-gray-800
        text-gray-900 dark:text-gray-100
        border border-gray-200 dark:border-gray-700
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
};
```

### Paso 3 — Colores del sistema (obligatorio)

Usar siempre la paleta del proyecto, nunca colores Tailwind directos:

```
✅ Correcto:  primary-600, primary-700, secondary-500
❌ Incorrecto: sky-600, slate-500, blue-700
```

Referencia de colores del proyecto (tailwind.config.js):
- `primary-500` → azul cielo (#0ea5e9)
- `primary-600` → azul cielo oscuro
- `secondary-500` → slate gris

### Paso 4 — Dark mode en cada elemento

Checklist para cada elemento nuevo:
- [ ] Fondo: `bg-white dark:bg-gray-800` (o variante correspondiente)
- [ ] Texto: `text-gray-900 dark:text-gray-100`
- [ ] Bordes: `border-gray-200 dark:border-gray-700`
- [ ] Hover/foco: incluir variantes `dark:hover:` cuando aplique

### Paso 5 — Animaciones disponibles

```jsx
// Animaciones CSS de Tailwind (tailwind.config.js)
<div className="animate-fade-in">   // fadeIn 0.3s — para apariciones
<div className="animate-slide-in">  // slideIn 0.3s — para deslizamientos

// Para animaciones de valores numéricos usar @react-spring/web
import { useSpring, animated } from '@react-spring/web';
```

### Paso 6 — Si es una nueva vista/ruta

Registrar en `frontend/src/App.jsx`:
```jsx
import NuevaVista from "./components/NuevaVista";

// Agregar dentro del array de createBrowserRouter:
{
  path: "nueva-ruta",
  element: <NuevaVista />,
},
```

Agregar al nav en `Layout.jsx`:
```jsx
const navItems = [
  { path: '/', label: 'Home' },
  { path: '/vault', label: 'Vault' },
  { path: '/nueva-ruta', label: 'Nueva Sección' }, // ← agregar aquí
];
```

### Paso 7 — Si el componente necesita llamadas a la API

```jsx
import axios from 'axios';
import Alert from '../Alert'; // o ajustar la ruta relativa

const [alert, setAlert] = useState({ show: false, message: '', type: 'success' });

const fetchData = async () => {
  try {
    const { data } = await axios.get('http://localhost:8080/api/teams');
    setData(data);
  } catch (error) {
    setAlert({ show: true, message: 'Error al cargar datos', type: 'error' });
  }
};

// En el JSX:
{alert.show && <Alert alert={alert} setAlert={setAlert} />}
```
