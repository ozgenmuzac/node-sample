// config/passport.js

// load all the things we need
var LocalStrategy   = require('passport-local').Strategy;


var Userdb = require('./dbintegration.js');

var User = require('../models/User.js').User;


// expose this function to our app using module.exports
module.exports = function(passport) {

    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        done(null, user.name);
    });

    // used to deserialize the user
    passport.deserializeUser(function(name, done) {
        Userdb.findByName(name, function(err, user) {
            done(err, user);
        });
    });


    passport.use('local-login', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with name
        usernameField : 'name',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, name, password, done) { // callback with name and password from our form
		// find a user whose name is the same as the forms name
		// we are checking to see if the user trying to login already exists
        console.log("User name: " + name)
        Userdb.isUserExists(name, password, function(res){
                if(!res) {
                    console.log("user does not exists");
                    return done(null, false, req.flash('loginMessage','Invalide User'));
                }
                else
                {
                    console.log("User exists");
                    return done(null, new User(name, null))
                }
            });
        }));
}
