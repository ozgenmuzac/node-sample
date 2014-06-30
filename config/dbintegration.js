"use strict";

var mysql = require('mysql');
var crypto = require('crypto'); 

var db = mysql.createConnection({
        host: 'localhost',
        user: 'license',
        password: 'license1234',
        database: 'license_user'
    });

db.connect(function(err) {
        if(err) {
             console.log("Error connectiong database: " + err.stack);
             return;
        }
        console.log("Successfully connected!");
    });

var User = require('../models/User.js').User;

module.exports = {
    isUserExists : function(name, password, callback) {
        var shasum = crypto.createHash('sha1');
        shasum.update(password);
        var passHash = shasum.digest('hex');
        var sql = 'SELECT * FROM user where username=' + db.escape(name) +' and password=' + db.escape(passHash) ;
        console.log("Query done");
        db.query(sql, function(err, rows){
            if(err){
                callback(false);}
            else if (rows.length > 0)
                callback(true);
            else
                callback(false);
            console.log("Query return");
        });
    },

    findByName : function(name, callback) {
        var sql = 'SELECT * FROM user where username=' + db.escape(name);
        db.query(sql, function(err, rows){
            if(err)
                callback(err, null);
            else if (rows.length > 0)
                callback(null, new User(rows[0].name, null));
        });
    },

};

