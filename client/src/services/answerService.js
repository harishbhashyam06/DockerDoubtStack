import { REACT_APP_API_URL, api } from "./config";

const ANSWER_API_URL = `${REACT_APP_API_URL}/answer`;

const addAnswer = async (qid, ans) => {
  const data = { qid: qid, ans: ans };
  const res = await api.post(`${ANSWER_API_URL}/addAnswer`, data);
  return res.data;
};

const updateAnswerStatus = async (aid, approved) => {
  const res = await api.post(`${ANSWER_API_URL}/updateAnswerStatus`, {
    aid: aid,
    approved: approved,
  });
  return res.data;
};

const addComment = async (aid, comment) => {
  const data = { aid: aid, comment: comment };
  const res = await api.post(`${ANSWER_API_URL}/addComment`, data);
  return res.data;
};


const getUnapprovedAnswers = async () => {
  const res = await api.get(`${ANSWER_API_URL}/getUnapprovedAnswers`);
  return res.data;
};

const getComments = async (aid) => {
  const res = await api.get(`${ANSWER_API_URL}/getComments/${aid}`);
  return res.data;
}

const addVoteAnswer = async (aid, doubleClicked) => {
  const data = { aid: aid , doubleClicked:doubleClicked};
  const res = await api.post(`${ANSWER_API_URL}/addVoteAnswer`, data);
  return res.data;
};

const removeVoteAnswer = async (aid, doubleClicked) => {
  const data = { aid: aid , doubleClicked:doubleClicked};
  const res = await api.post(`${ANSWER_API_URL}/removeVoteAnswer`, data);
  return res.data;
};

const switchVoteAnswer = async (aid, switchTo) => {
  const data = { aid: aid, switchTo: switchTo };
  const res = await api.post(`${ANSWER_API_URL}/switchVoteAnswer`, data);
  return res.data;
};

export {
  addVoteAnswer,
  removeVoteAnswer,
  switchVoteAnswer,
  addAnswer,
  getUnapprovedAnswers,
  updateAnswerStatus,
  addComment,
  getComments
};
