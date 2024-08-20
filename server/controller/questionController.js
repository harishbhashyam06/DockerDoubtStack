const express = require("express");

const User = require("../models/usersModel");
const { addTagToDB } = require("../utils/tagUtils");
const { addCommentToDB } = require("../utils/commentUtils");

const {
  getUserInterestsFromDB,
  getSavedQuestionsFromDB,
  updateUserSavedQuestionsInDB,
} = require("../utils/userUtils");
const {
  clearCache,
  updateCache,
  cacheMiddleware,
  loggerMiddleware,
  authenticateToken,
  checkModPrivilege,
} = require("../utils/serverUtils");
const {
  addQuestionToDB,
  getCommentsFromDB,
  addVoteQuestionDB,
  switchVoteQuestionDB,
  removeVoteQuestionDB,
  updateQuestionStatusInDB,
  getQuestionsByOrderFromDB,
  updateQuestionViewCountInDB,
  getUnapprovedQuestionsFromDB,
  getUserPostedQuestionsFromDB,
  filterQuestionsBySearchFromDB,
  getInterestQuestionsByUserFromDB,
} = require("../utils/questionUtils");

const sanitize = require("sanitize-html");
const allowedOrders = ["newest", "active", "unanswered"];

const router = express.Router();

/**
 * Retrieves questions based on specified filter criteria.
 * Route: GET /getQuestion
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>} Promise resolved when questions are retrieved and returned
 */
const getQuestionsByFilter = async (req, res) => {
  try {
    validateQuestionInput(req);
    sanitizeInput(req.query.search);
    const order = req.query.order || "newest";
    const search = req.query.search || "";
    const currentPage = req.query.currentPage
      ? parseInt(req.query.currentPage)
      : 1;

    let questions = await getQuestionsByOrderFromDB(order);
    questions = filterQuestionsBySearchFromDB(questions, search);

    const itemsPerPage = 10;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const slicedQuestions = questions.slice(startIndex, endIndex);

    const totalQuestions = questions.length;
    const totalPages = Math.ceil(totalQuestions / itemsPerPage);
    updateCache("getQuestionsByFilter" + currentPage + order + search, {
      questions: slicedQuestions,
      totalPages,
    });
    res.status(200);
    res.json({ questions: slicedQuestions, totalPages });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Internal server error" });
  }
};

/**
 * Retrieves questions based on user interests.
 * Route: GET /getInterestQuestionsByUser
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>} Promise resolved when questions are retrieved and returned
 */
const getQuestionsByUserInterest = async (req, res) => {
  try {
    validateQuestionInput(req);
    sanitizeInput(req.query.search);
    const order = req.query.order || "newest";
    const search = req.query.search || "";
    const currentPage = req.query.currentPage
      ? parseInt(req.query.currentPage)
      : 1;

    const interests = await getUserInterestsFromDB(req.user.username);
    let questions = await getInterestQuestionsByUserFromDB(interests, order);
    questions = filterQuestionsBySearchFromDB(questions, search);

    const itemsPerPage = 10;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    const slicedQuestions = questions.slice(startIndex, endIndex);

    const totalQuestions = questions.length;
    const totalPages = Math.ceil(totalQuestions / itemsPerPage);

    updateCache("getInterestQuestionsByUser" + currentPage + order + search, {
      questions: slicedQuestions,
      totalPages,
    });
    res.status(200);
    res.json({ questions: slicedQuestions, totalPages });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Internal server error" });
  }
};

/**
 * Retrieves questions saved by the authenticated user.
 * Route: GET /getSavedUserQuestions
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>} Promise resolved when questions are retrieved and returned
 */
const getSavedUserQuestions = async (req, res) => {
  try {
    sanitizeInput(req.query.search);
    const order = req.query.order || "newest";
    const search = req.query.search || "";
    let questions = await getSavedQuestionsFromDB(req.user.username, order);
    questions = filterQuestionsBySearchFromDB(questions, search);

    const totalQuestions = questions.length;
    const totalPages = Math.ceil(totalQuestions / 10);
    updateCache("getSavedUserQuestions", { questions: questions, totalPages });
    res.status(200);
    res.json({ questions: questions, totalPages });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Internal server error" });
  }
};

/**
 * Retrieves questions posted by the authenticated user.
 * Route: GET /getUserPostedQuestions
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>} Promise resolved when questions are retrieved and returned
 */
const getUserPostedQuestions = async (req, res) => {
  try {
    validateQuestionInput(req);
    sanitizeInput(req.query.search);
    const order = req.query.order || "newest";
    const search = req.query.search || "";
    let questions = await getUserPostedQuestionsFromDB(
      req.user.username,
      order
    );
    questions = filterQuestionsBySearchFromDB(questions, search);
    const totalQuestions = questions.length;
    const totalPages = Math.ceil(totalQuestions / 10);
    updateCache("getUserPostedQuestions", { questions: questions, totalPages });
    res.status(200);
    res.json({ questions: questions, totalPages });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Internal server error" });
  }
};

/**
 * Retrieves comments associated with a specific question.
 * Route: GET /getComments/:id
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>} Promise resolved when comments are retrieved and returned
 */
const getComments = async (req, res) => {
  try {
    let comments = await getCommentsFromDB(req.params.id);
    res.status(200);
    res.json(comments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Internal server error" });
  }
};

/**
 * Retrieves unapproved questions.
 * Route: GET /getUnapprovedQuestions
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>} Promise resolved when unapproved questions are retrieved and returned
 */
const getUnapprovedQuestions = async (req, res) => {
  try {
    const unapprovedQuestions = await getUnapprovedQuestionsFromDB();
    updateCache("getUnapprovedQuestions", unapprovedQuestions);
    res.status(200).json(unapprovedQuestions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Internal server error" });
  }
};

/**
 * Retrieves a single question by its ID.
 * Route: GET /getQuestionById/:id
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>} Promise resolved when the question is retrieved and returned
 */
const getQuestionById = async (req, res) => {
  try {
    let question = await updateQuestionViewCountInDB(req.params.id);
    clearCache();
    res.status(200);
    res.json(question);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Internal server error" });
  }
};

/**
 * Adds a new question.
 * Route: POST /addQuestion
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>} Promise resolved when the question is successfully added
 */
const addQuestion = async (req, res) => {
  try {
    if (!Array.isArray(req.body.tags)) {
      return res.status(400).json({ msg: "Tags must be an array" });
    }
    let tags = await Promise.all(
      req.body.tags.map(async (tag) => {
        if (typeof tag !== "string") {
          throw new Error("Tag must be a string");
        }
        return await addTagToDB(sanitizeInput(tag));
      })
    );
    let question = await addQuestionToDB(req.body, tags);
    clearCache();
    res.json(question);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Internal server error" });
  }
};

/**
 * Updates the approval status of a question (moderator privilege required).
 * Route: POST /updateQuestionStatus
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>} Promise resolved when the question status is updated
 */
const updateQuestionStatus = async (req, res) => {
  try {
    let qid = req.body.qid;
    let approved = req.body.approved;
    let unapprovedQuestions = await updateQuestionStatusInDB(qid, approved);
    clearCache();
    res.status(200).json(unapprovedQuestions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Internal server error" });
  }
};

/**
 * Handles the addition of a comment to a question in the database.
 * This function adds a new comment to the database associated with a specific question.
 * After successfully adding the comment, it clears the cache to reflect the updated data.
 *
 * @param {Object} req - The HTTP request object containing the comment details in the request body.
 * @param {Object} res - The HTTP response object used to send a response back to the client.
 * @returns {Promise<Object>} A Promise that resolves to the newly added comment object.
 * @throws {Error} If there's an internal server error during the process.
 */
const addComment = async (req, res) => {
  try {
    let comment = await addCommentToDB(
      req.body.comment,
      req.body.qid,
      "question"
    );
    clearCache();
    res.status(200);
    res.json(comment);
    return comment;
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Internal server error" });
  }
};

/**
 * Adds a vote to a question.
 * Route: POST /addVoteQuestion
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>} Promise resolved when the vote is successfully added
 */
const addVoteQuestion = async (req, res) => {
  try {
    let question = await addVoteQuestionDB(
      req.body.qid,
      req.user.username,
      req.body.doubleClicked
    );
    clearCache();
    res.status(200).json(question);
    return question;
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Internal server error" });
  }
};

/**
 * Removes a vote from a question.
 * Route: POST /removeVoteQuestion
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>} Promise resolved when the vote is successfully removed
 */
const removeVoteQuestion = async (req, res) => {
  try {
    let question = await removeVoteQuestionDB(
      req.body.qid,
      req.user.username,
      req.body.doubleClicked
    );
    clearCache();
    res.status(200);
    res.json(question);
    return question;
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Internal server error" });
  }
};

/**
 * Switches the vote on a question for the current user.
 * Route: POST /switchVoteQuestion
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<Object>} The updated question object
 */
const switchVoteQuestion = async (req, res) => {
  try {
    let question = await switchVoteQuestionDB(
      req.body.qid,
      req.user.username,
      req.body.switchTo
    );
    clearCache();
    res.status(200);
    res.json(question);
    return question;
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Internal server error" });
  }
};

/**
 * Saves a question for the current user.
 * Route: POST /saveQuestion
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<Object>} The updated user object
 */
const saveQuestion = async (req, res) => {
  try {
    let uid = req.body.uid;
    let qid = req.body.qid;
    let user = await updateUserSavedQuestionsInDB(uid, qid, "save");
    clearCache();
    res.status(200);
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Internal server error" });
  }
};

/**
 * Deletes a saved question for the current user.
 * Route: POST /deleteSaveQuestion
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<Object>} The updated user object
 */
const deleteSavedQuestion = async (req, res) => {
  try {
    let uid = req.body.uid;
    let qid = req.body.qid;
    let user = await updateUserSavedQuestionsInDB(uid, qid, "delete");
    clearCache();
    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Internal server error" });
  }
};

/**
 * Validates the input parameters for a question-related request.
 * It checks if the currentPage parameter is a positive integer,
 * and if the order parameter (if present) is a valid value from the allowedOrders array.
 * Throws an error if validation fails.
 * @param {Request} req - Express request object containing query parameters
 * @throws {Error} Throws an error if currentPage is not a positive integer or if order is invalid
 */
const validateQuestionInput = (req) => {
  const currentPage = parseInt(req.query.currentPage);
  if (isNaN(currentPage) || currentPage < 1) {
    throw new Error("currentPage must be a positive integer");
  }

  const order = req.query.order;
  if (order && !allowedOrders.includes(order)) {
    throw new Error("Invalid order parameter");
  }
};

/**
 * Sanitizes input data using sanitize-html library.
 * @param {string} data - The input data to sanitize
 * @returns {string} The sanitized data
 */
const sanitizeInput = (data) => {
  data = sanitize(data);
  return data;
};

// GET Routes

router.get(
  "/getQuestion",
  authenticateToken,
  loggerMiddleware,
  cacheMiddleware("getQuestionsByFilter"),
  (req, res) => {
    getQuestionsByFilter(req, res).then((data) => {
      return data;
    });
  }
);

router.get(
  "/getQuestionById/:id",
  authenticateToken,
  loggerMiddleware,
  (req, res) =>
    getQuestionById(req, res).then((data) => {
      return data;
    })
);

router.get(
  "/getInterestQuestionsByUser",
  authenticateToken,
  loggerMiddleware,
  cacheMiddleware("getInterestQuestionsByUser"),
  (req, res) =>
    getQuestionsByUserInterest(req, res).then((data) => {
      return data;
    })
);

router.get(
  "/getUserPostedQuestions",
  authenticateToken,
  loggerMiddleware,
  cacheMiddleware("getUserPostedQuestions"),
  (req, res) =>
    getUserPostedQuestions(req, res).then((data) => {
      return data;
    })
);

router.get(
  "/getSavedUserQuestions",
  authenticateToken,
  loggerMiddleware,
  cacheMiddleware("getSavedUserQuestions"),
  (req, res) =>
    getSavedUserQuestions(req, res).then((data) => {
      return data;
    })
);

router.get(
  "/getUnapprovedQuestions",
  authenticateToken,
  loggerMiddleware,
  cacheMiddleware("getUnapprovedQuestions"),
  (req, res) =>
    getUnapprovedQuestions(req, res).then((data) => {
      return data;
    })
);

router.get(
  "/getComments/:id",
  authenticateToken,
  loggerMiddleware,
  (req, res) => {
    getComments(req, res).then((data) => {
      return data;
    });
  }
);

// POST Routes

router.post("/addQuestion", authenticateToken, loggerMiddleware, (req, res) =>
  addQuestion(req, res).then((data) => {
    return data;
  })
);

router.post(
  "/updateQuestionStatus",
  authenticateToken,
  loggerMiddleware,
  checkModPrivilege,
  (req, res) =>
    updateQuestionStatus(req, res).then((data) => {
      return data;
    })
);

router.post(
  "/addVoteQuestion",
  authenticateToken,
  loggerMiddleware,
  (req, res) =>
    addVoteQuestion(req, res).then((data) => {
      return data;
    })
);

router.post(
  "/removeVoteQuestion",
  authenticateToken,
  loggerMiddleware,
  (req, res) =>
    removeVoteQuestion(req, res).then((data) => {
      return data;
    })
);

router.post(
  "/switchVoteQuestion",
  authenticateToken,
  loggerMiddleware,
  (req, res) =>
    switchVoteQuestion(req, res).then((data) => {
      return data;
    })
);

router.post("/addComment", authenticateToken, loggerMiddleware, (req, res) =>
  addComment(req, res).then((data) => {
    return data;
  })
);

router.post("/saveQuestion", authenticateToken, loggerMiddleware, (req, res) =>
  saveQuestion(req, res).then((data) => {
    return data;
  })
);

router.post(
  "/deleteSaveQuestion",
  authenticateToken,
  loggerMiddleware,
  (req, res) =>
    deleteSavedQuestion(req, res).then((data) => {
      return data;
    })
);

module.exports = router;
