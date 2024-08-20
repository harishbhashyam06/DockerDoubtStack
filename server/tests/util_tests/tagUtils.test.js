const mongoose = require("mongoose");
const {
  addTagToDB,
  findTagByNameInDB,
  getTagsWithQuestionNumberFromDB,
} = require("../../utils/tagUtils");

jest.mock("../../models/tagsModel");
jest.mock("../../models/questionsModel");
const Tag = require("../../models/tagsModel");
const Question = require("../../models/questionsModel");

describe("findTagByNameInDB", () => {
  it("should find a tag by name", async () => {
    const tagName = "JavaScript";
    const expectedTag = { _id: "123", name: tagName };

    Tag.findOne.mockResolvedValue(expectedTag);

    const result = await findTagByNameInDB(tagName);

    expect(Tag.findOne).toHaveBeenCalledWith({ name: tagName });
    expect(result).toEqual(expectedTag);
  });
});

describe("addTagToDB", () => {
  it("should add a new tag if it does not exist", async () => {
    const tagName = "Node.js";
    Tag.findOne.mockResolvedValue(null);
    const savedTag = { _id: "new123", name: tagName };
    Tag.mockImplementation(() => ({
      save: jest.fn().mockResolvedValue(savedTag),
    }));

    const result = await addTagToDB(tagName);

    expect(Tag.findOne).toHaveBeenCalledWith({ name: tagName });
    expect(result).toBe(savedTag._id);
  });

  it("should return existing tag ID if tag is already present", async () => {
    const tagName = "React";
    const existingTag = { _id: "existing123", name: tagName };
    Tag.findOne.mockResolvedValue(existingTag);

    const result = await addTagToDB(tagName);

    expect(Tag.findOne).toHaveBeenCalledWith({ name: tagName });
    expect(result).toBe(existingTag._id);
  });
});

describe("getTagsWithQuestionNumberFromDB", () => {
  it("should retrieve tags with the number of associated approved questions", async () => {
    const tags = [
      { _id: "1", name: "JavaScript", description: "JS Description" },
    ];
    const questions = [
      { _id: "q1", approved: true, tags: [{ _id: "1", name: "JavaScript" }] },
      { _id: "q2", approved: true, tags: [{ _id: "1", name: "JavaScript" }] },
    ];

    Tag.find.mockResolvedValue(tags);
    Question.find = jest
      .fn()
      .mockImplementation(() => ({
        populate: jest.fn().mockResolvedValueOnce(questions),
      }));

    const result = await getTagsWithQuestionNumberFromDB();

    expect(Tag.find).toHaveBeenCalled();
    expect(Question.find).toHaveBeenCalledWith({ approved: true });
    expect(result).toEqual([
      { name: "JavaScript", description: "JS Description", qcnt: 2 },
    ]);
  });
});