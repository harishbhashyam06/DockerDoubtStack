import React from "react";
import "./stylesheets/App.css";
import LoginPage from "./components/loginPage/LoginPage.js";
import { useState, useEffect } from "react";
import Main from "./components/main/index.js";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  loginUser,
  registerUser,
  isAuthorized,
  refreshToken,
  getUserProfile,
  logoutUser,
} from "./services/userService.js";

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [search, setSearch] = useState("");
  const [mainTitle, setMainTitle] = useState("All Questions");

  const setQuesitonPage = (search = "", title = "All Questions") => {
    setSearch(search);
    setMainTitle(title);
  };

  const handleMain = async () => {
    const user = await getUserProfile();
    if(user == undefined) {
      return;
    }
    setUserProfile(user);
    setLoggedIn(true);
  };

  const handleLogin = async (state) => {
    try {
      loginUser(state.email, state.password).then((status) => {
        if (status == true) {
          handleMain();
        } else {
          toast.error('Invalid Credentials', { containerId: 'loginpage' });
        }
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleLogout = async () => {
    await logoutUser();
    setUserProfile(null);
    setLoggedIn(false);
    toast.success('Logged out successfully', { containerId: 'loginpage' });
  };

  const handleRegisterUser = async (userData) => {
    try {
      registerUser(userData).then((status) => {
        if (status == true) {
          toast.success('Account Created Successfully', { containerId: 'loginpage' });
        } else {
          window.alert(
            "The email is already in use! Please use another email !"
          );
        }
      });
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const checkAuthorization = async () => {
      try {
        const authorized = await isAuthorized();

        if (authorized.status == "authorized") {
          handleMain();
        } else if (authorized.status == "Login Needed") {
          window.alert("You have been logged out, Please login again !");
        }
      } catch (error) {
        console.error(error);
      }
    };

    checkAuthorization();
  }, []);

  const refreshAccessTokenPeriodically = () => {
    const refreshTokenTime = 120 * 60 * 1000;

    setTimeout(async () => {
      try {
        await refreshToken();
        refreshAccessTokenPeriodically();
      } catch (error) {
        console.error("Error refreshing access token: ", error);

        refreshAccessTokenPeriodically();
      }
    }, refreshTokenTime);
  };

  refreshAccessTokenPeriodically();
  return (
    <>
      <div>
        {loggedIn ? (
          <>
            <Main
              title={mainTitle}
              search={search}
              setQuesitonPage={setQuesitonPage}
              userProfile={userProfile}
              handleLogout={handleLogout}
            />
          </>
        ) : (
          <LoginPage
            handleLogin={handleLogin}
            handleRegisterUser={handleRegisterUser}
          />
        )}
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
        containerId="loginpage"
      />
    </>
  );
}

export default App;
