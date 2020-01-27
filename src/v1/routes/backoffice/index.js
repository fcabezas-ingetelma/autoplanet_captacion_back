import express from 'express';
import dotenv from 'dotenv';

import * as dbController from '../../db/controller/dbController';

var router = express.Router();
dotenv.config();

router.post('/captador-auth', async (req, res) => {
    var response = await dbController.captadorLogin(req.body.user, req.body.pass);
    res.json(response);
});

router.get('/get-captador-dashboard/:rut_captador', async (req, res) => {
    console.log(req.headers.token);
    console.log(req.params.rut_captador);

    res.json();
});

module.exports = router;