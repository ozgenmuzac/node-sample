"use strict";

var sqlite3 = require("sqlite3").verbose();
var db = new sqlite3.Database("test.db");

var User = require('../models/UserS.js').User;
var generic = require('../config/generics.js');

function createTable() {
    db.run("CREATE TABLE IF NOT EXISTS users(uid varchar(25), username varchar(25), password varchar(100), tckimlik varchar(32), ipaddress varchar(32), macaddress varchar(32), phonenumber varchar(32), token varchar(8))");
}

module.exports = {
    insertUser: function(username, password, kimlikno, ipaddress, macaddress, phonenumber) {
        db.serialize(function(){
            createTable();
            db.run("INSERT INTO users (username, password, tckimlik, ipaddress, macaddress, phonenumber) VALUES (?,?,?,?,?)", [username, password, kimlikno, ipaddress, macaddress, phonenumber]);
        });
    },

    insertTCKimlikNo: function(uid, kimlikno, ipaddress, macaddress, callback) {
        db.serialize(function(){
            createTable();
            db.run("INSERT INTO users (uid, username, password, tckimlik, ipaddress, macaddress, phonenumber, token) VALUES (?,?,?,?,?,?,?,?)", [uid, "none", "none", kimlikno, ipaddress, macaddress, "none", "0"], 
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
     
    insertPhoneNumber: function(uid, phonenumber, ipaddress, macaddress, callback) {
        var token = generic.makeid(8);
        db.serialize(function(){
            createTable();
            db.run("INSERT INTO users (uid, username, password, tckimlik, ipaddress, macaddress, phonenumber, token) VALUES (?,?,?,?,?,?,?,?)", [uid, "none", "none", "none", ipaddress, macaddress, phonenumber, token], 
                function(err){
                        var stat = false;
                        if(err) {
                            console.log("Error occured when inserting phone number: "+ err);
                            stat = false;
                        }
                        else{
                            console.log("Phone number inserted successfully.");
                            console.log("LAST: " + this.lastID);
                            stat = true;
                        }
                        var res = {status:stat, name:"ozgen", password:"ozgen337"};
                        callback(res);
                    });
        });
    },

    tokenCheck: function(uid, token, callback) {
        db.serialize(function(){
            db.get("SELECT * FROM users WHERE uid=? and token=?", [uid, token],
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

    findById : function(uid, callback) {
        db.serialize(function(){
            db.get("SELECT * FROM users WHERE uid=?", [uid],
                function(err, row) {
                    if(err) {
                        console.log("Error occured when getting user!");
                        callback(err, null);
                    }
                    else {
                        var newUser;
                        if(!row) {
                            console.log("New User NULL");
                            newUser = null;
                        }
                        else {
                            console.log("New User exists: " + row.uid);
                            newUser = new User(row.uid, row.username, row.tckimlik, row.password, row.ipaddress, row.macaddress, row.phonenumber, row.token);
                        }
                        callback(err, newUser);
                    }
                });
        });
    },

    removeWithId : function(kimlikno, callback) {
        console.log("Remove with id");
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
        console.log("Remove with ip");
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

