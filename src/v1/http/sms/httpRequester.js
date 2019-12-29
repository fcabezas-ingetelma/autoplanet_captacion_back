import axios from 'axios';
import qs from 'querystring';
import dotenv from 'dotenv';
import "@babel/polyfill";

dotenv.config();

class HttpRequester {
    constructor() {
        this.url = process.env.SMS_CHILE_URL;
        this.config = {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        };
    }

    async sendSMS(requestBody) {
        try {
            return await axios.post(this.url, qs.stringify(requestBody), this.config);
        } catch (error) {
            console.log(error);
        }
    }
}

export default HttpRequester;