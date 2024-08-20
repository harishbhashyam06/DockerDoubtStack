const Tag = require("../models/tagsModel");
const Question = require("../models/questionsModel");


/**
 * Retrieves tag details along with the number of associated approved questions from the database.
 * Counts the number of approved questions associated with each tag and returns tag details.
 *
 * @returns An array of tag details including name, description, and the count of associated approved questions.
 */
const getTagsWithQuestionNumberFromDB = async () => {
  let tags = await Tag.find();
  let questions = await Question.find({ approved: true }).populate("tags");
  const tagDetails = tags.map((tag) => {
    let questionCount = 0;
    questions.forEach((q) => {
      questionCount += q.tags.filter((t) => t.name === tag.name).length;
    });
    return {
      name: tag.name,
      description: tag.description,
      qcnt: questionCount,
    };
  });

  return tagDetails;
};

/**
 * Retrieves a tag by its name from the database.
 *
 * @param tagName The name of the tag to retrieve.
 * @returns A Promise that resolves to the tag object matching the provided name.
 */
const findTagByNameInDB = (tagName) => {
  return Tag.findOne({ name: tagName });
};

/**
 * Adds a new tag to the database if it doesn't already exist.
 * Retrieves the existing tag ID if the tag is already present.
 *
 * @param tname The name of the tag to add.
 * @returns The ID of the existing or newly added tag.
 */
const addTagToDB = async (tname) => {
  let isPresent = await Tag.findOne({ name: tname });
  if (isPresent) {
    return isPresent._id;
  } else {
    let tag = Tag({ name: tname });
    const saveTag = await tag.save();
    return saveTag._id;
  }
};

module.exports = {
  addTagToDB,
  findTagByNameInDB,
  getTagsWithQuestionNumberFromDB,
};
