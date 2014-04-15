"use strict";

var sqlite3 = require("sqlite3").verbose();
var db = new sqlite3.Database("test.db");


var mongoose = require('mongoose');
var dbm;
if (process.env.VCAP_SERVICES) {
   var env = JSON.parse(process.env.VCAP_SERVICES);
   dbm = mongoose.createConnection(env['mongodb-2.2'][0].credentials.url);
} else {
   dbm = mongoose.createConnection('localhost', 'pollsapp');
}
var UserSchema = require('../models/User.js').UserSchema;
var User = dbm.model('users', UserSchema);

function createTable() {
    db.run("CREATE TABLE IF NOT EXISTS users(username varchar(25), password varchar(100), tckimlik varchar(32), ipaddress varchar(32), macaddress varchar(32))");
}

module.exports = {
    insertUser: function(username, password, kimlikno, ipaddress, macaddress) {
        db.serialize(function(){
            createTable();
            db.run("INSERT INTO users (username, password, tckimlik, ipaddress, macaddress) VALUES (?,?,?,?,?)", [username, password, kimlikno, ipaddress, macaddress]);
        });
    },

    insertTCKimlikNo: function(kimlikno, ipaddress, macaddress, callback) {
        db.serialize(function(){
            createTable();
            db.run("INSERT INTO users (username, password, tckimlik, ipaddress, macaddress) VALUES (?,?,?,?,?)", ["none", "none", kimlikno, ipaddress, macaddress], 
                function(err){
                        var stat = false;
                        if(err) {
                            console.log("Error occured when inserting kimlik no");
                            stat = false;
                        }
                        else{
                            console.log("Kimlik no inserted successfully.");
                            console.log("LAST: " + this.lastID);
                            stat = true;
                        }
                        var res = {status:stat, name:"ozgen", password:"ozgen337"};
                        callback(res);
                    });
        });
   }, 

    isUserExists : function(kimlikno, callback) {
        db.serialize(function(){
            db.get("SELECT * FROM users WHERE tckimlik=?", [kimlikno],
                function(err, row) {
                        var res;
                        if(err) {
                            console.log("Exists return error!: " + err);
                            res = false;
                        }
                        else if(!row) {
                            res = false;
                        }
                        else {
                            res = true;
                        }
                        console.log("Exists Row: " + row);
                        console.log("Exits value: " + res);
                        callback(res);
                    });
       });
    },

    findById : function(kimlikno, callback) {
        db.serialize(function(){
            db.get("SELECT * FROM users WHERE tckimlik=?", [kimlikno],
                function(err, row) {
                    if(err) {
                        console.log("Error occured when getting user!");
                        callback(null);
                    }
                    else {
                        console.log("Row name: " + row.username);
                        console.log("Row password: " + row.password);
                        console.log("Row kimlik: " + row.tckimlik);
                        var newUser = new User();
                        newUser.name = row.tckimlik;
                        newUser.password = row.password
                        callback(err, newUser);
                    }
                });
        });
    }
};

