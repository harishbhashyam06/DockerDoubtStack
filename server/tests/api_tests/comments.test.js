const supertest = require("supertest");
const jwt = require("jsonwebtoken");
const { API_ACCESS_TOKEN_SECRET } = require("../../config");
const { default: mongoose } = require("mongoose");

let server;
const token = jwt.sign({ username: "user1" }, API_ACCESS_TOKEN_SECRET, {
  expiresIn: "1h",
});

jest.mock("../../utils/commentUtils");
const {
  addVoteCommentDB,
  removeVoteCommentDB,
  switchVoteCommentDB,
} = require("../../utils/commentUtils");

const mockComment = {
  _id: "commentId1",
  text: "This is a comment.",
  votes: 10,
};

describe("POST Comment Voting Routes", () => {
  beforeEach(() => {
    server = require("../../server");
  });

  afterEach(async () => {
    server.close();
    await mongoose.disconnect();
  });

  it("should add a vote to a comment", async () => {
    addVoteCommentDB.mockResolvedValue({
      ...mockComment,
      votes: mockComment.votes + 1,
    });

    const response = await supertest(server)
      .post("/comment/addVoteComment")
      .set("Cookie", `accessToken=${token}`)
      .send({ cid: mockComment._id, doubleClicked: false });

    expect(response.status).toBe(200);
    expect(response.body.votes).toBe(mockComment.votes + 1);
    expect(addVoteCommentDB).toHaveBeenCalledWith(
      mockComment._id,
      "user1",
      false
    );
  });

  it("should remove a vote from a comment", async () => {
    removeVoteCommentDB.mockResolvedValue({
      ...mockComment,
      votes: mockComment.votes - 1,
    });

    const response = await supertest(server)
      .post("/comment/removeVoteComment")
      .set("Cookie", `accessToken=${token}`)
      .send({ cid: mockComment._id, doubleClicked: false });

    expect(response.status).toBe(200);
    expect(response.body.votes).toBe(mockComment.votes - 1);
    expect(removeVoteCommentDB).toHaveBeenCalledWith(
      mockComment._id,
      "user1",
      false
    );
  });

  it("should switch a vote on a comment", async () => {
    switchVoteCommentDB.mockResolvedValue({
      ...mockComment,
      votes: mockComment.votes + 1,
    });

    const response = await supertest(server)
      .post("/comment/switchVoteComment")
      .set("Cookie", `accessToken=${token}`)
      .send({ cid: mockComment._id, switchTo: true });

    expect(response.status).toBe(200);
    expect(response.body.votes).toBe(mockComment.votes + 1);
    expect(switchVoteCommentDB).toHaveBeenCalledWith(
      mockComment._id,
      "user1",
      true
    );
  });
});
