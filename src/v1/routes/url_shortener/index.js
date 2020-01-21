import express from 'express';
import dotenv from 'dotenv';

import HttpRequestController from '../../http/httpRequestController';

import * as Utils from '../../utils/utils';

const router = express.Router();
dotenv.config();

const config = {
    headers: {
        'Content-Type': 'application/json'
    }
};

router.post('/url-shortener-service', async (req, res) => {
    let requestController = new HttpRequestController(process.env.URL_SHORTENER_URI + process.env.URL_SHORTENER_API_KEY);
    let params = 'r=' + req.body.rut_captador + '&token=' + req.body.token + '&telefono=' + req.body.cellphone + '&c=20';
    let destUrl = req.body.url + '?encodedData=' + Utils.encodeToBase64(params);
    let requestBody = {
        longDynamicLink: "https://autoplanet.page.link/?link=" + destUrl
    }

    const response = await requestController.sendJSONPostRequest(requestBody, config);
    res.json(response.data);
});

module.exports = router;
