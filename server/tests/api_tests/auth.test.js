const supertest = require("supertest");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");

const {
  API_ACCESS_TOKEN_SECRET,
  API_REFRESH_TOKEN_SECRET,
} = require("../../config");
const User = require("../../models/usersModel");
const Question = require("../../models/questionsModel");

jest.mock("../../models/usersModel");
jest.mock("../../models/questionsModel");
jest.mock("../../utils/questionUtils");
jest.mock("../../utils/userUtils");
jest.mock("../../utils/tagUtils");
jest.mock("../../utils/commentUtils");

const {
  saveUserToDB,
  checkIfUserExsistsInDB,
  removeUserRefreshTokenInDB,
} = require("../../utils/userUtils");

const { findTagByNameInDB } = require("../../utils/tagUtils");

let server;
let token;

beforeEach(() => {
server = require("../../server");
  token = jwt.sign({ username: "testuser" }, API_ACCESS_TOKEN_SECRET, {
    expiresIn: "6h",
  });
});

afterEach(async () => {
  await mongoose.disconnect();
  jest.clearAllMocks();
  server.close();
});

describe("POST /register", () => {
  it("should register a new user", async () => {
    const userData = {
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      password: "password123",
      interestedFields: ["tech", "science"],
      image128: "path/to/image128.png",
      image75: "path/to/image75.png",
      about_me: "A bit about John",
    };

    findTagByNameInDB.mockImplementation((tagName) =>
      Promise.resolve({ _id: "tagId", name: tagName })
    );
    saveUserToDB.mockResolvedValue(true);

    const response = await supertest(server)
      .post("/auth/register")
      .send({ userDataWithImages: userData })
      .expect(201);

    expect(response.body.email).toEqual(userData.email);
    expect(saveUserToDB).toHaveBeenCalledTimes(1);
  });
});

describe("POST /login", () => {
  it("should login a user", async () => {
    const userCredentials = {
      username: "john@example.com",
      password: "password123",
    };
    const user = { email: "john@example.com", password: "hashedPassword" };

    checkIfUserExsistsInDB.mockResolvedValue(user);
    jest.spyOn(bcrypt, "compare").mockImplementation(() => {
      return true;
    });

    jest.spyOn(jwt, "sign").mockImplementation(() => {
      return "accessTokenHere";
    });

    const response = await supertest(server)
      .post("/auth/login")
      .send(userCredentials)
      .expect(200);

    expect(response.headers["set-cookie"]).toBeDefined();
  });
});

describe("POST /refreshToken", () => {
  it("should refresh user access token", async () => {
    jest.spyOn(jwt, "verify").mockImplementation((token, secret, callback) => {
      callback(null, { username: "john@example.com" });
    });

    const response = await supertest(server)
      .post("/auth/refreshToken")
      .set("Cookie", `refreshToken=${token}`)
      .expect(200);

    expect(response.body.refreshTokenExpired).toBe(false);
  });
});

describe("POST /logout", () => {
  it("should logout a user", async () => {
    removeUserRefreshTokenInDB.mockResolvedValue(true);

    const response = await supertest(server)
      .post("/auth/logout")
      .set("Cookie", `refreshToken=${token}`)
      .expect(204);

    expect(removeUserRefreshTokenInDB).toHaveBeenCalled();
  });
});

describe("GET /isAuthorized", () => {
  it("should check if user is authorized", async () => {
    jest.spyOn(jwt, "verify").mockImplementation((token, secret, callback) => {
      callback(null, { username: "john@example.com" });
    });

    const response = await supertest(server)
      .get("/auth/isAuthorized")
      .set("Cookie", `accessToken=${token}`)
      .expect(200);

    expect(response.body.authorized).toBe(true);
  });
});

