var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var bodyParser = require('body-parser');
var expressValidator = require('express-validator');
var session = require('express-session');
var falsh = require('connect-flash');
var uuid = require('uuid');
var nodeUuid = require('node-uuid');

var indexRouter = require('./routes/index');
var businessesRouter = require('./routes/businesses');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(
	bodyParser.urlencoded({
		extended: false
	})
);
app.use(express.json());
app.use(
	express.urlencoded({
		extended: false
	})
);
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//express session
app.use(
	session({
		secret: 'secert',
		saveUninitialized: true,
		resave: true
	})
);

//express validator

app.use(
	expressValidator({
		errorFormatter: function(param, msg, value) {
			let namespace = param.split('.'),
				root = namespace.shift(),
				formParam = root;
			while (namespace.length) {
				formParam += '[' + namespace.shift() + ']';
			}
			return {
				param: formParam,
				msg: msg,
				value: value
			};
		}
	})
);

//connect flash
app.use(falsh());
app.use((req, res, next) => {
	res.locals.messages = require('express-messages')(req, res);
	next();
});

app.use('/', indexRouter);
app.use('/businesses', businessesRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
	next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};

	// render the error page
	res.status(err.status || 500);
	res.render('error');
});

module.exports = app;
