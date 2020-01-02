import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

import sms from './v1/sms/index';

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
    next();
});

//Connect to the MongoDB database  
mongoose.connect('mongodb://' + process.env.MONGO_HOST + '/' + process.env.MONGO_INITDB_DATABASE, 
            { useNewUrlParser: true, useUnifiedTopology: true });  

app.use('/v1/sms', sms);

app.get('/', (req, res) => {
    res.send('Index');
})

app.listen(process.env.PORT, () => {
    console.log('Example app listening on port ' + process.env.PORT);
})