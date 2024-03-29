const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const filingsByTractMonthSchema = new Schema({
  // FilingMonth: { type: String, required: true },
  TractID: { type: String, required: true },
  CountyID: { type: String, required: true },
  FilingsByMonth: { type: Object, required: true },
});

const filingsByTractMonth = mongoose.model(
  "filingsByTractMonth",
  filingsByTractMonthSchema
);

module.exports = filingsByTractMonth;
