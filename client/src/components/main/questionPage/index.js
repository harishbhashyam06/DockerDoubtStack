import "./index.css";
import QuestionHeader from "./header";
import Question from "./question";
import {
  getQuestionsByFilter,
  getQuestionByInterests,
  getUserPostedQuestions,
  getUserSavedPosts,
} from "../../../services/questionService";
import { useEffect, useState } from "react";
import Pagination from "@mui/material/Pagination";
import Alert from '@mui/material/Alert';


const QuestionPage = ({
  title_text = "All Questions",
  order,
  search,
  setQuestionOrder,
  clickTag,
  handleAnswer,
  handleNewQuestion,
  handleQuesUser,
  isHomePage,
  isUserQuestionsPage,
  isSavedPage,
}) => {
  const [qlist, setQlist] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      let res;
      if (!isHomePage && !isUserQuestionsPage && !isSavedPage) {
        if (search !== "") {
          res = await getQuestionsByFilter(order, search, 1);
        } else {
          res = await getQuestionsByFilter(order, search, currentPage);
        }
      } else {
        if (isHomePage) {
          if (search !== "") {
            res = await getQuestionByInterests(order, search, 1);
          } else {
            res = await getQuestionByInterests(order, search, currentPage);
          }
        } else if (isSavedPage) {
          res = await getUserSavedPosts();
        } else if (isUserQuestionsPage) {
          res = await getUserPostedQuestions();
        }
      }
      const { questions, totalPages } = res || { questions: [], totalPages: 1 };
      setQlist(questions);
      setTotalPages(totalPages);
    };
    fetchData().catch((e) => console.log(e));
  }, [
    isHomePage,
    isSavedPage,
    isUserQuestionsPage,
    order,
    search,
    currentPage,
  ]);

  const handlePageChange = (event, newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const NoQuestions = () => {
    return (
      <Alert style={{ marginTop: '15px' }} severity="info">
        No Questions Found.
      </Alert>
    );
  };

  return (
    <>
      <QuestionHeader
        title_text={title_text}
        qcnt={qlist.length}
        setQuestionOrder={setQuestionOrder}
        handleNewQuestion={handleNewQuestion}
        isSavedPage={isSavedPage}
        totalPages={totalPages}
      />
      <div id="question_list" className="question_list container">
        {isSavedPage && qlist.length === 0 ? <Alert style={{ marginTop: '15px' }} severity="info">No saved questions.</Alert> : null}
        <div className="list item">
          {qlist.map((q, idx) => (
            <Question
              q={q}
              key={idx}
              clickTag={clickTag}
              handleAnswer={handleAnswer}
              handleQuesUser={handleQuesUser}
            />
          ))}
          {title_text === "Search Results" && !qlist.length ? <NoQuestions /> : null }
            
        </div>
        <div className="pagination item">
          {!isUserQuestionsPage && !isSavedPage && (
            <Pagination
              count={totalPages}
              page={currentPage}
              className="pagination"
              onChange={handlePageChange}
              variant="outlined"
              shape="rounded"
              color="primary"
              size="large"
              showFirstButton
              showLastButton
              style={{ marginTop: "20px", justifyContent: "center" }}
              sx={{
                "& > .MuiPagination-ul": {
                  justifyContent: "center",
                },
              }}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default QuestionPage;
