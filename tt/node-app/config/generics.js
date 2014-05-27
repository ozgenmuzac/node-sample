var http = require('http');
var fs = require('fs');

exports.readConfigFile = function(path) {
    var config = {};
    fs.readFileSync(path).toString().split('\n').forEach(function (line) { 
       if(line != "") {
            var key = line.split("=")[0];
            var value = line.split("=")[1];
            config[key] = value;
       }
    });
    return config;
}

exports.readConfigKey = function(path, key) {
    var config = this.readConfigFile(path);
    if(config[key] != null)
        return config[key];
    else
        return null;
}

exports.makeid = function(length) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < length; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    console.log("Generation: " + text);
    return text;
}

exports.sendTokenMessage = function(gsm, token, callback) {
    var head = "/direct/?cmd=sendsms&kullanici=comodotest&sifre=comodo1234&baslik=MESAJSERVSI&gsm=";
    var tail = "&mesaj=";
    var requestPath = head + gsm + tail + token;
    console.log("Option: " + requestPath);
    var options = {
        host: '91.93.120.188',
        port: 80,
        path: requestPath,
        method: 'GET'
    };
    var req = http.request(options, function(res) {
        callback(res.statusCode);
    });
    req.end();
}
