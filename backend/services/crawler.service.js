const SiteModel = require('../models/site.model');
const ScanModel = require('../models/scan.model');

const cheerio = require('cheerio');
const request = require('request');
var urlParse = require('url-parse');

let cache = {};

function getFullUrl(url) {
    return /^http/i.test(url) ? url : `http://${url}`;
}

async function createSite(url) {
    let siteUrl = getFullUrl(url);
    if (await isValidUrl(siteUrl) == false)
        throw 'Not valid url';

    let site = await SiteModel.findOne({ url: siteUrl });
    if (site == null) {
        site = new SiteModel({ url: siteUrl, lastRequestedTimestamp: new Date() });
    } else {
        if (site.finished == null)
            throw 'Site is on scan';
        if (parseInt((new Date() - new Date(site.lastRequestedTimestamp)) / (1000 * 60 * 60 * 24), 10) <= 1)
            throw `${url} was already requested today`;
        site.lastRequestedTimestamp = new Date();
    }

    return site;
}

async function getSiteStructure(site) {
    let siteStructure = [{ parent:null, url: site.url, depth: 0 }];

    for (let currentDepth = 1; currentDepth <= site.depth; currentDepth++) {
        let crawlUrls = siteStructure.filter(url => url.depth == currentDepth - 1);
        for (let i = 0; i < crawlUrls.length; i++) {
            let isSeenBefore = siteStructure.filter(url => url.depth < currentDepth && url.url == crawlUrls[i].url).length == 0;
            if (isSeenBefore) //Don't crawl the same url twice.
                continue;
            await sleep(Math.random() * 10 * 1000); //Inorder not to get blocked.
            let currentUrls = await getUrls(crawlUrls[i].url);
            siteStructure.push(...currentUrls.map(url => { return { parent: crawlUrls[i].url, url: url, depth: currentDepth } }));
        }
    }

    return siteStructure;
}

async function getUrls(url) {
    return new Promise(function (resolve) {
        let siteHost = urlParse(url).host;
        request({ url, rejectUnauthorized: false, timeout: 10 * 1000, headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.61 Safari/537.36' } }, function (error, response, body) {
            if (error) {
                resolve([]);
                return;
            }
            let urls = [];
            $ = cheerio.load(body);
            links = $('a');
            $(links).each(function (i, link) {
                let currentLink = $(link).attr('href');
                if (currentLink != null) {
                    if (currentLink.startsWith(siteHost))
                        currentLink = 'http://' + currentLink;
                    else if (currentLink.startsWith('http') == false)
                        currentLink = `http://${siteHost}${currentLink}`;

                    urls.push(currentLink);
                }
            });
            resolve(Array.from(new Set(urls)).filter(async url => await isValidUrl(url)));
        }).on('error', function (err) {
            resolve([])
        });
    });
}

function sleep(duration) {
    return new Promise(function (resolve) {
        setTimeout(function () {
            resolve();
        }, duration);
    });
}

function isValidUrl(url) {
    if (url in cache && parseInt((new Date() - cache[url].timestamp) / (1000 * 60 * 60 * 24), 10) <= 1)
        return cache[url].isValidUrl;

    return new Promise(function (resolve) {
        request({ url: url, method: 'HEAD', timeout: 10 * 1000, headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.61 Safari/537.36' } }, function (err, res) {
            let isValidUrl = err != null || /(2|3)\d\d/.test(res.statusCode);
            cache[url] = { isValidUrl: isValidUrl, timestamp: new Date() };
            resolve(isValidUrl);
        }).on('error', function () {
            resolve(false)
        });
    });
}

async function createNewScan(site) {
    let scan = new ScanModel({ depth: site.depth });
    await scan.save();
    site.scans.push(scan._id);
    return scan;
}


async function saveSiteStructure(scan, siteStructure) {
    scan.pages = siteStructure;
}

async function getSite(url) {
    let site = await SiteModel.findOne({ url: getFullUrl(url) });
    let scans = await ScanModel.find({ _id: { $in: site.scans.slice(site.scans.length - 2) } });
    let lastFinishedScan = null;
    let isAnotherScanIsProcessed = false;
    if(scans.length == 2) {
        lastFinishedScan = scans[1].finished == null ? scans[0] : scans[1];
        isAnotherScanIsProcessed = scans[1].finished == null;
    } else  {
        lastFinishedScan = scans[0];
        isAnotherScanIsProcessed = scans[0].finished == null;
    }
    return {site, lastFinishedScan, isAnotherScanIsProcessed};
}

module.exports = {
    createSite,

    createNewScan,

    getSiteStructure,

    saveSiteStructure,

    getSite
};
