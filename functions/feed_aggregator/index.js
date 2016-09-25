'use strict';

const request = require('request-promise-native');
const $ = require('cheerio');
const moment = require('moment');
const URL = require('url-parse');

exports.handle = (event, context, callback) => {

    var stackexchangeUserId = event.se_uid,
        stackexchangeProfileUrl = 'https://stackexchange.com/users/' + stackexchangeUserId + '?tab=accounts',
        stackexchangeProfileHtml = '',
        requestOptions = {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2859.0 Safari/537.36'
            },
            followAllRedirects: true
        };

    request(stackexchangeProfileUrl, requestOptions)
    .then((body) => {
        stackexchangeProfileHtml = body;

        var subSitesFeedsRequests = [];
        $('.account-container .account-site h2 a', stackexchangeProfileHtml).each(function (i, el) {
            var subSiteUrlParts = new URL($(el).attr('href')),
                subSiteUserId = subSiteUrlParts.pathname.split('/')[2];

            subSiteUrlParts.set('pathname', '/feeds/user/' + subSiteUserId);

            subSitesFeedsRequests.push(request(subSiteUrlParts.href, requestOptions));
        });

        Promise.all(subSitesFeedsRequests)
            .then(function(rawFeeds) {
                var rawEntries = [];
                for (var feed of rawFeeds) {
                    rawEntries.push($('entry', feed));
                }

                return rawEntries;
            })
            .then(function (rawEntries) {
                return rawEntries.sort(function (a, b) {
                    return moment($('updated', b).text()).format('X') - moment($('updated', a).text()).format('X');
                });
            })
            .then(function (sortedEntries) {
                var $fullFeed = $.load('<?xml version="1.0" encoding="utf-8"?><feed xmlns="http://www.w3.org/2005/Atom" xmlns:creativeCommons="http://backend.userland.com/creativeCommonsRssModule" xmlns:re="http://purl.org/atompub/rank/1.0"/>', {
                    xmlMode: true
                });

                for (var entry of sortedEntries) {
                    $fullFeed('feed').append(entry);
                }

                context.succeed({ feed: $fullFeed.html() })
            })
            .catch(function (error) {
                console.log(error);
            });
    });
};