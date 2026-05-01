const express = require('express');
const cors = require('cors');
const db = require('../database/config');

class Server {

    constructor() {
        this.app = express();
        this.port = process.env.PORT || 8080;
        this.teamsPath = '/api/teams';

        // Conexión a la BD
        this.conectarDB();

        // Middlewares
        this.middlewares();

        // Rutas del app
        this.routes();
    }

    async conectarDB() {
        try {
            await db.authenticate();
            console.log('Connection has been established successfully.');
            // Sincroniza el schema (agrega columnas nuevas sin borrar datos)
            await db.sync({ alter: true });
            console.log('Schema sincronizado.');
        } catch (error) {
            console.error('Unable to connect to the database:', error);
        }
    }

    middlewares() {

        //CORS
        this.app.use( cors() );

        // Lectura y parseo del body
        this.app.use( express.json() );

        // Directorio Público
        this.app.use( express.static("public") );

    }

    routes() {
        this.app.use( this.teamsPath , require('../routes/teams'));

    }

    listen() {
        this.app.listen( this.port, () => {
            console.log("localhost:",this.port);
        });
    }
}

module.exports = Server;