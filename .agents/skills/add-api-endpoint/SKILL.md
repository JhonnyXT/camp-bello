---
name: add-api-endpoint
description: Agrega un nuevo endpoint REST a la API de Codigo Camp siguiendo el patrón Express del proyecto. Usar cuando el usuario pida crear un endpoint, ruta de API, funcionalidad del servidor, o nueva operación de base de datos.
---

# Add API Endpoint — Codigo Camp

## When to Use
- El usuario pide crear un nuevo endpoint, ruta o funcionalidad del backend
- El usuario quiere agregar una operación CRUD para una entidad nueva o existente
- El usuario pide agregar lógica de negocio en el servidor

## Gotchas
- El flujo obligatorio es: `routes/ → controllers/ → models/` — no saltarse pasos
- Registrar siempre el nuevo router en el constructor de `api/models/server.js`
- Todas las funciones del controlador deben ser `async` con `try/catch`
- Validar manualmente los campos de `req.body` — no hay Joi ni Zod instalado
- `timestamps: false` es obligatorio en todos los modelos Sequelize

## Instructions

### Paso 1 — Identificar si es entidad nueva o existente

**Si es una nueva entidad** (ej. jugadores, actividades, premios):
→ Seguir todos los pasos del 2 al 5.

**Si es un endpoint nuevo para una entidad existente** (ej. nuevo filtro en teams):
→ Solo agregar la función en el controlador existente y la ruta en el archivo de rutas.

### Paso 2 — Crear el modelo (solo si es entidad nueva)

```js
// api/models/[entidad].js
const { DataTypes } = require('sequelize');
const db = require('../database/config');

const NuevaEntidad = db.define('NuevaEntidad', {
    nombre:    { type: DataTypes.STRING },
    valor:     { type: DataTypes.DECIMAL(20, 0) },
    activo:    { type: DataTypes.BOOLEAN, defaultValue: true },
    color:     { type: DataTypes.STRING },
    // Agregar los campos que necesite la entidad
}, {
    timestamps: false   // SIEMPRE false
});

module.exports = NuevaEntidad;
```

Tipos Sequelize disponibles: `STRING`, `TEXT`, `INTEGER`, `DECIMAL(20,0)`,
`BOOLEAN`, `DATE`, `FLOAT`.

### Paso 3 — Crear el controlador

```js
// api/controllers/[entidad].controller.js
const NuevaEntidad = require('../models/[entidad]');

const getAll = async (req, res) => {
    try {
        const items = await NuevaEntidad.findAll();
        res.json(items);
    } catch (error) {
        res.status(500).json({ msg: 'Error al obtener registros', error });
    }
};

const getById = async (req, res) => {
    try {
        const { id } = req.params;
        const item = await NuevaEntidad.findByPk(id);
        if (!item) return res.status(404).json({ msg: 'No encontrado' });
        res.json(item);
    } catch (error) {
        res.status(500).json({ msg: 'Error al obtener registro', error });
    }
};

const create = async (req, res) => {
    try {
        const { nombre, valor } = req.body;
        if (!nombre || valor === undefined) {
            return res.status(400).json({ msg: 'Faltan campos requeridos: nombre, valor' });
        }
        const nuevo = await NuevaEntidad.create({ nombre, valor });
        res.status(201).json({ msg: 'Creado exitosamente', data: nuevo });
    } catch (error) {
        res.status(500).json({ msg: 'Error al crear', error });
    }
};

const update = async (req, res) => {
    try {
        const { id } = req.params;
        const item = await NuevaEntidad.findByPk(id);
        if (!item) return res.status(404).json({ msg: 'No encontrado' });
        await item.update(req.body);
        res.json({ msg: 'Actualizado exitosamente' });
    } catch (error) {
        res.status(500).json({ msg: 'Error al actualizar', error });
    }
};

const remove = async (req, res) => {
    try {
        const { id } = req.params;
        const item = await NuevaEntidad.findByPk(id);
        if (!item) return res.status(404).json({ msg: 'No encontrado' });
        await item.destroy();
        res.json({ msg: 'Eliminado exitosamente' });
    } catch (error) {
        res.status(500).json({ msg: 'Error al eliminar', error });
    }
};

module.exports = { getAll, getById, create, update, remove };
```

### Paso 4 — Crear el archivo de rutas

```js
// api/routes/[entidad].js
const { Router } = require('express');
const { getAll, getById, create, update, remove } = require('../controllers/[entidad].controller');

const router = Router();

router.get('/', getAll);
router.get('/:id', getById);
router.post('/', create);
router.put('/:id', update);
router.delete('/:id', remove);

module.exports = router;
```

### Paso 5 — Registrar en el servidor

Editar `api/models/server.js`:

```js
constructor() {
    this.app = express();
    this.port = 8080 || 5000;
    this.teamsPath = '/api/teams';
    this.nuevaEntidadPath = '/api/nueva-entidad'; // ← 1. Agregar la nueva ruta

    this.conectarDB();
    this.middlewares();
    this.routes();
}

routes() {
    this.app.use(this.teamsPath, require('../routes/teams'));
    this.app.use(this.nuevaEntidadPath, require('../routes/nueva-entidad')); // ← 2. Registrar el router
}
```

### Paso 6 — Verificar que funciona

```bash
# Desde api/
node app.js

# Probar con curl o desde el frontend
curl http://localhost:8080/api/nueva-entidad
curl -X POST http://localhost:8080/api/nueva-entidad \
  -H "Content-Type: application/json" \
  -d '{"nombre": "test", "valor": 100}'
```

### Patrón especial — endpoint de ranking (referencia del proyecto)

```js
// Patrón para calcular porcentajes relativos (como /rank en teams)
const getRank = async (req, res) => {
    try {
        const items = await Entidad.findAll();
        const maxValor = items.reduce((max, item) =>
            Number(item.valor) > max ? Number(item.valor) : max, 0
        );
        items.map(({ dataValues }) => {
            dataValues.percent = ((Number(dataValues.valor) / maxValor) * 100).toFixed();
        });
        res.json(items);
    } catch (error) {
        res.status(500).json({ msg: 'Error al calcular ranking', error });
    }
};
```
