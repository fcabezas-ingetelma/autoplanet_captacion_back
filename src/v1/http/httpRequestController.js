import axios from 'axios';
import qs from 'querystring';
import dotenv from 'dotenv';
import soapRequest from 'easy-soap-request';
import "@babel/polyfill";

dotenv.config();

class HttpRequestController {
    constructor(requestUrl) {
        this.url = requestUrl;
    }

    async sendPostRequest(requestBody, requestConfig) {
        try {
            return await axios.post(this.url, qs.stringify(requestBody), requestConfig);
        } catch (error) {
            console.log(error);
        }
    }

    async sendJSONPostRequest(requestBody, requestConfig) {
        try {
            return await axios.post(this.url, requestBody, requestConfig);
        } catch (error) {
            console.log(error);
        }
    }

    async sendSOAPRequest(xml, requestConfig) {
        try {
            return await soapRequest({ url: this.url, headers: requestConfig, xml: xml });
        } catch (error) {
            console.log(error);
        }
    }

    async sendSOAPRequestWithUrl(serviceUrl, xml, requestConfig) {
        try {
            return await soapRequest({ url: serviceUrl, headers: requestConfig, xml: xml });
        } catch (error) {
            console.log(error);
        }
    }
}

export default HttpRequestController;