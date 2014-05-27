// config/passport.js

// load all the things we need
var LocalStrategy   = require('passport-local').Strategy;

//var mongoose = require('mongoose');
var db;
/*if (process.env.VCAP_SERVICES) {
   var env = JSON.parse(process.env.VCAP_SERVICES);
   db = mongoose.createConnection(env['mongodb-2.2'][0].credentials.url);
} else {
   db = mongoose.createConnection('localhost', 'pollsapp');
}*/
// load up the user model
//var UserSchema = require('../models/User.js').UserSchema;
//var User = db.model('users', UserSchema);

var Userdb = require('./dbintegration.js');
var generic = require('./generics.js');

var arp = require('node-arp');

var User = require('../models/UserS.js').User;

function validateKimlikNo(kno)
{
    if(typeof kno == "string")
    {
        if(kno.length != 11)
            return false;
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

function getIpAndMac(req)
{
    var ip = req.connection.remoteAddress;
    arp.getMAC(ip, function(err, mac) { 
        if(!err) {
            console.log("Remote Mac: " + mac);
            return ({ip:ip, mac:mac});
        }
    });
}


function loginWithKimlikNo(req, done)
{
    console.log("Is Entered with Kimlik no");
    if(!validateKimlikNo(req.body.kimlikno)) {
        return done(null, false, req.flash('loginMessage', 'Kimlik no is not valid!'));
    }
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
                        var uid = generic.makeid(20);
                        Userdb.insertTCKimlikNo(uid, kimlikno, ip, mac, function(res) {
                            if(!(res.status)) {
                                return done(null, false, req.flash('loginMessage', "User could not inserted"));
                            }
                            else {
                                var newUser = new User(uid, "none", kimlikno, "none", ip, mac, "none");
                                return done(null, newUser);
                            }
                        });
                    }
                    else
                        return done(null, false, req.flash('loginMessage', 'Unable to get MAC Address'));
                });
            }
        });
}

function loginWithPhoneNumber(req, done)
{
    var phonenumber = req.body.phonenumber;
    var ip = req.connection.remoteAddress;
    var uid = generic.makeid(20);
    arp.getMAC(ip, function(err, mac) { 
        Userdb.insertPhoneNumber(uid, phonenumber, ip, mac, function(res) {
            var newUser = new User(uid, "none", "none", "none", ip, mac, "5389708900");
            return done(null, newUser);
        });
    })
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
        console.log("Serialize User: " + user.id);
        done(null, user.uid);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        console.log("DeSerialize User: " + id);
        Userdb.findById(id, function(err, user) {
            console.log("User deserialize: " + user.uid);
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
        console.log("Kimlik no: " + req.body.kimlikno);
        if(req.body.kimlikno != null || req.body.kimlikno != "")
        {
            return loginWithKimlikNo(req, done);
        }

    }));

    passport.use('phone-login', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with name
        usernameField : 'name',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, name, password, done) { // callback with name and password from our form
		// find a user whose name is the same as the forms name
		// we are checking to see if the user trying to login already exists
        console.log("Phone number: " + req.body.phonenumber);
        if(req.body.phonenumber != null || req.body.phonenumber != "")
        {
            return loginWithPhoneNumber(req, done);
        }

    }));
}
