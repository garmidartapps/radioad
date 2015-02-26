var http = require("http");
var https = require("https");
var xmlParser = require("xml2js").parseString;
/**
 * getXML:  REST get request returning XML object(s)
 * @param options: http options object
 * @param callback: callback to pass the results XML object(s) back
 */
function getXML(options, onResult)
{
    console.log("rest::getJSON");

    var req = http.get(options, function(res)
    {
        var output = '';
        console.log(options.host + ':' + res.statusCode);
        res.setEncoding('utf8');

        res.on('data', function (chunk) {
            output += chunk;
        });

        res.on('end', function() {
            var obj = xmlParser(output);//JSON.parse(output);
            console.log(obj);
            onResult(res.statusCode, obj);
        });
    });

    req.on('error', function(err) {
        console.log('error: ' + err.message);
    });

    req.end();
};

exports.getXML = getXML;