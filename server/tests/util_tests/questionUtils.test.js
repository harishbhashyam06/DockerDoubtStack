const mongoose = require("mongoose");
const {
  getMaxAnsDate,
  addQuestionToDB,
  addVoteQuestionDB,
  getCommentsFromDB,
  switchVoteQuestionDB,
  removeVoteQuestionDB,
  updateQuestionStatusInDB,
  getQuestionsByOrderFromDB,
  updateQuestionViewCountInDB,
  getUnapprovedQuestionsFromDB,
  getUserPostedQuestionsFromDB,
  filterQuestionsBySearchFromDB,
  getInterestQuestionsByUserFromDB,
} = require("../../utils/questionUtils");
const { ObjectId } = mongoose.Types;

jest.mock("../../models/answersModel");
jest.mock("../../models/commentsModel");
jest.mock("../../models/usersModel");
jest.mock("../../models/tagsModel");

const Answer = require("../../models/answersModel");
const Question = require("../../models/questionsModel");
const Comment = require("../../models/commentsModel");
const User = require("../../models/usersModel");
const Tag = require("../../models/tagsModel");

const mockQuestions = [
  {
    _id: "1",
    title: "First Question",
    text: "Something",
    ask_date_time: new Date("2021-01-01T12:00:00Z"),
    answers: [{ approved: true, ans_by: { username: "user1" } }],
    asked_by: { username: "user1" },
    tags: [
      {
        name: "react",
      },
    ],
  },
  {
    _id: "2",
    title: "Second Question",
    text: "Something",
    ask_date_time: new Date("2020-01-01T12:00:00Z"),
    answers: [],
    asked_by: { username: "user2" },
    tags: [
      {
        name: "vue",
      },
    ],
  },
  {
    _id: "3",
    title: "Third Question",
    text: "Something",
    ask_date_time: new Date("2022-01-01T12:00:00Z"),
    answers: [{ approved: true, ans_by: { username: "user3" } }],
    asked_by: { username: "user3" },
    tags: [],
  },
];

describe("addQuestionToDB", () => {
  it("should add a new question and increment the user’s asked question count", async () => {
    const mockUser = {
      _id: "userId123",
      questions_asked: 1,
    };
    const questionData = {
      title: "How to test?",
      text: "Testing details",
      asked_by: { _id: mockUser._id },
      ask_date_time: "2021-01-01",
    };
    const tags = [{ name: "testing" }];

    User.findOneAndUpdate.mockResolvedValue({
      ...mockUser,
      questions_asked: mockUser.questions_asked + 1,
    });

    Question.create = jest.fn().mockResolvedValue({
      ...questionData,
      tags,
      asked_by: mockUser,
    });

    const result = await addQuestionToDB(questionData, tags);

    expect(User.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: mockUser._id },
      { $inc: { questions_asked: 1 } },
      { new: true }
    );

    expect(result).toHaveProperty("title", questionData.title);
    expect(result).toHaveProperty("text", questionData.text);
    expect(result).toHaveProperty("asked_by", mockUser);
  });
});

describe("getQuestionsByOrderFromDB", () => {
  it("should return questions sorted by newest", async () => {
    Question.find = jest.fn().mockImplementation(() => ({
      populate: jest.fn().mockImplementation(() => ({
        populate: jest.fn().mockImplementation(() => ({
          populate: jest.fn().mockResolvedValueOnce(mockQuestions),
        })),
      })),
    }));

    const questions = await getQuestionsByOrderFromDB("newest");

    expect(questions[0]._id).toBe("3");
    expect(questions[1]._id).toBe("1");
    expect(questions[2]._id).toBe("2");
  });

  it("should return questions sorted by unanswered", async () => {
    Question.find = jest.fn().mockImplementation(() => ({
      populate: jest.fn().mockImplementation(() => ({
        populate: jest.fn().mockImplementation(() => ({
          populate: jest.fn().mockResolvedValueOnce(mockQuestions),
        })),
      })),
    }));

    const questions = await getQuestionsByOrderFromDB("unanswered");

    expect(questions.length).toBe(1);
    expect(questions[0]._id).toBe("2");
  });

  it("should return questions sorted by active", async () => {
    const questionsWithMaxAnsDateSorted = [...mockQuestions].sort((a, b) => {
      const lastAnsA =
        a.answers.length > 0
          ? a.answers.reduce(
              (latest, current) =>
                current.ans_date_time > latest ? current.ans_date_time : latest,
              a.answers[0].ans_date_time
            )
          : 0;
      const lastAnsB =
        b.answers.length > 0
          ? b.answers.reduce(
              (latest, current) =>
                current.ans_date_time > latest ? current.ans_date_time : latest,
              b.answers[0].ans_date_time
            )
          : 0;
      return lastAnsB - lastAnsA;
    });

    Question.exec = jest.fn().mockResolvedValue(questionsWithMaxAnsDateSorted);

    const questions = await getQuestionsByOrderFromDB("active");
  });
});

describe("filterQuestionsBySearchFromDB", () => {
  it("should filter questions by tag", () => {
    const search = "[react]";
    const filtered = filterQuestionsBySearchFromDB(mockQuestions, search);
    expect(filtered.length).toBe(1);
  });

  it("should filter questions by multiple tags", () => {
    const search = "[react] [vue]";
    const filtered = filterQuestionsBySearchFromDB(mockQuestions, search);
    expect(filtered.length).toBe(2);
  });

  it("should filter questions by keywords in title or text", () => {
    const search = "Second";
    const filtered = filterQuestionsBySearchFromDB(mockQuestions, search);
    expect(filtered.length).toBe(1);
    expect(filtered[0]._id).toBe("2");
  });

  it("should combine tag and keyword search", () => {
    const search = "[react] Second";
    const filtered = filterQuestionsBySearchFromDB(mockQuestions, search);
    expect(filtered.length).toBe(2);
  });

  it("should handle non-matching search terms", () => {
    const search = "typescript";
    const filtered = filterQuestionsBySearchFromDB(mockQuestions, search);
    expect(filtered.length).toBe(0);
  });
});

describe("getInterestQuestionsByUserFromDB", () => {
  it("should return questions sorted by newest", async () => {
    Tag.distinct = jest.fn().mockImplementation(() => ({
      populate: jest.fn().mockResolvedValueOnce([]),
    }));

    Question.find = jest.fn().mockImplementation(() => ({
      populate: jest.fn().mockImplementation(() => ({
        populate: jest.fn().mockImplementation(() => ({
          populate: jest.fn().mockResolvedValueOnce(mockQuestions),
        })),
      })),
    }));

    const questions = await getInterestQuestionsByUserFromDB("newest");

    expect(questions[0]._id).toBe("3");
    expect(questions[1]._id).toBe("1");
    expect(questions[2]._id).toBe("2");
  });

  it("should return questions sorted by unanswered", async () => {
    Question.find = jest.fn().mockImplementation(() => ({
      populate: jest.fn().mockImplementation(() => ({
        populate: jest.fn().mockImplementation(() => ({
          populate: jest.fn().mockResolvedValueOnce(mockQuestions),
        })),
      })),
    }));

    const questions = await getInterestQuestionsByUserFromDB("unanswered");

    expect(questions[0]._id).toBe("3");
  });

  it("should return questions sorted by active", async () => {
    const questionsWithMaxAnsDateSorted = [...mockQuestions].sort((a, b) => {
      const lastAnsA =
        a.answers.length > 0
          ? a.answers.reduce(
              (latest, current) =>
                current.ans_date_time > latest ? current.ans_date_time : latest,
              a.answers[0].ans_date_time
            )
          : 0;
      const lastAnsB =
        b.answers.length > 0
          ? b.answers.reduce(
              (latest, current) =>
                current.ans_date_time > latest ? current.ans_date_time : latest,
              b.answers[0].ans_date_time
            )
          : 0;
      return lastAnsB - lastAnsA;
    });

    Question.exec = jest.fn().mockResolvedValue(questionsWithMaxAnsDateSorted);

    const questions = await getInterestQuestionsByUserFromDB("active");
  });
});

describe("getUserPostedQuestionsFromDB", () => {
  it("should retrieve questions for a valid user email", async () => {
    const mockUser = {
      _id: "123",
      email: "test@example.com",
    };
    const mockQuestions = [
      { _id: "q1", title: "First Question", asked_by: mockUser._id },
      { _id: "q2", title: "Second Question", asked_by: mockUser._id },
    ];

    User.findOne.mockResolvedValue(mockUser);
    Question.find.mockResolvedValue(mockQuestions);

    const results = await getUserPostedQuestionsFromDB(mockUser.email);

    expect(User.findOne).toHaveBeenCalledWith({ email: mockUser.email });
    expect(Question.find).toHaveBeenCalledWith({ asked_by: mockUser._id });
    expect(results).toEqual(mockQuestions);
  });

  it("should throw an error if no user is found", async () => {
    User.findOne.mockResolvedValue(null);

    await expect(
      getUserPostedQuestionsFromDB("nonexistent@example.com")
    ).rejects.toThrow("User not found");

    expect(User.findOne).toHaveBeenCalled();
    expect(Question.find).not.toHaveBeenCalled();
  });
});

describe("getUnapprovedQuestionsFromDB", () => {
  it("should retrieve only unapproved questions", async () => {
    const mockQuestions = [
      { _id: "q1", title: "Unapproved Question 1", approved: false },
      { _id: "q2", title: "Unapproved Question 2", approved: false },
    ];

    Question.find = jest.fn().mockImplementation(() => ({
      populate: jest.fn().mockImplementation(() => ({
        populate: jest.fn().mockResolvedValueOnce(mockQuestions),
      })),
    }));

    const results = await getUnapprovedQuestionsFromDB();

    expect(Question.find).toHaveBeenCalledWith({ approved: false });

    expect(results).toEqual(mockQuestions);
  });

  it("should handle the case when no unapproved questions are found", async () => {
    Question.find = jest.fn().mockImplementation(() => ({
      populate: jest.fn().mockImplementation(() => ({
        populate: jest.fn().mockResolvedValueOnce([]),
      })),
    }));

    const results = await getUnapprovedQuestionsFromDB();

    expect(results).toEqual([]);
  });
});

describe("updateQuestionStatusInDB", () => {
  it("should update the approval status to true and return unapproved questions", async () => {
    const qid = "123";
    const approved = true;
    const mockUnapprovedQuestions = [
      { _id: "1", title: "Question 1", approved: false },
    ];

    Question.findOneAndUpdate = jest.fn().mockImplementation(() => {
      return {
        _id: qid,
        approved: approved,
      };
    });

    Question.find = jest.fn().mockImplementation(() => ({
      populate: jest.fn().mockImplementation(() => ({
        populate: jest.fn().mockResolvedValueOnce(mockUnapprovedQuestions),
      })),
    }));

    const results = await updateQuestionStatusInDB(qid, approved);

    expect(Question.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: qid },
      { approved: true },
      { new: true }
    );
    expect(Question.find).toHaveBeenCalledWith({ approved: false });
    expect(results).toEqual(mockUnapprovedQuestions);
  });

  it("should delete the question if approval status is set to false and return unapproved questions", async () => {
    const qid = "123";
    const approved = false;
    const mockUnapprovedQuestions = [
      { _id: "1", title: "Question 1", approved: false },
    ];

    Question.deleteOne = jest.fn().mockImplementation(() => {
      return { deletedCount: 1 };
    });

    Question.find = jest.fn().mockImplementation(() => ({
      populate: jest.fn().mockImplementation(() => ({
        populate: jest.fn().mockResolvedValueOnce(mockUnapprovedQuestions),
      })),
    }));

    const results = await updateQuestionStatusInDB(qid, approved);

    expect(Question.deleteOne).toHaveBeenCalledWith({ _id: qid });
    expect(Question.find).toHaveBeenCalledWith({ approved: false });
    expect(results).toEqual(mockUnapprovedQuestions);
  });
});

describe('getCommentsFromDB', () => {
    it('should retrieve comments for a given question ID', async () => {
      const questionId = '1';
      const mockComments = [
        { _id: 'c1', text: 'Comment 1', comment_by: { username: 'user1' } },
        { _id: 'c2', text: 'Comment 2', comment_by: { username: 'user2' } }
      ];
  
      Question.findOne = jest.fn().mockImplementation(() => ({ populate: jest.fn().mockResolvedValueOnce({
        _id: questionId,
        comments: mockComments
      })}));
  
      const results = await getCommentsFromDB(questionId);
  
      expect(Question.findOne).toHaveBeenCalledWith({ _id: questionId });
      expect(results).toEqual(mockComments);
    });
  });

  describe('Voting on questions', () => {
    const qid = 'question1';
    const userEmail = 'user@example.com';
    const mockQuestion = {
      _id: qid,
      title: "Sample Question",
      votes: 5
    };
  
    beforeEach(() => {
      Question.findOneAndUpdate.mockClear();
      User.findOneAndUpdate.mockClear();
    });
  
    describe('addVoteQuestionDB', () => {
      it('should add a vote to a question', async () => {
        Question.findOneAndUpdate.mockResolvedValue({ ...mockQuestion, votes: mockQuestion.votes + 1 });
  
        const result = await addVoteQuestionDB(qid, userEmail, false);
  
        expect(Question.findOneAndUpdate).toHaveBeenCalledWith(
          { _id: qid },
          { $inc: { votes: 1 } },
          { new: true }
        );
        expect(User.findOneAndUpdate).toHaveBeenCalledWith(
          { email: userEmail },
          { $addToSet: { upvoted_entity: qid }, $pull: { downvoted_entity: qid } },
          { upsert: true }
        );
        expect(result.votes).toBe(mockQuestion.votes + 1);
      });
  
      it('should undo a vote if double-clicked', async () => {
        Question.findOneAndUpdate.mockResolvedValue({ ...mockQuestion, votes: mockQuestion.votes - 1 });
  
        const result = await addVoteQuestionDB(qid, userEmail, true);
  
        expect(User.findOneAndUpdate).toHaveBeenCalledWith(
          { email: userEmail },
          { $pull: { downvoted_entity: qid } },
          { upsert: true }
        );
      });
    });
  
    describe('removeVoteQuestionDB', () => {
      it('should remove a vote from a question', async () => {
        Question.findOneAndUpdate.mockResolvedValue({ ...mockQuestion, votes: mockQuestion.votes - 1 });
  
        const result = await removeVoteQuestionDB(qid, userEmail, false);
  
        expect(Question.findOneAndUpdate).toHaveBeenCalledWith(
          { _id: qid },
          { $inc: { votes: -1 } },
          { new: true }
        );
        expect(User.findOneAndUpdate).toHaveBeenCalledWith(
          { email: userEmail },
          { $addToSet: { downvoted_entity: qid }, $pull: { upvoted_entity: qid } },
          { upsert: true }
        );
      });
    });
  
    describe('switchVoteQuestionDB', () => {
      it('should switch a vote from down to up on a question', async () => {
        Question.findOneAndUpdate.mockResolvedValue({ ...mockQuestion, votes: mockQuestion.votes + 2 });
  
        const result = await switchVoteQuestionDB(qid, userEmail, 'up');
  
        expect(Question.findOneAndUpdate).toHaveBeenCalledWith(
          { _id: qid },
          { $inc: { votes: 2 } },
          { new: true }
        );
        expect(User.findOneAndUpdate).toHaveBeenCalledWith(
          { email: userEmail },
          { $addToSet: { upvoted_entity: qid }, $pull: { downvoted_entity: qid } },
          { upsert: true }
        );
      });
  
      it('should switch a vote from up to down on a question', async () => {
        Question.findOneAndUpdate.mockResolvedValue({ ...mockQuestion, votes: mockQuestion.votes - 2 });
  
        const result = await switchVoteQuestionDB(qid, userEmail, 'down');
  
        expect(Question.findOneAndUpdate).toHaveBeenCalledWith(
          { _id: qid },
          { $inc: { votes: -2 } },
          { new: true }
        );
        expect(User.findOneAndUpdate).toHaveBeenCalledWith(
          { email: userEmail },
          { $addToSet: { downvoted_entity: qid }, $pull: { upvoted_entity: qid } },
          { upsert: true }
        );
      });
    });
  });