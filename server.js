var express = require('express');
var fs = require('fs');
var engines = require('consolidate');
var bodyparser = require('body-parser');
var MongoClient = require('mongodb').MongoClient;
var session = require('express-session'),
	MongoDBStore = require('connect-mongodb-session')(session);

var store = new MongoDBStore({
	uri:'mongodb://MONGOURL',
	collection:'users_session'
});
var url = 'mongodb://MONGOURL';

var app = express();

app.use(
	session({
		secret:'YOURSECRETKEY',
		resave:true,
		saveUninitialized:true,
		store:store
	})
);
store.on('error', function(error){
	console.log(error);
})
var ajaxResult = {
	'finderror':"find error while searching",
	'inserterror':"insert error while adding",
	'duplicateerror':"there is a same user in the database",
	'notfounderror':"User name or password is not correct",
	'updateerror':'update error while modifying'
}
app.use(bodyparser.json());

app.use(express.static('assets'));

app.get('/', function(req,res){
	res.sendFile(__dirname + '/index.html');
});
app.post('/updatemessage', function(req,res){
	if(req.session.user.messages[req.body.id].mark){
		req.session.user.messages[req.body.id].mark = false;
	}else{
		req.session.user.messages[req.body.id].mark = true;
	}
	
	MongoClient.connect(url, function(err, db){
		db.collection('users').updateOne({'username':req.session.user.username},{
			$set:{
				'messages':req.session.user.messages
			}
		}).then(function(success){
			res.send('success');
			db.close();
		},function(err){
			res.send(ajaxResult.updateerror);
			db.close();
		});
	})
});
app.post('/deletemsg', function(req,res){
	MongoClient.connect(url, function(err,db){
		req.session.user.messages.splice(req.body.id,1);

		db.collection('users').updateOne({'username':req.session.user.username},{
			$set:{
				'messages':req.session.user.messages
			}
		}).then(function(success){
			res.send('success');
			db.close();
		},function(err){
			res.send(ajaxResult.updateerror);
			db.close();
		});
	});
});
app.get('/logout', function(req,res){
	// MongoClient.connect(url, function(err,db){
	req.session.user = null;
	res.send('success');
});
app.post('/updateuser', function(req,res){
	MongoClient.connect(url, function(err,db){
		db.collection('users').updateOne({'username':req.body.username},{
			$set:{
				'name':req.body.name,
				'email':req.body.email,
				'loc':req.body.loc,
				'password':req.body.password,
				'contactnumber':req.body.contactnumber
			}
		}).then(function(success){
			req.session.user = req.body;
			res.send('success');
			db.close();
		}, function(err){
			res.send(ajaxResult.updateerror);
			db.close();
		});
	});
})
app.get('/getsession', function(req,res){
	// console.log(req.session.user);
	res.send(req.session.user);
});



app.post('/loginuser', function(req,res){
	MongoClient.connect(url, function(err, db){
		db.collection('users').findOne({'username':req.body.username,'password':req.body.password}, function(err,result){
			if(err){
				res.send(ajaxResult.finderror);
			}else{
				if(result){
					req.session.user = result;
					res.send('success');
				}else{
					res.send(ajaxResult.notfounderror);
				}	
			}
			db.close();
		});
	})
});
app.post('/addmessage', function(req,res){
	MongoClient.connect(url, function(err, db){
		db.collection('users').updateOne({'username':req.session.user.username}, {
			$set:{
				'outmessages':req.body.outmessages
			}
		},function(err,result){
			if(err){
				res.send(ajaxResult.updateerror);
			}else{
				res.send('success');
			}
			db.close();
		});	
	});
});

app.post('/addinmessage', function(req,res){
	MongoClient.connect(url, function(err,db){
		db.collection('users').findOne({'username': req.body.msg.to}, function(err,result){
			if(err){
				res.send(ajaxResult.finderror);
				db.close();
			}else{
				req.body.msg.mark = 'false';
				req.body.msg.sender = req.session.user.username;
				result.messages.push(req.body.msg);
				db.collection('users').updateOne({'username': req.body.msg.to},{
					$set:{
						'messages':result.messages
					}
				}, function(err1,result1){
					if(err1){
						res.send(ajaxResult.updateerror);
					}else{
						res.send('success');
					}
					db.close();
				});
			}
		});
	});
});

app.post('/adduser', function(req,res){
	MongoClient.connect(url, function(err, db){
		db.collection('users').findOne({'username':req.body.username}, function(err,result1){
			if(err){
				res.send(ajaxResult.finderror);
			}else if(!result1){
				db.collection('users').insertOne({
			  		'name': req.body.name,
			  		'email':req.body.email,
			  		'username':req.body.username,
			  		'loc':req.body.location,
			  		'password':req.body.password,
			  		'contactnumber':req.body.contactnumber,
			  		'messages':{},
			  		'outmessages':{}
			  	},function(err, result){
			  		if (err) {
			  			res.send(ajaxResult.inserterror);
			  		}else{
			  			res.send("success");
			  		}
					db.close();
			  	});
			}else{
				res.send(ajaxResult.duplicateerror);
				db.close();
			}
		})
	  	
	});
});

app.use(function(req,res){
	res.send("404 not found!!!");
});
app.listen(3000);
console.log("server running on port 3000");
