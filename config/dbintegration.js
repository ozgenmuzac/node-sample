"use strict";

var sqlite3 = require("sqlite3").verbose();
var db = new sqlite3.Database("test.db");

function createTable() {
    db.run("CREATE TABLE IF NOT EXISTS users(username varchar(25), password varchar(100), ipaddress varchar(32), macaddress varchar(32))");
}

module.exports = {
    insertUser: function(username, password, ipaddress, macaddress) {
        db.serialize(function(){
            createTable();
            db.run("INSERT INTO users (username, password, ipaddress, macaddress) VALUES (?,?,?,?)", [username, password, ipaddress, macaddress]);
        })
        db.close();
    }
};

