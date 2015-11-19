var mongoose = require('mongoose');
var Schema = mongoose.Schema;

//User Schema
	var userGroupSchema = new Schema({

		name: { type: String, required: true },
		membersId: [{ type: Schema.Types.ObjectId, required: false, ref: 'User' }]
	});
	
module.exports = mongoose.model('UserGroup', userGroupSchema);
