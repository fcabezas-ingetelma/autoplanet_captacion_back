import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import mysql from 'mysql';

import sms from './v1/routes/sms/index';

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

const db = mysql.createConnection ({
    host     : process.env.MYSQL_HOST,
    user     : process.env.MYSQL_USER,
    password : process.env.MYSQL_PASSWORD,
    database : process.env.MYSQL_DATABASE
});

// connect to database
db.connect((err) => {
    if (err) {
        throw err;
    }
    console.log('Connected to database');
});
global.db = db;

app.use('/v1/sms', sms);

app.get('/', (req, res) => {
    res.send('Index');
})

app.listen(process.env.PORT, () => {
    console.log('Example app listening on port ' + process.env.PORT);
})