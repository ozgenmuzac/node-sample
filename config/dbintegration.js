"use strict";

var sqlite3 = require("sqlite3").verbose();
var db = new sqlite3.Database("test.db");

var User = require('../models/UserS.js').User;

function createTable() {
    db.run("CREATE TABLE IF NOT EXISTS users(uid varchar(25), username varchar(25), password varchar(100), tckimlik varchar(32), ipaddress varchar(32), macaddress varchar(32))");
}

module.exports = {
    insertUser: function(username, password, kimlikno, ipaddress, macaddress) {
        db.serialize(function(){
            createTable();
            db.run("INSERT INTO users (username, password, tckimlik, ipaddress, macaddress) VALUES (?,?,?,?,?)", [username, password, kimlikno, ipaddress, macaddress]);
        });
    },

    insertTCKimlikNo: function(uid, kimlikno, ipaddress, macaddress, callback) {
        db.serialize(function(){
            createTable();
            db.run("INSERT INTO users (uid, username, password, tckimlik, ipaddress, macaddress) VALUES (?,?,?,?,?,?)", [uid, "none", "none", kimlikno, ipaddress, macaddress], 
                function(err){
                        var stat = false;
                        if(err) {
                            console.log("Error occured when inserting kimlik no: "+ err);
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
                        callback(err, null);
                    }
                    else {
                        var newUser;
                        if(!row) {
                            newUser = null;
                        }
                        else {
                            newUser = new User(row.username, row.tckimlik, row.password, row.ipaddress, row.macaddress);
                        }
                        callback(err, newUser);
                    }
                });
        });
    },

    removeWithId : function(kimlikno, callback) {
        db.serialize(function(){
            db.run("DELETE FROM users WHERE tckimlik=?", [kimlikno],
                function(err) {
                    if(err) {
                        callback(false);
                    }
                    else {
                        callback(true);
                    }
                });
        });
    },

    removeWithIp : function(ipaddress, callback) {
        db.serialize(function(){
            db.get("SELECT * FROM users WHERE ipaddress=?", [ipaddress],
                function(err, row) {
                    if(err) {
                        console.log("Error occured when getting row before delete it")
                    }
                    else {
                        if(!row) {
                            console.log("No row found for deleting!")
                        }
                        else {
                            if(row == undefined) {
                                callback(null);
                            }
                            else {
                                var mac = row.macaddress;
                                callback(mac);
                                db.run("DELETE FROM users WHERE ipaddress=?", [ipaddress],
                                    function(err) {
                                        if(err) {
                                            callback(null);
                                        }
                                        else {
                                            callback(mac);
                                        }
                                    });
                            }
                        }
                    }
                });
        });

    }
};

