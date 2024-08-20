jest.mock("../../models/usersModel");
jest.mock("../../models/questionsModel");
jest.mock("../../models/answersModel");
const User = require("../../models/usersModel");
const Question = require("../../models/questionsModel");
const Answer = require("../../models/answersModel");

const {
  saveUserToDB,
  checkIfUserExsistsInDB,
  removeUserRefreshTokenInDB,
  getUserInterestsFromDB,
  getSavedQuestionsFromDB,
  getMaxAnsDate,
  getAllUsersDB,
  getUserProfileInfoFromDB,
  getUserProfileByEmailFromDB,
  getSearchedUsersFromDB,
  getUserPostsFromDB,
  deleteUserPostsInDB,
  updateUserSavedQuestionsInDB,
} = require("../../utils/userUtils");

describe("checkIfUserExsistsInDB", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return the user object when a user exists with the given email", async () => {
    const mockEmail = "test@example.com";
    const mockUser = { id: "1", email: mockEmail, name: "Test User" };

    User.findOne.mockResolvedValue(mockUser);

    const result = await checkIfUserExsistsInDB(mockEmail);

    expect(User.findOne).toHaveBeenCalledWith({ email: mockEmail });
    expect(result).toEqual(mockUser);
  });

  it("should return null when no user exists with the given email", async () => {
    const mockEmail = "nonexistent@example.com";

    User.findOne.mockResolvedValue(null);

    const result = await checkIfUserExsistsInDB(mockEmail);

    expect(User.findOne).toHaveBeenCalledWith({ email: mockEmail });
    expect(result).toBeNull();
  });
});

describe("saveUserToDB", () => {
  it("should call save on the user object", async () => {
    const mockUser = {
      email: "test@example.com",
      name: "Test User",
      save: jest.fn().mockResolvedValue(true),
    };

    await saveUserToDB(mockUser);

    expect(mockUser.save).toHaveBeenCalled();
  });
});

describe("removeUserRefreshTokenInDB", () => {
  it("should call findOneAndUpdate to unset the user refreshToken", async () => {
    const refreshToken = "some-refresh-token";
    User.findOneAndUpdate.mockResolvedValue({});

    await removeUserRefreshTokenInDB(refreshToken);

    expect(User.findOneAndUpdate).toHaveBeenCalledWith(
      { refreshToken },
      { $unset: { refreshToken: 1 } }
    );
  });
});

describe("getUserInterestsFromDB", () => {
  it("should return interest names for a given user email", async () => {
    const email = "user@example.com";
    const mockInterests = [
      { _id: "1", name: "Photography" },
      { _id: "2", name: "Reading" },
    ];

    User.findOne.mockImplementation(() => ({
      populate: jest.fn().mockResolvedValue({
        interests: mockInterests,
      }),
    }));

    const interestNames = await getUserInterestsFromDB(email);

    expect(User.findOne).toHaveBeenCalledWith({ email: email });
    expect(interestNames).toEqual(
      mockInterests.map((interest) => interest.name)
    );
  });
});

describe("getSavedQuestionsFromDB", () => {
  const mockQuestions = [
    {
      _id: "q1",
      title: "Question 1",
      ask_date_time: new Date("2021-01-01"),
      answers: [],
      asked_by: { name: "User A" },
      tags: [{ name: "tag1" }],
    },
    {
      _id: "q2",
      title: "Question 2",
      ask_date_time: new Date("2022-01-01"),
      answers: [
        { ans_date_time: new Date("2022-01-02"), ans_by: { name: "User B" } },
      ],
      asked_by: { name: "User B" },
      tags: [{ name: "tag2" }],
    },
    {
      _id: "q3",
      title: "Question 3",
      ask_date_time: new Date("2023-01-01"),
      answers: [
        { ans_date_time: new Date("2023-01-03"), ans_by: { name: "User C" } },
        { ans_date_time: new Date("2023-01-02"), ans_by: { name: "User D" } },
      ],
      asked_by: { name: "User C" },
      tags: [{ name: "tag3" }],
    },
  ];

  const mockUser = [
    {
      email: "user@example.com",
      saved_posts: mockQuestions,
    },
  ];

  function getMaxAnsDate(question) {
    if (!question.answers.length) return 0;
    return Math.max(...question.answers.map((ans) => ans.ans_date_time));
  }

  beforeAll(() => {
    User.find.mockImplementation(() => ({
      populate: jest.fn().mockResolvedValue(mockUser),
    }));
  });

  it("should retrieve and sort saved questions by newest", async () => {
    const email = "user@example.com";
    const order = "newest";

    const results = await getSavedQuestionsFromDB(email, order);

    expect(results[0]._id).toBe("q3");
    expect(results[1]._id).toBe("q2");
    expect(results[2]._id).toBe("q1");
  });

  it("should retrieve and filter unanswered saved questions", async () => {
    const email = "user@example.com";
    const order = "unanswered";

    const results = await getSavedQuestionsFromDB(email, order);

    expect(results.length).toBe(1);
    expect(results[0]._id).toBe("q1");
  });

  it("should retrieve and sort saved questions by most active", async () => {
    const email = "user@example.com";
    const order = "active";

    const results = await getSavedQuestionsFromDB(email, order);

    expect(results[0]._id).toBe("q3");
    expect(results[1]._id).toBe("q2");
    expect(results[2]._id).toBe("q1");
  });
});

describe("getAllUsersDB", () => {
  it("should retrieve all users except the specified one and populate their interests", async () => {
    const excludedEmail = "exclude@example.com";
    const mockUsers = [
      {
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        profile_pic_large: "path/to/pic.jpg",
        interests: [{ name: "Photography" }],
        joined_on: new Date("2020-01-01"),
      },
      {
        firstName: "Jane",
        lastName: "Doe",
        email: "jane@example.com",
        profile_pic_large: "path/to/pic2.jpg",
        interests: [{ name: "Cooking" }],
        joined_on: new Date("2021-01-01"),
      },
    ];

    const query = {
      ne: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      populate: jest.fn().mockResolvedValue(mockUsers),
    };
    User.find.mockReturnValue(query);

    const results = await getAllUsersDB(excludedEmail);

    expect(User.find).toHaveBeenCalled();
    expect(query.ne).toHaveBeenCalledWith("email", excludedEmail);
    expect(query.select).toHaveBeenCalledWith(
      "firstName lastName email profile_pic_large interests joined_on"
    );
    expect(query.populate).toHaveBeenCalledWith({
      path: "interests",
      select: "name",
    });
    expect(results).toEqual(mockUsers);
  });
});

describe("getUserProfileInfoFromDB", () => {
  it("should retrieve user profile information by email excluding password and refreshToken", async () => {
    const email = "user@example.com";
    const mockUser = [
      {
        _id: "1",
        email: "user@example.com",
        name: "John Doe",
        interests: [{ _id: "2", name: "Photography" }],
      },
    ];

    const query = {
      select: jest.fn().mockReturnThis(),
      populate: jest.fn().mockResolvedValue(mockUser),
    };
    User.find.mockReturnValue(query);

    const result = await getUserProfileInfoFromDB(email);

    expect(User.find).toHaveBeenCalledWith({ email: email });
    expect(query.select).toHaveBeenCalledWith("-password -refreshToken");
    expect(query.populate).toHaveBeenCalledWith("interests");
    expect(result).toEqual(mockUser);
  });
});

describe("getUserProfileByEmailFromDB", () => {
  it("should retrieve user profile information by email excluding sensitive fields and populate interests", async () => {
    const email = "test@example.com";
    const mockUserProfile = {
      _id: "123",
      email: "test@example.com",
      name: "Test User",
      interests: [{ _id: "456", name: "Reading" }],
    };

    User.findOne.mockImplementation(() => ({
      select: jest.fn().mockReturnThis(),
      populate: jest.fn().mockResolvedValue(mockUserProfile),
    }));

    const result = await getUserProfileByEmailFromDB(email);

    expect(User.findOne).toHaveBeenCalledWith({ email: email });
    expect(result).toEqual(mockUserProfile);
    expect(result).toMatchObject({ email: email });
    expect(result.interests[0]).toHaveProperty("name", "Reading");
  });

  it("should handle cases where no user is found", async () => {
    const email = "notfound@example.com";

    User.findOne.mockImplementation(() => ({
      select: jest.fn().mockReturnThis(),
      populate: jest.fn().mockResolvedValue(null),
    }));

    const result = await getUserProfileByEmailFromDB(email);

    expect(User.findOne).toHaveBeenCalledWith({ email: email });
    expect(result).toBeNull();
  });
});

describe("getSearchedUsersFromDB", () => {
  it("should retrieve matched users based on search criteria", async () => {
    const searchedUser = "John Doe";
    const mockUsers = [
      {
        _id: "1",
        email: "john.doe@example.com",
        firstName: "John",
        lastName: "Doe",
        interests: [{ name: "Photography" }],
      },
      {
        _id: "2",
        email: "jane.doe@example.com",
        firstName: "Jane",
        lastName: "Doe",
        interests: [{ name: "Reading" }],
      },
    ];

    User.find.mockImplementation(() => ({
      populate: jest.fn().mockReturnThis(),
      select: jest.fn().mockResolvedValue(mockUsers),
    }));

    const results = await getSearchedUsersFromDB(searchedUser);

    expect(User.find).toHaveBeenCalledWith({
      $or: [
        { email: { $regex: "John|Doe", $options: "i" } },
        { firstName: { $regex: "John|Doe", $options: "i" } },
        { lastName: { $regex: "John|Doe", $options: "i" } },
      ],
    });
    expect(results).toEqual(mockUsers);
  });

  it("should handle cases with no matches", async () => {
    const searchedUser = "Nonexistent User";
    User.find.mockImplementation(() => ({
      populate: jest.fn().mockReturnThis(),
      select: jest.fn().mockResolvedValue([]),
    }));

    const results = await getSearchedUsersFromDB(searchedUser);

    expect(User.find).toHaveBeenCalledWith({
      $or: [
        { email: { $regex: "Nonexistent|User", $options: "i" } },
        { firstName: { $regex: "Nonexistent|User", $options: "i" } },
        { lastName: { $regex: "Nonexistent|User", $options: "i" } },
      ],
    });
    expect(results).toEqual([]);
  });
});

describe("getUserPostsFromDB", () => {
  it("should fetch user posts and categorize them correctly", async () => {
    const userEmail = "test@example.com";
    const mockUser = {
      _id: "userId123",
      email: userEmail,
    };

    const mockQuestions = [
      { _id: "q1", title: "Question 1", approved: true, asked_by: mockUser },
      { _id: "q2", title: "Question 2", approved: false, asked_by: mockUser },
    ];

    const mockAnswers = [
      { _id: "a1", text: "Answer 1", approved: true, ans_by: mockUser },
      { _id: "a2", text: "Answer 2", approved: false, ans_by: mockUser },
    ];

    const mockQuestionTitles = [
      { _id: "q1", title: "Question 1", answers: ["a1", "a2"] },
    ];

    User.findOne.mockResolvedValue(mockUser);
    Question.find = jest
      .fn()
      .mockImplementation(() => ({
        populate: jest
          .fn()
          .mockImplementation(() => ({
            populate: jest.fn().mockResolvedValueOnce(mockQuestions),
          })),
      }));

    Answer.find = jest
      .fn()
      .mockImplementation(() => ({
        populate: jest.fn().mockResolvedValueOnce(mockAnswers),
      }));

    Question.aggregate.mockResolvedValue(mockQuestionTitles);

    const result = await getUserPostsFromDB(userEmail);

    expect(User.findOne).toHaveBeenCalledWith({ email: userEmail });
    expect(Question.find).toHaveBeenCalledWith({ asked_by: mockUser });
    expect(Answer.find).toHaveBeenCalledWith({ ans_by: mockUser });
    expect(Question.aggregate).toHaveBeenCalled();
  });

  it("should throw an error if the user is not found", async () => {
    const userEmail = "notfound@example.com";
    User.findOne.mockResolvedValue(null);

    await expect(getUserPostsFromDB(userEmail)).rejects.toThrow(
      "User not found"
    );
  });
});

describe("deleteUserPostsInDB", () => {
  it('should delete a question when type is "question"', async () => {
    const postId = "123";
    Question.deleteOne = jest.fn().mockResolvedValue({ deletedCount: 1 });

    await deleteUserPostsInDB("question", postId);

    expect(Question.deleteOne).toHaveBeenCalledWith({ _id: postId });
  });

  it('should delete an answer when type is "answer"', async () => {
    const postId = "456";
    Answer.deleteOne = jest.fn().mockResolvedValue({ deletedCount: 1 });

    await deleteUserPostsInDB("answer", postId);

    expect(Answer.deleteOne).toHaveBeenCalledWith({ _id: postId });
  });

  it("should handle cases with non-existing posts", async () => {
    const postId = "789";
    Answer.deleteOne = jest.fn().mockResolvedValue({ deletedCount: 0 });

    const result = await deleteUserPostsInDB("answer", postId);

    expect(Answer.deleteOne).toHaveBeenCalledWith({ _id: postId });
  });
});

describe("updateUserSavedQuestionsInDB", () => {
  const userId = "user123";
  const questionId = "question123";

  it("should add a question to the saved questions list", async () => {
    const mockUser = {
      _id: userId,
      saved_posts: [questionId],
    };
    User.findOneAndUpdate = jest.fn().mockResolvedValue(mockUser);

    const result = await updateUserSavedQuestionsInDB(
      userId,
      questionId,
      "save"
    );

    expect(User.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: userId },
      { $push: { saved_posts: { $each: [questionId], $position: 0 } } },
      { new: true }
    );
    expect(result).toEqual(mockUser);
  });

  it("should remove a question from the saved questions list", async () => {
    const mockUser = {
      _id: userId,
      saved_posts: [],
    };
    User.findOneAndUpdate = jest.fn().mockResolvedValue(mockUser);

    const result = await updateUserSavedQuestionsInDB(
      userId,
      questionId,
      "remove"
    );

    expect(User.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: userId },
      { $pull: { saved_posts: questionId } },
      { new: true }
    );
    expect(result).toEqual(mockUser);
  });
});
