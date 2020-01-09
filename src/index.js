import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';

import sms from './v1/routes/sms/index';
import user from './v1/routes/user/index';

var app = express();
dotenv.config();

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
    extended: true
}))

//Development
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "*");
    next();
});

app.use('/v1/sms', sms);
app.use('/v1/user', user);

app.get('/', (req, res) => {
    res.send('Index');
})

app.listen(process.env.PORT, () => {
    console.log('Example app listening on port ' + process.env.PORT);
})