const mongoose = require("mongoose");

var Schema = mongoose.Schema;
module.exports = new Schema(
  {
    title: { type: String, required: true },
    text: { type: String, required: true },
    asked_by: { type: Schema.Types.ObjectId, ref: "User", required: true },
    ask_date_time: { type: Date, required: true },
    views: { type: Number, default: 0 },
    answers: [{ type: Schema.Types.ObjectId, ref: "Answer" }],
    tags: [{ type: Schema.Types.ObjectId, ref: "Tag", required: true }],
    votes: { type: Number, default: 0 },
    comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
    approved: { type: Boolean, default: false },
  },
  { collection: "Question" }
);
