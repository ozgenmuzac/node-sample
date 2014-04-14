
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

require('./config/passport')(passport);

var options = {
    key: fs.readFileSync('private.pem'),
    cert: fs.readFileSync('certificate.pem')
};


// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.cookieParser());
app.use(express.bodyParser());
app.use(express.session({secret: 'ozgen'}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.use(app.router);


// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/polls/polls', routes.list);
app.get('/polls/:id', routes.poll);
app.post('/polls', routes.create);
app.get('/userinfo', routes.userinfo);
app.get('/success', routes.success);
app.get('/failure', routes.failure);
//app.post('/login', routes.login);
app.post('/login', passport.authenticate('local-login', {
        successRedirect: '/success',
        failureRedirect: '/failure',
        failureFlash: true
   }));
app.get('/users', user.list);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
//https.createServer(options, app).listen(443, function(){
//  console.log('Express server listening on port ' + app.get('port'));
//});
