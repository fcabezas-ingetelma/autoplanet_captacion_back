import express from 'express';
import * as dbController from '../../db/controller/dbController';

const router = express.Router();

router.put('/init-ws-token', async (req, res) => {
    var response = await dbController.initWSTokenState(req.body.cellphone);
    res.json(response);
});

router.get('/validate/:token/:cellphone', async (req, res) => {
    var response = await dbController.validateToken(req.params.cellphone, req.params.token);
    res.json(response);
});

router.patch('/set-token-used', async (req, res) => {
    var response = await dbController.setTokenUsed(req.body.cellphone, req.body.token);
    res.json(response);
});

module.exports = router;
