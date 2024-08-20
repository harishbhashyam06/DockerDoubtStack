import { useEffect, useState } from "react";
import { getMetaData } from "../../../tool";
import Answer from "./answer";
import AnswerHeader from "./header";
import "./index.css";
import QuestionBody from "./questionBody";
import { Button } from "@mui/material";

import { getQuestionById } from "../../../services/questionService";

// Component for the Answers page
const AnswerPage = ({ qid, handleNewQuestion, handleNewAnswer, userProfile, handleQuesUser }) => {
    const [question, setQuestion] = useState({});
    const [votes, setVotes] = useState(0);
    useEffect(() => {
        const fetchData = async () => {
            let res = await getQuestionById(qid);
            setQuestion(res || {});
            if(res) {
                setVotes(res.votes); 
            }
        };
        fetchData().catch((e) => console.log(e));
    }, []);
    return (
        <>
            <QuestionBody
                question = {question}
                userProfile = {userProfile}
                votes = {votes}
                setVotes = {setVotes}
                qid = {qid}
                handleQuesUser={handleQuesUser}
            />
            
            <AnswerHeader
                question = {question}
                handleNewQuestion={handleNewQuestion}
                meta = {question && getMetaData(new Date(question.ask_date_time))}
                handleQuesUser={handleQuesUser}
            />
            {question &&
                question.answers &&
                question.answers.map((a, idx) => (
                    a.approved ? (<Answer
                        id = {a._id}
                        key={idx}
                        text={a.text}
                        ansBy={a.ans_by}
                        meta={getMetaData(new Date(a.ans_date_time))}
                        voteCount = {a.votes}
                        comments={a.comments}
                        userProfile = {userProfile}
                        handleQuesUser={handleQuesUser}
                    />) : (null)
                ))}
                <br />
                <br />
            <Button
                className="bluebtn ansButton"
                variant="contained"
                id = "answer-question"
                onClick={() => {
                    handleNewAnswer();
                }}
            >
                Answer Question
            </Button>
        </>
    );
};

export default AnswerPage;
