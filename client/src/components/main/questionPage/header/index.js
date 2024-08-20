import { useState } from "react";
import "./index.css";
import OrderButton from "./orderButton";
import { Button, Typography } from "@mui/material";

const QuestionHeader = ({
  title_text,
  qcnt,
  setQuestionOrder,
  handleNewQuestion,
  isSavedPage,
  totalPages
}) => {
  const [currentFilter, setCurrentFilter] = useState("Newest");
  return (
    <div>
      <div className="space_between right_padding">
        <div className="bold_title">{title_text}</div>
        <Button
          variant="contained"
          className="bluebtn"
          id = "askQuestion"
          onClick={() => {
            handleNewQuestion();
          }}
          sx={{ marginRight: "10%" }}
        >
          Ask a Question
        </Button>
      </div>
      {isSavedPage ? (
        <></>
      ) : (
        <div className="space_between right_padding">
           <Typography id="question_count" variant="body1" sx={{ fontSize: "1.2rem", fontWeight: "bold" }}>
            {totalPages > 1
              ? `${(totalPages - 1) * 10}+ questions`
              : `${qcnt} questions`}
          </Typography>
          <div className="btns">
            {["Newest", "Active", "Unanswered"].map((m, idx) => (
              <OrderButton
                key={idx}
                message={m}
                setQuestionOrder={setQuestionOrder}
                currentFilter={currentFilter}
                setCurrentFilter={setCurrentFilter}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionHeader;
