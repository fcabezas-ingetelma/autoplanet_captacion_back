import express from 'express';
import dotenv from 'dotenv';

import * as dbController from '../../db/controller/dbController';
import HttpRequestController from '../../http/httpRequestController';

import * as CONSTANTS from '../../http/constants/constants'

var parseString = require('xml2js').parseString;

var router = express.Router();
dotenv.config();

router.put('/set-tracker', async (req, res) => {
    var response = await dbController.initTracker(res, 
        req.body.rut_captador, 
        req.body.rut_cliente, 
        req.body.ip, 
        req.body.cellphone, 
        req.body.canal, 
        req.body.sku, 
        req.body.userAgent, 
        req.body.os, 
        req.body.canalPromotor);
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(response));
});

router.put('/set-client', async (req, res) => {
    var response = await dbController.insertClient(res, 
        req.body.rut, 
        req.body.dv, 
        req.body.cellphone, 
        req.body.email, 
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
        req.body.cellphone, 
        req.body.canal, 
        req.body.sku, 
        req.body.userAgent, 
        req.body.os, 
        req.body.canal_promotor);

    response.trackerData = tracker;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(response));
});

router.patch('/set-client', async (req, res) => {
    var response = await dbController.updateClient(
        res, 
        req.body.rut, 
        req.body.cellphone, 
        req.body.email, 
        req.body.type, 
        req.body.client_response
    );
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

router.patch('/set-attendance-data', async (req, res) => {
    var response = await dbController.setCanalAndCaptador(res, 
        req.body.canal, 
        req.body.rut_captador, 
        req.body.rut_cliente, 
        req.body.canal_promotor);
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

router.get('/estados/cliente/:rut', async (req, res) => {
    var response = await dbController.getClienteEstado(res, req.params.rut);
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(response));
});

router.get('/validations/phone/:rut/:cellphone', async (req, res) => {
    var response = await dbController.validatePhone(res, req.params.rut, req.params.cellphone);
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(response));
});

router.get('/validations/sms/:rut/:sms', async (req, res) => {
    var response = await dbController.validateSMSReceived(res, req.params.sms, req.params.rut);
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(response));
});

router.get('/validations/status/:rut', async (req, res) => {
    var response = await dbController.validateSMSStatus(res, req.params.rut);
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(response));
});

router.get('/get-sinacofi-data/:rut', async (req, res) => {
    var requestController = new HttpRequestController();
    var xml = `<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
                    <soap:Body>
                    <Consulta xmlns="http://sinacofi.cl/WebServices">
                        <usuario></usuario>
                        <clave></clave>
                        <rut></rut>
                    </Consulta>
                    </soap:Body>
                </soap:Envelope>`;
    await getSinacofiData(res, req.params.rut, requestController, xml, true);
});

router.get('/batch-sinacofi-data-getter/:key', async (req, res) => {
    if(req.params.key == process.env.BATCH_SINACOFI_KEY) {
        var requestController = new HttpRequestController();
        var xml = `<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
                        <soap:Body>
                        <Consulta xmlns="http://sinacofi.cl/WebServices">
                            <usuario></usuario>
                            <clave></clave>
                            <rut></rut>
                        </Consulta>
                        </soap:Body>
                    </soap:Envelope>`;

        var rutArray = await dbController.getAllRutsWithoutUserData();
        var length = rutArray.length;
        var i = 0;
        rutArray.map(data => {
            getSinacofiData(res, data.rut, requestController, xml, i++ == length - 1);
        });
    } else {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(CONSTANTS.createGenericErrorJSONResponse()));
    }
});

router.get('/batch-sinacofi-vehicle-getter/:key', async (req, res) => {
    if(req.params.key == process.env.BATCH_SINACOFI_KEY) {
        var requestController = new HttpRequestController();
        var xml = `<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
                        <soap:Body>
                        <Consulta xmlns="http://sinacofi.cl/WebServices">
                            <usuario></usuario>
                            <clave></clave>
                            <rut></rut>
                        </Consulta>
                        </soap:Body>
                    </soap:Envelope>`;

        var rutArray = await dbController.getAllRuts();
        var length = rutArray.length;
        var i = 0;
        rutArray.map(data => {
            getVehiclesData(res, data.rut, requestController, xml, i++ == length - 1);
        });
    } else {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(CONSTANTS.createGenericErrorJSONResponse()));
    }
});

async function getVehiclesData(res, rut, requestController, xml, closeReq) {
    xml = xml.replace('<usuario></usuario>', '<usuario>' + process.env.SINACOFI_USER + '</usuario>');
    xml = xml.replace('<clave></clave>', '<clave>' + process.env.SINACOFI_CLAVE + '</clave>');
    xml = xml.replace('<rut></rut>', '<rut>' + rut + '</rut>');

    const requestConfig = {
        'Content-Type': 'text/xml',
        SOAPAction: 'http://sinacofi.cl/WebServices/Consulta',
    };

    var { response } = await requestController.sendSOAPRequestWithUrl(process.env.DATOS_VEHICULO_URL, xml, requestConfig);
    const { body, statusCode } = response;

    var responses = {};
            
    parseString(replaceSOAPTagsVehicle(body), async function (err, result) {
        if(err || result.ConsultaResult.RegistraVehiculos[0] === 'N') {
            //Does not have a vehicle
            if(closeReq) {
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(responses));
            }
        } else {
            //Have a vehicle
            var obj = result.ConsultaResult.Detalles[0].Detalle;
            var size = obj.length;
            var vehicleResults = [];
            for(var i = 0; i < size; i++) {
                var vehicleQueryRes = await dbController.insertVehicle(
                    res, 
                    result.ConsultaResult.Detalles[0].Detalle[i].Patente[0], 
                    result.ConsultaResult.Detalles[0].Detalle[i].Marca[0], 
                    result.ConsultaResult.Detalles[0].Detalle[i].Modelo[0], 
                    result.ConsultaResult.Detalles[0].Detalle[i].Tipo[0], 
                    result.ConsultaResult.Detalles[0].Detalle[i].AnioFabricacion[0], 
                    result.ConsultaResult.Detalles[0].Detalle[i].TasacionDesde[0], 
                    result.ConsultaResult.Detalles[0].Detalle[i].TasacionHasta[0], 
                    rut.substring(0, rut.length - 1)
                );
                vehicleResults.push(vehicleQueryRes);
            }

            responses.vehicle = vehicleResults;

            if(closeReq) {
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(responses));
            }
        }
    });
}

async function getSinacofiData(res, rut, requestController, xml, closeReq) {
    xml = xml.replace('<usuario></usuario>', '<usuario>' + process.env.SINACOFI_USER + '</usuario>');
    xml = xml.replace('<clave></clave>', '<clave>' + process.env.SINACOFI_CLAVE + '</clave>');
    xml = xml.replace('<rut></rut>', '<rut>' + rut + '</rut>');

    const requestConfig = {
        'Content-Type': 'text/xml',
        SOAPAction: 'http://sinacofi.cl/WebServices/Consulta',
    };

    var { response } = await requestController.sendSOAPRequestWithUrl(process.env.DATOS_PERSONA_URL, xml, requestConfig);
    const { body, statusCode } = response;

    var responses = {};

    parseString(replaceSOAPTags(body), async function (err, result) {
        if(err) {
            if(closeReq) {
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(CONSTANTS.createGenericErrorJSONResponse));
            }
        } else {
            var queryResponse = await dbController.updateClientFromSinacofi(
                res, 
                rut.substring(0, rut.length - 1), 
                result.ConsultaResult.PersonaNatural[0].NombreCompleto[0], 
                result.ConsultaResult.PersonaNatural[0].NombreCompleto[0], 
                result.ConsultaResult.PersonaNatural[0].FechaNac[0], 
                parseInt(result.ConsultaResult.PersonaNatural[0].Edad[0]), 
                result.ConsultaResult.PersonaNatural[0].EstadoCivil[0], 
                result.ConsultaResult.PersonaNatural[0].Nacionalidad[0], 
                result.ConsultaResult.PersonaNatural[0].Sexo[0], 
                result.ConsultaResult.PersonaNatural[0].FechaMatrimonio[0], 
                result.ConsultaResult.Direccion[0], 
                result.ConsultaResult.Ciudad[0], 
                result.ConsultaResult.Comuna[0]
                );

            responses.user = queryResponse;

            //For now, it not get vehicle data from Sinacofi
            /*var { response } = await requestController.sendSOAPRequestWithUrl(process.env.DATOS_VEHICULO_URL, xml, requestConfig);
            const { body, statusCode } = response;
            
            parseString(replaceSOAPTagsVehicle(body), async function (err, result) {
                if(err || result.ConsultaResult.RegistraVehiculos[0] === 'N') {
                    //Does not have a vehicle
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify(responses));
                } else {
                    //Have a vehicle
                    var obj = result.ConsultaResult.Detalles[0].Detalle;
                    var size = obj.length;
                    var vehicleResults = [];
                    for(var i = 0; i < size; i++) {
                        var vehicleQueryRes = await dbController.insertVehicle(
                            res, 
                            result.ConsultaResult.Detalles[0].Detalle[i].Patente[0], 
                            result.ConsultaResult.Detalles[0].Detalle[i].Marca[0], 
                            result.ConsultaResult.Detalles[0].Detalle[i].Modelo[0], 
                            result.ConsultaResult.Detalles[0].Detalle[i].Tipo[0], 
                            result.ConsultaResult.Detalles[0].Detalle[i].AnioFabricacion[0], 
                            result.ConsultaResult.Detalles[0].Detalle[i].TasacionDesde[0], 
                            result.ConsultaResult.Detalles[0].Detalle[i].TasacionHasta[0], 
                            rut.substring(0, rut.length - 1)
                        );
                        vehicleResults.push(vehicleQueryRes);
                    }

                    responses.vehicle = vehicleResults;

                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify(responses));
                }
            });*/

            if(closeReq) {
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(responses));
            }
        }
    });
}

function replaceSOAPTags(body) {
    var xmlBody = body.replace('<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema"><soap:Body><ConsultaResponse xmlns="http://sinacofi.cl/WebServices"><ConsultaResult><CodigoRetorno>10000</CodigoRetorno><TipoPersona>N</TipoPersona><ResultadoConsulta>S</ResultadoConsulta>', '<ConsultaResult>');
    return xmlBody.replace('</ConsultaResult></ConsultaResponse></soap:Body></soap:Envelope>', '</ConsultaResult>');
}

function replaceSOAPTagsVehicle(body) {
    var xmlBody = body.replace('<?xml version="1.0" encoding="utf-8"?><soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema"><soap:Body><ConsultaResponse xmlns="http://sinacofi.cl/WebServices"><ConsultaResult>', '<ConsultaResult>');
    return xmlBody.replace('</ConsultaResult></ConsultaResponse></soap:Body></soap:Envelope>', '</ConsultaResult>');
}

module.exports = router;