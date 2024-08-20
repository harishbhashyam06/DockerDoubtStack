const supertest = require("supertest");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const { API_ACCESS_TOKEN_SECRET } = require("../../config");
const User = require("../../models/usersModel");
const Question = require("../../models/questionsModel");

jest.mock("../../models/usersModel");
jest.mock("../../models/questionsModel");
jest.mock("../../utils/questionUtils");
jest.mock("../../utils/userUtils");
jest.mock("../../utils/tagUtils");
jest.mock("../../utils/commentUtils");

const {
  updateQuestionStatusInDB,
  addQuestionToDB,
  addVoteQuestionDB,
  removeVoteQuestionDB,
  switchVoteQuestionDB,
  getQuestionsByOrderFromDB,
  filterQuestionsBySearchFromDB,
  getInterestQuestionsByUserFromDB,
  getUserPostedQuestionsFromDB,
  updateQuestionViewCountInDB,
  getUnapprovedQuestionsFromDB,
  getCommentsFromDB,
} = require("../../utils/questionUtils");

const {
  updateUserSavedQuestionsInDB,
  getSavedQuestionsFromDB,
  checkIfUserExsistsInDB,
} = require("../../utils/userUtils");

const { addTagToDB } = require("../../utils/tagUtils");

const { addCommentToDB } = require("../../utils/commentUtils");

const { getUserInterestsFromDB } = require("../../utils/userUtils");

let server;

let token;

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

describe("GET /getQuestion", () => {
  it("should return filtered questions based on order and search criteria", async () => {
    const mockQuestions = [
      { title: "First Question", tags: ["javascript"] },
      { title: "Second Question", tags: ["react"] },
    ];

    getQuestionsByOrderFromDB.mockResolvedValue(mockQuestions);
    filterQuestionsBySearchFromDB.mockReturnValue(mockQuestions);

    const response = await supertest(server)
      .get("/question/getQuestion?order=newest&search=javascript&currentPage=1")
      .set("Cookie", `accessToken=${token}`);

    expect(response.status).toBe(200);
    expect(response.body.questions).toEqual(mockQuestions);
    expect(getQuestionsByOrderFromDB).toHaveBeenCalledWith("newest");
    expect(filterQuestionsBySearchFromDB).toHaveBeenCalledWith(
      mockQuestions,
      "javascript"
    );
  });
});

describe("GET /getInterestQuestionsByUser", () => {
  it("should return questions based on user interests", async () => {
    const mockQuestions = [
      { _id: "abc", title: "Interest-based Question 1" },
      { _id: "def", title: "Interest-based Question 2" },
    ];
    getUserInterestsFromDB.mockResolvedValue(mockQuestions);
    getInterestQuestionsByUserFromDB.mockResolvedValue(mockQuestions);
    filterQuestionsBySearchFromDB.mockReturnValue(mockQuestions);

    const response = await supertest(server)
      .get(
        "/question/getInterestQuestionsByUser?order=newest&search=javascript&currentPage=1"
      )
      .set("Cookie", `accessToken=${token}`); // Setting the token in cookies

    expect(response.status).toBe(200);
    expect(response.body.questions).toEqual(mockQuestions);
    expect(getInterestQuestionsByUserFromDB).toHaveBeenCalled();
  });
});

describe("POST /addVoteQuestion", () => {
  it("should add a vote to a question", async () => {
    const mockQuestion = { _id: "1", votes: 5 };

    addVoteQuestionDB.mockResolvedValue({
      ...mockQuestion,
      votes: mockQuestion.votes + 1,
    });

    const response = await supertest(server)
      .post("/question/addVoteQuestion")
      .send({ qid: "1", doubleClicked: false })
      .set("Cookie", `accessToken=${token}`);

    expect(response.status).toBe(200);
    expect(response.body.votes).toBe(6);
    expect(addVoteQuestionDB).toHaveBeenCalledWith("1", "testuser", false);
  });
});

describe("POST /removeVoteQuestion", () => {
  it("should remove a vote to a question", async () => {
    const mockQuestion = { _id: "1", votes: 5 };

    removeVoteQuestionDB.mockResolvedValue({
      ...mockQuestion,
      votes: mockQuestion.votes - 1,
    });

    const response = await supertest(server)
      .post("/question/removeVoteQuestion")
      .send({ qid: "1", doubleClicked: false })
      .set("Cookie", `accessToken=${token}`);

    expect(response.status).toBe(200);
    expect(response.body.votes).toBe(4);
    expect(removeVoteQuestionDB).toHaveBeenCalledWith("1", "testuser", false);
  });
});

describe("POST /switchVoteQuestion", () => {
  it("should toggle between vote and down vote to a question", async () => {
    const mockQuestion = { _id: "1", votes: 5 };

    switchVoteQuestionDB.mockResolvedValue({
      ...mockQuestion,
      votes: mockQuestion.votes,
    });

    const response = await supertest(server)
      .post("/question/switchVoteQuestion")
      .send({ qid: "1", switchTo: "up" })
      .set("Cookie", `accessToken=${token}`);

    expect(response.status).toBe(200);
    expect(switchVoteQuestionDB).toHaveBeenCalledWith("1", "testuser", "up");
  });
});

describe("GET /getQuestionById/:id", () => {
  it("should return a specific question by ID", async () => {
    const mockQuestion = {
      _id: "123",
      title: "Test Question",
      content: "Content here",
    };
    updateQuestionViewCountInDB.mockResolvedValue(mockQuestion);

    const response = await supertest(server)
      .get("/question/getQuestionById/123")
      .set("Cookie", `accessToken=${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockQuestion);
    expect(updateQuestionViewCountInDB).toHaveBeenCalledWith("123");
  });
});

describe("GET /getUserPostedQuestions", () => {
  it("should return questions posted by the authenticated user", async () => {
    const mockQuestions = [
      { _id: "1", title: "User Post Question 1" },
      { _id: "2", title: "User Post Question 2" },
    ];
    getUserPostedQuestionsFromDB.mockResolvedValue(mockQuestions);
    filterQuestionsBySearchFromDB.mockReturnValue(mockQuestions);

    const response = await supertest(server)
      .get(
        "/question/getUserPostedQuestions?order=newest&search=javascript&currentPage=1"
      )
      .set("Cookie", `accessToken=${token}`);

    expect(response.status).toBe(200);
    expect(response.body.questions).toEqual(mockQuestions);
  });
});

describe("GET /getUnapprovedQuestions", () => {
  it("should return unapproved questions posted by the authenticated user", async () => {
    const mockQuestions = [
      { _id: "1", title: "User Post Question 1" },
      { _id: "2", title: "User Post Question 2" },
    ];
    getUnapprovedQuestionsFromDB.mockResolvedValue(mockQuestions);

    const response = await supertest(server)
      .get("/question/getUnapprovedQuestions")
      .set("Cookie", `accessToken=${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockQuestions);
  });
});

describe("GET /getSavedUserQuestions", () => {
  it("should return saved questions of the authenticated user", async () => {
    const mockQuestions = [
      { _id: "abc", title: "Saved Question 1" },
      { _id: "def", title: "Saved Question 2" },
    ];
    getSavedQuestionsFromDB.mockResolvedValue(mockQuestions);
    filterQuestionsBySearchFromDB.mockReturnValue(mockQuestions);

    const response = await supertest(server)
      .get(
        "/question/getSavedUserQuestions?order=newest&search=javascript&currentPage=1"
      )
      .set("Cookie", `accessToken=${token}`);

    expect(response.status).toBe(200);
    expect(response.body.questions).toEqual(mockQuestions);
  });
});

describe("GET /getComments/:id", () => {
  it("should return comments for a perticular question", async () => {
    const mockComments = [
      { _id: "abc", title: "Saved Question 1" },
      { _id: "def", title: "Saved Question 2" },
    ];
    getCommentsFromDB.mockResolvedValue(mockComments);

    const response = await supertest(server)
      .get("/question/getComments/bcd")
      .set("Cookie", `accessToken=${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockComments);
  });
});

describe("GET /addQuestion", () => {
  it("should add question to database", async () => {
    const question = {
      tags: ["t1", "t2"],
      title: "Question",
    };

    addQuestionToDB.mockResolvedValue(question);
    addTagToDB.mockResolvedValue(question);

    const response = await supertest(server)
      .post("/question/addQuestion")
      .send(question)
      .set("Cookie", `accessToken=${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(question);
  });
});

describe("POST /updateQuestionStatus", () => {
  it("should not fail since user is  mod", async () => {
    const questionData = { qid: "1", approved: true };

    const mockQuestions = [
      { _id: "abc", title: "Saved Question 1" },
      { _id: "def", title: "Saved Question 2" },
    ];
    updateQuestionStatusInDB.mockReturnValue(mockQuestions);

    checkIfUserExsistsInDB.mockResolvedValue({
      role : "mod"
    });

    const response = await supertest(server)
      .post("/question/updateQuestionStatus")
      .send(questionData)
      .set("Cookie", `accessToken=${token}`);

    expect(response.status).toBe(200);
  });

  it("should fail since user is not mod", async () => {
    const questionData = { qid: "1", approved: true };

    const mockQuestions = [
      { _id: "abc", title: "Saved Question 1" },
      { _id: "def", title: "Saved Question 2" },
    ];
    updateQuestionStatusInDB.mockReturnValue(mockQuestions);

    checkIfUserExsistsInDB.mockResolvedValue({
      role : "user"
    });

    const response = await supertest(server)
      .post("/question/updateQuestionStatus")
      .send(questionData)
      .set("Cookie", `accessToken=${token}`);

    expect(response.status).toBe(401);
  });
});

describe("POST /addComment", () => {
  it("should add a comment to a question", async () => {
    const commentData = { comment: "Great post!", qid: "1" };
    addCommentToDB.mockResolvedValue({ ...commentData, id: "123" });

    const response = await supertest(server)
      .post("/question/addComment")
      .set("Cookie", `accessToken=${token}`)
      .send(commentData)
      .expect(200);

    expect(response.body.comment).toBe(commentData.comment);
    expect(addCommentToDB).toHaveBeenCalledWith(
      commentData.comment,
      commentData.qid,
      "question"
    );
  });
});

describe("POST /saveQuestion", () => {
  it("should save a question for a user", async () => {
    const saveData = { uid: "12345", qid: "1" };

    updateUserSavedQuestionsInDB.mockResolvedValue(saveData);
    const response = await supertest(server)
      .post("/question/saveQuestion")
      .set("Cookie", `accessToken=${token}`)
      .send(saveData)
      .expect(200);

    expect(response.body.qid).toContain(saveData.qid);
    expect(updateUserSavedQuestionsInDB).toHaveBeenCalledWith(
      saveData.uid,
      saveData.qid,
      "save"
    );
  });
});

describe("POST /deleteSaveQuestion", () => {
  it("should delete a saved question for a user", async () => {
    const deleteData = { uid: "12345", qid: "1" };
    const deletedData = { uid: "12345" };
    updateUserSavedQuestionsInDB.mockResolvedValue(deletedData);

    const response = await supertest(server)
      .post("/question/deleteSaveQuestion")
      .set("Cookie", `accessToken=${token}`)
      .send(deleteData)
      .expect(200);

    expect(updateUserSavedQuestionsInDB).toHaveBeenCalledWith(
      deleteData.uid,
      deleteData.qid,
      "delete"
    );
  });
});
