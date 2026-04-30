---
description: "Lanza el entorno de desarrollo de Codigo Camp: instala dependencias faltantes, arranca frontend (Vite) + API (Express) y verifica que ambas URLs respondan."
---

# /arrancar — Codigo Camp

Verifica el estado del entorno y lanza todo lo necesario para desarrollar.

## Pasos

### Paso 1 — Verificar que las dependencias están instaladas

```bash
# Verificar frontend
ls frontend/node_modules 2>/dev/null || (cd frontend && npm install)

# Verificar API
ls api/node_modules 2>/dev/null || (cd api && npm install)
```

Si algún `npm install` falla, reportar el error al usuario y detener.

### Paso 2 — Verificar MySQL

```bash
mysql -u root -p123456789 -e "SHOW DATABASES LIKE 'campBello-bd';" 2>/dev/null
```

Si MySQL no está corriendo:
- macOS: `brew services start mysql` o abrir MySQL desde System Preferences
- La BD `campBello-bd` debe existir; si no: `CREATE DATABASE \`campBello-bd\`;`

### Paso 3 — Lanzar frontend + API simultáneamente

```bash
cd frontend && npm run start
# Lanza:
# → Vite dev server en http://localhost:5173
# → Express API en http://localhost:8080
```

### Paso 4 — Verificar que ambas URLs responden

Después de ~3 segundos, verificar:
- Frontend: http://localhost:5173 debe mostrar la app
- API: `curl http://localhost:8080/api/teams` debe devolver JSON

### Paso 5 — Reportar estado al usuario

```
✅ Frontend → http://localhost:5173
✅ API      → http://localhost:8080
✅ Equipos cargados: <N> equipos en la BD
```

Si algo falla, usar skill `debug-fullstack` para diagnosticar.

## Notas

- Si solo necesitas el frontend sin la API: `cd frontend && npm run dev`
- Si solo necesitas la API: `cd api && node app.js`
- Para hot-reload en la API: `cd api && npx nodemon app.js`
