const request = require("supertest");
const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const { MONGO_URL, CLIENT_URL, port } = require("../../config");

const questionController = require("../../controller/questionController");
const tagController = require("../../controller/tagController");
const answerController = require("../../controller/answerController");
const userController = require("../../controller/userController");
const authController = require("../../controller/authController");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
  cors({
    credentials: true,
    origin: [CLIENT_URL],
  })
);

app.get("/", (_, res) => {
  res.send("Stack_db Endpoint");
  res.end();
});

app.use("/question", questionController);
app.use("/tag", tagController);
app.use("/answer", answerController);
app.use("/user", userController);
app.use("/auth", authController);

let server;

beforeAll(() => {
  server = require("../../server");
});

afterAll(async () => {
  await server.close();
  await mongoose.disconnect();
});

describe("Server Tests", () => {
  test("GET / returns 'Stack_db Endpoint'", async () => {
    const response = await request(app).get("/");
    expect(response.status).toBe(200);
    expect(response.text).toBe("Stack_db Endpoint");
  });

  test("CORS headers are set correctly", async () => {
    const response = await request(app).get("/");

    if (response.headers["access-control-allow-origin"]) {
      expect(response.headers["access-control-allow-origin"]).toBe(CLIENT_URL);
    }

    expect(response.headers["access-control-allow-credentials"]).toBe("true");
  });
});
