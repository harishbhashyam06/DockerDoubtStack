const express = require("express");

const { addCommentToDB } = require("../utils/commentUtils");
const {
  addAnswerToDB,
  addVoteAnswerDB,
  getCommentsFromDB,
  switchVoteAnswerDB,
  removeVoteAnswerDB,
  updateAnswerStatusInDB,
  getUnapprovedAnswersFromDB,
} = require("../utils/answerUtils");
const {
  clearCache,
  updateCache,
  cacheMiddleware,
  loggerMiddleware,
  checkModPrivilege,
  authenticateToken,
} = require("../utils/serverUtils");

const router = express.Router();

/**
 * Retrieves a list of unapproved answers.
 * Route: GET /getUnapprovedAnswers
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
const getUnapprovedAnswers = async (req, res) => {
  try {
    const unapprovedAnswers = await getUnapprovedAnswersFromDB();
    updateCache("getUnapprovedAnswers", unapprovedAnswers);
    res.status(200).json(unapprovedAnswers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Internal server error" });
  }
};

/**
 * Retrieves comments associated with an answer.
 * Route: GET /getComments/:id
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
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
 * Adds an answer to a question.
 * Route: POST /addAnswer
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
const addAnswer = async (req, res) => {
  try {
    let answer = await addAnswerToDB(req.body.ans, req.body.qid);
    clearCache();
    res.status(200);
    res.json(answer);
  } catch (error) {
    res.status(404);
    console.log("error", error);
  }
};

/**
 * Updates the approval status of an answer.
 * Route: POST /updateAnswerStatus
 * Requires moderator privilege.
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
const updateAnswerStatus = async (req, res) => {
  let aid = req.body.aid;
  let approved = req.body.approved;
  let unapprovedAnswers = await updateAnswerStatusInDB(aid, approved);
  clearCache();
  res.status(200).json(unapprovedAnswers);
};

/**
 * Adds a comment to an answer.
 * Route: POST /addComment
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
const addComment = async (req, res) => {
  try {
    let comment = await addCommentToDB(
      req.body.comment,
      req.body.aid,
      "answer"
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
 * Adds a vote to an answer.
 * Route: POST /addVoteAnswer
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
const addVoteAnswer = async (req, res) => {
  try {
    let answer = await addVoteAnswerDB(
      req.body.aid,
      req.user.username,
      req.body.doubleClicked
    );
    clearCache();
    res.status(200).json(answer);
    return answer;
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Internal server error" });
  }
};

/**
 * Removes a vote from an answer.
 * Route: POST /removeVoteAnswer
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
const removeVoteAnswer = async (req, res) => {
  try {
    let answer = await removeVoteAnswerDB(
      req.body.aid,
      req.user.username,
      req.body.doubleClicked
    );
    clearCache();
    res.status(200);
    res.json(answer);
    return answer;
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Internal server error" });
  }
};

/**
 * Switches a vote on an answer.
 * Route: POST /switchVoteAnswer
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
const switchVoteAnswer = async (req, res) => {
  try {
    let answer = await switchVoteAnswerDB(
      req.body.aid,
      req.user.username,
      req.body.switchTo
    );
    clearCache();
    res.status(200);
    res.json(answer);
    return answer;
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Internal server error" });
  }
};

// Routes for POST methods

router.post(
  "/addVoteAnswer",
  authenticateToken,
  loggerMiddleware,
  (req, res) =>
    addVoteAnswer(req, res).then((data) => {
      return data;
    })
);

router.post(
  "/removeVoteAnswer",
  authenticateToken,
  loggerMiddleware,
  (req, res) =>
    removeVoteAnswer(req, res).then((data) => {
      return data;
    })
);

router.post(
  "/switchVoteAnswer",
  authenticateToken,
  loggerMiddleware,
  (req, res) =>
    switchVoteAnswer(req, res).then((data) => {
      return data;
    })
);

router.post(
  "/addAnswer",
  authenticateToken,
  loggerMiddleware,
  (req, res) =>
    addAnswer(req, res).then((data) => {
      return data;
    })
);

router.post(
  "/addComment",
  authenticateToken,
  loggerMiddleware,
  (req, res) =>
    addComment(req, res).then((data) => {
      return data;
    })
);

router.post(
  "/updateAnswerStatus",
  authenticateToken,
  loggerMiddleware,
  checkModPrivilege,
  (req, res) =>
    updateAnswerStatus(req, res).then((data) => {
      return data;
    })
);

// Routes for GET methods

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

router.get(
  "/getUnapprovedAnswers",
  authenticateToken,
  loggerMiddleware,
  cacheMiddleware('getUnapprovedAnswers'),
  (req, res) =>
    getUnapprovedAnswers(req, res).then((data) => {
      return data;
    })
);

module.exports = router;
