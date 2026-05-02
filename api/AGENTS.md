# AGENTS.md — API Backend (Express + Sequelize + MySQL)

Backend REST para Camp Bello · Campaña del Soldado.
Para el contexto completo del juego ver `../AGENTS.md`.

---

## Arranque

```bash
cd api
node app.js                # Producción / uso normal — http://localhost:8080
npx nodemon app.js         # Desarrollo con hot-reload
```

Puerto definido en `.env` como `PORT` (default 8080).

---

## Arquitectura: flujo obligatorio

Todo nuevo recurso sigue este flujo sin excepción:

```
app.js
  └── models/server.js (Clase Server)
        ├── database/config.js  ← conexión Sequelize (lee .env)
        ├── routes/             ← define método HTTP → función
        └── controllers/        ← implementa la lógica
              └── models/       ← define las tablas con Sequelize
```

### Cómo agregar un nuevo recurso

1. Crear modelo: `api/models/player.js`
2. Crear controlador: `api/controllers/player.controller.js`
3. Crear rutas: `api/routes/players.js`
4. Registrar en `models/server.js`:
   ```js
   this.playersPath = '/api/players';
   // en routes():
   this.app.use(this.playersPath, require('../routes/players'));
   ```

---

## Conexión a la base de datos

```js
// api/database/config.js — lee de process.env (cargado desde api/.env)
const db = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  { host: process.env.DB_HOST, dialect: 'mysql' }
);
```

Al iniciar el servidor se llama `db.sync({ alter: true })` — actualiza la estructura
de tablas automáticamente si el modelo cambia.

---

## Endpoints disponibles

### `GET /api/teams`
Lista todos los equipos.
```json
// Respuesta:
[
  { "id": 1, "name": "Rojo", "cash": "2500", "color": "#ef4444", "soldierType": "estratega" },
  ...
]
```

### `GET /api/teams/rank`
Lista equipos con campo `percent` calculado (porcentaje respecto al líder).
Usado por `/vault` (CashCounter.jsx legacy).
```json
[
  { "id": 1, "name": "Rojo", "cash": "2500", "color": "#ef4444", "soldierType": "estratega", "percent": "100" },
  ...
]
```

### `POST /api/teams`
Crea un equipo.
```json
// Body:
{ "name": "Verde", "cash": 0, "color": "#22c55e" }

// Respuesta:
{ "msg": "Equipo creado exitosamente", "user": { "id": 5, ... } }
```

### `PUT /api/teams/:id`
Actualiza uno o más campos del equipo. Todos los campos son opcionales.
```json
// Body (cualquier combinación):
{ "cash": 1500 }
{ "name": "Nuevo nombre" }
{ "color": "#3b82f6", "cash": 800 }

// Respuesta:
{ "msg": "Equipo actualizado" }
```

### `PUT /api/teams/:id/soldier`
Asigna el arquetipo de soldado al equipo.
Los valores válidos son: `'guerrero'` | `'estratega'` | `'guardian'` | `'explorador'` | `null`.
```json
// Body:
{ "soldierType": "guerrero" }

// Respuesta:
{ "msg": "Soldado actualizado", "soldierType": "guerrero" }
```

---

## Modelo Team

```js
// api/models/team.js
const Team = db.define('Team', {
  name:        { type: DataTypes.STRING },
  cash:        { type: DataTypes.DECIMAL(20, 0) },
  color:       { type: DataTypes.STRING },
  soldierType: { type: DataTypes.STRING, allowNull: true, defaultValue: null },
}, { timestamps: false });  // ← SIEMPRE false en este proyecto
```

---

## Patrón de controlador

```js
// Patrón obligatorio: async + try/catch + respuesta JSON estructurada
const createTeam = async (req, res) => {
  try {
    const { name, cash, color } = req.body;
    if (!name || cash === undefined || !color) {
      return res.status(400).json({ msg: 'Faltan campos: name, cash, color' });
    }
    const user = await Team.create({ name, cash, color });
    res.json({ msg: 'Equipo creado exitosamente', user });
  } catch (error) {
    res.status(500).json({ msg: 'Error al crear equipo', error: error.message });
  }
};
```

---

## Middlewares activos (no duplicar)

- `cors()` — CORS abierto (acepta cualquier origen)
- `express.json()` — parseo de body JSON
- `express.static("public")` — archivos estáticos desde `api/public/`

---

## Variables de entorno (`api/.env`)

```
PORT=8080
DB_NAME=campBello-bd
DB_USER=root
DB_PASS=123456789
DB_HOST=localhost
```

---

## Gotchas del backend

- `timestamps: false` es **obligatorio** en todos los modelos — la tabla no tiene
  columnas `createdAt`/`updatedAt`.

- `db.sync({ alter: true })` actualiza la tabla al reiniciar. Si cambias tipos de
  columna en producción puede fallar — hacer backup primero.

- No hay autenticación. Todos los endpoints son públicos.

- No hay validación de inputs con librería (sin Joi ni Zod). Valida con `if (!campo)`.

- CORS abierto con `cors()`. Para restringir:
  ```js
  cors({ origin: process.env.ALLOWED_ORIGIN || 'http://localhost:5173' })
  ```

- `sqlite3` instalado en `package.json` pero no se usa. Desinstalar con:
  ```bash
  npm uninstall sqlite3
  ```
