import { REACT_APP_API_URL, api } from "./config";

const QUESTION_API_URL = `${REACT_APP_API_URL}/question`;

const getQuestionsByFilter = async (
  order = "newest",
  search = "",
  currentPage = 1
) => {
  const res = await api.get(
    `${QUESTION_API_URL}/getQuestion?order=${order}&search=${search}&currentPage=${currentPage}`
  );

  return res.data;
};

const getQuestionById = async (qid) => {
  const res = await api.get(`${QUESTION_API_URL}/getQuestionById/${qid}`);

  return res.data;
};

const addQuestion = async (q) => {
  const res = await api.post(`${QUESTION_API_URL}/addQuestion`, q);

  return res.data;
};

const getQuestionByInterests = async (
  order = "newest",
  search = "",
  currentPage = 1
) => {
  const res = await api.get(
    `${QUESTION_API_URL}/getInterestQuestionsByUser?order=${order}&search=${search}&currentPage=${currentPage}`
  );
  return res.data;
};

const getUserSavedPosts = async () => {
  const res = await api.get(`${QUESTION_API_URL}/getSavedUserQuestions`);
  return res.data;
};

const getUnapprovedQuestions = async () => {
  const res = await api.get(`${QUESTION_API_URL}/getUnapprovedQuestions`);
  return res.data;
};

const updateQuestionStatus = async (qid, approved) => {
  const res = await api.post(`${QUESTION_API_URL}/updateQuestionStatus`, {
    qid: qid,
    approved: approved,
  });
  return res.data;
};

const addComment = async (qid, comment) => {
  const data = { qid: qid, comment: comment };
  const res = await api.post(`${QUESTION_API_URL}/addComment`, data);
  return res.data;
};

const addVoteQuestion = async (qid, doubleClicked) => {
  const data = { qid: qid , doubleClicked:doubleClicked};
  const res = await api.post(`${QUESTION_API_URL}/addVoteQuestion`, data);
  return res.data;
};

const removeVoteQuestion = async (qid, doubleClicked) => {
  const data = { qid: qid , doubleClicked:doubleClicked};
  const res = await api.post(`${QUESTION_API_URL}/removeVoteQuestion`, data);
  return res.data;
};

const switchVoteQuestion = async (qid, switchTo) => {
  const data = { qid: qid, switchTo: switchTo };
  const res = await api.post(`${QUESTION_API_URL}/switchVoteQuestion`, data);
  return res.data;
};

const getComments = async (qid) => {
  const res = await api.get(`${QUESTION_API_URL}/getComments/${qid}`);
  return res.data;
};

const saveQuestion = async (uid, qid) => {
  const data = { uid: uid, qid: qid };
  const res = await api.post(`${QUESTION_API_URL}/saveQuestion`, data);
  return res.data;
};

const deleteSaveQuestion = async (uid, qid) => {
  const data = { uid: uid, qid: qid };
  const res = await api.post(`${QUESTION_API_URL}/deleteSaveQuestion`, data);
  return res.data;
};
const getUserPostedQuestions = async () => {
  const res = await api.get(`${QUESTION_API_URL}/getUserPostedQuestions`);
  return res.data;
};

export {
  updateQuestionStatus,
  getUnapprovedQuestions,
  getQuestionByInterests,
  getQuestionsByFilter,
  getUserSavedPosts,
  getQuestionById,
  addQuestion,
  addComment,
  switchVoteQuestion,
  addVoteQuestion,
  removeVoteQuestion,
  getComments,
  saveQuestion,
  deleteSaveQuestion,
  getUserPostedQuestions,
};
