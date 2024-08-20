const mongoose = require("mongoose");

const { Schema } = mongoose;

const userSchema = new Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String , required: true},
    role: { type: String, enum: ["user", "mod"], required: true },
    mod_for: { type: Schema.Types.ObjectId, ref: "Tag" },
    password: { type: String, required: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    profile_pic_large: { type: String },
    profile_pic_small: { type: String },
    about_me: { type: String },
    joined_on: { type: Date, required: true },
    saved_posts: [{ type: Schema.Types.ObjectId, ref: "Question" }],
    interests: [{ type: Schema.Types.ObjectId, ref: "Tag" }],
    upvoted_entity: [{ type: Schema.Types.ObjectId }],
    downvoted_entity: [{ type: Schema.Types.ObjectId }],
    answered_questions: { type: Number, default: 0 },
    questions_asked: { type: Number, default: 0 },
    comments: { type: Number },
    refreshToken: { type: String },
  },
  { collection: "User" }
);

module.exports = userSchema;
