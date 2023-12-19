var express = require('express');
var app = express();
var port = process.env.PORT || 8080;
var morgan = require("morgan");
let mongoose = require('mongoose');
var bodyParser = require('body-parser');
var router = express.Router();
var appRoute = require('./routers/api')(router);
var cors = require('cors');

app.use(cors({ origin: "http://localhost:4200" }));
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, HEAD, OPTIONS, PUT, PATCH, DELETE");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, x-access-token, x-refresh-token, _id");

    res.header(
        'Access-Control-Expose-Headers',
        'x-access-token, x-refresh-token'
    );

    next();
});
app.use(morgan('dev'));
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use('/api',appRoute);

mongoose.connect('mongodb+srv://mongodbuser:mongodbuser@cluster0-mvmyh.mongodb.net/test?retryWrites=true&w=majority', { useNewUrlParser: true,  useCreateIndex: true, useUnifiedTopology: true });
//mongoose.connect('mongodb://localhost:27017/test', {useNewUrlParser: true,  useCreateIndex: true, useUnifiedTopology: true});
var conn = mongoose.connection;

conn.on('connected', function(){
    console.log("Successfully connected to MongoDB !!!");
});
conn.on('disconnected', function(){
    console.log("Successfully disconnected to MongoDB !!!");
});
conn.on('error', console.error.bind(console, 'connection error:'));

app.listen(port, ()=> {
    console.log("Connected to localhost :"+port);
});