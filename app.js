///////////////////////////////////////////////////////////////////////
//IMPORTS
///////////////////////////////////////////////////////////////////////

var express = require('express');
var bodyParser = require('body-parser');
var CookieParser = require('cookie-parser');
var ExpressSession = require('express-session');
var http = require('http');
var request = require('request');
var fs = require('fs');

var DesignPageTest = require('./uptime_tests/DesignPageTest');
var FlowPageTest = require('./uptime_tests/FlowPageTest');
var Notification = require('./uptime_tests/Notification.js');
var Clock = require('./uptime_tests/Clock.js');
var Configuration = require('./logging/Configuration');
var LoggerManager = require('./logging/LoggerManager');

///////////////////////////////////////////////////////////////////////
//CONSTRUCTION
///////////////////////////////////////////////////////////////////////

var app = express();

var MILLIS_PER_MIN = 60 * 1000;

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(CookieParser());
app.use(ExpressSession({secret: 'topsecret'})); //Change topsecret to a random string of characters

var config = new Configuration(fs, __dirname + '/logging/config.json');
var notification = new Notification(config);
var clock = new Clock();

var designPageTest = new DesignPageTest(config, clock);

var flowPageTest = null;

var runTestInterval = null;

///////////////////////////////////////////////////////////////////////
//LOGIC
///////////////////////////////////////////////////////////////////////

app.use(express.static('client'));

var server = http.createServer(app);

server.listen(process.env.PORT || 3000, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log('App listening at http://%s:%s', host, port);
    if (config.getConfigParams().pingWaitTime && runTestInterval == null) {
        runTestsContinuously();
    }
});

var runTestsContinuously = function () {
    var waitTime = config.getConfigParams().pingWaitTime * MILLIS_PER_MIN;
    runTestInterval = setInterval(runTests, waitTime);
};

var runTests = function () {
    console.log("Running tests!");
    designPageTest.launchTest();
    flowPageTest.launchTests();
};

config.subscribeToUpdates(function () {
    console.log("Received config update!");
    if (runTestInterval) {
        clearInterval(runTestInterval);
    }

    flowPageTest = new FlowPageTest(
        config,
        app,
        request,
        notification,
        new LoggerManager(config),
        clock
    );
    runTestsContinuously();
});