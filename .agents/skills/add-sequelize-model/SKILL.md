---
name: add-sequelize-model
description: Crea un nuevo modelo de datos Sequelize para Codigo Camp. Usar cuando el usuario pida crear una nueva tabla, entidad de base de datos, modelo o esquema de datos.
---

# Add Sequelize Model — Codigo Camp

## When to Use
- El usuario pide crear una nueva tabla o entidad en la base de datos
- El usuario menciona agregar un nuevo tipo de dato al sistema (jugadores, actividades, premios, etc.)
- Se necesita persistir un nuevo tipo de información

## Gotchas
- `timestamps: false` es **obligatorio** — la BD MySQL no tiene columnas `createdAt`/`updatedAt`
  y Sequelize lanzará error si se omite esta configuración
- Sequelize sincroniza el modelo automáticamente al iniciar el servidor (`db.sync()` en `Server`)
  — no es necesario correr migraciones manualmente
- La conexión a la BD siempre se importa desde `api/database/config.js`
- Los nombres de modelos en Sequelize se mapean a tablas en plural por defecto
  (ej. `db.define('Team', ...)` → tabla `Teams`)

## Instructions

### Paso 1 — Crear el archivo del modelo

```js
// api/models/[nombre-en-singular].js
// Ejemplo: api/models/player.js

const { DataTypes } = require('sequelize');
const db = require('../database/config');  // ← siempre importar desde aquí

const Player = db.define('Player', {
    // Definir los campos según la entidad
    name:     { type: DataTypes.STRING },
    score:    { type: DataTypes.DECIMAL(20, 0) },
    active:   { type: DataTypes.BOOLEAN, defaultValue: true },
    teamId:   { type: DataTypes.INTEGER },    // foreign key manual
    color:    { type: DataTypes.STRING },     // hex color string
}, {
    timestamps: false   // SIEMPRE false — obligatorio
});

module.exports = Player;
```

### Paso 2 — Tipos de datos disponibles

| Tipo Sequelize | Equivalente MySQL | Cuándo usarlo |
|---|---|---|
| `DataTypes.STRING` | VARCHAR(255) | Texto corto: nombres, colores hex |
| `DataTypes.TEXT` | TEXT | Texto largo: descripciones, notas |
| `DataTypes.INTEGER` | INT | Números enteros: IDs, cantidades |
| `DataTypes.DECIMAL(20, 0)` | DECIMAL(20,0) | Puntuaciones grandes (patrón del proyecto) |
| `DataTypes.FLOAT` | FLOAT | Decimales: porcentajes |
| `DataTypes.BOOLEAN` | TINYINT(1) | Flags: activo/inactivo |
| `DataTypes.DATE` | DATETIME | Fechas y horas |
| `DataTypes.DATEONLY` | DATE | Solo fecha |

### Paso 3 — Opciones de columnas disponibles

```js
campoEjemplo: {
    type: DataTypes.STRING,
    allowNull: false,              // no permite NULL (por defecto sí permite)
    defaultValue: 'valor_default', // valor por defecto
    unique: true,                  // valor único en la tabla
    validate: {
        notEmpty: true,            // no puede ser string vacío
        min: 0,                    // valor mínimo (para números)
        max: 100,                  // valor máximo
    }
}
```

### Paso 4 — Relaciones entre modelos (si aplica)

```js
// Relación 1:N — Un Team tiene muchos Players
// En player.js:
const Player = db.define('Player', {
    teamId: { type: DataTypes.INTEGER }  // foreign key
}, { timestamps: false });

// Después de definir ambos modelos, declarar la asociación:
Team.hasMany(Player, { foreignKey: 'teamId' });
Player.belongsTo(Team, { foreignKey: 'teamId' });
```

Para que las asociaciones estén disponibles al iniciar, declararlas al final del
archivo del modelo o en un archivo `api/models/associations.js` que se importe
en `app.js`.

### Paso 5 — Verificar que el modelo funciona

```js
// Para verificar rápidamente, agregar en app.js temporalmente:
const Player = require('./models/player');
Player.findAll().then(data => console.log('Players:', data));
// Eliminar este código después de verificar
```

### Modelo de referencia del proyecto (Team)

```js
// api/models/team.js — modelo existente como referencia
const { DataTypes } = require('sequelize');
const db = require('../database/config');

const Team = db.define('Team', {
    name:  { type: DataTypes.STRING },
    cash:  { type: DataTypes.DECIMAL(20, 0) },
    color: { type: DataTypes.STRING },
}, { timestamps: false });

module.exports = Team;
```
