const { Router } = require('express');

// CONTROLLERS
const { getTeams, postTeams, putTeams, getRank } = require('../controllers/team.controller');

const router = Router();

router.get('/', getTeams);
router.get('/rank', getRank);

router.post('/', postTeams);
router.put('/:id', putTeams);

module.exports = router;