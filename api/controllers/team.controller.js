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
    try {
        const { body, params } = req;
        const { cash, name, color } = body;
        const updateData = {};
        if (cash  !== undefined) updateData.cash  = cash;
        if (name  !== undefined) updateData.name  = name;
        if (color !== undefined) updateData.color = color;

        await Team.update(updateData, { where: { id: params.id } });
        res.json({ msg: "Equipo actualizado" });
    } catch (error) {
        res.status(500).json({ msg: "Error al actualizar equipo", error: error.message });
    }
};

const putSoldier = async (req, res) => {
    try {
        const { body, params } = req;
        const soldierType = body.soldierType ?? null;
        await Team.update(
            { soldierType },
            { where: { id: params.id } }
        );
        res.json({ msg: "Soldado actualizado", soldierType });
    } catch (error) {
        res.status(500).json({ msg: "Error al asignar soldado", error: error.message });
    }
};

module.exports = {
    getRank,
    getTeams,
    postTeams,
    putTeams,
    putSoldier,
}