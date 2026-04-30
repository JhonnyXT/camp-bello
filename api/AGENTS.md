# AGENTS.md — API Backend (Express + Sequelize + MySQL)

Backend REST para la app Codigo Camp. Gestiona equipos con nombre, color y puntuación.

---

## Arranque

```bash
# Desde la carpeta api/
node app.js                # producción / uso normal
npx nodemon app.js         # desarrollo con hot-reload (nodemon instalado, sin script)
```

Puerto: **8080** (definido en `models/server.js`).

---

## Arquitectura: flujo obligatorio

Toda nueva funcionalidad sigue este flujo sin excepción:

```
app.js
  └── models/server.js (Clase Server)
        ├── database/config.js  ← conexión Sequelize
        ├── routes/             ← define qué método HTTP va a qué función
        └── controllers/        ← implementa la lógica de negocio
              └── models/       ← define las tablas/entidades con Sequelize
```

### Cómo agregar un nuevo recurso (ejemplo: `players`)

1. Crear modelo: `api/models/player.js`
2. Crear controlador: `api/controllers/player.controller.js`
3. Crear archivo de rutas: `api/routes/players.js`
4. Registrar el router en el constructor de `Server` (`models/server.js`):
   ```js
   this.playersPath = '/api/players';
   // en routes():
   this.app.use(this.playersPath, require('../routes/players'));
   ```

---

## Conexión a la base de datos

Archivo: `api/database/config.js`

```js
// Configuración actual (hardcodeada — pendiente migrar a .env)
const db = new Sequelize('campBello-bd', 'root', '123456789', {
    host: 'localhost',
    dialect: 'mysql',
});
```

- Dialecto: MySQL
- BD: `campBello-bd`
- La sincronización con la BD ocurre automáticamente al iniciar el servidor
  mediante `db.sync()` en la clase `Server`

---

## Modelo Sequelize de referencia (Team)

```js
// api/models/team.js — usar como plantilla para nuevos modelos
const { DataTypes } = require('sequelize');
const db = require('../database/config');

const Team = db.define('Team', {
    name:  { type: DataTypes.STRING },
    cash:  { type: DataTypes.DECIMAL(20, 0) },
    color: { type: DataTypes.STRING },
}, { timestamps: false });  // ← SIEMPRE false en este proyecto

module.exports = Team;
```

**Tipos de datos disponibles en Sequelize:**
- `DataTypes.STRING` — texto corto (VARCHAR 255)
- `DataTypes.TEXT` — texto largo
- `DataTypes.INTEGER` — entero
- `DataTypes.DECIMAL(20, 0)` — decimal (usado para puntuaciones)
- `DataTypes.BOOLEAN` — booleano
- `DataTypes.DATE` — fecha/hora

---

## Controlador de referencia (team.controller.js)

```js
// Patrón obligatorio: async + try/catch + respuesta JSON estructurada
const getTeams = async (req, res) => {
    try {
        const teams = await Team.findAll();
        res.json(teams);
    } catch (error) {
        res.status(500).json({ msg: 'Error al obtener equipos', error });
    }
};

const createTeam = async (req, res) => {
    try {
        const { name, cash, color } = req.body;
        // Validación mínima antes de usar req.body
        if (!name || cash === undefined || !color) {
            return res.status(400).json({ msg: 'Faltan campos requeridos: name, cash, color' });
        }
        const user = await Team.create({ name, cash, color });
        res.json({ msg: 'Equipo creado exitosamente', user });
    } catch (error) {
        res.status(500).json({ msg: 'Error al crear equipo', error });
    }
};
```

---

## Middlewares configurados en server.js

Ya están activos — no duplicar:
- `cors()` — CORS abierto (acepta cualquier origen)
- `express.json()` — parseo del body en JSON
- `express.static("public")` — sirve archivos estáticos desde `api/public/`

---

## Gotchas del backend

- `timestamps: false` es **obligatorio** en todos los modelos — la tabla MySQL no tiene
  columnas `createdAt`/`updatedAt` y Sequelize lanzará error si se omite.

- Las credenciales de MySQL están hardcodeadas en `database/config.js`. Si necesitas
  cambiarlas usa la skill `setup-env-vars`.

- `sqlite3` está instalado en `package.json` pero no se usa — la BD activa es MySQL.

- No hay middleware de autenticación. La API acepta todas las peticiones.

- No hay validación de inputs con librería (sin Joi, sin Zod). Valida manualmente
  antes de usar `req.body`.

- CORS está configurado con `cors()` sin restricciones — acepta cualquier origen.
  Para restringirlo: `cors({ origin: 'http://localhost:5173' })`.
