// app/routes.js

var FB 					= require('./facebook')
var User       			= require('./models/user');
var Mapping       		= require('./models/mapping');
var Advert       		= require('./models/advert');
var Event       		= require('./models/event');
var Html 				= require('./models/message');
var rest 				= require('./xmlhttprequest');
//var twit			= require('./tweeter');
var Twit = require('twit');
var configAuth = require('../config/auth');
var YQL = require('yql');


module.exports = function(app, passport, bodyParser , io) {

	// =====================================
	// HOME PAGE (with login links) ========
	// =====================================
	app.get('/home', function(req, res) {
		res.render('index.ejs'); // load the index.ejs file
	});

	// =====================================
	// LOGIN ===============================
	// =====================================
	// show the login form
	app.get('/login', function(req, res) {

		// render the page and pass in any flash data if it exists
		res.render('login.ejs', { message: req.flash('loginMessage') }); 
	});

	// process the login form
	app.post('/login', passport.authenticate('local-login', {
		successRedirect : '/editor.html', // redirect to the secure profile section
		failureRedirect : '/login', // redirect back to the signup page if there is an error
		failureFlash : true // allow flash messages
	}));

	// =====================================
	// SIGNUP ==============================
	// =====================================
	// show the signup form
	app.get('/signup', function(req, res) {

		// render the page and pass in any flash data if it exists
		res.render('signup.ejs', { message: req.flash('signupMessage') });
	});

	// process the signup form
	app.post('/signup', passport.authenticate('local-signup', {
		successRedirect : '/profile', // redirect to the secure profile section
		failureRedirect : '/signup', // redirect back to the signup page if there is an error
		failureFlash : true // allow flash messages
	}));

	// =====================================
	// PROFILE SECTION =====================
	// =====================================
	// we will want this protected so you have to be logged in to visit
	// we will use route middleware to verify this (the isLoggedIn function)
	app.get('/profile', isLoggedIn, function(req, res) {
		res.render('profile.ejs', {
			user : req.user // get the user out of session and pass to template
		});
	});

	// =====================================
	// LOGOUT ==============================
	// =====================================
	app.get('/logout', function(req, res) {
		req.logout();
		res.redirect('/home');
	});
// route for showing the profile page
	app.get('/profile', isLoggedIn, function(req, res) {
		res.render('profile.ejs', {
			user : req.user // get the user out of session and pass to template
		});
	});





	// =====================================
	// FACEBOOK ROUTES =====================
	// =====================================
	// route for facebook authentication and login
	app.get('/auth/facebook', passport.authenticate('facebook', { scope: ['read_stream', 'publish_actions', 'email']}));

	// handle the callback after facebook has authenticated the user
	app.get('/auth/facebook/callback',
		passport.authenticate('facebook', {
			successRedirect : '/profile',
			failureRedirect : '/home'
		}));

	// route for logging out
	app.get('/logout', function(req, res) {
		req.logout();
		res.redirect('/home');
	});
	
	
	app.post('/post', function(req, res) {
			console.log(req.body);
		console.log(req.body.message);
		User.findOne({ 'facebook.id' : req.body.id }, function(err, user) {
	
		        	// if there is an error, stop everything and return that
		        	// ie an error connecting to the database
		            if (err)
		                return done(err);
	
					// if the user is found, then log them in
		            if (user) {
		                // Call function that contains API call to post on Facebook (see facebook.js)
						FB.postMessage(user.facebook.token, req.body.message, res);
		            } 	
		});
	});
	
	// =====================================
	// TWITTER ROUTES ======================
	// =====================================
	// route for twitter authentication and login
	app.get('/auth/twitter', passport.authenticate('twitter'));

	// handle the callback after twitter has authenticated the user
	app.get('/auth/twitter/callback',
		passport.authenticate('twitter', {
			successRedirect : '/profile',
			failureRedirect : '/home'
		}));
		
	app.post('/tweet', function(req, response) {
		console.log(req.body.id);
		User.findOne({ 'twitter.id' : req.body.id }, function(err, user) {
		
		if(err) return done(err);
		
		console.log(user);
		
		var T = new Twit({
		consumer_key:         configAuth.twitterAuth.consumerKey
	  , consumer_secret:      configAuth.twitterAuth.consumerSecret
	  , access_token:         user.twitter.token
	  , access_token_secret:  /*'X8Tal8EbqV06dA3c2jJENWl4IuWwoTY7n6TBMmCVzqQ2o'*/ user.twitter.tokenSecret
	})

	console.log(JSON.stringify(req.body));
	console.log('req.body.message', req.body['message']);
	console.log(req.body.message);
	//
	//  tweet 'hello world!'
	//
	T.post('statuses/update', { status: req.body.message }, function(err, data, response) {
		if (err) return console.error("Error occured: ", err);
	  
	  // Generate output
     var output = '<p>Message has been posted to your twitter.</p>';
      //output += '<pre>' + JSON.stringify(data, null, '\t') + '</pre>';
      
      // Send output as the response
      //response.writeHeader(200, {'Content-Type': 'text/html'});
      //response.end(output);
	})
	})
	});
		
		
		
		// =============================================================================
		// AUTHORIZE (ALREADY LOGGED IN / CONNECTING OTHER SOCIAL ACCOUNT) =============
		// =============================================================================

	// locally --------------------------------
		app.get('/connect/local', function(req, res) {
			res.render('connect-local.ejs', { message: req.flash('loginMessage') });
		});
		app.post('/connect/local', passport.authenticate('local-signup', {
			successRedirect : '/profile', // redirect to the secure profile section
			failureRedirect : '/connect/local', // redirect back to the signup page if there is an error
			failureFlash : true // allow flash messages
		}));

	// facebook -------------------------------

		// send to facebook to do the authentication
		app.get('/connect/facebook', passport.authorize('facebook', { scope: ['read_stream', 'publish_actions', 'email'] }));

		// handle the callback after facebook has authorized the user
		app.get('/connect/facebook/callback',
			passport.authorize('facebook', {
				successRedirect : '/profile',
				failureRedirect : '/home'
			}));

	// twitter --------------------------------

		// send to twitter to do the authentication
		app.get('/connect/twitter', passport.authorize('twitter', { scope : 'email' }));

		// handle the callback after twitter has authorized the user
		app.get('/connect/twitter/callback',
			passport.authorize('twitter', {
				successRedirect : '/profile',
				failureRedirect : '/home'
			}));
			
				
	// =============================================================================
	// UNLINK ACCOUNTS =============================================================
	// =============================================================================
	// used to unlink accounts. for social accounts, just remove the token
	// for local account, remove email and password
	// user account will stay active in case they want to reconnect in the future

    // local -----------------------------------
    app.get('/unlink/local', function(req, res) {
        var user            = req.user;
        user.local.email    = undefined;
        user.local.password = undefined;
        user.save(function(err) {
            res.redirect('/profile');
        });
    });

    // facebook -------------------------------
    app.get('/unlink/facebook', function(req, res) {
        var user            = req.user;
        user.facebook.token = undefined;
        user.save(function(err) {
            res.redirect('/profile');
        });
    });

    // twitter --------------------------------
    app.get('/unlink/twitter', function(req, res) {
        var user           = req.user;
        user.twitter.token = undefined;
        user.save(function(err) {
           res.redirect('/profile');
        });
    });
	
// =============================================================================
// MAPPINGS ====================================================================
// =============================================================================
// used to map account to advertisment
 app.post('/mappings', function(req, res) {
 
		var mapping 		= new Mapping();
		mapping.uid			= req.body.uid;
		mapping.local		= req.body.customerId;
        mapping.save(function(err) {
            res.json({ message: 'Mapping created!' });
        });
    });
	app.get('/mappings',function(req, res) {
		Mapping.find(function(err, mapping) {
			if (err)
				res.send(err);

			res.json(mapping);
		});
	});
	

	// get the mapping with that id (accessed at GET http://localhost:8080/mappings/:mapping_id)
	app.get('/mappings/:mapping_id',function(req, res) {
		Mapping.findById(req.params.mapping_id, function(err, mapping) {
			if (err)
				res.send(err);
			res.json(mapping);
		});
	});
	
		// update the mapping with this id (accessed at PUT http://localhost:8080/mappings/:mapping_id)
	app.put('/mappings/:mapping_id', function(req, res) {

		// use our bear model to find the bear we want
		Mapping.findById(req.params.mapping_id, function(err, mapping) {

			if (err)
				res.send(err);

			mapping.uid			= req.body.uid;
			mapping.local		= req.body.customerId;
			
			// save the bear
			mapping.save(function(err) {
				if (err)
					res.send(err);

				res.json({ message: 'Mapping updated!' });
			});

		});
	});
	
	// delete the mapping with this id (accessed at DELETE http://localhost:8080/api/bears/:mapping_id)
	app.delete('/mappings/:mapping_id',function(req, res) {
		Mapping.remove({
			_id: req.params.mapping_id
		}, function(err, mapping) {
			if (err)
				res.send(err);

			res.json({ message: 'Successfully deleted' });
		});
	});

//=============================================================================
//========================HTML=================================================
//=============================================================================
app.post('/html', function(req, res) {

	 var site = 'http://www.interweb.idc.ac.il/radioidc1.xml';
    /*var yql = 'http://query.yahooapis.com/v1/public/yql?q=' + encodeURIComponent('select * from xml where url="' + site + '"') + '&format=xml&callback=?';
       
       var options = {
		    host: yql,
		    method: 'GET'
		    
		};
		rest.res.gegetXML(options,
       function(statusCode, result)
        {
            // I could work with the result html/json here.  I could also just return it
            console.log("onResult: (" + statusCode + ")" + result);
        });*/
        var doc = new Html();
		doc.html = req.body.html;
        var query = new YQL('select * from xml where url="' + site + '"');
        query.exec(function (error, response) {
            if (response.error) {
	    	console.log("Example #1... Error: " + response.error.description);
    	}
    	    else
    	    {
    	    	if(response.query.results.BroadcastMonitor.Current.ProgramName)
    	    	{
	                doc.programName = response.query.results.BroadcastMonitor.Current.ProgramName;
	                	console.log(doc.programName);
	                  doc.save(function(err) {
	        			 res.json({ message: 'Html created!' });
	    			 });
    	    	}
    	    }
        });
	
		
	
        	
        	io.sockets.clients().forEach(function (socket) {
				socket.emit('showhtml', doc.html);
        	});
      
    });
	
// =============================================================================
// UNDO Operation for an editor ====================================================================
// =============================================================================
app.post('/undoLast', function(req, res) {
    	io.sockets.clients().forEach(function (socket) {
				socket.emit('undoLast', '');
        	});
   
   			var programName = req.body.programName;
   
        	
        	Html.find({'programName' : programName}).sort('timestamp', 2).limit(1).remove().exec();
        	
        	
});
	
// =============================================================================
// UNDO Operation for an editor ====================================================================
// =============================================================================

app.post('/flush', function(req, res) {
    	io.sockets.clients().forEach(function (socket) {
				socket.emit('flush', '');
        	});
        	var programName = req.body.programName;
        	Html.find({'programName' : programName}).remove().exec();
        	
        	
});	

	
// =============================================================================
// ADVERTS ====================================================================
// =============================================================================
// used to map account to advertisment
 app.post('/adverts', function(req, res) {
 
		var advert 		= new Advert();
		advert.uid			= req.body.uid;
		advert.message		= req.body.message;
		advert.link			= req.body.link;
		advert.html			= req.body.html;
		advert.isActive		= false;
        advert.save(function(err) {
            res.json({ message: 'Advert created!' });
        });
    });
	app.get('/adverts',function(req, res) {
		Advert.find(function(err, advert) {
			if (err)
				res.send(err);

			res.json(advert);
		});
	});
	

	// get the advert with that id (accessed at GET http://localhost:8080/adverts/:uid)
	app.get('/adverts/:advert_id',function(req, res) {
		Advert.findById(req.params.uid, function(err, advert) {
			if (err)
				res.send(err);
			res.json(advert);
		});
	});
	
		// update the advert with this id (accessed at PUT http://localhost:8080/adverts/:uid)
	app.put('/adverts/:uid', function(req, res) {

		// use our bear model to find the bear we want
		Advert.findById(req.params.uid, function(err, advert) {

			if (err)
				res.send(err);

			advert.uid			= req.body.uid;
			advert.message		= req.body.message;
			advert.link			= req.body.link;
			
			// save the advert
			advert.save(function(err) {
				if (err)
					res.send(err);

				res.json({ message: 'Advert updated!' });
			});

		});
	});
	
	// delete the advert with this id (accessed at DELETE http://localhost:8080/api/bears/:uid)
	app.delete('/adverts/:uid',function(req, res) {
		Advert.remove({
			uid: req.params.uid
		}, function(err, advert) {
			if (err)
				res.send(err);

			res.json({ message: 'Successfully deleted' });
		});
	});
	
	// =============================================================================
	// EVENT ====================================================================
	// =============================================================================
	// used to map account to advertisment
	 app.post('/event', function(req, res) {
 		
		var event 			= new Event();
		event.uid			= req.body.uid;
		event.stationId		= req.body.stationId;
		event.programId		= req.body.programId;
		event.programName	= req.body.programName;
		event.localTime		= req.body.localTime !== null ? req.body.localTime : 0;
		var localId;
		var message = "";
		var link = "";
		var	delay = req.body.delay !== null ? req.body.delay : 0;
		setTimeout(function() {
		Mapping.findOne({ 'uid' : event.uid }, function(err, mapping) {
			if (err)
			{
							res.send(err);
				
			}
			if(!mapping)
			{
					
					io.sockets.clients().forEach(function (socket) {
					console.log("socket"+ socket);
					console.log("socket.stationId"+ socket.stationId);
					if(socket.stationId == req.body.stationId.valueOf())
					
					{
						
					socket.emit('update', '<div class="thumbnail"><img src="images/main_thumbnail.png" alt="Thumbnail Caption" />');	//FIXME temp fix   width="250" height="126"
					var events =	Event.find({"stationId" : req.body.stationId.valueOf()}).sort([['localTime', 'descending']]).limit(10);
							
						events.exec(function(err, result)
						{
							if(err)
								return console.log(err);
								var timeout = 10000;
							result.forEach(function(event)
							
							{
								Advert.findOne(event.uid, function(err,advert)
								{
									timeout = timeout + 10000;
									if(err)
										console.log(err);
									/*	 setTimeout(function(){socket.emit('update', advert.html);}, timeout);*/
										

								
								});	
							});
							});
							
					}
					
				});	
				 res.json({ message: 'Nothing Found' });
				return;
			}// if !mapping
			
				console.log(mapping.local);
			 localId = mapping.local;
		
		
        event.save(function(err) {
            res.json({ message: 'Event created!' });
        });
		Advert.findOne({ 'uid' : req.body.uid }, function(err, advert) {
			if (err )
			{
				res.send(err);
				return;
			}
			if(!advert)
			{
				return;
			}
			
			
			 link = advert.link !== null ? advert.link : "";
			 message =  advert.message !== null ? advert.message : "";
			 advert.isActive = true;
			 var htmlAdvert = advert.html !== null ? advert.html : "";
			console.log(advert);

		io.sockets.clients().forEach(function (socket) {
			console.log("socket"+ socket);
			console.log("socket.stationId"+ socket.stationId);
			if(socket.stationId == req.body.stationId.valueOf())
			{
				console.log("found the one"+htmlAdvert);
				socket.emit('update', htmlAdvert);
				socket.emit('button', link);
			}
			
		});
			

	
		User.findById(localId, function(err, user) {
			if (err)
			{
				res.send(err);
				return;
			}
		console.log(user);
		if(user.twitter)
		{
				var T = new Twit({
				consumer_key:         configAuth.twitterAuth.consumerKey
			  , consumer_secret:      configAuth.twitterAuth.consumerSecret
			  , access_token:         user.twitter.token
			  , access_token_secret:   user.twitter.tokenSecret
			});
		
			//	}
			T.post('statuses/update', { status:message + " " + link + " was played at " + event.programName + " on " +event.localTime }, function(err, data, response) {
				if (err) return res.send(err);
			  
			  // Generate output
				 //var output = '<p>Message has been posted to your twitter.</p>';
		      //output += '<pre>' + JSON.stringify(data, null, '\t') + '</pre>';
		      
		      // Send output as the response
		      //response.writeHeader(200, {'Content-Type': 'text/html'});
		      //response.end(output);
			});
		}
		if(user.facebook)
		{
			console.log("fb user" + user.facebook);
			FB.postMessage(user.facebook.token, message + " " + link + " was played at " + event.programName + " on " +event.localTime, res);
		}
		});
		});
    });
		}, delay*1000);//MainTimeOut
	 });
	
	
	// get the advert with that id (accessed at GET http://localhost:8080/banner/:uid)
	app.get('/banner/:uid',function(req, res) {
	Advert.findOne({ 'uid' : req.params.uid }, function(err, advert) {
			if (err)
			{
				res.send(err);
				return;
			}
			//res.send(advert,html);
		});
	});

};


// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

	// if user is authenticated in the session, carry on
	if (req.isAuthenticated())
		return next();

	// if they aren't redirect them to the home page
	res.redirect('/home');
}