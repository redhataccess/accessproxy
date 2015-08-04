'use strict';
var os = require('os');
var counter = 0;

exports.increment = function () {
    counter++;
};

function dump() {
    if (counter > 0) {
        var host = os.hostname();
        var noop = function () {};
        // Hail mary before the process exits
        require('child_process').exec('curl -X POST ' +
            '-H "Content-Type: application/json" ' +
            '-d \'{"amount":  ' + counter + ', "hostname": "' + host + '"}\' ' +
            'http://stats-chindley.itos.redhat.com/api/stats &', noop);
    }
}
process.on('exit', dump);
process.on('SIGINT', process.exit);
