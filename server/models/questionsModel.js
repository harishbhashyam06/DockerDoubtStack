const mongoose = require("mongoose");

const Question = require("./schema/questionSchema");

module.exports = mongoose.model("Question", Question);
