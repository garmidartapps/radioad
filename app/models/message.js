// app/models/mapping.js
// load the things we need
var mongoose = require('mongoose');

// define the schema for our user model
var mappingSchema = mongoose.Schema({
        html        : String,
        timestamp   : { type : Date, default: Date.now },
        programName :String
});


module.exports = mongoose.model('Html', mappingSchema);