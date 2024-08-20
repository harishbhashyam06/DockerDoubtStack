import { REACT_APP_API_URL, api } from "./config";

const COMMENT_API_URL = `${REACT_APP_API_URL}/comment`;

const addVoteComment = async (cid, doubleClicked) => {
  const data = { cid: cid, doubleClicked: doubleClicked };
  const res = await api.post(`${COMMENT_API_URL}/addVoteComment`, data);
  return res.data;
};

const removeVoteComment = async (cid, doubleClicked) => {
  const data = { cid: cid, doubleClicked: doubleClicked };
  const res = await api.post(`${COMMENT_API_URL}/removeVoteComment`, data);
  return res.data;
};

const switchVoteComment = async (cid, switchTo) => {
  const data = { cid: cid, switchTo: switchTo };
  const res = await api.post(`${COMMENT_API_URL}/switchVoteComment`, data);
  return res.data;
};

export { addVoteComment, removeVoteComment, switchVoteComment };
