const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const filingsByTractDailySchema = new Schema({
	FilingDate: { type: String, required: true },
	TractID: { type: String, required: true },
	CountyID: { type: String, required: true },
	TotalFilings: { type: String, required: true },
	TotalAnsweredFilings: { type: String, required: true }
	// UniqueIdentifier: { type: String, required: true }
}, {collection: 'filingsbytractdaily'});

const filingsByTractDaily = mongoose.model(
	'filingsbytractaily',
	filingsByTractDailySchema
);

module.exports = filingsByTractDaily;
