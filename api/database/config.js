const { Sequelize } = require('sequelize');

const db = new Sequelize('campBello-bd', 'root', '123456789', {
    host: 'localhost',
    dialect: 'mysql',
});

module.exports = db;