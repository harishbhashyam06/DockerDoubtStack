import "./index.css";
import React, { useEffect, useState } from "react";
import { handleHyperlink } from "../../../../tool";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import { IconButton, Typography, Button, Grid } from "@mui/material";
import TurnedInNotIcon from "@mui/icons-material/TurnedInNot";
import TurnedInIcon from "@mui/icons-material/TurnedIn";
import TextField from "@mui/material/TextField";
import {
  addComment,
  getComments,
  addVoteQuestion,
  removeVoteQuestion,
  switchVoteQuestion,
  saveQuestion,
  deleteSaveQuestion,
} from "../../../../services/questionService";
import Comment from "../comments";
import { getUserProfile } from "../../../../services/userService";

const QuestionBody = ({ question, userProfile, votes, setVotes, qid, handleQuesUser }) => {
    const [comment, setComment] = useState("");
    const [upVote, setUpVote] = useState(false);
    const [downVote, setDownVote] = useState(false);
    const [commentButton, setCommentButton] = useState(true);
    const [comments, setComments] = useState([]);
    const [saved, setSaved] = useState(false);
    const fetchData = async () => {
      let res = await getComments(qid);
      let updatedUser = await getUserProfile();
      if (res) {
          setComments(res);
      }
      if (updatedUser.saved_posts.includes(qid)) {
          setSaved(true);
      } else {
          setSaved(false);
      }
      if(updatedUser.upvoted_entity.includes(qid)) {
          setUpVote(true);
      } else {
          setUpVote(false);
      }
      if(updatedUser.downvoted_entity.includes(qid)) {
          setDownVote(true);
      } else {
          setDownVote(false);
      }
  };

    useEffect(() => {
        fetchData().catch((e) => console.log(e));
    }, []);

    const handleCommentClick = async () => {
        if (comment != "") {
            let newComment = {
                comment_type: "question",
                text: comment,
                votes: 0,
                comment_by: userProfile,
                date: new Date(),
            }
            await addComment(question._id, newComment)
            setComment("");
            setCommentButton(true);
            fetchData().catch((e) => console.log(e));
        }
    }
    const handleUpvoteClick = async () => {
        if (upVote && !downVote) {
            setUpVote(false);
            setVotes(votes => votes - 1);
            await removeVoteQuestion(question._id, true);
        } else if (!upVote && downVote) {
            setUpVote(true);
            setVotes(votes => votes + 2);
            await switchVoteQuestion(question._id, "up");
            setDownVote(false);
        } else if (!upVote && !downVote) {
            setUpVote(true);
            setVotes(votes => votes + 1);
            await addVoteQuestion(question._id, false);
        }
    }
    const handleDownvoteClick = async () => {
        if (!downVote && !upVote) {
            setDownVote(true);
            setVotes(votes => votes - 1);
            await removeVoteQuestion(question._id, false);
        } else if (!downVote && upVote) {
            setDownVote(true);
            setVotes(votes => votes - 2);
            await switchVoteQuestion(question._id, "down");
            setUpVote(false);
        } else if (downVote && !upVote) {
            setDownVote(false);
            setVotes(votes => votes + 1);
            await addVoteQuestion(question._id, true);
        }
    }

    const handleSave = async () => {
        if(!saved) {
            await saveQuestion(userProfile._id, qid);
            setSaved(true);
        } else {
            await deleteSaveQuestion(userProfile._id, qid);
            setSaved(false);
        }
    }
  return (
    <>
      <div id="questionBody" className="questionBody right_padding">
        <div className="answer_question_view">
          <Grid container justifyContent="center" alignItems="center">
            <Grid item xs={2}>
              <IconButton
                size="medium"
                color="primary"
                onClick={() => handleSave()}
                id = "savebtn"
              >
                {saved ? (
                  <TurnedInIcon style={{ fontSize: "1.5em" }} />
                ) : (
                  <TurnedInNotIcon style={{ fontSize: "1.5em" }} />
                )}
              </IconButton>
            </Grid>
            <Grid
              item
              xs={10}
              container
              justifyContent="center"
              alignItems="center"
            >
              <Grid item>
                <IconButton
                  size="medium"
                  color={upVote ? "secondary" : "primary"}
                  id="q-upvote"
                  onClick={() => handleUpvoteClick()}
                >
                  <ArrowUpwardIcon style={{ fontSize: "1.5em" }} />
                </IconButton>
              </Grid>
              <Grid item>
                <Typography
                  style={{ textAlign: "center", fontSize: "20px", backgroundColor: "black", padding:5, borderRadius: 5 }}
                  fontWeight="bold"
                  color="white"
                  id = "vote-count"
                >
                  {votes}
                </Typography>
              </Grid>
              <Grid item>
                <IconButton
                  size="medium"
                  color={downVote ? "secondary" : "primary"}
                  id = "q-downvote"
                  onClick={() => handleDownvoteClick()}
                >
                  <ArrowDownwardIcon style={{ fontSize: "1.5em" }} />
                </IconButton>
              </Grid>
            </Grid>
          </Grid>
        </div>
        <div className="answer_question_text">
          <div>
            <Typography fontWeight="bold" fontSize="1.5rem">
              {question && question.title}
            </Typography>
          </div>
          <div>{handleHyperlink(question && question.text)}</div>
        </div>
      </div>
      <div className="questionBody right_padding">
        <div className="answer_question_text_comments">
          {Array.isArray(comments) &&
            comments.map((c) => <Comment key={c._id} comment={c} handleQuesUser = {handleQuesUser}/>)}
          {commentButton ? (
            <>
              <Button
                variant="outlined"
                onClick={() => setCommentButton(false)}
                id="add-comment"
              >
                Add Comment
              </Button>
            </>
          ) : (
            <>
              <TextField
                id="outlined-basic"
                label="Add Comment"
                variant="outlined"
                fullWidth="true"
                onChange={(e) => setComment(e.target.value)}
              />
              <Button
                variant="contained"
                type="submit"
                id = "comment-submit"
                sx={{ marginTop: "10px" }}
                onClick={() => handleCommentClick()}
              >
                Comment
              </Button>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default QuestionBody;
