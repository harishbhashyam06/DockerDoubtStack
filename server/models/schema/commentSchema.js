const mongoose = require("mongoose");

var Schema = mongoose.Schema;

module.exports = new Schema(
  {
    comment_type: {
      type: String,
      enum: ["question", "answer"],
      required: true,
    },
    text: { type: String, required: true },
    votes: { type: Number, default: 0 },
    comment_by: { type: Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: Date, required: true },
  },
  { collection: "Comment" }
);
