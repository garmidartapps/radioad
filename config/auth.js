// config/auth.js

// expose our config directly to our application using module.exports
module.exports = {

	'facebookAuth' : {
		'clientID' 		: '253190524878455', // your App ID
		'clientSecret' 	: '55403c4b0610baf08c98b360ca161b02', // your App Secret
		'callbackURL' 	: 'http://localhost:8080/auth/facebook/callback'
	},

	'twitterAuth' : {
		'consumerKey' 		: 'w71qh5Ir1U8BKlnRd0k3FlofO',
		'consumerSecret' 	: '8ssaBU9hTsjJt91IO2uKqKKhrBk0NIQCQ5TVbmRfZp92mIIh9S',
		'callbackURL' 		: 'https://radioad-c9-garmidart.c9.io/auth/twitter/callback'
	},

	'googleAuth' : {
		'clientID' 		: 'your-secret-clientID-here',
		'clientSecret' 	: 'your-client-secret-here',
		'callbackURL' 	: 'http://localhost:8080/auth/google/callback'
	}

};
