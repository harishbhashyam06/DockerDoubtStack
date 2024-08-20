const { API_ACCESS_TOKEN_SECRET } = require("../../config");
const supertest = require("supertest");

const Tag = require("../../models/tagsModel");
const Question = require("../../models/questionsModel");
const { default: mongoose } = require("mongoose");

const mockTags = [{ name: "tag1" }, { name: "tag2" }];

const mockQuestions = [
  { tags: [mockTags[0], mockTags[1]] },
  { tags: [mockTags[0]] },
];

const jwt = require("jsonwebtoken");
const token = jwt.sign({ id: "user1" }, API_ACCESS_TOKEN_SECRET, {
  expiresIn: "1h",
});

let server;

describe("GET /getTagsWithQuestionNumber", () => {
  beforeEach(() => {
    server = require("../../server");
  });
  afterEach(async () => {
    server.close();
    await mongoose.disconnect();
  });

  it("should return tags with question numbers", async () => {
    expect(true).toBe(true);

    Tag.find = jest.fn().mockResolvedValueOnce(mockTags);

    Question.find = jest.fn().mockImplementation(() => ({
      populate: jest.fn().mockResolvedValueOnce(mockQuestions),
    }));

    await supertest(server).get("/").expect(200);

    const response = await supertest(server)
      .get("/tag/getTagsWithQuestionNumber")
      .set("Cookie", `accessToken=${token}`);

    expect(response.body).toEqual([
      { name: "tag1", qcnt: 2 },
      { name: "tag2", qcnt: 1 },
    ]);
    expect(response.status).toBe(200);
    expect(Tag.find).toHaveBeenCalled();
    expect(Question.find).toHaveBeenCalled();
  });
});
