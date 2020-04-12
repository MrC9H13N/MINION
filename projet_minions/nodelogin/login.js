// déclaration des constantes de connexion au serveur



const mysql = require('mysql');
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const ejs = require('ejs');

let connection = mysql.createConnection({
	host     : 'localhost',
	user     : 'root',
	password : '',
	database : 'chess'
});

let app = express();

app.set('view engine', 'ejs');

// Fichiers statiques
app.use('/css', express.static('css'));
app.use('/js', express.static('js'));
app.use('/img', express.static('img'));
app.use('/icon-fonts', express.static('icon-fonts'));

app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));

app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());

connection.query( 'CREATE TABLE IF NOT EXISTS `users` (`id` int(10) unsigned NOT NULL AUTO_INCREMENT,`name` varchar(255) DEFAULT NULL,`pswd` varchar(255) DEFAULT NULL,PRIMARY KEY (`id`),UNIQUE KEY `name` (`name`)) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8');

// page de connexion
app.get('/', function(request, response) {
	if (request.session.loggedin) {
		response.redirect('/home');
	} else {
		response.render('login');
	}
});

// page d'inscription

app.get('/signup', function(request, response) {
	if (request.session.loggedin) {
		response.redirect('/home');
	} else {
		response.render('signup');
	}
});

// inscription

app.post('/inscr', function(request, response) {
	let username = request.body.username;
	let password = request.body.password;
	connection.query('SELECT * FROM users WHERE name = ?', [username], function(error, results, fields) {
		if (results.length == 1) {
			response.redirect('/signup');
			response.end();
		}
	});
	if (username && password) {
		connection.query('INSERT INTO users (name, pswd) VALUES (?, MD5(?))', [username, password], function(error, results, fields) {
			response.redirect('/')	
			response.end();
		});
	} else {
		response.redirect('/signup')
		response.end();
	}
});

// authentification

app.post('/auth', function(request, response) {
	let username = request.body.username;
	let password = request.body.password;
	if (username && password) {
		connection.query('SELECT * FROM users WHERE name = ? AND pswd = MD5(?)', [username, password], function(error, results, fields) {
			if (results.length > 0) {
				request.session.loggedin = true;
				request.session.username = username;
				response.redirect('/home');
				response.end();
			} else {
				response.redirect('/')
				response.end();
			}			
			response.end();
		});
	} else {
		response.redirect('/')
		response.end();
	}
});

// page connecté

app.get('/home', function(request, response) {
	if (request.session.loggedin) {
		let tagline = request.session.username;
		response.render('home',{
			tagline : tagline
		});
	} else {
		response.redirect('/')
	}

});

// Déconnexion

app.get('/logout', function(request, response) {
	if (request.session.loggedin) {
		request.session.destroy();
		response.redirect('/')
	} else {
		response.redirect('/')
	}

});

// Jeu

app.get('/play', function(request, response) {
	if (request.session.loggedin) {
		let pseudo = request.session.username;
		res.redirect(__dirname + "../client/index.html");
	} else {
		response.render('signup');
	}
});

app.listen(6969);