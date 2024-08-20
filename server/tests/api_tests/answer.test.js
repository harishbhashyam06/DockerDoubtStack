const supertest = require("supertest");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const { API_ACCESS_TOKEN_SECRET } = require("../../config");

jest.mock("../../models/usersModel");
jest.mock("../../models/questionsModel");
jest.mock("../../utils/answerUtils");
jest.mock("../../utils/userUtils");
jest.mock("../../utils/tagUtils");
jest.mock("../../utils/commentUtils");
const {
  addAnswerToDB,
  addVoteAnswerDB,
  getCommentsFromDB,
  switchVoteAnswerDB,
  removeVoteAnswerDB,
  updateAnswerStatusInDB,
  getUnapprovedAnswersFromDB,
} = require("../../utils/answerUtils");

const {
  checkIfUserExsistsInDB
} = require("../../utils/userUtils");

const { addCommentToDB } = require("../../utils/commentUtils");


let token;
let server;

beforeEach(() => {
  server = require("../../server");
  token = jwt.sign({ username: "testuser" }, API_ACCESS_TOKEN_SECRET, {
    expiresIn: "1h",
  });
  jest.clearAllMocks();
});

afterEach(async () => {
  await mongoose.disconnect();
  server.close();
});

describe("GET /getUnapprovedAnswers", () => {
  it("should retrieve a list of unapproved answers", async () => {
    const unapprovedAnswers = [{ id: "1", answer: "Pending approval" }];
    getUnapprovedAnswersFromDB.mockResolvedValue(unapprovedAnswers);

    const response = await supertest(server)
      .get("/answer/getUnapprovedAnswers")
      .set("Cookie", `accessToken=${token}`)
      .expect(200);

    expect(response.body).toEqual(unapprovedAnswers);
    expect(getUnapprovedAnswersFromDB).toHaveBeenCalled();
  });
});

describe("GET /getComments/:id", () => {
  it("should retrieve comments associated with an answer", async () => {
    const comments = [{ id: "1", comment: "Great answer!" }];
    getCommentsFromDB.mockResolvedValue(comments);

    const response = await supertest(server)
      .get("/answer/getComments/1")
      .set("Cookie", `accessToken=${token}`)
      .expect(200);

    expect(response.body).toEqual(comments);
    expect(getCommentsFromDB).toHaveBeenCalledWith("1");
  });
});

describe("POST /addAnswer", () => {
  it("should add an answer to a question", async () => {
    const answerData = { ans: "This is an answer", qid: "123" };
    addAnswerToDB.mockResolvedValue({ ...answerData, id: "1" });

    const response = await supertest(server)
      .post("/answer/addAnswer")
      .send(answerData)
      .set("Cookie", `accessToken=${token}`)
      .expect(200);

    expect(response.body.id).toEqual("1");
    expect(addAnswerToDB).toHaveBeenCalledWith(answerData.ans, answerData.qid);
  });
});

describe("POST /updateAnswerStatus/", () => {
  it("should  be able to change the approval status of an answer as user is mod", async () => {
    const updateData = { aid: "1", approved: true };
    updateAnswerStatusInDB.mockResolvedValue([
      { ...updateData, status: "approved" },
    ]);

    checkIfUserExsistsInDB.mockResolvedValue({
      role : "mod"
    });

    const response = await supertest(server)
      .post("/answer/updateAnswerStatus")
      .send(updateData)
      .set("Cookie", `accessToken=${token}`)
      .expect(200);
  });


  it("should not be able to change the approval status of an answer as user is not mod", async () => {
    const updateData = { aid: "1", approved: true };
    updateAnswerStatusInDB.mockResolvedValue([
      { ...updateData, status: "approved" },
    ]);

    checkIfUserExsistsInDB.mockResolvedValue({
      role : "user"
    });

    const response = await supertest(server)
      .post("/answer/updateAnswerStatus")
      .send(updateData)
      .set("Cookie", `accessToken=${token}`)
      .expect(401);
  });
});


describe("POST /addComment", () => {
  it("should add a comment to an answer", async () => {
    const commentData = { comment: "Great explanation!", aid: "1" };
    addCommentToDB.mockResolvedValue({ ...commentData, id: "comment1" });

    const response = await supertest(server)
      .post("/answer/addComment")
      .send(commentData)
      .set("Cookie", `accessToken=${token}`)
      .expect(200);

    expect(response.body.id).toBe("comment1");
    expect(addCommentToDB).toHaveBeenCalledWith(
      commentData.comment,
      commentData.aid,
      "answer"
    );
  });
});

describe("POST Vote manipulaiton", () => {
  it("should add a vote to an answer", async () => {
    const voteData = { aid: "1", doubleClicked: false };
    addVoteAnswerDB.mockResolvedValue({ ...voteData, votes: 1 });

    const response = await supertest(server)
      .post("/answer/addVoteAnswer")
      .send(voteData)
      .set("Cookie", `accessToken=${token}`)
      .expect(200);

    expect(response.body.votes).toBe(1);
    expect(addVoteAnswerDB).toHaveBeenCalledWith(
      voteData.aid,
      "testuser",
      voteData.doubleClicked
    );
  });

  it("should remove a vote from an answer", async () => {
    const voteData = { aid: "1", doubleClicked: false };
    removeVoteAnswerDB.mockResolvedValue({ ...voteData, votes: 0 });

    const response = await supertest(server)
      .post("/answer/removeVoteAnswer")
      .send(voteData)
      .set("Cookie", `accessToken=${token}`)
      .expect(200);

    expect(response.body.votes).toBe(0);
    expect(removeVoteAnswerDB).toHaveBeenCalledWith(
      voteData.aid,
      "testuser",
      voteData.doubleClicked
    );
  });

  it("should switch a vote on an answer", async () => {
    const voteData = { aid: "1", switchTo: true };
    switchVoteAnswerDB.mockResolvedValue({ ...voteData, votes: 1 });

    const response = await supertest(server)
      .post("/answer/switchVoteAnswer")
      .send(voteData)
      .set("Cookie", `accessToken=${token}`)
      .expect(200);

    expect(response.body.votes).toBe(1);
    expect(switchVoteAnswerDB).toHaveBeenCalledWith(
      voteData.aid,
      "testuser",
      voteData.switchTo
    );
  });
});
