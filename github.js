var GitHubApi = require('github');
var config = require('./config.json');

var active = false,
    repos = [{ 'user': 'johnballantyne', 'repo': 'test' }],
    rate = 60 * 60 * 1000 / (60 * repos.length),
    github = new GitHubApi({
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

function getCommits() {
    if (!active) {
        return;
    }
    github.repos.getCommits(
        {
            'user': repos[0].user,
            'repo': repos[0].repo,
            'page': '1',
            'per_page': '1'
        },
        function (err, data) {
            if (err) {
                console.log(err);
                //callback(repos, rate);
            } else {
                if (!repos[0].sha) {
                    console.log("Commit not set for %s/%s. Initializing...", repos[0].user, repos[0].repo);
                    repos[0].sha = data[0].sha;
                } else if (repos[0].sha !== data[0].sha) {
                    console.log("ALERT!!! A NEW COMMIT! HIT IT SPINDERELLA");
                    repos[0].sha = data[0].sha;
                }
                var reqRem = data.meta['x-ratelimit-remaining'],
                    reset = data.meta['x-ratelimit-reset'];

                rate = calcRate(reqRem, reset);
                console.log(new Date().toUTCString());
                console.log('    Rate: 1 request per %s seconds', rate / 1000);
                console.log('    Requests remaining: %s', reqRem);
                console.log('    Request count resets in %s minutes', ((reset * 1000 - Date.now()) / 60000).toFixed(1));
                setTimeout(function () { getCommits(); }, rate);
            }
        }
    );
}

module.exports.getCommits = getCommits;
module.exports.repos = repos;
module.exports.rate = rate;
module.exports.active = active;
