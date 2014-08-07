// server.js

// set up ======================================================================
// get all the tools we need
var express  = require('express');
var app      = express();
var port     = process.env.PORT ;
var mongoose = require('mongoose');
var passport = require('passport');
var flash 	 = require('connect-flash');
var morgan       = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');//require('connect');//
var session      = require('express-session');
var http = require('http');
var configDB = require('./config/database.js');
var socketio = require('socket.io');
var path = require('path');

// configuration ===============================================================
mongoose.connect(configDB.url); // connect to our database

require('./config/passport')(passport); // pass passport for configuration

// set up our express application
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser()); // get information from html forms
/*app.configure(function(){
    app.use(bodyParser());
});*/
//app.use( bodyParser.json() );       // to support JSON-encoded bodies
//app.use( bodyParser.urlencoded() ); // to support URL-encoded bodies

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

app.set('view engine', 'ejs'); // set up ejs for templating

// required for passport
app.use(session({ secret: 'ilovescotchscotchyscotchscotch' })); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

// routes ======================================================================
app.use(express.static(path.resolve(__dirname , 'radioadclient')));
/*app.post('/tweet', function(req, response) {
	

		

	console.log(JSON.stringify(req.body));
	console.log('req.body.message', req.body['message']);
	console.log(req.body.message);
	//
	//  tweet 'hello world!'
	//
	});
*/
// launch ======================================================================
app.set('port', process.env.PORT);
//var server = http.createServer(app);

var server = app.listen(app.get('port'));
//var io     = require('socket.io').listen(server);
console.log('The magic happens on port ' + process.env.PORT);


var io = socketio.listen(server);
io.sockets.on('connection', function(socket)
{
  console.log(socket);
  socket.emit('connect', 'hello world');
  socket.on('stationId',function(data)
  {
  	socket.stationId = data;
  	console.log(data);
  });
});
var routes = require('./app/routes.js')(app, passport, bodyParser(), io); // load our routes and pass in our app and fully configured passport
