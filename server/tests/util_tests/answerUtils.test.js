const mongoose = require("mongoose");
const {
  addAnswerToDB,
  addVoteAnswerDB,
  getCommentsFromDB,
  switchVoteAnswerDB,
  removeVoteAnswerDB,
  updateAnswerStatusInDB,
  getUnapprovedAnswersFromDB,
} = require("../../utils/answerUtils");
const { ObjectId } = mongoose.Types;

jest.mock("../../models/answersModel");
jest.mock("../../models/commentsModel");
jest.mock("../../models/usersModel");

const Answer = require("../../models/answersModel");
const Question = require("../../models/questionsModel");
const Comment = require("../../models/commentsModel");
const User = require("../../models/usersModel");

const answerId1 = new ObjectId();
const answerId2 = new ObjectId();

const questionId1 = new ObjectId();
const questionId2 = new ObjectId();

jest.mock("sanitize-html", () => jest.fn((input) => input));

const mockAnswers = [
  {
    _id: answerId1,
    text: "Here is an unapproved answer to the first question",
    ans_by: new ObjectId(),
    ans_date_time: new Date(),
    votes: 0,
    comments: [],
    approved: false,
  },
  {
    _id: answerId2,
    text: "Here is an unapproved answer to the second question",
    ans_by: new ObjectId(),
    ans_date_time: new Date(),
    votes: 0,
    comments: [],
    approved: false,
  },
];

const mockQuestions = [
  {
    _id: questionId1,
    title: "First Question Title",
    text: "Content of the first question",
    asked_by: new ObjectId(),
    ask_date_time: new Date(),
    views: 10,
    answers: [answerId1],
    tags: [new ObjectId()],
    votes: 3,
    comments: [],
    approved: true,
  },
  {
    _id: questionId2,
    title: "Second Question Title",
    text: "Content of the second question",
    asked_by: new ObjectId(),
    ask_date_time: new Date(),
    views: 20,
    answers: [answerId2],
    tags: [new ObjectId()],
    votes: 5,
    comments: [],
    approved: true,
  },
];

describe("getUnapprovedAnswersFromDB", () => {
  it("should fetch unapproved answers", async () => {
    Answer.find = jest.fn().mockImplementation(() => ({
      populate: jest.fn().mockResolvedValueOnce(mockAnswers),
    }));

    Question.aggregate = jest.fn().mockImplementation(() => {
      let res = [
        {
          _id: questionId1,
          title: mockQuestions[0].title,
          answers: [answerId1],
        },
        {
          _id: questionId2,
          title: mockQuestions[1].title,
          answers: [answerId2],
        },
      ];
      return res;
    });

    const results = await getUnapprovedAnswersFromDB();

    expect(Answer.find).toHaveBeenCalledWith({ approved: false });
    expect(Question.aggregate).toHaveBeenCalled();
    expect(results).toEqual([
      {
        question: mockQuestions[0].title,
      },
      {
        question: mockQuestions[1].title,
      },
    ]);
  });
});

describe("getCommentsFromDB", () => {
  it("should fetch comments associated with an answer", async () => {
    const answerId = "1";
    const mockComments = [
      { _id: "c1", content: "Nice answer!", answerId: answerId },
    ];

    Answer.findOne = jest.fn().mockImplementation(() => ({
      populate: jest.fn().mockResolvedValueOnce({ comments: mockComments }),
    }));

    const results = await getCommentsFromDB(answerId);

    expect(Answer.findOne).toHaveBeenCalledWith({ _id: answerId });
    expect(results).toEqual(mockComments);
  });
});

describe("addAnswerToDB", () => {
  it("should add an answer to the database and update the user record", async () => {
    const ans = {
      text: "This is a new answer",
      ans_by: { _id: new ObjectId() },
    };
    const qid = new ObjectId();

    User.findOneAndUpdate.mockResolvedValue({
      _id: ans.ans_by._id,
      answered_questions: 1,
    });

    Answer.create.mockResolvedValue({
      ...ans,
      _id: new ObjectId(),
    });

    Question.findOneAndUpdate = jest.fn().mockImplementation(() => {
      return {
        _id: qid,
        answers: [ans._id],
      };
    });

    const result = await addAnswerToDB(ans, qid);

    expect(User.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: ans.ans_by._id },
      { $inc: { answered_questions: 1 } },
      { new: true }
    );
    expect(Answer.create).toHaveBeenCalledWith(ans);
    expect(Question.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: qid },
      { $push: { answers: { $each: [result._id], $position: 0 } } },
      { new: true }
    );
    expect(result).toHaveProperty("_id");
  });
});

describe("addVoteAnswerDB", () => {
  it("should add a vote to an answer", async () => {
    const answerId = "1";
    const username = "user1";
    const doubleClicked = false;
    const mockAnswer = { _id: answerId, votes: 1 };

    Answer.findOneAndUpdate.mockResolvedValue(mockAnswer);

    const result = await addVoteAnswerDB(answerId, username, doubleClicked);

    expect(Answer.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: answerId },
      { $inc: { votes: 1 } },
      { new: true }
    );
    expect(result).toEqual(mockAnswer);
  });
});

describe("removeVoteAnswerDB", () => {
  beforeEach(() => {
    jest.clearAllMocks(); // Clears any previous settings
  });

  it("should remove a vote from an answer and update user upvoted_entity on double click", async () => {
    const answerId = "1";
    const userEmail = "user@example.com";
    const doubleClicked = true;
    const updatedAnswer = { _id: answerId, votes: -1 };

    Answer.findOneAndUpdate.mockResolvedValue(updatedAnswer);
    User.findOneAndUpdate.mockResolvedValue({});

    const result = await removeVoteAnswerDB(answerId, userEmail, doubleClicked);

    expect(Answer.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: answerId },
      { $inc: { votes: -1 } },
      { new: true }
    );

    expect(User.findOneAndUpdate).toHaveBeenCalledWith(
      { email: userEmail },
      { $pull: { upvoted_entity: answerId } },
      { upsert: true }
    );

    expect(result).toEqual(updatedAnswer);
  });

  it("should move the vote from upvoted to downvoted when not double-clicked", async () => {
    const answerId = "1";
    const userEmail = "user@example.com";
    const doubleClicked = false;
    const updatedAnswer = { _id: answerId, votes: -1 };

    Answer.findOneAndUpdate.mockResolvedValue(updatedAnswer);
    User.findOneAndUpdate.mockResolvedValue({});

    await removeVoteAnswerDB(answerId, userEmail, doubleClicked);

    expect(User.findOneAndUpdate).toHaveBeenCalledWith(
      { email: userEmail },
      {
        $addToSet: { downvoted_entity: answerId },
        $pull: { upvoted_entity: answerId },
      },
      { upsert: true }
    );
  });
});

describe("switchVoteAnswerDB", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should switch a vote on an answer to up", async () => {
    const answerId = "1";
    const userEmail = "user1@example.com";
    const switchTo = "up";
    const updatedAnswer = { _id: answerId, votes: 2 };

    Answer.findOneAndUpdate.mockResolvedValue(updatedAnswer);
    User.findOneAndUpdate.mockResolvedValue({});

    const result = await switchVoteAnswerDB(answerId, userEmail, switchTo);

    expect(Answer.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: answerId },
      { $inc: { votes: 2 } },
      { new: true }
    );
    expect(User.findOneAndUpdate).toHaveBeenCalledWith(
      { email: userEmail },
      {
        $addToSet: { upvoted_entity: answerId },
        $pull: { downvoted_entity: answerId },
      },
      { upsert: true }
    );
    expect(result).toEqual(updatedAnswer);
  });

  it("should switch a vote on an answer to down", async () => {
    const answerId = "1";
    const userEmail = "user2@example.com";
    const switchTo = "down";
    const updatedAnswer = { _id: answerId, votes: 0 };

    Answer.findOneAndUpdate.mockResolvedValue(updatedAnswer);
    User.findOneAndUpdate.mockResolvedValue({});

    const result = await switchVoteAnswerDB(answerId, userEmail, switchTo);

    expect(Answer.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: answerId },
      { $inc: { votes: -2 } },
      { new: true }
    );
    expect(User.findOneAndUpdate).toHaveBeenCalledWith(
      { email: userEmail },
      {
        $addToSet: { downvoted_entity: answerId },
        $pull: { upvoted_entity: answerId },
      },
      { upsert: true }
    );
    expect(result).toEqual(updatedAnswer);
  });
});

describe("updateAnswerStatusInDB", () => {
  const mockUnapprovedAnswers = [
    { _id: "2", approved: false, ans_by: { name: "John Doe" } },
  ];

  beforeEach(() => {
    jest.clearAllMocks(); // Clears any previous settings if necessary

    // Setting up chainable mocks
    Answer.find.mockImplementation(() => ({
      populate: jest.fn().mockResolvedValue(mockUnapprovedAnswers),
    }));
  });

  it("should update the approval status of an answer to approved and fetch unapproved answers", async () => {
    const aid = "1";
    const approved = true;

    Answer.findOneAndUpdate.mockResolvedValue({
      _id: aid,
      approved: approved,
    });

    const result = await updateAnswerStatusInDB(aid, approved);

    expect(Answer.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: aid },
      { approved: true },
      { new: true }
    );
    expect(Answer.find).toHaveBeenCalledWith({ approved: false });
    expect(result).toEqual(mockUnapprovedAnswers);
  });

  it("should delete the answer if setting approval status to false and fetch unapproved answers", async () => {
    const aid = "1";
    const approved = false;

    Answer.deleteOne.mockResolvedValue({ acknowledged: true, deletedCount: 1 });

    const result = await updateAnswerStatusInDB(aid, approved);

    expect(Answer.deleteOne).toHaveBeenCalledWith({ _id: aid });
    expect(Answer.find).toHaveBeenCalledWith({ approved: false });
    expect(result).toEqual(mockUnapprovedAnswers);
  });
});
