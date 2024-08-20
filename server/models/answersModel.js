const mongoose = require("mongoose");

const Answer = require("./schema/answerSchema");

module.exports = mongoose.model("Answer", Answer);
