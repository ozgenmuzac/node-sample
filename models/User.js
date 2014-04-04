var mongoose = require('mongoose');

// Document schema for polls
exports.UserSchema = new mongoose.Schema({
	name: { type: String, required: true },
	password: { type: String, require: true}
});
