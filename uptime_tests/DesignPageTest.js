var Notification = require('./Notification.js');
var DesignPageAccessor = require('./DesignPageAccessor.js');
var Logger = require('./../logging/Logger.js');

var DesignPageTest = function (configuration, clock) {

    var MILLIS_PER_SEC = 1000;
    var numConsecutiveFailures = 0;
    var failureTimeout = null;
    var startTime;
    var timeOutMillis;

    var logger = new Logger('./logging/DesignPageLog.csv');

    this.launchTest = function () {
        timeOutMillis = configuration.getConfigParams().timeOutSeconds * MILLIS_PER_SEC;
        var designAccessor = new DesignPageAccessor(success, configuration.getConfigParams());
        designAccessor.accessDesignerPage();

        startTime = clock.getCurrentTime();
        failureTimeout = clock.setTimeout(failure, timeOutMillis);
    };

    var failure = function () {
        logger.log('0');
        numConsecutiveFailures++;
        console.log("consecutive failures: " + numConsecutiveFailures);
        if (numConsecutiveFailures >= configuration.getConfigParams().timeOuts) {
            console.log("sending email notification");
            var timeOutSeconds = timeOutMillis / MILLIS_PER_SEC;
            var subject = 'Octoblu design page unavailable';
            var text = 'Octoblu design page down at ' + new Date() + '. No success in ' + timeOutSeconds + ' seconds.';
            var notification = new Notification(configuration);
            notification.sendNotification(subject, text);
        }
    };

    var success = function () {
        var elapsedMillis = clock.getCurrentTime() - startTime;
        var elapsedSeconds = elapsedMillis / MILLIS_PER_SEC;
        logger.log(elapsedSeconds);
        clock.clearTimeout(failureTimeout);
        numConsecutiveFailures = 0;
    };
};

module.exports = DesignPageTest;