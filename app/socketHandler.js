var Html 				= require('./models/message');
var rest 				= require('./xmlhttprequest');
var YQL = require('yql');


module.exports = function(app , io, socket) {
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
        var query = new YQL('select * from xml where url="' + site + '"');
        query.exec(function (error, response) {
            if (response.error) {
	    	console.log("Example #1... Error: " + response.error.description);
    	}
    	    else
    	    {
                var programName = response.query.results.BroadcastMonitor.Current.ProgramName;
                var d2 = new Date();
                var d1 = new Date()

                d2.setHours(d2.getHours() - 2);
                
                Html.find({ 'programName' : programName , 'timestamp' : {'$lt' : d1, '$gte' : d2}}).sort({'timestamp' : 1}).exec(function(err, htmls) 
                { 
                     if(err)
                    {
                        console.log("error:" + err);
                        return;
                    }
                    if(!htmls || htmls.length == 0)
                    {
                        console.log("No HTMLs");
                        return;
                    }
                    else
                    {
                       for ( var index = 0; index < htmls.length; ++index) {
                           socket.emit('reload', htmls[index].html);
                       }
                        
                    }
                    
                });
    	    }
        });
        
        
}
