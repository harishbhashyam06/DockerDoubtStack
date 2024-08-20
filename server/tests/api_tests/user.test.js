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
  getAllUsersDB,
  getUserPostsFromDB,
  getSearchedUsersFromDB,
  getUserProfileInfoFromDB,
  getUserProfileByEmailFromDB,
} = require("../../utils/userUtils");

let server ;
let token;

beforeEach(() => {
    server = require("../../server");
  token = jwt.sign({ username: "testuser" }, API_ACCESS_TOKEN_SECRET, {
    expiresIn: "1h",
  });
});

afterEach(async () => {
    await mongoose.disconnect();
    server.close();
  });
  

describe("GET /getUserProfileInfo", () => {
  it("should retrieve profile information for the authenticated user", async () => {
    const userProfile = { username: "testuser", email: "test@example.com" };
    getUserProfileInfoFromDB.mockResolvedValue(userProfile);

    const response = await supertest(server)
      .get("/user/getUserProfile")
      .set("Cookie", `accessToken=${token}`)
      .expect(200);

    expect(response.body).toEqual(userProfile);
    expect(getUserProfileInfoFromDB).toHaveBeenCalledWith("testuser");
  });
});

describe("GET /getUserProfileByEmail/:email", () => {
  it("should retrieve profile information for a user by email", async () => {
    const userProfile = { username: "testuser", email: "test@example.com" };
    getUserProfileByEmailFromDB.mockResolvedValue(userProfile);

    const response = await supertest(server)
      .get("/user/getUserProfileByEmail/test@example.com")
      .set("Cookie", `accessToken=${token}`)
      .expect(200);

    expect(response.body).toEqual(userProfile);
    expect(getUserProfileByEmailFromDB).toHaveBeenCalledWith(
      "test@example.com"
    );
  });
});

describe("GET /getAllUsers", () => {
  it("should retrieve all users", async () => {
    const users = [{ username: "user1" }, { username: "user2" }];
    getAllUsersDB.mockResolvedValue(users);

    const response = await supertest(server)
      .get("/user/getAllUsers")
      .set("Cookie", `accessToken=${token}`)
      .expect(200);

    expect(response.body).toEqual(users);
    expect(getAllUsersDB).toHaveBeenCalled();
  });
});

describe("GET /getSearchedUsers", () => {
  it("should retrieve users matching a searched username", async () => {
    const users = [{ username: "user1" }];
    getSearchedUsersFromDB.mockResolvedValue(users);

    const response = await supertest(server)
      .get("/user/getSearchedUsers?searchedUser=user")
      .set("Cookie", `accessToken=${token}`)
      .expect(200);

    expect(response.body).toEqual(users);
    expect(getSearchedUsersFromDB).toHaveBeenCalledWith("user");
  });
});

describe("GET /getUserPosts", () => {
  it("should retrieve posts authored by the authenticated user", async () => {
    const userPosts = [{ id: "1", post: "Hello World" }];
    getUserPostsFromDB.mockResolvedValue(userPosts);

    const response = await supertest(server)
      .get("/user/getUserPosts")
      .set("Cookie", `accessToken=${token}`)
      .expect(200);

    expect(response.body).toEqual(userPosts);
    expect(getUserPostsFromDB).toHaveBeenCalledWith("testuser");
  });
});
