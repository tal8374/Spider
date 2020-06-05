const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var PageSchema = new Schema({
    url: { type: Schema.Types.String },
    parent: { type: Schema.Types.String },
    depth: { type: Schema.Types.Number },
});

var scanSchema = new Schema({
    started: { type: Schema.Types.Date, default: new Date() },
    finished: { type: Schema.Types.Date },
    depth: { type: Schema.Types.Number, required: true },
    pages: { type: [PageSchema], default: [] },
});

module.exports = mongoose.model('Scan', scanSchema);
