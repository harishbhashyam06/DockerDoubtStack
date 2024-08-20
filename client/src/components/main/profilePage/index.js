import React, { useEffect, useState } from "react";
import { Typography, Grid, Chip } from "@mui/material";
import AccessTimeFilledIcon from '@mui/icons-material/AccessTimeFilled';

import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import AssignmentIndRoundedIcon from "@mui/icons-material/AssignmentIndRounded";
import InterestsRoundedIcon from "@mui/icons-material/InterestsRounded";
import { BarChart } from "@mui/x-charts/BarChart";
import { getUserOtherProfile } from "../../../services/userService";
import "./index.css";
import "ldrs/quantum";

const ProfilePage = ({ emailId }) => {
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    const getUser = async (mail) => {
      const user = await getUserOtherProfile(mail);
      return user;
    };
    getUser(emailId).then((data) => {
      setUserProfile(data);
    });
  }, []);

  if (
    userProfile == null ||
    userProfile == undefined ||
    userProfile.length == 0
  ) {
    return <l-quantum size="200" speed="1.75" color="black"></l-quantum>;
  }

  const {
    firstName,
    lastName,
    profile_pic_large,
    joined_on,
    upvoted_entity,
    downvoted_entity,
    interests,
    about_me,
    email,
    answered_questions,
    questions_asked,
    comments,
  } = userProfile;

  const date_options = {
    day: "2-digit",
    month: "long",
    year: "numeric",
  };

  const joinedOnDate = new Date(joined_on);

  const chartSetting = {
    xAxis: [
      {
        label: "Number of Posts",
      },
    ],
    width: 500,
    height: 400,
    margin: { bottom: 50, left: 75 },
  };

  const data = [
    { argument: "Upvotes", value: upvoted_entity.length },
    { argument: "Downvotes", value: downvoted_entity.length },
    { argument: "Answers", value: answered_questions },
    { argument: "Questions", value: questions_asked },
    { argument: "Comments", value: comments },
  ];

  return (
    <div className="profile-container">
      <Grid container spacing={3} alignItems="center">
        <Grid container item xs={12} md={6} lg={6} spacing={2}>
          <Grid item>
            <img
              className="profile-image-large"
              alt="Profile Picture"
              src={
                profile_pic_large
                  ? profile_pic_large
                  : "https://img.icons8.com/ios/100/user--v1.png"
              }
            />
          </Grid>
          <Grid item>
            <Typography variant="h4">{firstName + " " + lastName}</Typography>
          </Grid>

          <Grid item container spacing={1} alignItems="center">
            <Grid item>
              <EmailRoundedIcon />
            </Grid>
            <Grid item>{email}</Grid>
          </Grid>

          <Grid item container spacing={1} alignItems="center">
            <Grid item>
              <AccessTimeFilledIcon />
            </Grid>
            <Grid item>
              <Typography>
                <strong>Member Since: </strong>
                {joinedOnDate.toLocaleDateString("en-US", date_options)}
              </Typography>
            </Grid>
          </Grid>

          <Grid item container spacing={1} alignItems="center">
            <Grid item>
              <AssignmentIndRoundedIcon />
            </Grid>
            <Grid item>
              <strong>About Me</strong> <br />
            </Grid>
            <Grid item>{about_me}</Grid>
          </Grid>

          <Grid item container spacing={1} alignItems="center">
            <Grid item>
              <InterestsRoundedIcon />
            </Grid>
            <Grid item>
              <Typography variant="subtitle1">
                <strong>Interested Topics:</strong>{" "}
              </Typography>
            </Grid>
            <Grid item container spacing={2}>
              {interests.map((topic) => (
                <Grid item key={topic.name}>
                  <Chip
                    key={topic.name}
                    label={topic.name}
                    variant="outlined"
                  />
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>

        <Grid className="stats-bar-graph" item xs={12} md={5} lg={5}>
          <BarChart
            dataset={data}
            yAxis={[{ scaleType: "band", dataKey: "argument" }]}
            series={[{ dataKey: "value", label: "User Stats" }]}
            layout="horizontal"
            grid={{ vertical: true }}
            {...chartSetting}
          />
        </Grid>
      </Grid>
    </div>
  );
};

export default ProfilePage;
