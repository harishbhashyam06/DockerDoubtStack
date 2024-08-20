const mongoose = require("mongoose");

const User = require("./schema/userSchema");

module.exports = mongoose.model("User", User);
