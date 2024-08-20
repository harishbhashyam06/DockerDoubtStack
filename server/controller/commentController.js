const express = require("express");

const {
  addVoteCommentDB,
  removeVoteCommentDB,
  switchVoteCommentDB,
} = require("../utils/commentUtils");
const {
  clearCache,
  loggerMiddleware,
  authenticateToken,
} = require("../utils/serverUtils");

const router = express.Router();

/**
 * Handles the addition of a vote to a comment.
 * Route: POST /addVoteComment
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<any>} Promise that resolves to the updated comment object
 */
const addVoteComment = async (req, res) => {
  try {
    let comment = await addVoteCommentDB(
      req.body.cid,
      req.user.username,
      req.body.doubleClicked
    );
    clearCache(); // Clear cache after vote addition
    res.status(200).json(comment);
    return comment;
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Internal server error" });
  }
};

/**
 * Handles the removal of a vote from a comment.
 * Route: POST /removeVoteComment
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<any>} Promise that resolves to the updated comment object
 */
const removeVoteComment = async (req, res) => {
  try {
    let comment = await removeVoteCommentDB(
      req.body.cid,
      req.user.username,
      req.body.doubleClicked
    );
    clearCache(); // Clear cache after vote removal
    res.status(200).json(comment);
    return comment;
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Internal server error" });
  }
};

/**
 * Handles switching a vote on a comment.
 * Route: POST /switchVoteComment
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<any>} Promise that resolves to the updated comment object
 */
const switchVoteComment = async (req, res) => {
  try {
    let comment = await switchVoteCommentDB(
      req.body.cid,
      req.user.username,
      req.body.switchTo
    );
    clearCache(); // Clear cache after vote switch
    res.status(200).json(comment);
    return comment;
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Internal server error" });
  }
};

// POST definitions

router.post(
  "/addVoteComment",
  authenticateToken,
  loggerMiddleware,
  (req, res) =>
    addVoteComment(req, res).then((data) => {
      return data;
    })
);

router.post(
  "/removeVoteComment",
  authenticateToken,
  loggerMiddleware,
  (req, res) =>
    removeVoteComment(req, res).then((data) => {
      return data;
    })
);

router.post(
  "/switchVoteComment",
  authenticateToken,
  loggerMiddleware,
  (req, res) =>
    switchVoteComment(req, res).then((data) => {
      return data;
    })
);

module.exports = router;