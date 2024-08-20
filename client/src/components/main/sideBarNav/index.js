import "./index.css";
import { Typography, Grid } from "@mui/material";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import QuizRoundedIcon from "@mui/icons-material/QuizRounded";
import LocalOfferRoundedIcon from "@mui/icons-material/LocalOfferRounded";
import BookmarkRoundedIcon from "@mui/icons-material/BookmarkRounded";
import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded";
import AssignmentTurnedInRoundedIcon from "@mui/icons-material/AssignmentTurnedInRounded";
import AccountBoxRoundedIcon from "@mui/icons-material/AccountBoxRounded";

const SideBarNav = ({
  selected = "",
  handleQuestions,
  handleTags,
  handleHomePage,
  handleSavedPage,
  handleUsersPage,
  userProfile,
  handleApprovePage,
  handleMyPosts,
}) => {

  const gridStyle = {
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: 25,
    paddingRight: 0,
    marginTop:10,
  };

  return (
    <div id="sideBarNav" className="sideBarNav">
      <Grid
        className="sidebar-inner"
        style={{
          margin:1,
          marginTop: 0,
          padding: 0,
          width:170
        }}
        container
        spacing={4}
        alignItems="center"
      >
        <Grid
          style={gridStyle}
          id="menu_home"
          className={`menu_button ${selected === "h" ? "menu_selected" : ""}`}
          onClick={() => {
            handleHomePage();
          }}
          item
          container
          spacing={1}
          alignItems="center"
        >
          <Grid item>
            <HomeRoundedIcon />
          </Grid>
          <Grid item>
            <Typography className="sidebar-text">
              <strong>Home</strong>
            </Typography>
          </Grid>
        </Grid>

        <Grid
           style={gridStyle}
          id="menu_question"
          className={`menu_button ${selected === "q" ? "menu_selected" : ""}`}
          onClick={() => {
            handleQuestions();
          }}
          item
          container
          spacing={1}
          alignItems="center"
        >
          <Grid item>
            <QuizRoundedIcon />
          </Grid>
          <Grid item>
            <Typography className="sidebar-text" id="sideBarQuestions">
              <strong>Questions</strong>
            </Typography>
          </Grid>
        </Grid>

        <Grid
          style={gridStyle}
          id="menu_question"
          className={`menu_button ${selected === "mp" ? "menu_selected" : ""}`}
          onClick={() => {
            handleMyPosts();
          }}
          item
          container
          spacing={1}
          alignItems="center"
        >
          <Grid item>
            <AccountBoxRoundedIcon />
          </Grid>
          <Grid item>
            <Typography className="sidebar-text" id="mypost">
              <strong>My Posts</strong>
            </Typography>
          </Grid>
        </Grid>

        <Grid
           style={gridStyle}
          id="menu_tag"
          className={`menu_button ${selected === "t" ? "menu_selected" : ""}`}
          onClick={() => {
            handleTags();
          }}
          item
          container
          spacing={1}
          alignItems="center"
        >
          <Grid item>
            <LocalOfferRoundedIcon />
          </Grid>
          <Grid item>
            <Typography className="sidebar-text" id="sideTags">
              <strong>Tags</strong>
            </Typography>
          </Grid>
        </Grid>

        <Grid
           style={gridStyle}
          id="menu_saved"
          className={`menu_button ${selected === "s" ? "menu_selected" : ""}`}
          onClick={() => {
            handleSavedPage();
          }}
          item
          container
          spacing={1}
          alignItems="center"
        >
          <Grid item>
            <BookmarkRoundedIcon />
          </Grid>
          <Grid item>
            <Typography className="sidebar-text" id="side-saved">
              <strong>Saved</strong>
            </Typography>
          </Grid>
        </Grid>

        <Grid
          style={gridStyle}
          id="menu_users"
          className={`menu_button ${selected === "u" ? "menu_selected" : ""}`}
          onClick={() => {
            handleUsersPage();
          }}
          item
          container
          spacing={1}
          alignItems="center"
        >
          <Grid item>
            <PeopleAltRoundedIcon />
          </Grid>
          <Grid item>
            <Typography className="sidebar-text">
              <strong>Users</strong>
            </Typography>
          </Grid>
        </Grid>

        {userProfile.role == "mod" ? (
          <>
            <Grid
              style={gridStyle}
              id="menu_users"
              className={`menu_button ${
                selected === "ap" ? "menu_selected" : ""
              }`}
              onClick={() => {
                handleApprovePage();
              }}
              item
              container
              spacing={1}
              alignItems="center"
            >
              <Grid item>
                <AssignmentTurnedInRoundedIcon />
              </Grid>
              <Grid item>
                <Typography className="sidebar-text" id="sideApprove">
                  <strong>Approve</strong>
                </Typography>
              </Grid>
            </Grid>
          </>
        ) : null}
      </Grid>
    </div>
  );
};

export default SideBarNav;
