var GitHubApi = require('github');
var config = require('./config.json');

var github = new GitHubApi({
    // required
     version: '3.0.0',
    //optional
    protocol: 'https',
    host: 'api.github.com',
    timeout: 5000,
    headers: {
        'user-agent': 'push-it'
    }
});

github.authenticate({
    type: "token",
    token: config.authToken
});

function calcRate(reqRem, reset) {
    var timeRem = reset * 1000 - Date.now();

    return Math.round(timeRem / reqRem);
}

function getCommits(repos, rate, callback) {
    github.repos.getCommits(
        {
            'user': 'johnballantyne',
            'repo': 'fbhw',
            'page': '1',
            'per_page': '1'
        },
        function (err, data) {
            if (err) {
                console.log(err);
                //callback(repos, rate);
            } else {
                var reqRem = data.meta['x-ratelimit-remaining'],
                    reset = data.meta['x-ratelimit-reset'];

                rate = calcRate(reqRem, reset);
                console.log(new Date().toUTCString());
                console.log('    Rate: 1 request per %s seconds', rate / 1000);
                console.log('    Requests remaining: %s', reqRem);
                console.log('    Request count resets in %s minutes', ((reset * 1000 - Date.now()) / 60000).toFixed(1));
                setTimeout(function () { callback(repos, rate); }, rate);
            }
        }
    );
}

function poll(repos, rate) {
    getCommits(repos, rate, poll);
}

function init() {
    var repos = [
            { 'user': 'johnballantyne', 'repo': 'fbhw' }
        ],
        rate = 3600000 / (60 * repos.length);
    poll(repos, 0);
}


init();

