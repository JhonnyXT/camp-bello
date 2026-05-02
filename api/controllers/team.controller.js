const Team = require('../models/team');

const getTeams = async (req, res) => {
    try {
        const teams = await Team.findAll();
        res.json(teams);
    } catch (error) {
        res.status(500).json({ msg: 'Error al obtener equipos', error: error.message });
    }
};

const getRank = async (req, res) => {
    try {
        const teams = await Team.findAll();
        const max_value = teams.reduce(
            (max, t) => Number(t.cash) > max ? Number(t.cash) : max,
            0
        );
        teams.forEach(({ dataValues }) => {
            dataValues.percent = max_value > 0
                ? ((Number(dataValues.cash) / max_value) * 100).toFixed()
                : '0';
        });
        res.json(teams);
    } catch (error) {
        res.status(500).json({ msg: 'Error al obtener ranking', error: error.message });
    }
};

const postTeams = async (req, res) => {
    try {
        const { name, cash, color } = req.body;
        if (!name || cash === undefined || !color) {
            return res.status(400).json({ msg: 'Faltan campos requeridos: name, cash, color' });
        }
        const user = await Team.create({ name, cash, color });
        res.json({ msg: 'Equipo creado exitosamente', user });
    } catch (error) {
        res.status(500).json({ msg: 'Error al crear equipo', error: error.message });
    }
};

const putTeams = async (req, res) => {
    try {
        const { body, params } = req;
        const { cash, name, color } = body;
        const updateData = {};
        if (cash  !== undefined) updateData.cash  = cash;
        if (name  !== undefined) updateData.name  = name;
        if (color !== undefined) updateData.color = color;

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ msg: 'No se proporcionaron campos para actualizar' });
        }

        await Team.update(updateData, { where: { id: params.id } });
        res.json({ msg: 'Equipo actualizado' });
    } catch (error) {
        res.status(500).json({ msg: 'Error al actualizar equipo', error: error.message });
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
        res.json({ msg: 'Soldado actualizado', soldierType });
    } catch (error) {
        res.status(500).json({ msg: 'Error al asignar soldado', error: error.message });
    }
};

module.exports = {
    getRank,
    getTeams,
    postTeams,
    putTeams,
    putSoldier,
};
