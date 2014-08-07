// app/models/event.js
// load the things we need
var mongoose = require('mongoose');

// define the schema for our user model
var eventSchema = mongoose.Schema({
		uid			 	 : String,
		stationId		 : String,
		programType		 : String,
		programName		 : String,
		localTime		 : String
		
});


module.exports = mongoose.model('Event', eventSchema);