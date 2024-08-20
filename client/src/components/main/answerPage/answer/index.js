import { handleHyperlink } from "../../../../tool";
import "./index.css";
import { Box } from "@mui/material";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import {
  IconButton,
  Typography,
  Button,
  Avatar,
  TextField,
} from "@mui/material";
import { useEffect, useState } from "react";
import {
  addVoteAnswer,
  removeVoteAnswer,
  switchVoteAnswer,
  addComment,
  getComments,
} from "../../../../services/answerService";
import Comment from "../comments";
import { getUserProfile } from "../../../../services/userService";
// Component for the Answer Page
const Answer = ({
  id,
  text,
  ansBy,
  meta,
  voteCount,
  comments,
  userProfile,
  handleQuesUser
}) => {
  const [upVote, setUpVote] = useState(false);
  const [downVote, setDownVote] = useState(false);
  const [votes, setVotes] = useState(voteCount);
  const [commentButton, setCommentButton] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [allComments, setAllComments] = useState(comments);
  const [showComment, setShowComment] = useState(false);

  let ans_By = "";
  if (ansBy) {
    ans_By = ansBy.firstName + " " + ansBy.lastName;
  }

  useEffect(() => {
    const fetchData = async () => {
      let res = await getComments(id);
      let updatedUser = await getUserProfile();
      if (res) {
        setAllComments(res);
      }
      if (updatedUser.upvoted_entity.includes(id)) {
        setUpVote(true);
      } else {
        setUpVote(false);
      }
      if (updatedUser.downvoted_entity.includes(id)) {
        setDownVote(true);
      } else {
        setDownVote(false);
      }
    };
    fetchData().catch((e) => console.log(e));
  }, [commentButton]);

  const handleCommentClick = async () => {
    if (newComment != "") {
      let c = {
        comment_type: "answer",
        text: newComment,
        votes: 0,
        comment_by: userProfile,
        date: new Date(),
      };
      await addComment(id, c);
      setNewComment("");
      setCommentButton(true);
    }
  };
  const handleUpvoteClick = async () => {
    if (upVote && !downVote) {
      setUpVote(false);
      setVotes((votes) => votes - 1);
      await removeVoteAnswer(id, true);
    } else if (!upVote && downVote) {
      setUpVote(true);
      setVotes((votes) => votes + 2);
      await switchVoteAnswer(id, "up");
      setDownVote(false);
    } else if (!upVote && !downVote) {
      setUpVote(true);
      setVotes((votes) => votes + 1);
      await addVoteAnswer(id, false);
    }
  };
  const handleDownvoteClick = async () => {
    if (!downVote && !upVote) {
      setDownVote(true);
      setVotes((votes) => votes - 1);
      await removeVoteAnswer(id, false);
    } else if (!downVote && upVote) {
      setDownVote(true);
      setVotes((votes) => votes - 2);
      await switchVoteAnswer(id, "down");
      setUpVote(false);
    } else if (downVote && !upVote) {
      setDownVote(false);
      setVotes((votes) => votes + 1);
      await addVoteAnswer(id, true);
    }
  };
  return (
    <>
      <div className="answer">
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "10%",
          }}
        >
          <div className="answer_votes_data">
            <IconButton
              size="small"
              color={upVote ? "secondary" : "primary"}
              className="answer-upvote"
              onClick={() => handleUpvoteClick()}
              sx={{ display: "flex", alignItems: "center" }}
            >
              <ArrowUpwardIcon style={{ fontSize: "1.5em" }} />
            </IconButton>
            <Typography
              style={{ textAlign: "center", fontSize: "12px", backgroundColor: "black", padding:10, borderRadius: 5}}
              color="white"
              fontWeight="bold"
              className="answer-votes"
            >
              {votes}
            </Typography>
            <IconButton
              size="small"
              className="answer-downvote"
              color={downVote ? "secondary" : "primary"}
              onClick={() => handleDownvoteClick()}
            >
              <ArrowDownwardIcon style={{ fontSize: "1.5em" }} />
            </IconButton>
          </div>
        </Box>
        <div id="answerText" className="answerText">
          {handleHyperlink(text)}
        </div>
        <div className="answerAuthor">
          <Box
            display="flex"
            alignItems="center"
            className="activity"
            width="60%"
          >
            <Button variant="text" color="primary" onClick={() => handleQuesUser(ansBy)} className="ansByBtn">
              <Avatar
                src={ansBy ? ansBy.profile_pic_small : ''}
                alt="Avatar"
                sx={{ marginRight: 1 }}
              />{ans_By}
            </Button>
            
          </Box>
          <Typography
            variant="body2"
            color="textSecondary"
            width="40%"
            sx={{ display: "flex", alignItems: "center" }}
            className="ansByMeta"
          >
            {meta}
          </Typography>
          <IconButton
            size="small" onClick={() => setShowComment(!showComment)}
            className="showComment-icon"
          >
            {showComment ? (<ArrowDropUpIcon style={{ fontSize: "1.5em" }} />)
              : (<ArrowDropDownIcon style={{ fontSize: "1.5em" }} />)}

          </IconButton>
        </div>
      </div>
      {showComment ? (
        <>
          <div className="answer_comments" style={{ display: "flex" }}>
            <div style={{ width: "18.5%" }}></div>
            <div style={{ width: "81.5%" }}>
              {Array.isArray(allComments) &&
                allComments.map((c) => (
                  // <div key={index}>{c.text}</div>
                  <Comment key={c._id} comment={c} handleQuesUser={handleQuesUser}/>
                ))}
            </div>
          </div>
          <div className="answer_comments" style={{ display: "flex" }}>
            <div style={{ width: "18.5%" }}></div>
            <div style={{ width: "81.5%" }}>
              {commentButton ? (
                <>
                  <Button variant="outlined" onClick={() => setCommentButton(false)} sx={{ marginTop: "15px" }} id="add-answer-comment">
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
                    onChange={(e) => setNewComment(e.target.value)}
                    sx={{ marginTop: "15px" }}
                  />
                  <Button
                    variant="contained"
                    type="submit"
                    sx={{ marginTop: "10px" }}
                    id = "postAnsComment"
                    onClick={() => handleCommentClick()}
                  >
                    Comment
                  </Button>
                </>
              )}
            </div>
          </div>
        </>
      ) : (null)}
    </>
  );
};

export default Answer;
