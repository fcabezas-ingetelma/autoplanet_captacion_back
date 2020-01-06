import express from 'express';
import dotenv from 'dotenv';

import * as dbController from '../../db/controller/dbController';

var router = express.Router();
dotenv.config();

router.put('/set-tracker', async (req, res) => {
    var response = await dbController.initTracker(res, req.body.rut_captador, 
        req.body.ip, 
        req.body.canal);
    res.setHeader('Content-Type', 'application/json');
    res.end(response);
});

router.patch('/set-tracker', async (req, res) => {
    var response = await dbController.updateTracker(res, 
        req.body.tracker_id, 
        req.body.rut_captador, 
        req.body.ip, 
        req.body.canal);
    res.setHeader('Content-Type', 'application/json');
    res.end(response);
});

router.put('/create-client', async (req, res) => {
    var response = await dbController.insertClient(res, req.body.rut, 
        req.body.dv, 
        req.body.cellphone, 
        req.body.type, 
        req.body.id_tracker, //This parameter is not allowed here -> remove
        req.body.rut_captador, //This parameter is not allowed here -> remove
        req.body.sended_sms_code, 
        undefined, // Validated SMS code, undefined since it's not validated yet
        undefined); // Client response, undefined since client not answer yet
        //TODO Create tracker when create client
    res.setHeader('Content-Type', 'application/json');
    res.end(response);
});

router.put('/create-solicitud', async (req, res) => {
    var response = await dbController.createSolicitud(res, req.body.estado_id, 
        req.body.rut);
    res.setHeader('Content-Type', 'application/json');
    res.end(response);
});

router.get('/estados', async (req, res) => {
    var response = await dbController.getEstados(res);
    res.setHeader('Content-Type', 'application/json');
    res.end(response);
});

router.get('/estados/:estadoId', async (req, res) => {
    var response = await dbController.getEstado(res, req.params.estadoId);
    res.setHeader('Content-Type', 'application/json');
    res.end(response);
});

module.exports = router;