// Connect to MongoDB using Mongoose
var mongoose = require('mongoose');
var db;
if (process.env.VCAP_SERVICES) {
   var env = JSON.parse(process.env.VCAP_SERVICES);
   db = mongoose.createConnection(env['mongodb-2.2'][0].credentials.url);
} else {
   db = mongoose.createConnection('localhost', 'pollsapp');
}

// Get Poll schema and model
var PollSchema = require('../models/Poll.js').PollSchema;
var Poll = db.model('polls', PollSchema);

var UserSchema = require('../models/User.js').UserSchema;
var User = db.model('users', UserSchema);

var Userdb = require('../config/dbintegration.js');

var arp = require('node-arp');

var exec = require('child_process');

/*User.count({name: "ozgen"}, function(error, count){
        if(!error) {
            if(count == 0) {
                console.log("User does not exists! Inserting");
                var userObj = {name: "ozgen", password: "ozgen337"};
                var user = new User(userObj);
            
                // Save poll to DB
                user.save(function(err, doc) {
                    if(err || !doc) {
                        console.log("Error inserting!");
                    } else {
                        console.log("Inserted!");        
                    }		
                });
            }
        }
    });
*/

exports.isLoggedIn = function(req, res, next) {
    if(!req.user) {
        res.redirect('/failure');
    }
    else {
        next();
    }
}

exports.failure = function(req, res) {
    console.log("Message: " + req.flash('loginMessage'));
    res.status(401).json({auth:false});
};

exports.success = function(req, res) {
    var user = req.user;

    console.log("Host: " + req.get('host'));

    exec.execFile('./allow_user.sh', ["--allow", user.mac], function(err, stdout, stderr) {
        console.log("Stdout: " + stdout);
        console.log("Stderr: " + stderr);
    });

    console.log("Success name: " + user.name);
    console.log("Success kimlik: " + user.kimlikno);
    console.log("Success pass: " + user.password);
    console.log("Success ip: " + user.ip);
    console.log("Success mac: " + user.mac);

    res.json({auth: true});
};

exports.connect = function(socket) {
    var ip = socket.handshake.headers['x-forwarded-for'] || socket.handshake.address.address;
    socket.on("send", function(data){
        socket.emit("response", "resp-resp");
    });
    socket.on("disconnect", function(){
        Userdb.removeWithIp(ip, function(mac){
            if(mac) {
                exec.execFile('./allow_user.sh', ["--deny", mac], function(err, stdout, stderr) {
                    console.log("Stdout: " + stdout);
                    console.log("Stderr: " + stderr);
                });
/*                req.session.destroy(function(err) {
                    if(err) {
                        console.log("Failed to session destroy after window closed");
                    }
                    else {
                        console.log("Successfully session destroyed after window closed");
                    }
                });
*/
            }
            else {
                console.log("Could not removed");
            }
        });
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
            Userdb.removeWithId(kimlikno, function(res){
                if(res) {
                    exec.execFile('./allow_user.sh', ["--deny", mac], function(err, stdout, stderr) {
                        console.log("Stdout: " + stdout);
                        console.log("Stderr: " + stderr);
                    });
                }
                else {
                    console.log("Error occured when logging out!");
                }
            });
            res.json({auth: true});
        }
    });
}

// Main application view
exports.index = function(req, res) {
	res.render('index', {url: req.get('host')});
};

// JSON API for list of polls
exports.list = function(req, res) {
	// Query Mongo for polls, just get back the question text
	Poll.find({}, 'question', function(error, polls) {
		res.json(polls);
	});
};

// JSON API for getting a single poll
exports.poll = function(req, res) {
	// Poll ID comes in the URL
	var pollId = req.params.id;
	
	// Find the poll by its ID, use lean as we won't be changing it
	Poll.findById(pollId, '', { lean: true }, function(err, poll) {
		if(poll) {
			var userVoted = false,
					userChoice,
					totalVotes = 0;

			// Loop through poll choices to determine if user has voted
			// on this poll, and if so, what they selected
			for(c in poll.choices) {
				var choice = poll.choices[c]; 

				for(v in choice.votes) {
					var vote = choice.votes[v];
					totalVotes++;

					if(vote.ip === (req.header('x-forwarded-for') || req.ip)) {
						userVoted = true;
						userChoice = { _id: choice._id, text: choice.text };
					}
				}
			}

			// Attach info about user's past voting on this poll
			poll.userVoted = userVoted;
			poll.userChoice = userChoice;

			poll.totalVotes = totalVotes;
		
			res.json(poll);
		} else {
			res.json({error:true});
		}
	});
};

exports.userinfo = function(req, res) {
    var name = req.user.kimlikno;
    res.json({username: name});
}

exports.userstatus = function(req, res) {
    if(!req.user) {
        res.status(401).send();
    }
    else {
        res.status(200).send();
    }
}

// JSON API for creating a new poll
exports.create = function(req, res) {
	var reqBody = req.body,
			// Filter out choices with empty text
			choices = reqBody.choices.filter(function(v) { return v.text != ''; }),
			// Build up poll object to save
			pollObj = {question: reqBody.question, choices: choices};
				
	// Create poll model from built up poll object
	var poll = new Poll(pollObj);
	
	// Save poll to DB
	poll.save(function(err, doc) {
		if(err || !doc) {
			throw 'Error';
		} else {
			res.json(doc);
		}		
	});
};

exports.vote = function(socket) {
	socket.on('send:vote', function(data) {
		var ip = socket.handshake.headers['x-forwarded-for'] || socket.handshake.address.address;
		
		Poll.findById(data.poll_id, function(err, poll) {
			var choice = poll.choices.id(data.choice);
			choice.votes.push({ ip: ip });
			
			poll.save(function(err, doc) {
				var theDoc = { 
					question: doc.question, _id: doc._id, choices: doc.choices, 
					userVoted: false, totalVotes: 0 
				};

				// Loop through poll choices to determine if user has voted
				// on this poll, and if so, what they selected
				for(var i = 0, ln = doc.choices.length; i < ln; i++) {
					var choice = doc.choices[i]; 

					for(var j = 0, jLn = choice.votes.length; j < jLn; j++) {
						var vote = choice.votes[j];
						theDoc.totalVotes++;
						theDoc.ip = ip;

						if(vote.ip === ip) {
							theDoc.userVoted = true;
							theDoc.userChoice = { _id: choice._id, text: choice.text };
						}
					}
				}
				
				socket.emit('myvote', theDoc);
				socket.broadcast.emit('vote', theDoc);
			});			
		});
	});
};
