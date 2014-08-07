// app/models/mapping.js
// load the things we need
var mongoose = require('mongoose');

// define the schema for our user model
var mappingSchema = mongoose.Schema({
		uid			 : String,
        local        : String
});


module.exports = mongoose.model('Mapping', mappingSchema);