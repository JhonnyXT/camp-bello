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

## Estado actual del proyecto (deuda técnica)

Hay **dos problemas de hardcoding** activos en el proyecto:

1. **`api/database/config.js`** — credenciales MySQL directas en el código:
   ```js
   new Sequelize('campBello-bd', 'root', '123456789', { host: 'localhost' })
   ```

2. **Frontend** — URL del backend en 3 archivos:
   - `frontend/src/components/CashCounter.jsx` → `http://localhost:8080`
   - `frontend/src/components/BankModal.jsx` → `http://localhost:8080`
   - `frontend/src/components/AddTeamModal.jsx` → `http://localhost:8080`

## Instructions

### Paso 1 — Crear `api/.env`

```bash
# api/.env
PORT=8080
DB_NAME=campBello-bd
DB_USER=root
DB_PASS=123456789
DB_HOST=localhost
```

### Paso 2 — Actualizar `api/database/config.js`

```js
// ANTES (hardcodeado):
const db = new Sequelize('campBello-bd', 'root', '123456789', {
    host: 'localhost',
    dialect: 'mysql',
});

// DESPUÉS (con variables de entorno):
const db = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASS,
    {
        host: process.env.DB_HOST || 'localhost',
        dialect: 'mysql',
    }
);
```

### Paso 3 — Instalar dotenv en la API

```bash
# Desde api/
npm install dotenv
```

Agregar al inicio de `api/app.js` (primera línea):
```js
require('dotenv').config();
const Server = require('./models/server');
// ...
```

### Paso 4 — Actualizar puerto del servidor en `api/models/server.js`

```js
// ANTES:
this.port = 8080 || 5000;

// DESPUÉS:
this.port = process.env.PORT || 8080;
```

### Paso 5 — Crear `frontend/.env`

```bash
# frontend/.env
VITE_API_URL=http://localhost:8080
```

### Paso 6 — Actualizar los 3 componentes del frontend

Reemplazar `http://localhost:8080` por `import.meta.env.VITE_API_URL` en:

**`frontend/src/components/CashCounter.jsx`:**
```js
// ANTES:
const { data } = await axios.get("http://localhost:8080/api/teams/rank");

// DESPUÉS:
const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/teams/rank`);
```

**`frontend/src/components/BankModal.jsx`:**
```js
// ANTES (GET):
const { data } = await axios.get("http://localhost:8080/api/teams");
// ANTES (PUT):
await axios.put(`http://localhost:8080/api/teams/${teamSelect}`, { cash: amount });

// DESPUÉS (GET):
const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/teams`);
// DESPUÉS (PUT):
await axios.put(`${import.meta.env.VITE_API_URL}/api/teams/${teamSelect}`, { cash: amount });
```

**`frontend/src/components/AddTeamModal.jsx`:**
```js
// ANTES:
await axios.post("http://localhost:8080/api/teams", { name, cash, color });

// DESPUÉS:
await axios.post(`${import.meta.env.VITE_API_URL}/api/teams`, { name, cash, color });
```

### Paso 7 — Actualizar `.gitignore`

Verificar que `frontend/.gitignore` tenga:
```
.env
.env.local
.env.*.local
```

Crear o actualizar `api/.gitignore`:
```
node_modules/
.env
```

### Paso 8 — Crear archivos `.env.example` (referencia sin valores reales)

```bash
# api/.env.example
PORT=8080
DB_NAME=nombre-base-de-datos
DB_USER=usuario-mysql
DB_PASS=contraseña-mysql
DB_HOST=localhost
```

```bash
# frontend/.env.example
VITE_API_URL=http://localhost:8080
```

### Verificación final

```bash
# Reiniciar la API (necesario para que dotenv cargue)
# Desde api/
node app.js

# El servidor debe arrancar sin errores en puerto 8080
# El frontend en http://localhost:5173 debe conectar normalmente
```
