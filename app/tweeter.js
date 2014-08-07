var Twit = require('twit');
var request = require('request');

function postMessage( req, response) {
	var T = new Twit({
		consumer_key:         'w71qh5Ir1U8BKlnRd0k3FlofO'
	  , consumer_secret:      '8ssaBU9hTsjJt91IO2uKqKKhrBk0NIQCQ5TVbmRfZp92mIIh9S'
	  , access_token:         '2669374290-zr4jLMlfx1899niAYJxYA14iVdDbrfIvOfXZmyX'
	  , access_token_secret:  'X8Tal8EbqV06dA3c2jJENWl4IuWwoTY7n6TBMmCVzqQ2o'
	})

	console.log(req.body.message);
	//
	//  tweet 'hello world!'
	//
	T.post('statuses/update', { status: String("lama ze lo oved?!?!") }, function(err, data, response) {
		if (err) return console.error("Error occured: ", err);
	  if (data) return console.log(data);
	  // Generate output
    // var output = '<p>Message has been posted to your twitter.</p>';
      //output += '<pre>' + JSON.stringify(data, null, '\t') + '</pre>';
      
      // Send output as the response
      //response.writeHeader(200, {'Content-Type': 'text/html'});
    //  response.end(output);
	})


}

exports.postMessage = postMessage;