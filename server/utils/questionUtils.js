const Tag = require("../models/tagsModel");
const User = require("../models/usersModel");
const sanitizeHtml = require("sanitize-html");
const Question = require("../models/questionsModel");

/**
 * Retrieves the maximum answer date from a given question's answers.
 *
 * @param question The question object to extract answer dates from.
 * @return The maximum answer date among the answers associated with the question.
 */
const getMaxAnsDate = (question) => {
  if (!question || !question.answers || question.answers.length === 0) {
    return 0;
  }
  const answerDates = question.answers.map((answer) => {
    return answer.ans_date_time;
  });
  return Math.max(...answerDates);
};

/**
 * Adds a new question to the database along with updating the user's asked question count.
 *
 * @param questionToAdd The question object to be added.
 * @param tags An array of tag objects associated with the question.
 * @return The newly created question object.
 */
const addQuestionToDB = async (questionToAdd, tags) => {
  const updatedUser = await User.findOneAndUpdate(
    { _id: questionToAdd.asked_by._id },
    { $inc: { questions_asked: 1 } },
    { new: true }
  );
  let question = await Question.create({
    title: sanitizeInput(questionToAdd.title),
    text: sanitizeInput(questionToAdd.text),
    asked_by: updatedUser,
    ask_date_time: new Date(questionToAdd.ask_date_time),
    tags: tags,
  });
  return question;
};

/**
 * Retrieves a list of questions from the database based on specified ordering criteria.
 *
 * @param order The order type for sorting questions ("newest", "unanswered", or "active").
 * @return An array of questions sorted according to the specified order.
 */
const getQuestionsByOrderFromDB = async (order) => {
  let qlist = await Question.find({ approved: true })
    .populate({
      path: "answers",
      match: { approved: true },
      populate: {
        path: "ans_by",
        select: "-password -role -saved_posts -refreshToken",
      },
    })
    .populate({
      path: "asked_by",
      select: "-password -role -saved_posts -refreshToken",
    })
    .populate("tags");

  if (order === "newest") {
    qlist.sort((a, b) => b.ask_date_time - a.ask_date_time);
  } else if (order === "unanswered") {
    qlist = qlist.filter((question) => question.answers.length === 0);
    qlist.sort((a, b) => b.ask_date_time - a.ask_date_time);
  } else if (order === "active") {
    qlist.sort((a, b) => b.ask_date_time - a.ask_date_time);
    qlist.sort((a, b) => {
      return getMaxAnsDate(b) - getMaxAnsDate(a);
    });
  }
  return qlist;
};

/**
 * Filters a list of questions based on a search string.
 *
 * @param qlist The list of questions to filter.
 * @param search The search string used to filter questions.
 * @return A filtered array of questions matching the search criteria.
 */
const filterQuestionsBySearchFromDB = (qlist, search) => {
  let qlist2 = [...qlist];
  if (search.length > 0) {
    search = search.trim().toLowerCase();
    const searchTags = search.match(/\[([^\]]+)\]/g);
    const nonTags = search
      .replace(/\[([^\]]+)\]/g, "")
      .trim()
      .split(/\s+/);
    let mergedList = [];
    if (searchTags) {
      const tagNames = searchTags.map((tag) =>
        tag.replace(/\[|\]/g, "").toLowerCase()
      );
      qlist = qlist.filter((question) =>
        question.tags.some((tag) => tagNames.includes(tag.name.toLowerCase()))
      );
      mergedList = [...qlist];
    }
    if (nonTags && nonTags[0] !== "") {
      nonTags.forEach((t) => {
        qlist2 = qlist2.filter((question) => {
          return (
            question.title.toLowerCase().includes(t) ||
            question.text.toLowerCase().includes(t)
          );
        });
      });
      qlist2.forEach((q) => {
        if (!mergedList.includes(q)) {
          mergedList.push(q);
        }
      });
    }
    mergedList.sort((a, b) => b.askDate - a.askDate);
    return mergedList;
  }
  return qlist;
};

/**
 * Retrieves a list of interest-based questions from the database for a user.
 *
 * @param interestTags An array of tags representing the user's interests.
 * @param order The order type for sorting questions ("newest", "unanswered", or "active").
 * @return An array of interest-based questions sorted according to the specified order.
 */
const getInterestQuestionsByUserFromDB = async (interestTags, order) => {
  const tagIds = await Tag.distinct("_id", { name: { $in: interestTags } });
  let interestQuestions = await Question.find({
    tags: { $in: tagIds },
    approved: true,
  })
    .populate({
      path: "answers",
      match: { approved: true },
      populate: {
        path: "ans_by",
        select: "-password -role -saved_posts -refreshToken",
      },
    })
    .populate({
      path: "asked_by",
      select: "-password -role -saved_posts -refreshToken",
    })
    .populate("tags");

  if (order === "newest") {
    interestQuestions.sort((a, b) => b.ask_date_time - a.ask_date_time);
  } else if (order === "unanswered") {
    interestQuestions = interestQuestions.filter(
      (question) => question.answers.length === 0
    );
    interestQuestions.sort((a, b) => b.ask_date_time - a.ask_date_time);
  } else if (order === "active") {
    interestQuestions.sort((a, b) => b.ask_date_time - a.ask_date_time);
    interestQuestions.sort((a, b) => {
      return getMaxAnsDate(b) - getMaxAnsDate(a);
    });
  }
  return interestQuestions;
};

/**
 * Updates the view count of a question in the database.
 *
 * @param qid The ID of the question to update.
 * @return The updated question object with the incremented view count.
 */
const updateQuestionViewCountInDB = async (qid) => {
  return Question.findOneAndUpdate(
    { _id: qid },
    { $inc: { views: 1 } },
    { new: true }
  )
    .populate({
      path: "answers",
      populate: {
        path: "comments",
        populate: {
          path: "comment_by",
          select: "-password -role -saved_posts -refreshToken",
        },
      },
    })
    .populate({
      path: "answers",
      populate: {
        path: "ans_by",
        select: "-password -role -saved_posts -refreshToken",
      },
    })
    .populate({
      path: "comments",
      populate: {
        path: "comment_by",
        select: "-password -role -saved_posts -refreshToken",
      },
    })
    .populate({
      path: "asked_by",
      select: "-password -role -saved_posts -refreshToken",
    });
};

/**
 * Retrieves questions posted by a specific user from the database.
 *
 * @param email The email of the user whose posted questions are to be retrieved.
 * @return An array of questions posted by the specified user.
 */
const getUserPostedQuestionsFromDB = async (email) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("User not found");
  }
  const userPostedQuestions = await Question.find({ asked_by: user._id });

  return userPostedQuestions;
};

/**
 * Retrieves unapproved questions from the database.
 *
 * @return An array of unapproved questions.
 */
const getUnapprovedQuestionsFromDB = async () => {
  const unapprovedQuestions = await Question.find({ approved: false })
    .populate({
      path: "asked_by",
      select: "-password -role -saved_posts -refreshToken",
    })
    .populate("tags");
  return unapprovedQuestions;
};

/**
 * Updates the approval status of a question in the database.
 *
 * @param qid The ID of the question to update.
 * @param approved The new approval status (true or false).
 * @return An updated list of unapproved questions after the specified question's status change.
 */
const updateQuestionStatusInDB = async (qid, approved) => {
  if (approved === false) {
    await Question.deleteOne({ _id: qid });
  } else {
    await Question.findOneAndUpdate(
      { _id: qid },
      { approved: approved },
      { new: true }
    );
  }

  const unapprovedQuestions = await Question.find({ approved: false })
    .populate({
      path: "asked_by",
      select: "-password -role -saved_posts -refreshToken",
    })
    .populate("tags");

  return unapprovedQuestions;
};

/**
 * Retrieves comments associated with a specific question from the database.
 *
 * @param id The ID of the question to retrieve comments for.
 * @return An array of comments associated with the specified question.
 */
const getCommentsFromDB = async (id) => {
  const question = await Question.findOne({ _id: id }).populate({
    path: "comments",
    populate: {
      path: "comment_by",
      select: "-password -role -saved_posts -refreshToken",
    },
  });
  if(question.comments == null) {
    return [];
  }
  return question.comments;
};

/**
 * Adds an upvote to a question and manages the user's upvoted_entity list.
 *
 * @param qid The ID of the question to be upvoted.
 * @param userEmail The email of the user performing the upvote.
 * @param doubleClicked Indicates if the upvote action is a double-click (to undo).
 * @return The updated question object after the upvote action.
 */
const addVoteQuestionDB = async (qid, userEmail, doubleClicked) => {
  let question = await Question.findOneAndUpdate(
    { _id: qid },
    { $inc: { votes: 1 } },
    { new: true }
  );
  userEmail = sanitizeInput(userEmail);
  if (doubleClicked) {
    await User.findOneAndUpdate(
      { email: userEmail },
      { $pull: { downvoted_entity: qid } },
      { upsert: true }
    );
  } else {
    await User.findOneAndUpdate(
      { email: userEmail },
      { $addToSet: { upvoted_entity: qid }, $pull: { downvoted_entity: qid } },
      { upsert: true }
    );
  }

  return question;
};

/**
 * Removes a vote (upvote or downvote) from a question and adjusts the user's upvoted_entity or downvoted_entity accordingly.
 *
 * @param qid The ID of the question from which the vote is removed.
 * @param userEmail The email of the user performing the action.
 * @param doubleClicked Indicates if the action is to undo a previous vote.
 * @return The updated question object after removing the vote.
 */
const removeVoteQuestionDB = async (qid, userEmail, doubleClicked) => {
  let question = await Question.findOneAndUpdate(
    { _id: qid },
    { $inc: { votes: -1 } },
    { new: true }
  );
  userEmail = sanitizeInput(userEmail);
  if (doubleClicked) {
    await User.findOneAndUpdate(
      { email: userEmail },
      { $pull: { upvoted_entity: qid } },
      { upsert: true }
    );
  } else {
    await User.findOneAndUpdate(
      { email: userEmail },

      { $addToSet: { downvoted_entity: qid }, $pull: { upvoted_entity: qid } },

      { upsert: true }
    );
  }

  return question;
};

/**
 * Switches the vote (upvote to downvote or vice versa) on a question and updates the user's upvoted_entity or downvoted_entity accordingly.
 *
 * @param qid The ID of the question for which the vote is switched.
 * @param userEmail The email of the user performing the action.
 * @param switchTo The target vote type ("up" for upvote, "down" for downvote).
 * @return The updated question object after switching the vote.
 */
const switchVoteQuestionDB = async (qid, userEmail, switchTo) => {
  let question = await Question.findOneAndUpdate(
    { _id: qid },
    { $inc: { votes: switchTo == "up" ? 2 : -2 } },
    { new: true }
  );
  userEmail = sanitizeInput(userEmail);
  if (switchTo == "up") {
    await User.findOneAndUpdate(
      { email: userEmail },
      { $addToSet: { upvoted_entity: qid }, $pull: { downvoted_entity: qid } },
      { upsert: true }
    );
  } else {
    await User.findOneAndUpdate(
      { email: userEmail },
      { $addToSet: { downvoted_entity: qid }, $pull: { upvoted_entity: qid } },
      { upsert: true }
    );
  }

  return question;
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
  getMaxAnsDate,
  addQuestionToDB,
  addVoteQuestionDB,
  getCommentsFromDB,
  switchVoteQuestionDB,
  removeVoteQuestionDB,
  updateQuestionStatusInDB,
  getQuestionsByOrderFromDB,
  updateQuestionViewCountInDB,
  getUnapprovedQuestionsFromDB,
  getUserPostedQuestionsFromDB,
  filterQuestionsBySearchFromDB,
  getInterestQuestionsByUserFromDB,
};
