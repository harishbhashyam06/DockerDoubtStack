const mongoose = require("mongoose");

const Mailbox = require("./schema/mailboxSchema");

module.exports = mongoose.model("Mailbox", Mailbox);
