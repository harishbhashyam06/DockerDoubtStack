import "./index.css";
import React, { useState, Suspense, lazy } from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const SideBarNav = lazy(() => import('./sideBarNav'));
const QuestionPage = lazy(() => import('./questionPage'));
const TagPage = lazy(() => import('./tagPage'));
const AnswerPage = lazy(() => import('./answerPage'));
const NewQuestion = lazy(() => import('./newQuestion'));
const NewAnswer = lazy(() => import('./newAnswer'));
const ProfilePage = lazy(() => import('./profilePage'));
const UsersPage = lazy(() => import('./usersPage'));
const ApprovePage = lazy(() => import('./approvePage'));
const Header = lazy(() => import('../header'));
const MyQuestionPage = lazy(() => import('./myQuestions'));

const CustomLoadingIndicator = () => (
  <div style={{ textAlign: 'center', padding: '20px' }}>
    <CircularProgress />
    <p>Loading...</p>
  </div>
);

const Main = ({
  search = "",
  title,
  setQuesitonPage,
  userProfile,
  handleLogout,
}) => {
  const [page, setPage] = useState("userHome");
  const [questionOrder, setQuestionOrder] = useState("newest");
  const [qid, setQid] = useState("");
  const [quesUser, setQuesUser] = useState([]);
  const [searchUser, setSearchedUser] = useState(null);
  let selected = "";
  let content = null;

  const handleQuestions = () => {
    setQuesitonPage();
    setPage("home");
  };
  const handleQuestions1 = () => {
    setQuesitonPage();
    setPage("home");
    toast.success('Question added!', { containerId: 'mainContainer' });
  };

  const handleQuesUser = (user) => {
    setQuesUser(user);
    setPage("quesUser");
  };

  const handleTags = () => {
    setPage("tag");
  };

  const handleAnswer1 = (qid) => {
    setQid(qid);
    setPage("answer");
    toast.success('Answer added!', { containerId: 'mainContainer' });
  };
  const handleAnswer = (qid) => {
    setQid(qid);
    setPage("answer");
  };
  const handleUsersPage = (userSearch = "") => {
    console.log("handle users search", userSearch);
    setSearchedUser(userSearch);
    setPage("users");
  };

  const handleHomePage = () => {
    setQuesitonPage("", "Curated Questions");
    setPage("userHome");
  };

  const handleSavedPage = () => {
    setQuesitonPage("", "Saved Questions");
    setPage("saved");
  };

  const clickTag = (tname) => {
    setQuesitonPage("[" + tname + "]", tname);
    setPage("home");
  };

  const handleNewQuestion = () => {
    setPage("newQuestion");
  };

  const handleNewAnswer = () => {
    setPage("newAnswer");
  };

  const handleProfile = () => {
    setPage("profile");
  };

  const handleApprovePage = () => {
    setPage("approve");
  };

  const handleMyPosts = () => {
    setPage("myPosts");
  };

  const getQuestionPage = ({
    isSavedPage = false,
    isHomePage = false,
    order = "newest",
    search = "",
  }) => {
    return (
      <QuestionPage
        title_text={title}
        order={order}
        search={search}
        setQuestionOrder={setQuestionOrder}
        clickTag={clickTag}
        handleAnswer={handleAnswer}
        handleNewQuestion={handleNewQuestion}
        handleQuesUser={handleQuesUser}
        isHomePage={isHomePage}
        isSavedPage={isSavedPage}
      />
    );
  };

  switch (page) {
    case "home": {
      selected = "q";
      content = getQuestionPage({
        order: questionOrder.toLowerCase(),
        search: search,
      });
      break;
    }
    case "tag": {
      selected = "t";
      content = (
        <TagPage clickTag={clickTag} handleNewQuestion={handleNewQuestion} />
      );
      break;
    }
    case "profile": {
      selected = "";
      content = <ProfilePage emailId={userProfile.email} />;
      break;
    }

    case "quesUser": {
      selected = "";
      content = <ProfilePage emailId={quesUser.email} />;
      break;
    }

    case "myPosts": {
      selected = "";
      content = (
        <MyQuestionPage
          clickTag={clickTag}
          handleAnswer={handleAnswer}
          handleQuesUser={handleQuesUser}
        />
      );
      break;
    }
    case "answer": {
      selected = "";
      content = (
        <AnswerPage
          qid={qid}
          handleNewQuestion={handleNewQuestion}
          handleNewAnswer={handleNewAnswer}
          userProfile={userProfile}
          handleQuesUser={handleQuesUser}
        />
      );
      break;
    }

    case "approve": {
      selected = "ap";
      content = (
        <ApprovePage
          clickTag={clickTag}
          handleAnswer={handleAnswer}
          handleQuesUser={handleQuesUser}
        />
      );
      break;
    }

    case "newQuestion": {
      selected = "";
      content = (
        <NewQuestion
          handleQuestions={handleQuestions1}
          userProfile={userProfile}
        />
      );
      break;
    }
    case "newAnswer": {
      selected = "";
      content = (
        <NewAnswer
          qid={qid}
          handleAnswer={handleAnswer1}
          userProfile={userProfile}
        />
      );
      break;
    }

    case "users": {
      selected = "u";
      content = (
        <UsersPage
          handleQuesUser={handleQuesUser}
          searchUser={searchUser}
          handleUsersPage={handleUsersPage}
        />
      );
      break;
    }

    case "userHome": {
      selected = "h";
      content = getQuestionPage({
        order: questionOrder.toLowerCase(),
        search: search,
        isHomePage: true,
      });
      break;
    }

    case "saved": {
      selected = "s";
      content = getQuestionPage({
        order: questionOrder.toLowerCase(),
        search: search,
        isSavedPage: true,
      });
      break;
    }
    default:
      selected = "h";
      content = getQuestionPage({
        order: questionOrder.toLowerCase(),
        search: search,
        isHomePage: true,
      });
      break;
  }

  return (
    <Suspense fallback={<CustomLoadingIndicator />}>
      <Header
        search={search}
        setQuesitonPage={setQuesitonPage}
        profileIcon={userProfile.profile_pic_small}
        handleProfile={handleProfile}
        handleLogout={handleLogout}
        initial={userProfile.firstName[0]}
        page={page}
      />
      <div id="main" className="main">
          <SideBarNav
            selected={selected}
            userProfile={userProfile}
            handleQuestions={handleQuestions}
            handleTags={handleTags}
            handleHomePage={handleHomePage}
            handleSavedPage={handleSavedPage}
            handleUsersPage={handleUsersPage}
            handleApprovePage={handleApprovePage}
            handleMyPosts={handleMyPosts}
          />
        <div id="right_main" className="right_main">
          {content}
        </div>
      </div>
      <ToastContainer
         position="bottom-right"
         autoClose={2000}
         hideProgressBar={true}
         newestOnTop={true}
         closeOnClick
         rtl={false}
         pauseOnFocusLoss
         draggable
         theme="dark"
         containerId="mainContainer"
      />
    </Suspense>
  );
};

export default Main;
