var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');

//User Schema
	var UserSchema = new Schema({

		fname: { type: String, required: true },
		lname: { type: String, required: true },
		username: { type: String, required: true, index: { unique: true } },
		password: { type: String, required: true, select: false },
		phone: { type: String, required: true, index: { unique: true } },
		expenses: [{ type: Schema.Types.ObjectId, ref: 'Expense' }],
		userGroups: [{ type: Schema.Types.ObjectId, ref: 'UserGroup' }]
	});
	

	UserSchema.pre('save', function (next) {
		var user = this;

		if (!user.isModified('password')) return next();

		bcrypt.hash(user.password, null, null, function (err, hash) {
			if (err) return next(err);

			user.password = hash;
			next();
		});
	});

	UserSchema.methods.comparePassword = function (password) {
		var user = this;

		return bcrypt.compareSync(password, user.password);
	};


module.exports = mongoose.model('User', UserSchema);
