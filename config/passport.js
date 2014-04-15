// config/passport.js

// load all the things we need
var LocalStrategy   = require('passport-local').Strategy;

var mongoose = require('mongoose');
var db;
if (process.env.VCAP_SERVICES) {
   var env = JSON.parse(process.env.VCAP_SERVICES);
   db = mongoose.createConnection(env['mongodb-2.2'][0].credentials.url);
} else {
   db = mongoose.createConnection('localhost', 'pollsapp');
}
// load up the user model
var UserSchema = require('../models/User.js').UserSchema;
var User = db.model('users', UserSchema);

var Userdb = require('./dbintegration.js');
var arp = require('node-arp');

function validateKimlikNo(kno)
{
    if(typeof kno == "string")
    {
        if(kno.charAt(0) == '0')
            return false;
        var no = kno.split('');
        var i = 0, total1 = 0, total2 = 0, total3 = parseInt(no[0]);

        for(i = 0; i < 10; i++)
            total1 += parseInt(no[i]);

        if((total1 % 10) != parseInt(no[10]))
            return false;
        
        for(i = 1; i < 9; i += 2)
        {
            total2 = total2 + parseInt(no[i]);
            total3 = total3 + parseInt(no[i+1]);
        }
        if(((total3*7 - total2) % 10) != parseInt(no[9]))
            return false;
        return true;
    }
}

function ipAndMac(req)
{
    var ip = req.connection.remoteAddress;
    arp.getMAC(ip, function(err, mac) { 
        if(!err) {
            console.log("Remote Mac: " + mac);
            return ({ip:ip, mac:mac});
        }
    });
}

function makeid()
{
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 20; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    console.log("Generation: " + text);
    return text;
}

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
    passport.deserializeUser(function(id, done) {
        Userdb.findById(id, function(err, user) {
            done(err, user);
        });
    });

 	// =========================================================================
    // LOCAL SIGNUP ============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
	// by default, if there was no name, it would just be called 'local'

    passport.use('local-signup', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with name
        usernameField : 'name',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, name, password, done) {

        // asynchronous
        // User.findOne wont fire unless data is sent back
        process.nextTick(function() {

		// find a user whose name is the same as the forms name
		// we are checking to see if the user trying to login already exists
        User.findOne({ 'name' :  name }, function(err, user) {
            // if there are any errors, return the error
            if (err)
                return done(err);
            // check to see if theres already a user with that name
            if (user) {
                return done(null, false, req.flash('signupMessage', 'That name is already taken.'));
            } else {

				// if there is no user with that name
                // create the user
                var newUser = new User();

                // set the user's local credentials
                newUser.name    = name;
                newUser.password = password;

				// save the user
                newUser.save(function(err) {
                    if (err)
                        throw err;
                    return done(null, newUser);
                });
            }   

        });    

        });

    }));

/*    passport.use('local-login', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with name
        usernameField : 'name',
        passwordField : 'password',
        kimlikNoField : 'kimlikno',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, name, password, done) { // callback with name and password from our form

		// find a user whose name is the same as the forms name
		// we are checking to see if the user trying to login already exists
        console.log("Request: " + req.body.kimlikno);
        User.findOne({ 'name' :  name }, function(err, user) {
            // if there are any errors, return the error before anything else
            if (err)
                return done(err);

            // if no user is found, return the message
            if (!user)
                return done(null, false, req.flash('loginMessage', 'No user found.')); // req.flash is the way to set flashdata using connect-flash

			// if the user is found but the password is wrong
            if (user.password != password)
                return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.')); // create the loginMessage and save it to session as flashdata

            // all is well, return successful user
            //user.kimlikno = kimlikno;
            return done(null, user);
        });

    }));*/

    passport.use('local-login', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with name
        usernameField : 'name',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, name, password, done) { // callback with name and password from our form
		// find a user whose name is the same as the forms name
		// we are checking to see if the user trying to login already exists
        console.log("Kimlik no: " + req.body.kimlikno);
        Userdb.isUserExists(req.body.kimlikno, function(res){
                if(res) {
                    return done(null, false, req.flash('loginMessage','Kimlik no is already in use!'));
                }
                else
                {
                    var ip = req.connection.remoteAddress;
                    arp.getMAC(ip, function(err, mac) { 
                        if(!err) {
                            console.log("Remote Mac: " + mac);
                            var kimlikno = req.body.kimlikno;
                            Userdb.insertTCKimlikNo(kimlikno, ip, mac, function(res) {

                                if(!(res.status)) {
                                    return done(null, false, req.flash('loginMessage', "User could not inserted"));
                                }
                                else {
                                    var newUser = new User();
                                    //newUser.name = res.name;
                                    //newUser.password = res.password; 
                                    newUser.name = kimlikno;
                                    console.log("New User name: " + newUser.name);
                                    newUser.password = "none";
                                    makeid();
                                    newUser._id = "533d4cc81eab0af824f9c2dc";
                                    return done(null, newUser);
                                }
                            });
                        }
                        else
                            return done(null, false, req.flash('loginMessage', 'Unable to get MAC Address'));
                    });
                }
            });
        /*User.findOne({ 'name' :  name }, function(err, user) {
            // if there are any errors, return the error before anything else
            if (err)
                return done(err);

            // if no user is found, return the message
            if (!user)
                return done(null, false, req.flash('loginMessage', 'No user found.')); // req.flash is the way to set flashdata using connect-flash

			// if the user is found but the password is wrong
            if (user.password != password)
                return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.')); // create the loginMessage and save it to session as flashdata

            // all is well, return successful user
            console.log("ID: "+ user._id);
            return done(null, user);
        });*/
    }));
}
