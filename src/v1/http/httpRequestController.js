import axios from 'axios';
import qs from 'querystring';
import dotenv from 'dotenv';
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
}

export default HttpRequestController;