---
name: setup-env-vars
description: Configura variables de entorno en Codigo Camp. Usar cuando el usuario mencione .env, variables de entorno, credenciales, configuración de base de datos, URL de la API, o pida resolver el problema de datos hardcodeados.
---

# Setup Environment Variables — Codigo Camp

## When to Use
- El usuario pide configurar variables de entorno
- El usuario quiere resolver el problema de credenciales hardcodeadas
- El usuario quiere centralizar la URL de la API del frontend
- El usuario menciona `.env`, `process.env` o `import.meta.env`

## Estado actual del proyecto

La migración a variables de entorno **ya está completada** para los archivos principales.
Las variables de entorno están activas en:
- `api/database/config.js` → usa `process.env.DB_*`
- `api/models/server.js` → usa `process.env.PORT`
- `frontend/src/` → todos los componentes nuevos usan `import.meta.env.VITE_API_URL`

Los archivos `.env.example` existen en `api/` y `frontend/` como referencia.

**Nota:** Los componentes legacy `BankModal.jsx`, `AddTeamModal.jsx` y `CashCounter.jsx`
en `frontend/src/components/` pueden aún tener URLs hardcodeadas. Verificar antes de editar.

## Variables disponibles

### `api/.env`
```
PORT=8080
DB_NAME=campBello-bd
DB_USER=root
DB_PASS=contraseña
DB_HOST=localhost
```

### `frontend/.env`
```
VITE_API_URL=http://localhost:8080
VITE_POLL_INTERVAL=5000
VITE_MASTER_PIN=1234
```

## Instructions

### Agregar una variable nueva a la API

```bash
# 1. Agregar a api/.env
MI_VARIABLE=valor

# 2. Agregar a api/.env.example (sin el valor real)
MI_VARIABLE=descripcion-del-valor

# 3. Usar en el código
process.env.MI_VARIABLE
```

### Agregar una variable nueva al frontend

```bash
# 1. DEBE empezar con VITE_ para que Vite la exponga
VITE_MI_VARIABLE=valor

# 2. Agregar a frontend/.env y frontend/.env.example

# 3. Usar en el código
import.meta.env.VITE_MI_VARIABLE
```

> Las variables sin prefijo `VITE_` no son accesibles en el frontend.

### Si un componente legacy tiene URL hardcodeada

Reemplazar `http://localhost:8080` por `import.meta.env.VITE_API_URL`:

```js
// ANTES:
const { data } = await axios.get("http://localhost:8080/api/teams");

// DESPUÉS:
const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/teams`);
```

### Verificación final

```bash
# Reiniciar la API (necesario para que dotenv recargue)
cd api && node app.js

# El servidor debe arrancar con "Connection has been established successfully."
# El frontend en http://localhost:5173 debe conectar normalmente
```

### Seguridad

- Los archivos `.env` están en `.gitignore` — nunca commitear credenciales reales
- El `VITE_MASTER_PIN` es solo validación en el cliente — no es seguridad real
- En producción cambiar la contraseña de BD y el PIN
