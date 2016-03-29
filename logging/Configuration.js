function Configuration(fs, filePath) {

    var config = {};
    var subscriberCallbacks = [];

    fs.readFile(filePath, 'utf8', function (err, data) {
        if (err) {
            return console.log(err);
        }
        try {
            config = JSON.parse(data);
        } catch (err) {
            console.log('Error parsing config file: ' + err);
        }
        notifySubscribers();
    });

    this.subscribeToUpdates = function (subscriberCallback) {
        subscriberCallbacks.push(subscriberCallback);
    };

    this.getConfigParams = function() {
        return config;
    };

    var notifySubscribers = function () {
        for (var i = 0; i < subscriberCallbacks.length; i++) {
            subscriberCallbacks[i](config);
        }
    };

    var saveConfig = function () {
        var configString = JSON.stringify(config);
        fs.writeFile(filePath, configString, function (err) {
            if(err) {
                return console.log('Error saving the config file: ' + err);
            }
        })
    };

    this.updateConfig = function (newConfig) {
        if (newConfig.emailPass === 'unchanged') {
            newConfig.emailPass = config.emailPass;
        }
        if (newConfig.octobluPass === 'unchanged') {
            newConfig.octobluPass = config.octobluPass;
        }
        config = newConfig;
        saveConfig(config);
        notifySubscribers();
    }
}

module.exports = Configuration;