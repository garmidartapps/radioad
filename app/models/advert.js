// app/models/advert.js
// load the things we need
var mongoose = require('mongoose');

// define the schema for our user model
var advertSchema = mongoose.Schema({
		uid			 : String,
		message		 : String,
		link		 : String,
		html		 : String,
		isActive	 : Boolean
		
});


module.exports = mongoose.model('Advert', advertSchema);