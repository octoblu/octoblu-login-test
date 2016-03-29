var LoggerManager = function (config, spyLogger) {

    // For unit testing, spyLogger overrides default Logger if passed as an argument
    var Logger = require('./../logging/Logger.js');
    var triggers = {};
    var loggers = {};

    this.log = function (triggerName, message) {
        if (typeof triggerName != 'undefined' && typeof loggers[triggerName] != 'undefined') {
            loggers[triggerName].log(message);
        } else {
            console.log("Unknown trigger name: " + triggerName);
        }
    };

    config.subscribeToUpdates(function () {
        updateLoggers();
    });

    var updateLoggers = function () {
        triggers = config.getConfigParams().flows;
        if (typeof triggers == 'undefined') {
            console.log("No trigger URLs to test");
            return;
        }

        loggers = {};
        triggers.forEach(function (trigger) {
            if (typeof spyLogger !== 'undefined') {
                loggers[trigger.name] = spyLogger;
            } else {
                loggers[trigger.name] = new Logger('./logging/FlowPageLog_' + trigger.name + '.csv');
            }
        });
    };

    updateLoggers();
};

module.exports = LoggerManager;