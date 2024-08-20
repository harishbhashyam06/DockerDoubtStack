const express = require("express");

const {
  clearCache,
  updateCache,
  cacheMiddleware,
  loggerMiddleware,
  authenticateToken,
} = require("../utils/serverUtils");
const {
  getAllUsersDB,
  getUserPostsFromDB,
  deleteUserPostsInDB,
  getSearchedUsersFromDB,
  getUserProfileInfoFromDB,
  getUserProfileByEmailFromDB,
} = require("../utils/userUtils");

const router = express.Router();

/**
 * Retrieves profile information for the authenticated user from the database.
 * Responds with the user profile information in the response JSON.
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
const getUserProfileInfo = async (req, res) => {
  let user = await getUserProfileInfoFromDB(req.user.username);
  res.json(user);
};

/**
 * Retrieves profile information for a user based on the provided email address from the database.
 * If the user is not found, responds with a 404 status and an error message.
 * Responds with the user profile information in the response JSON if found.
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
const getUserProfileByEmail = async (req, res) => {
  let user = await getUserProfileByEmailFromDB(req.params.email);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  res.json(user);
};

/**
 * Retrieves all users from the database.
 * Updates the cache with the retrieved users.
 * Responds with the list of users in the response JSON.
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
const getAllUsers = async (req, res) => {
  let users = await getAllUsersDB(req.user.username);
  updateCache("getAllUsers", users);
  res.status(200).json(users);
};

/**
 * Retrieves users matching a searched username from the database.
 * Responds with the list of matched users in the response JSON.
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
const getSearchedUsers = async (req, res) => {
  let users = await getSearchedUsersFromDB(req.query.searchedUser);
  res.status(200).json(users);
};

/**
 * Retrieves posts authored by the authenticated user from the database.
 * Deletes specific posts based on provided type and ID parameters.
 * Clears the cache after retrieving user posts.
 * Responds with the user's posts in the response JSON.
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
const getUserPosts = async (req, res) => {
  try {
    const type = req.query.type;
    const id = req.query.id;
    if (
      type !== "null" &&
      type !== undefined &&
      id !== "null" &&
      id !== undefined
    ) {
      await deleteUserPostsInDB(type, id);
    }
    let userPosts = await getUserPostsFromDB(req.user.username);
    clearCache();
    res.json(userPosts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Internal server error" });
  }
};


// GET Routes 

router.get("/getUserProfile", authenticateToken, loggerMiddleware, (req, res) =>
  getUserProfileInfo(req, res).then((data) => {
    return data;
  })
);

router.get(
  "/getUserProfileByEmail/:email",
  authenticateToken,
  loggerMiddleware,
  (req, res) =>
    getUserProfileByEmail(req, res).then((data) => {
      return data;
    })
);

router.get(
  "/getAllUsers",
  authenticateToken,
  loggerMiddleware,
  cacheMiddleware("getAllUsers"),
  (req, res) =>
    getAllUsers(req, res).then((data) => {
      return data;
    })
);

router.get(
  "/getSearchedUsers",
  authenticateToken,
  loggerMiddleware,
  (req, res) =>
    getSearchedUsers(req, res).then((data) => {
      return data;
    })
);

router.get("/getUserPosts", authenticateToken, loggerMiddleware, (req, res) =>
  getUserPosts(req, res).then((data) => {
    return data;
  })
);

module.exports = router;
