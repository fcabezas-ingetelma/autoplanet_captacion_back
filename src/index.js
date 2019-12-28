import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';

import sms from './v1/sms/index';

var app = express();
dotenv.config();

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
    extended: true
}))
app.use('/v1/sms', sms);

app.get('/', (req, res) => {
    res.send('Index');
})

app.listen(process.env.PORT, () => {
    console.log('Example app listening on port ' + process.env.PORT);
})