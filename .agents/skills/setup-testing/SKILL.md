---
name: setup-testing
description: |
  Configura Vitest como framework de testing en Codigo Camp desde cero.
  Cubre: instalar Vitest + @testing-library/react en frontend/, configurar
  vitest.config.js, crear el primer test de ejemplo para un componente UI,
  agregar script "test" en package.json.
  Usa esta skill cuando el usuario diga "quiero agregar tests", "configurar
  testing", "escribir tests", "setup Vitest", "necesito cobertura de tests",
  "agregar pruebas unitarias" al proyecto.
  No incluye configuración de tests en la API (backend) — eso es deuda separada.
license: MIT
metadata:
  project: codigo-camp
  stack: React 18 + Vite 4 + Vitest
---

# Setup Testing — Codigo Camp

Configura Vitest + React Testing Library en el frontend del proyecto.
El proyecto actualmente no tiene ningún framework de testing configurado.

## Pre-requisitos

- Node.js instalado
- `frontend/node_modules/` ya instalado (`npm install` corrido desde `frontend/`)
- El frontend levanta sin errores (`npm run dev` desde `frontend/`)

Si algún pre-requisito falla, detente y reporta al usuario.

## Cuándo usar

- El usuario pide configurar testing por primera vez en el proyecto
- El usuario quiere escribir tests para un componente
- El usuario pide "setup Vitest" o "agregar pruebas"
- Antes de cerrar una tarea de deuda técnica relacionada con testing

## Gotchas

- Vite 4 y Vitest son del mismo ecosistema — usar `vitest` no `jest`, ya que
  el bundler es Vite y la configuración se integra en `vite.config.js`
- Los componentes usan `export default` en los archivos actuales (legacy) pero
  los nuevos usan named exports — los tests deben importar en consecuencia
- `jsdom` es el environment para tests de componentes React — especificarlo
  en `vitest.config.js` para evitar errores de `window is not defined`
- Los tests van en `frontend/src/__tests__/` o junto al componente con sufijo
  `.test.jsx` — elegir la convención y ser consistente
- El proyecto usa Tailwind CSS — los tests de componentes no necesitan el
  procesamiento de Tailwind; los estilos simplemente no aparecen en el DOM de test

## Pasos

### Paso 1 — Instalar dependencias de testing

```bash
# Desde frontend/
npm install --save-dev vitest @vitest/ui jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

### Paso 2 — Actualizar `frontend/vite.config.js`

Agregar la sección `test` al config existente:

```js
// frontend/vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test-setup.js',
    css: false,
  },
})
```

### Paso 3 — Crear archivo de setup de tests

```js
// frontend/src/test-setup.js
import '@testing-library/jest-dom';
```

### Paso 4 — Agregar scripts a `frontend/package.json`

```json
"scripts": {
  "dev": "vite",
  "start": "concurrently \"vite --open\" \"node ../api/app\"",
  "build": "vite build",
  "lint": "eslint . --ext js,jsx --report-unused-disable-directives --max-warnings 0",
  "preview": "vite preview",
  "test": "vitest",
  "test:ui": "vitest --ui",
  "test:coverage": "vitest --coverage"
}
```

### Paso 5 — Crear primer test de ejemplo (componente `ui/Button`)

```jsx
// frontend/src/__tests__/Button.test.jsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Button from '../components/ui/Button';

describe('Button', () => {
  it('renderiza el texto de children', () => {
    render(<Button>Agregar Equipo</Button>);
    expect(screen.getByText('Agregar Equipo')).toBeInTheDocument();
  });

  it('aplica variante primary por defecto', () => {
    render(<Button>Test</Button>);
    const btn = screen.getByRole('button');
    expect(btn.className).toContain('bg-primary-600');
  });

  it('llama onClick cuando se hace clic', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Clic</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledOnce();
  });

  it('está deshabilitado cuando se pasa disabled', () => {
    render(<Button disabled>Deshabilitado</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

### Paso 6 — Crear carpeta de tests

```bash
mkdir -p frontend/src/__tests__
```

## Verificación

```bash
# Desde frontend/
npm run test

# Output esperado:
# ✓ src/__tests__/Button.test.jsx (4 tests)
# Test Files  1 passed (1)
# Tests  4 passed (4)
```

Si aparece `Error: window is not defined`: verificar que `environment: 'jsdom'`
está en `vite.config.js`.

Si aparece `Cannot find module '@testing-library/jest-dom'`: correr
`npm install` de nuevo desde `frontend/`.

## Criterios para NO usar esta skill

- El usuario ya tiene Vitest configurado y solo quiere escribir un test específico
  → escribir el test directamente siguiendo el patrón del Paso 5
- El usuario quiere testear la API Express
  → eso requiere una skill separada de `setup-testing-api` con Jest/Supertest (deuda pendiente)
