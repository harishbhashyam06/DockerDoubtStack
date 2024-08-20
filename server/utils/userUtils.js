const User = require("../models/usersModel");
const Answer = require("../models/answersModel");
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
 * Checks if a user with the specified username (email) exists in the database.
 *
 * @param username The username (email) of the user to check.
 * @returns A Promise that resolves to the user object if found, otherwise null.
 */
const checkIfUserExsistsInDB = async (username) => {
  const user = await User.findOne({ email: username });
  return user;
};

/**
 * Saves a user object to the database.
 *
 * @param user The user object to be saved.
 */
const saveUserToDB = async (user) => {
  user.save();
};

/**
 * Removes the refreshToken field from a user document in the database.
 *
 * @param refreshToken The refreshToken to be removed.
 */
const removeUserRefreshTokenInDB = async (refreshToken) => {
  User.findOneAndUpdate({ refreshToken }, { $unset: { refreshToken: 1 } });
};

/**
 * Retrieves user interests by email from the database.
 *
 * @param email The email of the user whose interests are to be retrieved.
 * @returns A Promise that resolves to an array of user interests.
 */
const getUserInterestsFromDB = async (email) => {
  try {
    const user = await User.findOne({ email: email }).populate("interests");
    const interestNames = user.interests.map((interest) => interest.name);
    return interestNames;
  } catch (error) {
    console.error("Error fetching user interests:", error);
    throw new Error("Failed to fetch user interests");
  }
};

/**
 * Retrieves saved questions for a user from the database based on email and sorting order.
 *
 * @param email The email of the user whose saved questions are to be retrieved.
 * @param order The sorting order for the retrieved questions ("newest", "unanswered", or "active").
 * @returns A Promise that resolves to an array of saved questions.
 */
const getSavedQuestionsFromDB = async (email, order) => {
  let users = await User.find({ email: email }).populate({
    path: "saved_posts",
    populate: [
      {
        path: "answers",
        populate: {
          path: "ans_by",
          select: "-password -role -saved_posts -refreshToken",
        },
      },
      {
        path: "asked_by",
        select: "-password -role -saved_posts -refreshToken",
      },
      {
        path: "tags",
      },
    ],
  });

  let questions = users[0].saved_posts;

  if (order === "newest") {
    questions.sort((a, b) => b.ask_date_time - a.ask_date_time);
  } else if (order === "unanswered") {
    questions = questions.filter((question) => question.answers.length === 0);
    questions.sort((a, b) => b.ask_date_time - a.ask_date_time);
  } else if (order === "active") {
    questions.sort((a, b) => b.ask_date_time - a.ask_date_time);
    questions.sort((a, b) => {
      return getMaxAnsDate(b) - getMaxAnsDate(a);
    });
  }
  return questions;
};

/**
 * Retrieves all users from the database except the specified user (email).
 *
 * @param email The email of the user to exclude from the retrieved user list.
 * @returns A Promise that resolves to an array of user objects.
 */
const getAllUsersDB = async (email) => {
  let users = await User.find()
    .ne("email", email)
    .select("firstName lastName email profile_pic_large interests joined_on")
    .populate({
      path: "interests",
      select: "name",
    });

  return users;
};

/**
 * Retrieves user profile information (excluding password and refreshToken) by email from the database.
 *
 * @param email The email of the user whose profile information is to be retrieved.
 * @returns A Promise that resolves to the user profile information.
 */
const getUserProfileInfoFromDB = async (email) => {
  let user = await User.find({ email: email })
    .select("-password -refreshToken")
    .populate("interests");
  return user;
};

/**
 * Retrieves user profile information (excluding password and refreshToken) by email from the database.
 *
 * @param email The email of the user whose profile information is to be retrieved.
 * @returns A Promise that resolves to the user profile information.
 */
const getUserProfileByEmailFromDB = async (email) => {
  let user = await User.findOne({ email: email })
    .select("-password -refreshToken")
    .populate("interests");
  return user;
};

/**
 * Retrieves users from the database based on a searched user string (searchedUser).
 *
 * @param searchedUser The string used for searching users by email, firstName, or lastName.
 * @returns A Promise that resolves to an array of matched users.
 */
const getSearchedUsersFromDB = async (searchedUser) => {
  const nameParts = searchedUser.split(" ");

  let users = await User.find({
    $or: [
      { email: { $regex: nameParts.join("|"), $options: "i" } },
      { firstName: { $regex: nameParts.join("|"), $options: "i" } },
      { lastName: { $regex: nameParts.join("|"), $options: "i" } },
    ],
  })
    .populate("interests")
    .select("-password -role -saved_posts -refreshToken");

  return users;
};

/**
 * Retrieves user posts (questions and answers) from the database based on userEmail.
 *
 * @param userEmail The email of the user whose posts are to be retrieved.
 * @returns A Promise that resolves to an object containing arrays of approved and unapproved questions and answers.
 */
const getUserPostsFromDB = async (userEmail) => {
  const user = await User.findOne({ email: userEmail });
  if (!user) {
    throw new Error("User not found");
  }
  const ques = await Question.find({
    asked_by: user,
  })
    .populate({
      path: "asked_by",
      select: "-password -role -saved_posts -refreshToken",
    })
    .populate("tags");

  const approvedQuestions = [];
  const unapprovedQuestions = [];

  ques.forEach((question) => {
    if (question.approved) {
      approvedQuestions.push(question);
    } else {
      unapprovedQuestions.push(question);
    }
  });

  const ans = await Answer.find({ ans_by: user }).populate({
    path: "ans_by",
    select: "-password -role -saved_posts -refreshToken ",
  });

  const answerIds = ans.map((answer) => answer._id);
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
  ans.forEach((answer) => {
    let ans = {
      ...answer._doc,
      question: answerIdToQuestionTitleMap[answer._id],
    };
    resAns.push(ans);
  });

  const approvedAnswers = [];
  const unapprovedAnswers = [];

  resAns.forEach((answer) => {
    if (answer.approved) {
      approvedAnswers.push(answer);
    } else {
      unapprovedAnswers.push(answer);
    }
  });

  return {
    unapprovedQuestions: unapprovedQuestions,
    approvedQuestions: approvedQuestions,
    approvedAnswers: approvedAnswers,
    unapprovedAnswers: unapprovedAnswers,
  };
};

/**
 * Deletes a user post (question or answer) from the database based on type ("question" or "answer") and ID.
 *
 * @param type The type of post to delete ("question" or "answer").
 * @param id The ID of the post to delete.
 */
const deleteUserPostsInDB = async (type, id) => {
  if (type === "question") {
    await Question.deleteOne({ _id: id });
  } else {
    await Answer.deleteOne({ _id: id });
  }
};

/**
 * Updates a user's list of saved questions in the database based on the specified update type.
 *
 * @param {string} uid - The ID of the user whose saved questions list will be updated.
 * @param {string} qid - The ID of the question to be added or removed from the user's saved questions list.
 * @param {string} updateType - The type of update operation to perform ('add' to add a question, 'remove' to remove a question).
 * @returns {Promise<Object>} A Promise that resolves to the updated user object containing the modified saved_posts array.
 * @throws {Error} If there's an error during the database operation, if the user ID (uid) is invalid, or if the updateType is invalid.
 */
const updateUserSavedQuestionsInDB = async (uid, qid, updateType) => {
  let user = null;
  if(updateType == "save") {
    user = await User.findOneAndUpdate(
      { _id: uid },
      { $push: { saved_posts: { $each: [qid], $position: 0 } } },
      { new: true }
    );
  } else {
    user = await User.findOneAndUpdate(
      { _id: uid },
      { $pull: { saved_posts: qid } },
      { new: true }
    );
  }
  return user;
};

module.exports = {
  getMaxAnsDate,
  saveUserToDB,
  getAllUsersDB,
  getUserPostsFromDB,
  deleteUserPostsInDB,
  checkIfUserExsistsInDB,
  getSearchedUsersFromDB,
  getUserInterestsFromDB,
  getSavedQuestionsFromDB,
  getUserProfileInfoFromDB,
  removeUserRefreshTokenInDB,
  getUserProfileByEmailFromDB,
  updateUserSavedQuestionsInDB,
};
