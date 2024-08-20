const mongoose = require("mongoose");
const {
  addCommentToDB,
  addVoteCommentDB,
  removeVoteCommentDB,
  switchVoteCommentDB,
} = require("../../utils/commentUtils");

// Mocking Mongoose models and necessary utilities
jest.mock("../../models/commentsModel");
jest.mock("../../models/usersModel");
jest.mock("../../models/answersModel");
jest.mock("../../models/questionsModel");
jest.mock("sanitize-html", () => jest.fn((input) => input));

const Comment = require("../../models/commentsModel");
const User = require("../../models/usersModel");
const Answer = require("../../models/answersModel");
const Question = require("../../models/questionsModel");
const sanitizeHtml = require("sanitize-html");

describe('addCommentToDB', () => {
    it('should add a new comment to the database and associate it with an answer', async () => {
      const comment = { text: 'Great answer!', _id: '1' };
      const id = 'answer1';
      const type = 'answer';
  
      Comment.create.mockResolvedValue(comment);
      Answer.findOneAndUpdate.mockResolvedValue({ _id: id, comments: [comment._id] });
  
      const result = await addCommentToDB(comment, id, type);
  
      expect(Comment.create).toHaveBeenCalledWith(comment);
      expect(Answer.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: id },
        { $push: { comments: { $each: [comment._id], $position: 0 } } },
        { new: true }
      );
      expect(result).toEqual(comment);
    });
  });

  
  describe('addVoteCommentDB', () => {
    it('should add an upvote to a comment and update user\'s upvoted_entity list', async () => {
      const cid = 'comment1';
      const userEmail = 'user@example.com';
      const doubleClicked = false;
      const updatedComment = { _id: cid, votes: 1 };
  
      Comment.findOneAndUpdate.mockResolvedValue(updatedComment);
      User.findOneAndUpdate.mockResolvedValue({ email: userEmail, upvoted_entity: [cid] });
  
      const result = await addVoteCommentDB(cid, userEmail, doubleClicked);
  
      expect(Comment.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: cid },
        { $inc: { votes: 1 } },
        { new: true }
      );
      expect(User.findOneAndUpdate).toHaveBeenCalledWith(
        { email: userEmail },
        { $addToSet: { upvoted_entity: cid }, $pull: { downvoted_entity: cid } },
        { upsert: true }
      );
      expect(result).toEqual(updatedComment);
    });
  });

  describe('removeVoteCommentDB', () => {
    it('should remove a vote from a comment and update user lists accordingly', async () => {
      const cid = 'comment1';
      const userEmail = 'user@example.com';
      const doubleClicked = true;
      const updatedComment = { _id: cid, votes: -1 };
  
      Comment.findOneAndUpdate.mockResolvedValue(updatedComment);
      User.findOneAndUpdate.mockResolvedValue({ email: userEmail, downvoted_entity: [] });
  
      const result = await removeVoteCommentDB(cid, userEmail, doubleClicked);
  
      expect(Comment.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: cid },
        { $inc: { votes: -1 } },
        { new: true }
      );
      expect(User.findOneAndUpdate).toHaveBeenCalledWith(
        { email: userEmail },
        { $pull: { upvoted_entity: cid } },
        { upsert: true }
      );
      expect(result).toEqual(updatedComment);
    });
  });

  describe('switchVoteCommentDB', () => {
    it('should switch a vote on a comment and update user lists accordingly', async () => {
      const cid = 'comment2';
      const userEmail = 'user@example.com';
      const switchTo = 'up';
      const updatedComment = { _id: cid, votes: 2 };
  
      Comment.findOneAndUpdate.mockResolvedValue(updatedComment);
      User.findOneAndUpdate.mockResolvedValue({ email: userEmail, upvoted_entity: [cid], downvoted_entity: [] });
  
      const result = await switchVoteCommentDB(cid, userEmail, switchTo);
  
      expect(Comment.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: cid },
        { $inc: { votes: switchTo == "up" ? 2 : -2 } },
        { new: true }
      );
      expect(User.findOneAndUpdate).toHaveBeenCalledWith(
        { email: userEmail },
        { $addToSet: { upvoted_entity: cid }, $pull: { downvoted_entity: cid } },
        { upsert: true }
      );
      expect(result).toEqual(updatedComment);
    });
  });

  
  
  
