import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import http from 'http';
import https from 'https';
import fs from 'fs';

import sms from './v1/routes/sms/index';
import user from './v1/routes/user/index';
import urlService from './v1/routes/url_shortener/index';
import token from './v1/routes/token/index';
import backoffice from './v1/routes/backoffice';

var app = express();
dotenv.config();

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
    extended: true
}))

// Certificate
const privateKey = fs.readFileSync(process.env.PRIVATE_KEY_PATH, 'utf8');
const certificate = fs.readFileSync(process.env.CERTIFICATE_PATH, 'utf8');
const ca = fs.readFileSync(process.env.CA_PATH, 'utf8');

const credentials = {
	key: privateKey,
	cert: certificate,
	ca: ca
};

//Development
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "*");
    next();
});

app.use('/v1/sms', sms);
app.use('/v1/user', user);
app.use('/v1/url', urlService);
app.use('/v1/token', token);
app.use('/v1/backoffice', backoffice);

app.get('/', (req, res) => {
    res.send('Index');
})

const httpServer = http.createServer(app);
const httpsServer = https.createServer(credentials, app);

if(process.env.NODE_ENV == 'development') {
    httpServer.listen(process.env.HTTP_PORT, () => {
        console.log('HTTP Server running on port ' + process.env.HTTP_PORT);
    });
}

httpsServer.listen(process.env.PORT, () => {
	console.log('HTTPS Server running on port ' + process.env.PORT);
});