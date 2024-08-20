const express = require("express");

const { getTagsWithQuestionNumberFromDB } = require("../utils/tagUtils");
const {
  updateCache,
  cacheMiddleware,
  loggerMiddleware,
  authenticateToken,
} = require("../utils/serverUtils");

const router = express.Router();

/**
 * Retrieves tag details with the corresponding question counts from the database.
 * Updates the cache with the retrieved data and sends a JSON response with the tag details.
 *
 * @param req The HTTP request object.
 * @param res The HTTP response object.
 */
const getTagsWithQuestionNumber = async (req, res) => {
  try {
    const tagDetails = await getTagsWithQuestionNumberFromDB();
    updateCache("getTagsWithQuestionNumber", tagDetails);
    res.status(200).json(tagDetails);
  } catch (error) {
    console.error("Error in getTagsWithQuestionNumber:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// GET Routes 

router.get(
  "/getTagsWithQuestionNumber",
  authenticateToken,
  loggerMiddleware,
  cacheMiddleware("getTagsWithQuestionNumber"),
  (req, res) =>
    getTagsWithQuestionNumber(req, res).then((data) => {
      return data;
    })
);

module.exports = router;
