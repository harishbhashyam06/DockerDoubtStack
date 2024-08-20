const express = require("express");

const { API_ACCESS_TOKEN_SECRET } = require("../config");
const { API_REFRESH_TOKEN_SECRET } = require("../config");
const { findTagByNameInDB } = require("../utils/tagUtils");
const { loggerMiddleware } = require("../utils/serverUtils");
const {
  saveUserToDB,
  checkIfUserExsistsInDB,
  removeUserRefreshTokenInDB,
} = require("../utils/userUtils");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/usersModel");
const sanitizeHtml = require("sanitize-html");

const router = express.Router();

/**
 * Generate an access token for a user.
 * @param {object} user - The user data to be encoded in the token.
 * @returns {string} - The generated access token.
 */
const generateAccessToken = (user) => {
  return jwt.sign(user, API_ACCESS_TOKEN_SECRET, { expiresIn: "6h" });
};

/**
 * Generate a refresh token for a user.
 * @param {object} user - The user data to be encoded in the token.
 * @returns {string} - The generated refresh token.
 */
const generateRefreshToken = (user) => {
  return jwt.sign(user, API_REFRESH_TOKEN_SECRET, { expiresIn: "31d" });
};

/**
 * Check if the user is authorized based on the access token in cookies.
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 * @returns {Response} - The response indicating authorization status.
 */
const checkIfUserIsAuthorized = async (req, res) => {
  const accessToken = req.cookies.accessToken;

  if (!accessToken) {
    return res.status(401).json({ authorized: false });
  }

  jwt.verify(
    accessToken,
    API_ACCESS_TOKEN_SECRET,
    (accessTokenErr, accessTokenPayload) => {
      if (accessTokenErr) {
        if (accessTokenErr.name === "TokenExpiredError") {
          return res.json({ authorized: false, accessTokenExpired: true });
        } else {
          return res
            .status(401)
            .json({ authorized: false, accessTokenExpired: false });
        }
      } else {
        return res
          .status(200)
          .json({ authorized: true, accessTokenExpired: false });
      }
    }
  );
};

/**
 * Logout a user by removing the refresh token from the database and clearing cookies.
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 * @returns {Response} - The response indicating successful logout.
 */
const logoutUser = async (req, res) => {
  try {
    const { refreshToken } = req.cookies.refreshToken;
    await removeUserRefreshTokenInDB(refreshToken);
    res.cookie("accessToken", "-", {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
    });
    res.cookie("refreshToken", "-", {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
    });
    res.sendStatus(204);
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
};

/**
 * Refresh the user's access token using the refresh token.
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 * @returns {Response} - The response with updated access token or error.
 */
const refreshUserAccessToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.sendStatus(401);
    }

    jwt.verify(
      refreshToken,
      API_REFRESH_TOKEN_SECRET,
      (refreshTokenErr, refreshTokenPayload) => {
        if (refreshTokenErr) {
          if (refreshTokenErr.name === "TokenExpiredError") {
            return res.status(200).json({ refreshTokenExpired: true });
          } else {
            return res.sendStatus(403);
          }
        } else {
          const accessToken = generateAccessToken({
            username: refreshTokenPayload.username,
          });
          res.cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
          });
          return res.status(200).json({ refreshTokenExpired: false });
        }
      }
    );
  } catch (error) {
    console.error(error);
    res.sendStatus(403);
  }
};

/**
 * Login a user and issue access and refresh tokens.
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 * @returns {Response} - The response indicating successful login or error.
 */
const loginUser = async (req, res) => {
  try {
    let { username, password } = req.body;
    const user = await checkIfUserExsistsInDB(username);
    username = sanitizeInput(username);

    if (!user) {
      return res.status(403).json({ msg: "Invalid Credentials" });
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(403).json({ msg: "Invalid Credentials" });
    }

    const accessToken = generateAccessToken({ username: user.email });
    const refreshToken = generateRefreshToken({ username: user.email });

    user.refreshToken = refreshToken;
    await saveUserToDB(user);

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
    });
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
    });

    res.sendStatus(200);
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
};

/**
 * Register a new user.
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 * @returns {Response} - The response indicating successful registration or error.
 */
const registerUser = async (req, res) => {
  try {
    const userData = req.body.userDataWithImages;

    let {
      firstName,
      lastName,
      email,
      password,
      interestedFields,
      image128,
      image75,
      about_me,
    } = userData;

    email = sanitizeInput(email);
    firstName = sanitizeInput(firstName);
    lastName = sanitizeInput(lastName);

    const tags = await Promise.all(
      interestedFields.map(async (tagName) => {
        const tag = await findTagByNameInDB(tagName);
        if (tag) {
          return tag;
        } else {
          console.warn(`Tag with name ${tagName} not found.`);
          return null;
        }
      })
    );

    const filteredTags = tags.filter((tag1) => tag1 !== null);
    const existingUser = await User.findOne({ email: email });

    if (existingUser) {
      return res
        .status(409)
        .json({ error: "User with this email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let userDetail = {
      firstName: firstName,
      lastName: lastName,
      email: email,
      role: "user",
      password: hashedPassword,
      interests: [...filteredTags],
      profile_pic_large: image128,
      profile_pic_small: image75,
      joined_on: Date.now(),
      about_me: about_me,
    };

    let user = new User(userDetail);
    await saveUserToDB(user);

    res.status(201).json({ email: userDetail.email });
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
};

/**
 * Sanitize input HTML to prevent XSS attacks.
 * @param {string} input - The input string containing HTML.
 * @returns {string} - The sanitized HTML string.
 */
const sanitizeInput = (input) => {
  return sanitizeHtml(input);
};

// POST Routes

router.post("/register", loggerMiddleware, (req, res) =>
  registerUser(req, res).then((data) => {
    return data;
  })
);

router.post("/login", loggerMiddleware, (req, res) =>
  loginUser(req, res).then((data) => {
    return data;
  })
);

router.post("/refreshToken", loggerMiddleware, (req, res) =>
  refreshUserAccessToken(req, res).then((data) => {
    return data;
  })
);

router.post("/logout", loggerMiddleware, (req, res) =>
  logoutUser(req, res).then((data) => {
    return data;
  })
);

// GET Routes

router.get("/isAuthorized", loggerMiddleware, (req, res) =>
  checkIfUserIsAuthorized(req, res).then((data) => {
    return data;
  })
);

module.exports = router;
