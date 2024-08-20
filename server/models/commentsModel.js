const mongoose = require("mongoose");

const Comment = require("./schema/commentSchema");

module.exports = mongoose.model("Comment", Comment);
