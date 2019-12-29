import express from 'express';
import dotenv from 'dotenv';

import HttpRequester from '../http/sms/httpRequester';
import * as CONSTANTS from '../http/constants';

var router = express.Router();
var requester = new HttpRequester();
dotenv.config();

router.post('/send_sms', (req, res) => {
    let requestBody = {
        username: process.env.SMS_CHILE_USERNAME,
        password: process.env.SMS_CHILE_PASS,
        phone: req.body.phone,
        message: CONSTANTS.SMS_MESSAGE.replace('{$CODE}', req.body.code)
    }
    let sendSms = async (requestBody) => {
        const response = await requester.sendSMS(requestBody);
        res.setHeader('Content-Type', 'application/json');
        if(response.status == 200) {
            res.end(CONSTANTS.createGenericJSONResponse(response.status, response.data));
        } else {
            res.end(CONSTANTS.createGenericErrorJSONResponse());
        }
    }

    sendSms(requestBody);
});

module.exports = router;