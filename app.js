var express  = require('express');
var routes = require('./routes');
var http = require('http');
var path = require('path');
var urlencoded = require('url');
var bodyParser = require('body-parser');
var logger = require('logger');
var methodOverride = require('method-override');
var json = require('json');

var nano = require('nano')('http://localhost:5948');

var db = nano.use("address");
var app = express();
app.set('port' , process.env.PORT || 2020);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine' , 'jade');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', routes.index);
app.post('/createdb'){
	nano.db.create(req.body.dbname, function(err){
		if(err){
			console.log("Error creating database");
			
		}
		else{
		console.log("database Successfully");
	}
	});
};

app.post('/new_contact' , function(req, res){
	var name = req.body.name;
	var phone = req.body.name;
	db.insert({name: name, phone : phone, crazy : true}, phone , function(err, body, header){
		if(err){
			res.send("Error creating contact");
			return;
		}
		res.send("contact created successfully");
	});
});

app.post('/view_contact' , function(req, res){
	var alldoc = "Following other contects";
	db.get(req.body.phone, {revs_info : true}, function(err , body){
		if(!err){
			console.log(body);
		}
		if(body){
			alldoc += "Name : " + body.name + "<br/>Phone no: " + body.phone;	
		}
		else{
			alldoc = "No records found";
		}
	});
});

app.post("/delete_contact" , function(req, res){
	db.get(req.body.phone, {revs_info : true}, function(err , body){
		if(!err){
			db.destroy(req.body.phone, body._rev, function(err, body){
				if(err){
					res.send("Sorry error not delete");
				}
				res.send("Conatct delete successfully");
			});
		}
	});
});

http.createServer(app).listen(app.get('port'), function(){
	console.log("Express server listening on port" + app.get('port'));
});
