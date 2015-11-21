//Call for the required packages
var bodyparser = require('body-parser');
var User = require('../models/user');
var Expense = require('../models/expense');
var UserGroup = require('../models/userGroup');
var jwt = require('jsonwebtoken');
var config = require('../../config');

//Set the Secrect 
var SuperSecret = config.secret;

module.exports = function (app, express) {
	var apiRouter = express.Router();

	apiRouter.get('/', function (req, res) {
		res.send('I am dashbooard!');
	});
	
	//-------------------------------------------------------------------------------
	//Authenticate
	//-------------------------------------------------------------------------------
	apiRouter.post('/authenticate', function (req, res) {
		// find the user
		User.findOne({
			username: req.body.username
		}).select('name username password').exec(function (err, user) {

			if (err) throw err;

			// no user with that username was found
			if (!user) {
				res.json({
					success: false,
					message: 'Authentication failed. User not found.'
				});
			} else if (user) {

				// check if password matches
				var validPassword = user.comparePassword(req.body.password);
				if (!validPassword) {
					res.json({
						success: false,
						message: 'Authentication failed. Wrong password.'
					});
				} else {

					// if user is found and password is right
					// create a token
					var token = jwt.sign({
						name: user.name,
						username: user.username
					}, SuperSecret, {
							expiresInMinutes: 1440 // expires in 24 hours
						});

					// return the information including token as JSON
					res.json({
						success: true,
						message: 'Enjoy your token!',
						token: token
					});
				}

			}

		});
	});
	
	//-------------------------------------------------------------------------------
	//Middleware
	//-------------------------------------------------------------------------------
	// route middleware to verify a token
	apiRouter.use(function (req, res, next) {
		// do logging
		console.log('Somebody just came to our app!');

		// check header or url parameters or post parameters for token
		var token = req.body.token || req.query.token || req.headers['x-access-token'];

		// decode token
		if (token) {

			// verifies secret and checks exp
			jwt.verify(token, SuperSecret, function (err, decoded) {

				if (err) {
					res.status(403).send({
						success: false,
						message: 'Failed to authenticate token.'
					});
				} else { 
					// if everything is good, save to request for use in other routes
					req.decoded = decoded;

					next(); // make sure we go to the next routes and don't stop here
				}
			});

		} else {

			// if there is no token
			// return an HTTP response of 403 (access forbidden) and an error message
			res.status(403).send({
				success: false,
				message: 'No token provided.'
			});

		}
	});
	
	//-------------------------------------------------------------------------------
	//Users
	//-------------------------------------------------------------------------------
	apiRouter.route('/users')
	// create a user (accessed at POST http://localhost:8080/users)
		.post(function (req, res) {

			var user = new User();		// create a new instance of the User model
			user.fname = req.body.fname;  // set the users name (comes from the request)
			user.lname = req.body.lname;  // set the users name (comes from the request)
			user.username = req.body.username;  // set the users username (comes from the request)
			user.password = req.body.password;  // set the users password (comes from the request)
			user.phone = req.body.phone;  // set the users password (comes from the request)

			user.save(function (err) {
				if (err) {
					// duplicate entry
					if (err.code == 11000)
						return res.json({ success: false, message: 'A user with that username already exists. ' });
					else
						return res.send(err);
				}

				// return a message
				res.json({ message: 'User created!' });
			});

		})

	// get all the users (accessed at GET http://localhost:8080/api/users)
		.get(function (req, res) {

			User.find({}, function (err, users) {
				if (err) res.send(err);

				// return the users
				res.json(users);
			});
		});
		
	//-------------------------------------------------------------------------------
	//Expense
	//-------------------------------------------------------------------------------
	apiRouter.route('/expense')
		.post(function (req, res) {
			var expense = new Expense();
			var phoneInput = req.body.phone;
			expense.groupId = req.body.groupId;
			expense.amount = req.body.amount;
			expense.date = req.body.date;
			expense.spentFor = req.body.spentFor;
			expense.description = req.body.description;

			User.findOne({
				phone: phoneInput
			}).select('_id').exec(function (err, user) {
				if (!user) {
					res.json({
						success: false,
						message: 'No user found of the specific phone number. Please check the number and try again.'
					});
				} else if (user) {
					expense.spenderId = user._id;

					expense.save(function (err) {
						if (err) {
							return res.send(err);
						}
						res.json({ message: 'Expense Added!' });
					});
				}
			})
		})

		.get(function (req, res) {
			var phoneInput = req.headers['phone'];
			User.findOne({
				phone: phoneInput
			}).select('_id').exec(function (err, user) {
				if (!user) {
					res.json({
						success: false,
						message: 'No records found.'
					});
				} else if (user) {
					Expense.find({ spenderId: user._id }, function (err, expenses) {
						if (err) res.send(err);
						res.json(expenses);
					});
				}
			})
		});
		
	//-------------------------------------------------------------------------------
	//UserGroup
	//-------------------------------------------------------------------------------
	apiRouter.route('/userGroup')
		.post(function (req, res) {
			var validMembers = false;
			var userGroup = new UserGroup();
			var membersPhone = (req.body.membersPhone).split(',');
			userGroup.name = req.body.name;
			
			//userGroup.membersId.push('564a108a101fea9c1918905c');
			//userGroup.membersId.push('564a2bfd3c087fcc20e8cdfc');
			//userGroup.membersId = [membersPhone[0], membersPhone[1]];
			
			var i = 0;
			var successCount = 0;
			for (i = 0; i < membersPhone.length; i++) {
				User.findOne({
					phone: membersPhone[i]
				}).select('_id').exec(function (err, user) {

					if (!user) {

						validMembers = false;
						res.json({
							success: false,
							message: 'One of the members provided could not be found in the database.'
						});

					} else if (user) {
						successCount += 1;
						userGroup.membersId.push(user._id);
						console.log(user._id);
						validMembers = true;
						
						//it looks dirty, but it did'nt work otherwise
						if (successCount == membersPhone.length) {
							//save if all the members are valid
							if (validMembers === true && i === membersPhone.length) {
								console.log('reached here' + i);
								userGroup.save(function (err) {
									if (err) {
										return res.send(err);
									}
									res.json({ message: 'UserGroup Added!' });
								});
							}
						}
					}
				})
			}
		})

		.get(function (req, res) {

			UserGroup.find({}, function (err, expenses) {
				if (err) res.send(err);
				res.json(expenses);
			});
		});
		
	//-------------------------------------------------------------------------------
	//-------------------------------------------------------------------------------
	return apiRouter;
}