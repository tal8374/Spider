var crawlerService = require('../services/crawler.service');

async function crawlSite(req, res) {
    try {
        let site = await crawlerService.createSite(req.body.url);
        let scan = await crawlerService.createNewScan(site);
        res.send(site);
        let siteStructure = await crawlerService.getSiteStructure(site);
        await crawlerService.saveSiteStructure(scan, siteStructure);
        scan.finished = new Date();
        await scan.save();
        await site.save();

    } catch (error) {
        res.send(error.toString())
    }
}

async function getSite(req, res) {
    try {
        res.send(await crawlerService.getSite(req.query.url));
    } catch (error) {
        res.send(error.toString())
    }
}

module.exports = {
    crawlSite,

    getSite,
};
