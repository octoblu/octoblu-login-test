function Clock() {
    this.setTimeout = setTimeout;
    this.clearTimeout = clearTimeout;
    this.setInterval = setInterval;
    this.clearInterval = clearInterval;
    this.getCurrentTime = function(){ return new Date().getTime(); }
}

module.exports = Clock;