var Userdb = require('../config/dbintegration.js');


exports.isAuthenticated = function(req, res, next) {
    if(!req.user) {
        res.redirect('/failure');
    }
    else {
        next();
    }
}

exports.isloggedin = function(req, res) {
    if(!req.user) {
        res.status(200).json({auth:true});
    }
    else {
        res.status(200).json({auth:true});
    }
}

exports.failure = function(req, res) {
    console.log("Message: " + req.flash('loginMessage'));
    res.status(401).json({auth:false});
};

exports.success = function(req, res) {
    var user = req.user;

    console.log("SUCCESS");

    console.log("Host: " + req.get('host'));

    res.json({auth: true});
};

exports.connect = function(socket) {
    var ip = socket.handshake.headers['x-forwarded-for'] || socket.handshake.address.address;
    socket.on("send", function(data){
        socket.emit("response", "resp-resp");
    });
    socket.on("disconnect", function(){
        console.log("Socket disconnect"); 
    });
}

exports.logout = function(req, res) {
    console.log("Logout");
    var kimlikno = req.user.kimlikno;
    var mac = req.user.mac;
    req.session.destroy(function(err){
        if(err) {
            console.log("Session destroy error: " + err);
            res.json({auth: false});
        }
        else {
            console.log("Session destroyed"); 
            res.json({auth: true});
        }
    });
}

// Main application view
exports.index = function(req, res) {
	res.render('index', {url: req.get('host')});
};


exports.userinfo = function(req, res) {
    var name = req.user.kimlikno;
    res.json({username: name});
};

exports.userstatus = function(req, res) {
    if(!req.user) {
        res.status(401).send();
    }
    else {
        res.status(200).send();
    }
};
