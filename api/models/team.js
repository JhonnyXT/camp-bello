const { DataTypes } = require('sequelize');
const db = require('../database/config');

const Team = db.define('Team', {
    name: {
        type: DataTypes.STRING,
    },
    cash: {
        type: DataTypes.DECIMAL(20, 0)
    },
    color: {
        type: DataTypes.STRING
    }
}, {
    timestamps: false,
});

module.exports = Team;