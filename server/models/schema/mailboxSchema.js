const mongoose = require("mongoose");

var Schema = mongoose.Schema;

module.exports = new Schema(
  {
    // add relevant properties.
    mail_from: { type: Schema.Types.ObjectId, ref: "User", required: true },
    mail_to: { type: Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: Date, required: true },
    message: { type: String, required: true },
  },
  { collection: "Mailbox" }
);
