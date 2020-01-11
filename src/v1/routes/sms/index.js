import express from 'express';
import dotenv from 'dotenv';

import HttpRequestController from '../../http/httpRequestController';
import * as CONSTANTS from '../../http/constants/constants';

import * as dbController from '../../db/controller/dbController';

var router = express.Router();
var requestController = new HttpRequestController(process.env.SMS_CHILE_URL);
dotenv.config();

var requestBody = {
    username: process.env.SMS_CHILE_USERNAME,
    password: process.env.SMS_CHILE_PASS
};

var config = {
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
    }
};

router.post('/send-sms', (req, res) => {
    requestBody.phone = req.body.phone;
    requestBody.message = CONSTANTS.SMS_MESSAGE.replace('{$CODE}', req.body.code)

    let sendSms = async (requestBody, config) => {
        const response = await requestController.sendPostRequest(requestBody, config);
        res.setHeader('Content-Type', 'application/json');
        if(response && response.status == 200) {
            if(response.data.message === 'BAD PARAMETERS INVALID PHONE') {
                res.end(JSON.stringify(CONSTANTS.createCustomJSONResponse(CONSTANTS.BAD_REQUEST_CODE, response.data.message)));
            } else {
                res.end(JSON.stringify(CONSTANTS.createCustomJSONResponse(response.status, response.data)));
            }
        } else {
            res.end(JSON.stringify(CONSTANTS.createGenericErrorJSONResponse()));
        }
    }

    sendSms(requestBody, config);
});

router.post('/re-send-sms', (req, res) => {
    requestBody.message = CONSTANTS.SMS_MESSAGE.replace('{$CODE}', req.body.code)

    let sendSms = async (requestBody, config) => {
        const getPhone = await dbController.updateSMSSended(res, req.body.rut, req.body.code);
        if(getPhone) {
            requestBody.phone = '569' + getPhone;
            const response = await requestController.sendPostRequest(requestBody, config);
            res.setHeader('Content-Type', 'application/json');
            if(response && response.status == 200) {
                if(response.data.message === 'BAD PARAMETERS INVALID PHONE') {
                    res.end(JSON.stringify(CONSTANTS.createCustomJSONResponse(CONSTANTS.BAD_REQUEST_CODE, response.data.message)));
                } else {
                    res.end(JSON.stringify(CONSTANTS.createCustomJSONResponse(response.status, response.data)));
                }
            } else {
                res.end(JSON.stringify(CONSTANTS.createGenericErrorJSONResponse()));
            }
        } else {
            res.end(JSON.stringify(CONSTANTS.createCustomJSONResponse(CONSTANTS.NOT_FOUND_CODE, CONSTANTS.ERROR_MESSAGE)));
        }
    }

    sendSms(requestBody, config);
});

module.exports = router;