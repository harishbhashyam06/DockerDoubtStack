import React from "react";
import UsersHeader from "./header";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import { Grid } from "@mui/material";
import { useEffect, useState } from "react";
import { getAllUsers, getSearchedUsers } from "../../../services/userService";

import "./index.css";
import "ldrs/quantum";

const UsersPage = ({ handleQuesUser, searchUser, handleUsersPage }) => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    if (searchUser) {
      const fetchData = async () => {
        let res = await getSearchedUsers(searchUser);
        setUsers(res || []);
      };
      fetchData().catch((e) => console.log(e));
    } else {
      const fetchData = async () => {
        let res = await getAllUsers();
        setUsers(res || []);
      };
      fetchData().catch((e) => console.log(e));
    }
  }, [searchUser]);

  const getFormatedDate = (unformatted) => {
    return new Date(unformatted).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <>
      <UsersHeader handleUsersPage={handleUsersPage} />

      <Grid
        style={{ paddingLeft: 90, paddingTop: 30 }}
        spacing={4}
        container
        id="user_list"
        className="user_list"
      >
        {users.map((u, idx) => (
          <Grid item key={idx}>
            <div
              className="user-card"
              onClick={() => handleQuesUser(u)}
              // eslint-disable-next-line react/no-unknown-property
            >
              <CardHeader
                title={u.firstName + " " + u.lastName}
                subheader={"User since " + getFormatedDate(u.joined_on)}
              />
              <CardContent>
                <div className="card-content">
                  <img
                    className="profile-image-large"
                    alt="Profile Picture"
                    src={
                      u.profile_pic_large
                        ? u.profile_pic_large
                        : "https://img.icons8.com/ios/100/user--v1.png"
                    }
                  />
                </div>
                <Grid item spacing={1} container xs={12}>
                  <Grid item xs={12}>
                  <div className="title-text-tag">
                    <strong>Interests</strong>
                  </div>
                  </Grid>
                  <Grid>
                  <div className="tag-container">
                    {u.interests.map((interest, index) => (
                      <div className="tag-name" key={index}>
                        {interest.name + ","}
                      </div>
                    ))}
                  </div>
                  </Grid>
                </Grid>
              </CardContent>
            </div>
          </Grid>
        ))}
      </Grid>
    </>
  );
};

export default UsersPage;
