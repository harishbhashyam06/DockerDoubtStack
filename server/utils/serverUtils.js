const jwt = require("jsonwebtoken");
const logger = require("./loggerUtils");
const NodeCache = require("node-cache");
const { API_ACCESS_TOKEN_SECRET } = require("../config");
const { checkIfUserExsistsInDB } = require("../utils/userUtils");

const serverCache = new NodeCache();

/**
 * Middleware function to authenticate the access token provided in the request.
 * Verifies the token using the API_ACCESS_TOKEN_SECRET and sets req.user if authentication is successful.
 * If authentication fails, sends a 403 Forbidden response; if no token is provided, sends a 401 Unauthorized response.
 *
 * @param req The HTTP request object.
 * @param res The HTTP response object.
 * @param next The next middleware function in the request-response cycle.
 */
const authenticateToken = (req, res, next) => {
  const token = req.cookies.accessToken;
  if (!token) {
    return res.sendStatus(401);
  }
  jwt.verify(token, API_ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) {
      return res.sendStatus(403);
    }
    req.user = user;
    next();
  });
};

/**
 * Middleware function to log request details and response status.
 * Uses logger utility to log request method, URL, timestamp, user (or "Anonymous" if not authenticated),
 * response status code, and response time.
 *
 * @param req The HTTP request object.
 * @param res The HTTP response object.
 * @param next The next middleware function in the request-response cycle.
 */
const loggerMiddleware = (req, res, next) => {
  const logEntry = {
    method: req.method,
    url: req.originalUrl,
    timestamp: new Date().toISOString(),
    user: req.user ? req.user.username : "Anonymous",
  };

  logger.info(logEntry);

  const originalEnd = res.end;
  res.end = (...args) => {
    logger.info({
      ...logEntry,
      statusCode: res.statusCode,
      responseTime: new Date() - req.startTime,
    });
    res.end = originalEnd;
    res.end(...args);
  };

  next();
};

/**
 * Middleware function to check if the authenticated user has "moderator" privileges.
 * Retrieves user details from the database and checks if the role is "mod".
 * If the user is not a moderator, sends a 401 Unauthorized response.
 *
 * @param req The HTTP request object.
 * @param res The HTTP response object.
 * @param next The next middleware function in the request-response cycle.
 */
const checkModPrivilege = (req, res, next) => {
  try {
    const user = checkIfUserExsistsInDB(req.user.username).then((user) => {
      if (user.role != "mod") {
        return res.sendStatus(401);
      } else {
        next();
      }
    });
  } catch (error) {
    console.log("error", error);
  }
  
};

/**
 * Middleware factory function to implement caching based on the provided cache key.
 * Caches specific requests to optimize performance by serving cached data if available.
 * Supports caching for specific query-based requests like pagination.
 *
 * @param cacheKey The cache key identifier for the specific request type.
 * @returns An async middleware function to handle caching logic.
 */
const cacheMiddleware = (cacheKey) => {
  return async (req, res, next) => {
    try {
      let key = cacheKey;
      if (
        cacheKey == "getInterestQuestionsByUser" ||
        cacheKey == "getQuestionsByFilter"
      ) {
        key = cacheKey + req.query.currentPage + req.query.order + req.query.search;
      }
      const cachedData = serverCache.get(key);

      if (cachedData) {
        res.status(200).json(cachedData);
      } else {
        await next();
      }
    } catch (error) {
      console.error("Error in cacheMiddleware:", error);
      next(error);
    }
  };
};

/**
 * Middleware function to clear all cached data in the server cache.
 */
const clearCache = () => {
  serverCache.flushAll();
};

/**
 * Updates the server cache with the provided key-value pair.
 *
 * @param key The key to use for caching.
 * @param data The data to be cached.
 */
const updateCache = (key, data) => {
  if (key && data) {
    serverCache.set(key, data);
  }
};

module.exports = {
  clearCache,
  updateCache,
  cacheMiddleware,
  loggerMiddleware,
  authenticateToken,
  checkModPrivilege,
};
