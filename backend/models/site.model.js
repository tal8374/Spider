const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let siteSchema = new mongoose.Schema({
    url: { type: Schema.Types.String, required: true },
    lastRequestedTimestamp: { type: Schema.Types.Date, default: new Date() },
    depth: { type: Schema.Types.Number, default: 1 },
    scans: [{ type: Schema.Types.ObjectId, ref: 'Scan' }]
});

module.exports = mongoose.model('Site', siteSchema);
