const mongoose = require("mongoose");

var Schema = mongoose.Schema;
module.exports = new Schema(
  {
    text: { type: String, required: true },
    ans_by: { type: Schema.Types.ObjectId, ref: "User", required: true },
    ans_date_time: { type: Date, required: true },
    votes: { type: Number, default: 0 },
    comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
    approved: { type: Boolean, default: false },
  },
  { collection: "Answer" }
);
