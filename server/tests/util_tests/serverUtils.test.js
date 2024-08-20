const jwt = require("jsonwebtoken");
const NodeCache = require("node-cache");
const {
  clearCache,
  updateCache,
  cacheMiddleware,
  loggerMiddleware,
  authenticateToken,
  checkModPrivilege,
} = require("../../utils/serverUtils");
const logger = require("../../utils/loggerUtils");
const { checkIfUserExsistsInDB } = require("../../utils/userUtils");

jest.mock("jsonwebtoken");
jest.mock("node-cache");
jest.mock("../../utils/loggerUtils");
jest.mock("../../utils/userUtils");

describe("Middleware Functions", () => {
  let req, res, next, cache;

  beforeEach(() => {
    req = {
      cookies: {},
      method: "GET",
      originalUrl: "/api/test",
      startTime: new Date(),
      query: {},
    };
    res = {
      statusCode: undefined,
      json: jest.fn(),
      sendStatus: jest.fn(),
      end: jest.fn().mockImplementation(function () {
        return this;
      }),
    };
    next = jest.fn();
    cache = new NodeCache();
    global.serverCache = cache; 
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("authenticateToken", () => {
    it("should authenticate a valid token", () => {
      req.cookies.accessToken = "validToken";
      jwt.verify.mockImplementation((token, secret, cb) =>
        cb(null, { username: "testUser" })
      );

      authenticateToken(req, res, next);

      expect(jwt.verify).toHaveBeenCalled();
      expect(req.user).toBeDefined();
      expect(req.user.username).toBe("testUser");
      expect(next).toHaveBeenCalled();
    });

    it("should send 403 when token is invalid", () => {
      req.cookies.accessToken = "invalidToken";
      jwt.verify.mockImplementation((token, secret, cb) =>
        cb(new Error("Invalid token"), null)
      );

      authenticateToken(req, res, next);

      expect(res.sendStatus).toHaveBeenCalledWith(403);
    });

    it("should send 401 when no token is provided", () => {
      authenticateToken(req, res, next);

      expect(res.sendStatus).toHaveBeenCalledWith(401);
    });
  });

  describe("loggerMiddleware", () => {
    it("should log request details", () => {
      loggerMiddleware(req, res, next);

      expect(logger.info).toHaveBeenCalledWith(
        expect.objectContaining({
          method: "GET",
          url: "/api/test",
          user: "Anonymous",
        })
      );

      res.end();

      expect(logger.info).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: undefined,
        })
      );
      expect(next).toHaveBeenCalled();
    });
  });

  describe("checkModPrivilege", () => {
    it("should proceed if user is a moderator", async () => {
      req.user = { username: "modUser" };
      checkIfUserExsistsInDB.mockResolvedValue({ role: "mod" });

      await checkModPrivilege(req, res, next);

      expect(checkIfUserExsistsInDB).toHaveBeenCalledWith("modUser");
      expect(next).toHaveBeenCalled();
    });

    it("should send 401 if user is not a moderator", async () => {
      req.user = { username: "user" };
      checkIfUserExsistsInDB.mockResolvedValue({ role: "user" });

      await checkModPrivilege(req, res, next);

      expect(res.sendStatus).toHaveBeenCalledWith(401);
    });
  });

  describe("cacheMiddleware", () => {

    it("should call next if no cache is available", async () => {
      const middleware = cacheMiddleware("testKey");

      await middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });
});
