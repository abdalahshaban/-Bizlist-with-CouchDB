var express = require('express');
var businessesRouter = express.Router();
1;

const NodeCouchDb = require('node-couchdb');

const couch = new NodeCouchDb({
	auth: {
		user: 'admin',
		pass: 'admin'
	}
});

let uuid = require('node-uuid');

/* GET users listing. */
businessesRouter.get('/', function(req, res, next) {
	const dbName = 'bizlist';

	const viewUrl = '_design/all_b/_view/all';

	const queryOptions = {};

	couch.get(dbName, viewUrl, queryOptions).then(
		({ data, headers, status }) => {
			console.log('********************************************************')
			console.log(data.rows);
			console.log('********************************************************')
			res.render('businesses', {
				businesses: data.rows
			});
		},
		(err) => {
			res.send('err')
		}
	);
});
businessesRouter.get('/add', function(req, res, next) {
	res.render('addBussines');
});

businessesRouter.get('/show/:id', function(req, res, next) {
	couch.get('bizlist', req.params.id).then(
		({ data, headers, status }) => {
			res.render('show',{business:data})
		},
		(err) => {
			res.send('error');
		}
	);
});

businessesRouter.get('/edit/:id', function(req, res, next) {
	couch.get('bizlist', req.params.id).then(
		({ data, headers, status }) => {
			res.render('editbusiness',{business:data})
		},
		(err) => {
			res.send('error');
		}
	);
});

businessesRouter.get('/category/:category', function(req, res, next) {
	res.send('respond with a resource');
});

businessesRouter.post('/add', function(req, res, next) {
	// console.log(req.body)
	req.checkBody('name', 'name is required').notEmpty();
	req.checkBody('category', 'category is required').notEmpty();
	req.checkBody('city', 'city is required').notEmpty();

	let errors = req.validationErrors();
	if (errors) {
		console.log(errors);
		res.render('addBussines', {
			errors: errors
		});
	} else {
		couch
			.insert('bizlist', {
				_id: uuid.v1(),
				name: req.body.name,
				category: req.body.category,
				website: req.body.website,
				phone: req.body.phone,
				address: req.body.address,
				city: req.body.city,
				state: req.body.state,
				zip: req.body.zip
			})
			.then(
				({ data, headers, status }) => {
					req.flash('success', 'Bussiness Added');
					res.redirect('/businesses');
				},
				(err) => {
					res.send(err);
				}
			);
	}
});

businessesRouter.post('/edit/:id', function(req, res, next) {
	req.checkBody('name', 'name is required').notEmpty();
	req.checkBody('category', 'category is required').notEmpty();
	req.checkBody('city', 'city is required').notEmpty();

	let errors = req.validationErrors();
	if (errors) {
		couch.get('bizlist', req.params.id).then(
			({ data, headers, status }) => {
				res.render('editbusiness', {
					business:data,
					errors: errors
				});
			},
		);
		console.log(errors);

	} else {
		couch.get('bizlist', req.params.id).then(
			({ data, headers, status }) => {
				couch.update("bizlist", {
					_id: req.params.id,
					_rev: data._rev,
					name: req.body.name,
					category: req.body.category,
					website: req.body.website,
					phone: req.body.phone,
					address: req.body.address,
					city: req.body.city,
					state: req.body.state,
					zip: req.body.zip

				}).then(({data, headers, status}) => {
					req.flash('success','Business Updated');
					res.redirect('/businesses')
				}, err => {
					res.send(err)
					// either request error occured
					// ...or err.code=EFIELDMISSING if either _id or _rev fields are missing
				});
			},
			(err) => {
				res.send('error');
			}
		);

	}
});

businessesRouter.post('/delete/:id', function(req, res, next) {
	couch.get('bizlist', req.params.id).then(
		({ data, headers, status }) => {
			couch.del("bizlist", req.params.id, data._rev).then(({data, headers, status}) => {
				req.flash("success","business removed");
				res.redirect('/businesses')
			}, err => {
				res.send(err)
				// either request error occured
				// ...or err.code=EDOCMISSING if document does not exist
				// ...or err.code=EUNKNOWN if response status code is unexpected
			});
		},
		(err) => {
			res.send('error');
		}
	);

});
module.exports = businessesRouter;
