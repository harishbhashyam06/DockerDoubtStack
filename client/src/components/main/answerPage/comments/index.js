import { styled } from "@mui/material/styles";
import { Button, Avatar, Typography, IconButton } from "@mui/material";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import "./index.css";
import { useEffect, useState } from "react";
import {
  addVoteComment,
  removeVoteComment,
  switchVoteComment,
} from "../../../../services/commentService";
import { getUserProfile } from "../../../../services/userService";

const Comment = ({ comment, handleQuesUser}) => {
  const [upVote, setUpVote] = useState(false);
  const [downVote, setDownVote] = useState(false);
  const [votes, setVotes] = useState(comment.votes);
  const fullName = `${comment.comment_by?.firstName || ""} ${
    comment.comment_by?.lastName || ""
  }`;
  const CustomButton = styled(Button)({
    textTransform: "none",
  });

  useEffect(() => {
    const fetchData = async () => {
      await updateUserEntityData();
    };
    fetchData().catch((e) => console.log(e));
  }, []);

  const updateUserEntityData = async () => {
    let updatedUser = await getUserProfile();

    if (updatedUser.upvoted_entity.includes(comment._id)) {
      setUpVote(true);
    } else {
      setUpVote(false);
    }
    if (updatedUser.downvoted_entity.includes(comment._id)) {
      setDownVote(true);
    } else {
      setDownVote(false);
    }
  };

  const handleUpvoteClick = async () => {
    if (upVote && !downVote) {
      setUpVote(false);
      setVotes((votes) => votes - 1);
      await removeVoteComment(comment._id, true);
    } else if (!upVote && downVote) {
      setUpVote(true);
      setVotes((votes) => votes + 2);
      await switchVoteComment(comment._id, "up");
      setDownVote(false);
    } else if (!upVote && !downVote) {
      setUpVote(true);
      setVotes((votes) => votes + 1);
      await addVoteComment(comment._id, false);
    }
  };
  const handleDownvoteClick = async () => {
    if (!downVote && !upVote) {
      setDownVote(true);
      setVotes((votes) => votes - 1);
      await removeVoteComment(comment._id, false);
    } else if (!downVote && upVote) {
      setDownVote(true);
      setVotes((votes) => votes - 2);
      await switchVoteComment(comment._id, "down");
      setUpVote(false);
    } else if (downVote && !upVote) {
      setDownVote(false);
      setVotes((votes) => votes + 1);
      await addVoteComment(comment._id, true);
    }
  };

  return (
    <>
      <div className="comment-container">
        <div className="comment-votes">
          <IconButton size="small" className="comment-upvote">
            <ArrowUpwardIcon
              style={{ fontSize: "1.5em" }}
              color={upVote ? "secondary" : "primary"}
              onClick={() => handleUpvoteClick()}
            />
          </IconButton>
          <Typography
            style={{ textAlign: "center", fontSize: "12px", backgroundColor: "black", padding:10, borderRadius: 5 }}
            color="white"
            className="comment-votes"
            fontWeight="bold"
          >
            {votes}
          </Typography>
          <IconButton size="small" className="comment-downvote">
            <ArrowDownwardIcon
              style={{ fontSize: "1.5em" }}
              color={downVote ? "secondary" : "primary"}
              onClick={() => handleDownvoteClick()}
            />
          </IconButton>
        </div>
        <div className="comment-text">{comment.text}</div>
        <div className="comment-by">
          <CustomButton color="primary" variant="text" onClick={() => handleQuesUser(comment.comment_by)}>
            {comment.comment_by?.profile_pic_small && (
              <Avatar
                src={comment.comment_by.profile_pic_small}
                alt="Avatar"
                sx={{ width: 32, height: 32, marginRight: 1 }}
              />
            )}
            <Typography variant="body2" className="comment-by">{fullName}</Typography>
          </CustomButton>
        </div>
      </div>
    </>
  );
};

export default Comment;
