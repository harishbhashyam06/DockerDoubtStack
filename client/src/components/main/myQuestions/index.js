import "./index.css";

import { useEffect, useState } from "react";
import Question from "../questionPage/question";
import { getUserPosts } from "../../../services/userService";

import { Grid, Box, Button, Avatar } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import Alert from '@mui/material/Alert';


const MyQuestionPage = ({ clickTag, handleAnswer, handleQuesUser }) => {
  const [qlistApproved, setQlist] = useState([]);
  const [qlistNonApproved, setUnapprovedQlist] = useState([]);

  const [alistApproved, setAlist] = useState([]);
  const [alistNonApproved, setUnapprovedAlist] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      let posts = await getUserPosts();

      setQlist(posts.approvedQuestions);
      setAlist(posts.approvedAnswers);
      setUnapprovedQlist(posts.unapprovedQuestions);
      setUnapprovedAlist(posts.unapprovedAnswers);
    };
    fetchData().catch((e) => console.log(e));
  }, []);

  const updatePosts = async (type, id) => {
    let posts = await getUserPosts(type, id);
    setQlist(posts.approvedQuestions);
    setAlist(posts.approvedAnswers);
    setUnapprovedQlist(posts.unapprovedQuestions);
    setUnapprovedAlist(posts.unapprovedAnswers);
  };

  return (
    <>
      <h1>Approved Questions</h1>

      {qlistApproved && qlistApproved.length == 0 ? <Alert style={{ marginTop: '15px' }} severity="info">No questions posted.</Alert> : null}
      {qlistApproved.map((q, idx) => (
        <Grid
          key={idx}
          container
          spacing={3}
          direction="row"
          justifyContent="flex-end"
          alignItems="center"
        >
          <Grid item xs={10}>
            <Question
              q={q}
              key={idx}
              clickTag={clickTag}
              handleAnswer={handleAnswer}
              handleQuesUser={handleQuesUser}
            />
          </Grid>
          <Grid container spacing={2} item xs={2}>
            <Grid item xs={12}>
              <Button
                startIcon={<DeleteIcon />}
                size="large"
                variant="contained"
                color="error"
                className="deletebtn-approved-question"
                onClick={() => {
                    updatePosts("question", q._id);
                }}
              >
                Delete
              </Button>
            </Grid>
          </Grid>
        </Grid>
      ))}

      <br />
      <hr />
      <br />

      <h1>Approval Pending Questions</h1>
      {qlistNonApproved && qlistNonApproved.length == 0 ? <Alert style={{ marginTop: '15px' }} severity="success">No questions pending approval.</Alert> : null}

      {qlistNonApproved.map((q, idx) => (
        <Grid
          key={idx}
          container
          spacing={3}
          direction="row"
          justifyContent="flex-end"
          alignItems="center"
        >
          <Grid item xs={10}>
            <Question
              q={q}
              key={idx}
              clickTag={clickTag}
              handleAnswer={handleAnswer}
              handleQuesUser={handleQuesUser}
            />
          </Grid>
          <Grid container spacing={2} item xs={2}>
            <Grid item xs={12}>
              <Button
                startIcon={<DeleteIcon />}
                size="large"
                variant="contained"
                color="error"
                className="deletebtn-unapproved-question"
                onClick={() => {
                    updatePosts("question", q._id);
                }}
              >
                Delete
              </Button>
            </Grid>
          </Grid>
        </Grid>
      ))}

      <br />
      <hr />
      <br />

      <h1>Answers</h1>
      {alistApproved && alistApproved.length == 0 ? <Alert style={{ marginTop: '15px' }} severity="info">No answers posted.</Alert> : null}
      {alistApproved.map((a, idx) => (
        <>
          <Grid
            key={idx}
            container
            spacing={5}
            direction="row"
            justifyContent="flex-end"
            alignItems="center"
          >
            <Grid item xs={10}>
              <div className="ans-div">
                <div>
                  <strong>{a.question}</strong>
                </div>
                <hr />
                <div>{a.text}</div>

                <Box
                  display="flex"
                  alignItems="center"
                  mt={2}
                  className="activity"
                >
                  <Button variant="text">
                    <Avatar
                      src={a.ans_by.profile_pic_small}
                      alt="Avatar"
                      sx={{ marginRight: 1 }}
                    />
                    {`${a.ans_by.firstName || ""} ${a.ans_by.lastName || ""}`}
                  </Button>
                </Box>
              </div>
            </Grid>

            <Grid container spacing={2} item xs={2}>
              <Grid item xs={12}>
                <Button
                  startIcon={<DeleteIcon />}
                  size="large"
                  variant="contained"
                  className="deletebtn-approved-answer"
                  color="error"
                  onClick={() => {
                    updatePosts("answer", a._id);
                  }}
                >
                  Delete
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </>
      ))}

      <br />
      <hr />
      <br />

      <h1>Approval Pending Answers</h1>
      {alistNonApproved && alistNonApproved.length == 0 ? <Alert style={{ marginTop: '15px' }} severity="success">No answers pending approvals.</Alert> : null}
      {alistNonApproved.map((a, idx) => (
        <>
          <Grid
            key={idx}
            container
            spacing={5}
            direction="row"
            justifyContent="flex-end"
            alignItems="center"
          >
            <Grid item xs={10}>
              <div className="ans-div">
                <div>
                  <strong>{a.question}</strong>
                </div>
                <hr />
                <div>{a.text}</div>

                <Box
                  display="flex"
                  alignItems="center"
                  mt={2}
                  className="activity"
                >
                  <Button variant="text">
                    <Avatar
                      src={a.ans_by.profile_pic_small}
                      alt="Avatar"
                      sx={{ marginRight: 1 }}
                    />
                    {`${a.ans_by.firstName || ""} ${a.ans_by.lastName || ""}`}
                  </Button>
                </Box>
              </div>
            </Grid>

            <Grid container spacing={2} item xs={2}>
    
              <Grid item xs={12}>
                <Button
                  startIcon={<DeleteIcon />}
                  size="large"
                  variant="contained"
                  className="deletebtn-unapproved-answer"
                  color="error"
                  onClick={() => {
                    updatePosts("answer", a._id);
                  }}
                >
                  Delete
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </>
      ))}
    </>
  );
};

export default MyQuestionPage;
