const User = require("../models/usersModel");
const sanitizeHtml = require("sanitize-html");
const Answer = require("../models/answersModel");
const Question = require("../models/questionsModel");

/**
 * Adds an answer to the database and updates the corresponding user's answered_questions count.
 * @param {Object} ans - The answer object to be added.
 * @param {string} qid - The ID of the question to which the answer is added.
 * @returns {Promise<Object>} - The newly added answer object.
 */
const addAnswerToDB = async (ans, qid) => {
  ans.text = sanitizeInput(ans.text);
  const updatedUser = await User.findOneAndUpdate(
    { _id: ans.ans_by._id },
    { $inc: { answered_questions: 1 } },
    { new: true }
  );
  ans.ans_by = updatedUser;
  let answer = await Answer.create(ans);

  await Question.findOneAndUpdate(
    { _id: qid },
    { $push: { answers: { $each: [answer._id], $position: 0 } } },
    { new: true }
  );

  return answer;
};

/**
 * Retrieves unapproved answers from the database along with their corresponding question titles.
 * @returns {Promise<Array>} - Array of unapproved answer objects with associated question titles.
 */
const getUnapprovedAnswersFromDB = async () => {
  try {
    const unapprovedAnswers = await Answer.find({ approved: false }).populate({
      path: "ans_by",
      select: "-password -role -saved_posts -refreshToken ",
    });

    const answerIds = unapprovedAnswers.map((answer) => answer._id);
    const questionTitles = await Question.aggregate([
      {
        $match: {
          answers: { $in: answerIds },
        },
      },
      {
        $project: {
          _id: 1,
          title: 1,
          answers: 1,
        },
      },
    ]);

    const answerIdToQuestionTitleMap = {};
    questionTitles.forEach((question) => {
      question.answers.forEach((answerId) => {
        if (!(answerId in answerIdToQuestionTitleMap)) {
          answerIdToQuestionTitleMap[answerId] = question.title;
        }
      });
    });

    resAns = [];
    unapprovedAnswers.forEach((answer) => {
      let ans = {
        ...answer._doc,
        question: answerIdToQuestionTitleMap[answer._id],
      };
      resAns.push(ans);
    });

    return resAns;
  } catch (error) {
    console.error(error);
    throw new Error("Error fetching unapproved answers");
  }
};

/**
 * Retrieves comments for a specific answer from the database.
 * @param {string} id - The ID of the answer for which comments are retrieved.
 * @returns {Promise<Array>} - Array of comments associated with the specified answer.
 */
const getCommentsFromDB = async (id) => {
  const answer = await Answer.findOne({ _id: id }).populate({
    path: "comments",
    populate: {
      path: "comment_by",
      select: "-password -role -saved_posts -refreshToken",
    },
  });
  return answer.comments;
};

/**
 * Updates the approval status of an answer in the database.
 * @param {string} aid - The ID of the answer to be updated.
 * @param {boolean} approved - The approval status to be set for the answer.
 * @returns {Promise<Array>} - Array of unapproved answer objects after update operation.
 */
const updateAnswerStatusInDB = async (aid, approved) => {
  if (approved === false) {
    await Answer.deleteOne({ _id: aid });
  } else {
    await Answer.findOneAndUpdate(
      { _id: aid },
      { approved: approved },
      { new: true }
    );
  }

  const unapprovedAnswers = await Answer.find({ approved: false }).populate({
    path: "ans_by",
    select: "-password -role -saved_posts -refreshToken",
  });

  return unapprovedAnswers;
};

/**
 * Adds a vote (upvote or downvote) to an answer in the database.
 * @param {string} aid - The ID of the answer to be voted on.
 * @param {string} userEmail - The email of the user casting the vote.
 * @param {boolean} doubleClicked - Indicates whether the vote action is a double-click.
 * @returns {Promise<Object>} - The updated answer object after the vote.
 */
const addVoteAnswerDB = async (aid, userEmail, doubleClicked) => {
  let answer = await Answer.findOneAndUpdate(
    { _id: aid },
    { $inc: { votes: 1 } },
    { new: true }
  );

  userEmail = sanitizeInput(userEmail);
  if (doubleClicked) {
    await User.findOneAndUpdate(
      { email: userEmail },
      { $pull: { downvoted_entity: aid } },
      { upsert: true }
    );
  } else {
    await User.findOneAndUpdate(
      { email: userEmail },
      { $addToSet: { upvoted_entity: aid }, $pull: { downvoted_entity: aid } },
      { upsert: true }
    );
  }

  return answer;
};

/**
 * Removes a vote (upvote or downvote) from an answer in the database.
 * @param {string} aid - The ID of the answer to be unvoted.
 * @param {string} userEmail - The email of the user removing the vote.
 * @param {boolean} doubleClicked - Indicates whether the unvote action is a double-click.
 * @returns {Promise<Object>} - The updated answer object after removing the vote.
 */
const removeVoteAnswerDB = async (aid, userEmail, doubleClicked) => {
  let answer = await Answer.findOneAndUpdate(
    { _id: aid },
    { $inc: { votes: -1 } },
    { new: true }
  );
  userEmail = sanitizeInput(userEmail);
  if (doubleClicked) {
    await User.findOneAndUpdate(
      { email: userEmail },
      { $pull: { upvoted_entity: aid } },
      { upsert: true }
    );
  } else {
    await User.findOneAndUpdate(
      { email: userEmail },

      { $addToSet: { downvoted_entity: aid }, $pull: { upvoted_entity: aid } },

      { upsert: true }
    );
  }

  return answer;
};

/**
 * Switches the vote (upvote to downvote or vice versa) for an answer in the database.
 * @param {string} aid - The ID of the answer to switch the vote for.
 * @param {string} userEmail - The email of the user switching the vote.
 * @param {string} switchTo - Indicates the type of vote to switch to ("up" or "down").
 * @returns {Promise<Object>} - The updated answer object after switching the vote.
 */
const switchVoteAnswerDB = async (aid, userEmail, switchTo) => {
  let answer = await Answer.findOneAndUpdate(
    { _id: aid },
    { $inc: { votes: switchTo == "up" ? 2 : -2 } },
    { new: true }
  );
  userEmail = sanitizeInput(userEmail);
  if (switchTo == "up") {
    await User.findOneAndUpdate(
      { email: userEmail },
      { $addToSet: { upvoted_entity: aid }, $pull: { downvoted_entity: aid } },
      { upsert: true }
    );
  } else {
    await User.findOneAndUpdate(
      { email: userEmail },
      { $addToSet: { downvoted_entity: aid }, $pull: { upvoted_entity: aid } },
      { upsert: true }
    );
  }

  return answer;
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
  addAnswerToDB,
  addVoteAnswerDB,
  getCommentsFromDB,
  switchVoteAnswerDB,
  removeVoteAnswerDB,
  updateAnswerStatusInDB,
  getUnapprovedAnswersFromDB,
};
