const { Router } = require('express');

const { getTeams, postTeams, putTeams, getRank, putSoldier } = require('../controllers/team.controller');

const router = Router();

router.get('/',      getTeams);
router.get('/rank',  getRank);
router.post('/',     postTeams);
router.put('/:id',          putTeams);
router.put('/:id/soldier',  putSoldier);

module.exports = router;
