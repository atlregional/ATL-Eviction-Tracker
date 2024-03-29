const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const filingsByCountyMonthSchema = new Schema({
	FilingMonth: { type: String, required: true },
	FilingMonthISO: { type: Date, required: true },
	CountyID: { type: String, required: true },
	TotalFilings: { type: Number, required: true },
	AnsweredFilings: { type: Number, required: true },
	BaselineFilings: { type: Number, required: true }
});

const filingsByCountyMonth = mongoose.model(
	'filingsByCountyMonth',
	filingsByCountyMonthSchema
);

module.exports = filingsByCountyMonth;
