var fs = require('fs');

var Logger = function (fileName) {

    function timeStamp(message) {
        var date = new Date();
        var month = makeTwoDigits(date.getMonth() + 1);
        var day = makeTwoDigits(date.getDate());
        var hours = makeTwoDigits(date.getHours());
        var minutes = makeTwoDigits(date.getMinutes());
        var formattedDate = date.getFullYear() + "-" + month + "-" + day + " " + hours + ":" + minutes;

        return formattedDate + ", " + message + "\n";
    }

    this.log = function (message) {
        fs.appendFile(fileName, timeStamp(message), function(err) {
            if(err) {
                return console.log('Error while writing to log: ' + err);
            }
        })
    };

    var makeTwoDigits = function (number) {
        if (number < 10) {
            return "0" + number;
        }
        return number;
    };
};

module.exports = Logger;