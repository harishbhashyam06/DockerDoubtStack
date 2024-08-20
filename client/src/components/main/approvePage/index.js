import "./index.css";

import { useEffect, useState } from "react";
import Question from "../questionPage/question";
import {
  getUnapprovedQuestions,
  updateQuestionStatus,
} from "../../../services/questionService";
import {
  getUnapprovedAnswers,
  updateAnswerStatus,
} from "../../../services/answerService";
import { Grid, Box, Button, Avatar } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import Alert from '@mui/material/Alert';

const ApprovePage = ({ clickTag, handleAnswer, handleQuesUser }) => {
  const [qlist, setQlist] = useState([]);
  const [alist, setAlist] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      let ques = await getUnapprovedQuestions();
      let ans = await getUnapprovedAnswers();
      setQlist(ques);
      setAlist(ans);
    };
    fetchData().catch((e) => console.log(e));
  }, []);

  const updateQuestionApproved = async (qid, approved) => {
    let ques = await updateQuestionStatus(qid, approved);
    setQlist(ques);
  };

  const updateAnswerApproved = async (aid, approved) => {
    let ans = await updateAnswerStatus(aid, approved);
    setAlist(ans);
  };

  return (
    <>
      <h1>Questions</h1>
      {qlist && qlist.length == 0 ? <Alert severity="success">No questions for approval.</Alert>: null}

      {qlist.map((q, idx) => (
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
                startIcon={<CheckBoxIcon />}
                size="large"
                variant="contained"
                className="approvebtn-question"
                id = "question-approve"
                color="success"
                onClick={() => {
                  updateQuestionApproved(q._id, true);
                }}
              >
                Approve
              </Button>
            </Grid>
            <Grid item xs={12}>
              <Button
                startIcon={<DeleteIcon />}
                size="large"
                className = "rejectbtn-question"
                variant="contained"
                color="error"
                onClick={() => {
                  updateQuestionApproved(q._id, false);
                }}
              >
                Reject
              </Button>
            </Grid>
          </Grid>
        </Grid>
      ))}

      <br />
      <hr />
      <br />

      <h1>Answers</h1>
      {alist && alist.length == 0 ? <Alert severity="success">No answers for approval.</Alert>: null}

      {alist.map((a, idx) => (
        <div className="answer-approve" key={idx}>
          <Grid
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
                  startIcon={<CheckBoxIcon />}
                  size="large"
                  variant="contained"
                  id = "answer-approve"
                  className="approvebtn-answer"
                  color="success"
                  onClick={() => {
                    updateAnswerApproved(a._id, true);
                  }}
                >
                  Approve
                </Button>
              </Grid>

              <Grid item xs={12}>
                <Button
                  startIcon={<DeleteIcon />}
                  size="large"
                  variant="contained"
                  className="rejectbtn-answer"
                  color="error"
                  onClick={() => {
                    updateAnswerApproved(a._id, false);
                  }}
                >
                  Reject
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </div>
      ))}
    </>
  );
};

export default ApprovePage;
