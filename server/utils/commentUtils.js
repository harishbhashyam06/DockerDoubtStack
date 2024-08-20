const User = require("../models/usersModel");
const sanitizeHtml = require("sanitize-html");
const Answer = require("../models/answersModel");
const Comment = require("../models/commentsModel");
const Question = require("../models/questionsModel");

/**
 * Adds a new comment to the database and associates it with a specific answer or question.
 *
 * @param comment The comment object to be added.
 * @param id The ID of the associated answer or question.
 * @param type The type of the associated entity ("answer" or "question").
 * @return The newly created comment object.
 */
const addCommentToDB = async (comment, id, type) => {
  comment.text = sanitizeInput(comment.text);
  let createdComment = await Comment.create(comment);

  if (type == "answer") {
    await Answer.findOneAndUpdate(
      { _id: id },
      { $push: { comments: { $each: [createdComment._id], $position: 0 } } },
      { new: true }
    );
  } else {
    await Question.findOneAndUpdate(
      { _id: id },
      { $push: { comments: { $each: [createdComment._id], $position: 0 } } },
      { new: true }
    );
  }

  return createdComment;
};

/**
 * Adds an upvote to a comment and manages the user's upvoted_entity list.
 *
 * @param cid The ID of the comment to be upvoted.
 * @param userEmail The email of the user performing the upvote.
 * @param doubleClicked Indicates if the upvote action is a double-click (to undo).
 * @return The updated comment object after the upvote action.
 */
const addVoteCommentDB = async (cid, userEmail, doubleClicked) => {
  let comment = await Comment.findOneAndUpdate(
    { _id: cid },
    { $inc: { votes: 1 } },
    { new: true }
  );
  userEmail = sanitizeInput(userEmail);
  if (doubleClicked) {
    await User.findOneAndUpdate(
      { email: userEmail },
      { $pull: { downvoted_entity: cid } },
      { upsert: true }
    );
  } else {
    await User.findOneAndUpdate(
      { email: userEmail },
      { $addToSet: { upvoted_entity: cid }, $pull: { downvoted_entity: cid } },
      { upsert: true }
    );
  }

  return comment;
};

/**
 * Removes a vote (upvote or downvote) from a comment and adjusts the user's upvoted_entity or downvoted_entity accordingly.
 *
 * @param cid The ID of the comment from which the vote is removed.
 * @param userEmail The email of the user performing the action.
 * @param doubleClicked Indicates if the action is to undo a previous vote.
 * @return The updated comment object after removing the vote.
 */
const removeVoteCommentDB = async (cid, userEmail, doubleClicked) => {
  let comment = await Comment.findOneAndUpdate(
    { _id: cid },
    { $inc: { votes: -1 } },
    { new: true }
  );
  userEmail = sanitizeInput(userEmail);
  if (doubleClicked) {
    await User.findOneAndUpdate(
      { email: userEmail },
      { $pull: { upvoted_entity: cid } },
      { upsert: true }
    );
  } else {
    await User.findOneAndUpdate(
      { email: userEmail },

      { $addToSet: { downvoted_entity: cid }, $pull: { upvoted_entity: cid } },

      { upsert: true }
    );
  }

  return comment;
};

/**
 * Switches the vote (upvote to downvote or vice versa) on a comment and updates the user's upvoted_entity or downvoted_entity accordingly.
 *
 * @param cid The ID of the comment for which the vote is switched.
 * @param userEmail The email of the user performing the action.
 * @param switchTo The target vote type ("up" for upvote, "down" for downvote).
 * @return The updated comment object after switching the vote.
 */
const switchVoteCommentDB = async (cid, userEmail, switchTo) => {
  let comment = await Comment.findOneAndUpdate(
    { _id: cid },
    { $inc: { votes: switchTo == "up" ? 2 : -2 } },
    { new: true }
  );
  userEmail = sanitizeInput(userEmail);
  if (switchTo == "up") {
    await User.findOneAndUpdate(
      { email: userEmail },
      { $addToSet: { upvoted_entity: cid }, $pull: { downvoted_entity: cid } },
      { upsert: true }
    );
  } else {
    await User.findOneAndUpdate(
      { email: userEmail },
      { $addToSet: { downvoted_entity: cid }, $pull: { upvoted_entity: cid } },
      { upsert: true }
    );
  }

  return comment;
};

/**
 * Sanitizes input using the sanitizeHtml library to prevent HTML/JS code injection.
 * @param {string} input - The input string to be sanitized.
 * @returns {string} - The sanitized input string.
 */
const sanitizeInput = (input) => {
  return sanitizeHtml(input);
};

module.exports = {
  addCommentToDB,
  addVoteCommentDB,
  removeVoteCommentDB,
  switchVoteCommentDB,
};
