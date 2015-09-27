var GitHubApi = require('github');
var config = require('./config.json');

var active = false,
    validRepos = [{ 'user': 'johnballantyne', 'repo': 'fbhw' }],
    invalidRepos = [{ 'user': 'johnballantyne', 'repo': 'test' }],
    rate = 60 * 60 * 1000 / (60 * validRepos.length),
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
    type: 'token',
    token: config.authToken
});

function calcRate(reqRem, reset) {
    var timeRem = reset * 1000 - Date.now();
    return Math.round(timeRem / reqRem);
}

function setActive(val) {
    if (val) {
        active = true;
    } else {
        active = false;
    }
}

function checkValidRepos() {

}

function checkInvalidRepos() {
    invalidRepos.forEach(function (repo, i, arr) {
        github.repos.getCommits(
            {
                'user': repo[i].user,
                'repo': repo[i].repo,
                'page': '1',
                'per_page': '1'
            },
            function (err, data) {
                if (err) {
                    console.log('%s/%s: still inactive.');
                } else {
                    console.log('%s/%s: no longer inactive! Suggest switching.');
                }
            });
    });
}

function handleValidRepo(err, data, action) {
    if (err) {
        console.log('Error! You should make this repo inactive.');
        console.log(err);
        //callback(validRepos, rate);
    } else {
        if (!validRepos[0].sha) {
            console.log('Commit not set for %s/%s. Initializing...', validRepos[0].user, validRepos[0].repo);
            validRepos[0].sha = data[0].sha;
        } else if (validRepos[0].sha !== data[0].sha) {
            console.log('ALERT!!! A NEW COMMIT! HIT IT SPINDERELLA');
            action();
            validRepos[0].sha = data[0].sha;
        }
        var reqRem = data.meta['x-ratelimit-remaining'],
            reset = data.meta['x-ratelimit-reset'];

        rate = calcRate(reqRem, reset);
        console.log(new Date().toUTCString());
        console.log('    Rate: 1 request per %s seconds', rate / 1000);
        console.log('    Requests remaining: %s', reqRem);
        console.log('    Request count resets in %s minutes', ((reset * 1000 - Date.now()) / 60000).toFixed(1));
    }
    setTimeout(function () { getCommits(action); }, rate);
}

function getCommits(action) {
    if (!active) {
        return;
    }
    github.repos.getCommits(
        {
            'user': validRepos[0].user,
            'repo': validRepos[0].repo,
            'page': '1',
            'per_page': '1'
        }, function (err, data) {
            handleValidRepo(err, data, action);
        });
}

exports.validRepos = validRepos;
exports.rate = rate;
exports.active = active;
exports.setActive = setActive;
exports.getCommits = getCommits;
