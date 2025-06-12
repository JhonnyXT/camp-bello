const { response: res, request: req, request } = require('express');

const Team = require('../models/team');

const getTeams = async (req, res) => {

    const teams = await Team.findAll();

    res.json(teams);

};

const getRank = async (req, res) => {

    const teams = await Team.findAll();
    let max_value = 0;

    // Obtener el mayor valor
    max_value = teams.reduce((objetoMayor, objetoActual) => Number(objetoActual.cash) > objetoMayor ? Number(objetoActual.cash) : objetoMayor, 0);

    teams.map(({ dataValues }) => {
        dataValues.percent = ((Number(dataValues.cash) / max_value) * 100).toFixed();
    });

    res.json(teams);

};

const postTeams = async (req, res) => {

    const { body } = req;
    const { name, cash, color } = body;
    const user = await Team.create({
        name,
        cash,
        color
    });

    res.json({
        msg: "Equipo creado exitosamente",
        user
    })

};

const putTeams = async (req, res) => {

    const { body, params } = req;
    const { cash } = body;
    await Team.update(
        { cash: cash },
        {
            where: {
                id: params.id
            }
        }
    );

    res.json({
        msg: "Monto actualizado",
    })

};

module.exports = {
    getRank,
    getTeams,
    postTeams,
    putTeams
}