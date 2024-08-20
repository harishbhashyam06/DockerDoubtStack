import "./index.css";
import { Grid } from "@mui/material";
import PersonSearchRoundedIcon from "@mui/icons-material/PersonSearchRounded";
import { useState } from "react";
import * as React from "react";


const UsersHeader = ({ handleUsersPage }) => {
    const [searchUser, setSearchUser] = useState("");
      
  return (
    <div>
      <div className="users-page-title">Users</div>
      <div className="header-container">
        <Grid container spacing={2}>
          <Grid spacing={2} container item alignItems="center">
            <Grid item >
            <PersonSearchRoundedIcon />

            </Grid>
            <Grid item xs={11} >
            <input
                type="text"
              placeholder="Search User ..."
              value={searchUser}
              id = "user-search"
              onChange={(e) => {
                setSearchUser(e.target.value);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleUsersPage(e.target.value);
                }
              }}
            />
                </Grid>
           
      
        
          </Grid>
        </Grid>
      </div>
    </div>
  );
};

export default UsersHeader;
