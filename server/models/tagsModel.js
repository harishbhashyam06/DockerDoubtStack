const mongoose = require("mongoose");

const Tag = require("./schema/tagSchema");

module.exports = mongoose.model("Tag", Tag);
