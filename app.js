
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');

var passport = require('passport');
var https = require('https');
var fs = require('fs');

var flash = require('connect-flash');

var app = express();

var morgan = require('morgan')
var methodOverride = require('method-override');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var errorhandler = require('errorhandler');

var server = http.createServer(app);
var io = require('socket.io').listen(server);

require('./config/passport')(passport);

var options = {
    key: fs.readFileSync('private.pem'),
    cert: fs.readFileSync('certificate.pem')
};


// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
//app.use(methodOverride());

app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());
app.use(bodyParser());
app.use(session({secret: 'ozgen'}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

//app.use(app.router);


// development only
if ('development' == app.get('env')) {
  app.use(errorhandler());
}

app.get('/', routes.index);
app.get('/userinfo', routes.isAuthenticated, routes.userinfo);
app.get('/status', routes.userstatus);
app.get('/success', routes.success);
app.get('/failure', routes.failure);
app.get('/logout', routes.logout);
app.get('/isloggedin', routes.isloggedin)
app.post('/login', passport.authenticate('local-login', {
        successRedirect: '/success',
        failureRedirect: '/failure',
        failureFlash: true
   }));
app.get('/users', user.list);

io.sockets.on('connection', routes.connect);
//io.sockets.on('disconnect', routes.disconnect);


/*server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});*/
https.createServer(options, app).listen(1443, function(){
  console.log('Express server listening on port ' + app.get('port'));
});
