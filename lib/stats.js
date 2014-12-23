'use strict';
var counter = 0;

exports.increment = function() {
    counter++;
};

function dump() {
    if (counter > 0) {
        require('child_process').exec('curl -X POST -H "Content-Type: application/json" -d \'{"amount":  ' + counter + '}\' http://stats-chindley.itos.redhat.com/api/stats &', function() {});
    }
}
process.on('exit', dump);
process.on('SIGINT', process.exit);
