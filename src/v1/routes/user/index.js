import express from 'express';
import dotenv from 'dotenv';

import * as dbController from '../../db/controller/dbController';

var router = express.Router();
dotenv.config();

router.put('/set-tracker', async (req, res) => {
    var response = await dbController.initTracker(res, 
        req.body.rut_captador, 
        req.body.rut_cliente, 
        req.body.ip, 
        req.body.canal);
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(response));
});

router.patch('/update-tracker', async (req, res) => {
    var response = await dbController.updateTracker(res, 
        req.body.tracker_id, 
        req.body.rut_captador,
        req.body.rut_cliente, 
        req.body.ip, 
        req.body.canal);
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(response));
});

router.put('/set-client', async (req, res) => {
    var response = await dbController.insertClient(res, 
        req.body.rut, 
        req.body.dv, 
        req.body.cellphone, 
        req.body.type, 
        req.body.name, 
        req.body.lastname, 
        req.body.birth_date, 
        req.body.edad, 
        req.body.estado_civil, 
        req.body.nacionalidad, 
        req.body.sended_sms_code, 
        undefined, // Validated SMS code, undefined since it's not validated yet
        req.body.client_response);

    var tracker = await dbController.initTracker(res, 
        req.body.rut_captador, 
        req.body.rut, 
        req.body.ip, 
        req.body.canal);

    response.trackerData = tracker;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(response));
});

router.patch('/update-validated-sms', async (req, res) => {
    var response = await dbController.updateSMSData(res, 
        req.body.validatedSMSCode, 
        req.body.rut);
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(response));
});

router.put('/create-solicitud', async (req, res) => {
    var response = await dbController.createSolicitud(res, 
        req.body.estado_id, 
        req.body.rut);
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(response));
});

router.get('/estados', async (req, res) => {
    var response = await dbController.getEstados(res);
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(response));
});

router.get('/estados/:estadoId', async (req, res) => {
    var response = await dbController.getEstado(res, req.params.estadoId);
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(response));
});

router.get('/validations/phone/:cellphone', async (req, res) => {
    var response = await dbController.validatePhone(res, req.params.cellphone);
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(response));
});

router.get('/validations/sms/:rut/:sms', async (req, res) => {
    var response = await dbController.validateSMSReceived(res, req.params.sms, req.params.rut);
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(response));
});

module.exports = router;