---
name: debug-fullstack
description: Debugging sistemático del stack de Codigo Camp (MySQL + Express + React). Usar cuando el usuario reporte un error, algo no funcione, vea un mensaje de error, o pida ayuda para resolver un problema.
---

# Debug Fullstack — Codigo Camp

## When to Use
- El usuario reporta un error o algo que "no funciona"
- Hay un error en la consola del navegador o del servidor
- La app no carga, los datos no aparecen, o los formularios no responden
- Hay un error de conexión a la base de datos

## Instrucciones de debugging por capas

Siempre empezar desde la capa más profunda (BD) hacia arriba (UI).

---

### Capa 1 — Base de datos MySQL

```bash
# Verificar que MySQL está corriendo
mysql -u root -p123456789 -e "SHOW DATABASES;"

# Verificar que la BD existe
mysql -u root -p123456789 -e "USE campBello-bd; SHOW TABLES;"

# Verificar que la tabla Teams existe y tiene datos
mysql -u root -p123456789 -e "SELECT * FROM campBello-bd.Teams LIMIT 5;"
```

**Errores comunes de MySQL:**
- `ECONNREFUSED` → MySQL no está corriendo → iniciar el servicio MySQL
- `Unknown database 'campBello-bd'` → crear la BD: `CREATE DATABASE \`campBello-bd\`;`
- `Access denied for user 'root'` → contraseña incorrecta en `api/database/config.js`

---

### Capa 2 — Servidor Express (API)

```bash
# Desde api/ — arrancar con logs visibles
node app.js
```

**Verificar que la API responde:**
```bash
curl http://localhost:8080/api/teams
# Debe devolver JSON con array de equipos

curl http://localhost:8080/api/teams/rank
# Debe devolver JSON con equipos y campo percent
```

**Errores comunes del servidor:**
- `Error: connect ECONNREFUSED 127.0.0.1:3306` → MySQL no está corriendo
- `SequelizeDatabaseError: Table 'campBello-bd.Teams' doesn't exist`
  → Sequelize no sincronizó — revisar que `db.sync()` se llama en `Server`
- `SyntaxError: ...` → Error de sintaxis en JS — leer el stack trace
- Puerto 8080 ya en uso → `lsof -ti:8080 | xargs kill` (Mac/Linux)

**Verificar estructura de respuesta:**
```bash
# POST crear equipo
curl -X POST http://localhost:8080/api/teams \
  -H "Content-Type: application/json" \
  -d '{"name":"Equipo Test","cash":1000,"color":"#FF5733"}'
# Debe responder: {"msg":"Equipo creado exitosamente","user":{...}}

# PUT actualizar puntos
curl -X PUT http://localhost:8080/api/teams/1 \
  -H "Content-Type: application/json" \
  -d '{"cash":2000}'
```

---

### Capa 3 — Frontend React / Vite

**Verificar que Vite corre:**
```bash
# Desde frontend/
npm run dev
# Debe abrir en http://localhost:5173
```

**Consola del navegador (F12 → Console):**

Errores comunes y sus causas:

| Error | Causa | Solución |
|---|---|---|
| `Network Error` en Axios | API no está corriendo en 8080 | Iniciar `node app.js` en `api/` |
| `CORS error` | Origen bloqueado por CORS | Verificar `cors()` en `server.js` |
| `404 Not Found` en `/api/teams` | Ruta no registrada | Verificar `routes()` en `server.js` |
| `Failed to fetch` | URL incorrecta en Axios | Verificar URL en el componente |
| `Cannot read properties of undefined` | Datos de API inesperados | Verificar estructura de la respuesta |

**Inspeccionar llamadas de red (F12 → Network):**
1. Recargar la página con DevTools abierto
2. Filtrar por "XHR" o "Fetch"
3. Hacer clic en la petición para ver URL, status y respuesta

---

### Capa 4 — Problemas específicos de este proyecto

**Problema: Las barras de `/vault` no aparecen**
1. Verificar que el video introductorio terminó (`videoEnded === true` en state)
2. Verificar que `GET /api/teams/rank` devuelve datos con campo `percent`
3. Verificar que `percent` no es `NaN` (pasa si `max_value === 0` — todos en 0 puntos)

**Problema: El modal no se cierra**
1. Verificar que se pasa `setModal` como prop a `Modal.jsx`
2. El modal cierra con Escape, click en el overlay negro, o el botón X

**Problema: Dark mode no funciona**
1. Verificar que `tailwind.config.js` tiene `darkMode: 'class'`
2. El toggle en `Layout.jsx` manipula `document.documentElement.classList`
3. Verificar que los componentes tienen variantes `dark:` en sus clases

**Problema: Sequelize no actualiza la tabla**
1. Verificar que el modelo tiene los campos correctos
2. `db.sync()` crea la tabla si no existe, pero no modifica columnas existentes
3. Para cambiar columnas, usar `db.sync({ alter: true })` (con cuidado en producción)
   o eliminar y recrear la tabla manualmente en MySQL

**Problema: `concurrently` no inicia ambos servicios**
1. Verificar que ambas `node_modules/` están instaladas (en `api/` Y en `frontend/`)
2. Correr `npm install` en ambas carpetas
3. Alternativa: abrir dos terminales y lanzar cada servicio por separado

---

### Checklist de diagnóstico rápido

```
□ MySQL está corriendo
□ La BD campBello-bd existe en MySQL
□ node app.js corre sin errores desde api/
□ GET http://localhost:8080/api/teams devuelve JSON
□ npm run dev corre sin errores desde frontend/
□ La consola del navegador no tiene errores rojos
□ La pestaña Network muestra las peticiones con status 200
```
