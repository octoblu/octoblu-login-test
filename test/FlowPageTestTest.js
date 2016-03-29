var FlowPageTest = require('./../uptime_tests/FlowPageTest.js');
var LoggerManager = require('./../logging/LoggerManager.js');

function MockServer() {
    var pageCallbacks = {};

    this.get = function (path, callback) {
        pageCallbacks[path] = callback;
    };

    this.sendGetRequest = function (path, req, res) {
        pageCallbacks[path](req, res);
    };
}

function MockClock() {
    var currentTime = 1;

    var timeouts = {};
    this.setTimeout = function (callback, msecs) {
        var timeOutId = currentTime + msecs;
        timeouts[timeOutId] = callback;
        return timeOutId;
    };

    this.clearTimeout = function (timeout) {
        delete timeouts[timeout];
    };

    this.advanceTime = function (msecs) {
        currentTime += msecs;
        for (var timeOutId in timeouts) {
            if (timeOutId <= currentTime) {
                timeouts[timeOutId]({"url": "https://foo.bar.com", "name": "Mock Flow"});
                delete timeouts["" + timeOutId];
            }
        }
    };

    this.getCurrentTime = function () {
        return currentTime;
    }
}

var configuration = {
    getConfigParams: function () {
        return {
            flows: [{"url": "https://foo.bar.com/1234", "name": "Mock Flow"}],
            timeOutSeconds: 5,
            timeOuts: 2
        }
    },
    subscribeToUpdates: function () {
        // Do nothing
    }
};

exports.test_launchTestTimeOut_should_log0 = function (test) {
    var spyLogger = {
        log: function (message) {
            test.ok(message == '0', "message should be 0");
            test.done();
        }
    };

    var mockClock = new MockClock();
    var mockServer = new MockServer();

    var flowPageTest = new FlowPageTest(configuration, mockServer, {
        post: function () {
        }
    }, null, new LoggerManager(configuration, spyLogger), mockClock);
    flowPageTest.launchTests({"url": "https://foo.bar.com", "name": "Test Flow"});
    mockClock.advanceTime(6000);
};

exports.test_launchTest_should_postToWebHook = function (test) {
    var spyRequest = {
        post: function (url, _) {
            test.ok(url === configuration.getConfigParams().flows[0].url, "URL should be the web hook URL");
            test.done();
        }
    };

    var mockClock = new MockClock();
    var mockServer = new MockServer();

    var flowPageTest = new FlowPageTest(configuration, mockServer, spyRequest, null, {
        log: function () {
        }
    }, mockClock);
    flowPageTest.launchTests({"url": "https://foo.bar.com", "name": "Test Flow"});
};

exports.test_timeOutsReached_should_sendEmail = function (test) {
    var spyNotification = {
        sendNotification: function (subject, text) {
            test.ok(subject != null && text != null, "email should contain subject and body.");
            test.done();
        }
    };

    var mockClock = new MockClock();
    var mockServer = new MockServer();

    var flowPageTest = new FlowPageTest(configuration, mockServer, {
        post: function () {
        }
    }, spyNotification, {
        log: function () {
        }
    }, mockClock);

    flowPageTest.launchTests({"url": "https://foo.bar.com", "name": "Test Flow"});
    mockClock.advanceTime(6000);
    flowPageTest.launchTests({"url": "https://foo.bar.com", "name": "Test Flow"});
    mockClock.advanceTime(6000);
};

exports.test_successfulTest_shouldLogResponseTime = function (test) {
    var secondsToAdvance = 3; //must be less than timeOutSeconds defined in configuration
    var MILLIS_PER_SEC = 1000;
    var millisToAdvance = secondsToAdvance * MILLIS_PER_SEC;
    var spyLogger = {
        log: function (message) {
            test.ok(message == "" + secondsToAdvance, "message should be " + secondsToAdvance);
            test.done();
        }
    };

    var mockServer = new MockServer();
    var mockClock = new MockClock();

    var flowPageTest = new FlowPageTest(
        configuration,
        mockServer,
        {
            post: function () {
            }
        },
        null,
        new LoggerManager(configuration, spyLogger),
        mockClock
    );

    flowPageTest.launchTests({"url": "https://foo.bar.com", "name": "Test Flow"});

    mockClock.advanceTime(millisToAdvance);

    mockServer.sendGetRequest('/flowtest', {"headers": {"uuid": "1234"}}, {
        send: function () {
        }
    });
};
