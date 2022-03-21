const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CasesSchema = new Schema({
	id: { type: String, required: true },
	street: { type: String, required: true },
	city: { type: String, required: true },
	zip: { type: String, required: true },
	fileDate: { type: String, required: true },
	answer: { type: String, required: true },
	county: { type: String, required: true },
	geometry: { type: Object, required: true },
	services: { type: String, required: true },
	dismiss: { type: String, required: true },
	defaultJudgment: { type: String, required: true },
	judgment: { type: String, required: true },
	answerDate: { type: String, required: true },
	servicesDate: { type: String, required: true },
	dismissDate: { type: String, required: true },
	defaultJudgmentDate: { type: String, required: true },
	judgmentDate: { type: String, required: true },
	tractID: { type: String, required: true },
	blockGroupID: { type: String, required: true },
  latitude: { type: String, required: true },
  longitude: { type: String, required: true },
  street: { type: String, required: false },
  streetAddress:  { type: String, required: true }
});

const Case = mongoose.model('case', CasesSchema);

module.exports = Case;
