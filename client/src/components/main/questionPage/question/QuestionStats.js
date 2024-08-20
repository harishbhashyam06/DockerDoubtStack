import { Grid, Typography } from "@mui/material";
import React from "react";
import "./index.css";

export default function QuestionStats({ icon, countText, className }) {
  return (
    <Grid container alignItems="center">
      <Grid item>{icon}</Grid>
      <Grid item sx={{ marginLeft: "8px" }}>
        <Typography  variant="body2" className={className}>
          {countText}
        </Typography>
      </Grid>
    </Grid>
  );
}
