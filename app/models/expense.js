var mongoose = require('mongoose');
var Schema = mongoose.Schema;

//Expense Schema
	var ExpenseSchema = new Schema({

		spenderId: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
		groupId: { type: Schema.Types.ObjectId, required: false },
		amount: { type: Number, required: true },
		date: { type: Date, required: true },
		spentFor: { type: String, required: true },
		description: { type: String, required: false }
	});
	
	
	module.exports = mongoose.model('Expense', ExpenseSchema);