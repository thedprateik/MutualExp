//Import Configurations from config.js
//Call for the required packages
var config     = require('./config');
var express    = require('express');
var app        = express();
var bodyParser = require('body-parser');
var morgan     = require('morgan');
var path       = require('path');
var mongoose   = require('mongoose');

//Application Configurations
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(morgan('dev'));	//configure Morgan
app.use(express.static(__dirname + '/public')); //set the location of the frontend (static) pages

//Connect to the Database
mongoose.connect(config.database); 

//CORS Configuration
app.use(function (req, res, next) {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
	res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Authorization');
	next();
});

app.get('/', function (req, res) {
	res.sendFile(path.join(__dirname + '/public/app/views/index.html'));
});

//Route Configuration
var apiRoutes = require('./app/routes/api')(app, express);
app.use('/api', apiRoutes);

//Send Users to Front End
app.get('*', function(req, res) {
	res.sendFile(path.join(__dirname + '/public/app/views/index.html'));
});

//Start the Server
app.listen(config.port);
console.log('Magic happens on port ' + config.port);