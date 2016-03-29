var FlowPageTest = function (configuration, server, request, notification, loggerManager, clock) {

    var MILLIS_PER_SEC = 1000;
    var timeOutMillis;

    var findTriggerWithUuid = function (uuid) {
        if (typeof triggers == 'undefined' || typeof uuid == 'undefined') {
            return null;
        }

        for (var i = 0; i < triggers.length; i++) {
            if (triggers[i].url.indexOf(uuid.trim()) > -1) {
                return triggers[i];
            }
        }
        console.log("Could not find trigger for UUID: " + uuid);
        return null;
    };

    server.get('/flowtest', function (req, res) {
        res.send('Hello Web Hook! ' + clock.getCurrentTime());
        if (!req.headers.uuid) {
            console.log("Could not find header with 'uuid' key from the http/GET.");
            console.log(req.headers);
        } else {
            console.log("Received GET from Octoblu from UUID " + req.headers.uuid);
        }

        var triggerWithUuid = findTriggerWithUuid(req.headers.uuid);
        if (triggerWithUuid != null) {
            success(triggerWithUuid);
        }
    });

    this.launchTests = function () {
        if (typeof triggers == 'undefined') {
            console.log("No trigger URLs to test");
            return;
        }

        triggers.forEach(function (trigger) {
            launchTest(trigger);
        });
    };

    var launchTest = function (trigger) {
        console.log("Testing: " + trigger.name + '@' + trigger.url);
        timers[trigger.name].startTime = clock.getCurrentTime();
        timeOutMillis = configuration.getConfigParams().timeOutSeconds * MILLIS_PER_SEC;
        timers[trigger.name].failureTimeout = clock.setTimeout(failure, timeOutMillis, trigger);

        request.post(
            trigger.url,
            function (error, response, body) {
                if (!error && response.statusCode == 201) {
                    console.log("Octoblu webhook " + trigger.name + " post successful.")
                } else {
                    console.log("Error with " + trigger.name + ", flow: " + trigger.url);
                    if (!error)
                        console.log("Error: " + error);
                    if (!response)
                        console.log("Status code: " + JSON.stringify(response));
                }
            }
        );
    };

    // Get UUID substring from a trigger URL, which has the following format:
    // https://triggers.octoblu.com/flows/25a06ad8-07af-4a35-9bf0-2b0cce0d1cc2/triggers/9...
    var parseUUID = function (triggerURL) {
        var uuidEnd = triggerURL.search("/triggers/");
        var uuidStart = triggerURL.search("/flows/") + "/flows/".length;
        if (uuidStart == -1 || uuidEnd == -1) {
            console.log("Could not parse UUID from the triggerURL: " + triggerURL);
            return triggerURL;
        }

        return triggerURL.substring(uuidStart, uuidEnd);
    };

    var sendEmail = function (trigger) {
        console.log("Sending email notification");
        var timeOutSeconds = timeOutMillis / MILLIS_PER_SEC;
        var subject = 'Octoblu flow [' + trigger.name + '] unavailable';
        var text = 'Octoblu flow (' + parseUUID(trigger.url) + ') is down at ' +
            new Date() + '. No success in ' + timeOutSeconds + ' seconds.';
        notification.sendNotification(subject, text);
        numConsecutiveFailures[trigger.name] = 0;
    };

    var failure = function (trigger) {
        loggerManager.log(trigger.name, '0');
        numConsecutiveFailures[trigger.name]++;
        console.log("Trigger " + trigger.name + " consecutive failures: " + numConsecutiveFailures[trigger.name]);
        if (numConsecutiveFailures[trigger.name] >= configuration.getConfigParams().timeOuts) {
            sendEmail(trigger);
        }
    };

    var success = function (trigger) {
        if (typeof timers[trigger.name].startTime === 'undefined' || timers[trigger.name].startTime === 0) {
            console.log("Received a phantom HTTP/GET call from flow: " + trigger.name);
            return;
        }
        clock.clearTimeout(timers[trigger.name].failureTimeout);
        numConsecutiveFailures[trigger.name] = 0;
        var elapsedMillis = clock.getCurrentTime() - timers[trigger.name].startTime;
        var elapsedSeconds = elapsedMillis / MILLIS_PER_SEC;
        loggerManager.log(trigger.name, elapsedSeconds);
        timers[trigger.name].startTime = 0;
    };

    // Construction time init for the failure counters.
    triggers = configuration.getConfigParams().flows;
    if (typeof triggers == 'undefined') {
        console.log("No trigger URLs to test");
        return;
    }

    numConsecutiveFailures = {};
    timers = {};
    triggers.forEach(function (trigger) {
        numConsecutiveFailures[trigger.name] = 0;
        timers[trigger.name] = {
            startTime: 0,
            failureTimeout: null
        };
    });
};

module.exports = FlowPageTest;