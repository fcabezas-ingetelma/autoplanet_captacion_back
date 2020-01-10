import express from 'express';
import dotenv from 'dotenv';

import * as dbController from '../../db/controller/dbController';
import HttpRequestController from '../../http/httpRequestController';

var parseString = require('xml2js').parseString;

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

router.get('/get-sinacofi-data/:rut', async (req, res) => {
    var requestController = new HttpRequestController(process.env.DATOS_PERSONA_URL);
    var xml = `<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
                    <soap:Body>
                    <Consulta xmlns="http://sinacofi.cl/WebServices">
                        <usuario></usuario>
                        <clave></clave>
                        <rut></rut>
                    </Consulta>
                    </soap:Body>
                </soap:Envelope>`;
    xml = xml.replace('<usuario></usuario>', '<usuario>' + process.env.SINACOFI_USER + '</usuario>');
    xml = xml.replace('<clave></clave>', '<clave>' + process.env.SINACOFI_CLAVE + '</clave>');
    xml = xml.replace('<rut></rut>', '<rut>' + req.params.rut + '</rut>');

    const requestConfig = {
        'Content-Type': 'text/xml',
        SOAPAction: 'http://sinacofi.cl/WebServices/Consulta',
    };

    var { response } = await requestController.sendSOAPRequest(xml, requestConfig);
    const { body, statusCode } = response;

    var xmlBody = body.replace('<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema"><soap:Body><ConsultaResponse xmlns="http://sinacofi.cl/WebServices"><ConsultaResult><CodigoRetorno>10000</CodigoRetorno><TipoPersona>N</TipoPersona><ResultadoConsulta>S</ResultadoConsulta>', '<ConsultaResult>');
    xmlBody = xmlBody.replace('</ConsultaResult></ConsultaResponse></soap:Body></soap:Envelope>', '</ConsultaResult>');

    parseString(xmlBody, function (err, result) {
        console.log(result.ConsultaResult.PersonaNatural[0].NombreCompleto[0]);
        console.log(result.ConsultaResult.PersonaNatural[0].FechaNac[0]);
        console.log(result.ConsultaResult.PersonaNatural[0].Edad[0]);
        console.log(result.ConsultaResult.PersonaNatural[0].EstadoCivil[0]);
        console.log(result.ConsultaResult.PersonaNatural[0].Nacionalidad[0]);
        console.log(result.ConsultaResult.Direccion[0]);
        console.log(result.ConsultaResult.Ciudad[0]);
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(result));
    });
});

module.exports = router;