var Logger = require('./../logging/Logger');

exports.testLoggerConstruction = function(test) {
    var logger = new Logger('./TestLog.log');
    logger.log("test");
    test.done();
};