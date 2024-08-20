const mongoose = require("mongoose");

var Schema = mongoose.Schema;

module.exports = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String, default: "" },
  },
  { collection: "Tag" }
);
