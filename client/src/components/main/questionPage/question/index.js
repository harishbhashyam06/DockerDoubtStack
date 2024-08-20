import { getMetaData } from "../../../../tool";
import "./index.css";
import { Typography, Grid, Box, Button, Avatar } from "@mui/material";
import {
  QuestionAnswerRounded,
  Visibility as ViewsIcon,
} from "@mui/icons-material";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import QuestionStats from "./QuestionStats";

const Question = ({ q, clickTag, handleAnswer, handleQuesUser }) => {

  // Check if q.asked_by is null or undefined
  const askedBy = q.asked_by ? q.asked_by : { firstName: "", lastName: "", profile_pic_small: null };

  return (
    <div className="question right_padding">
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "12%",
        }}
      >
        <Grid container spacing={1} >

          <Grid item>
            <QuestionStats
              icon={<QuestionAnswerRounded />}
              countText={`${q.answers.length || 0} answers`}
              className = "statAnswer"
            />
          </Grid>
          <Grid item>
            <QuestionStats
              icon={<ViewsIcon />}
              countText={`${q.views || 0} views`}
              className = "statViews"
            />
          </Grid>
          <Grid item>
            {q.votes >= 0 ? (
              <QuestionStats
                icon={<ArrowUpwardIcon />}
                countText={`${q.votes} upvotes`}
                className = "statVotes"
              />
            ) : (
              <QuestionStats
                icon={<ArrowDownwardIcon />}
                countText={`${q.votes} DownVotes`}
                className = "statVotes"
              />
            )}
          </Grid>
        </Grid>
      </Box>
      <Grid container direction="column" className="question_mid" >
        <Typography
          variant="h6"
          className="postTitle"
          sx={{ marginBottom: 1, cursor: "pointer" }}
          onClick={() => {
            handleAnswer(q._id);
          }}
        >
          {q.title}
        </Typography>
        <Typography variant="body2" sx={{ marginBottom: 1 }}>
          {q.text.substring(0, 250)}
          ...
        </Typography>
        <Grid
          container
          spacing={1}
          className="question_tags"
          display={"flex"}
          justifyContent={"space-between"}
        >
          <div className="tagList" style={{ display: "flex", justifyContent: "left" }}>
            {q.tags.map((tag, idx) => (
              <Grid item key={idx} mt={2}>
                <Button
                  className="question_tag_button"
                  variant="outlined"
                  onClick={(e) => {
                    e.stopPropagation();
                    clickTag(tag.name);
                  }}
                >
                  {tag.name}
                </Button>
              </Grid>
            ))}
          </div>
          <Box display="flex" alignItems="center" mt={2} className="activity">
            <Button variant="text" className = "name-button" onClick={() => handleQuesUser(q.asked_by)}>
              <Avatar
                src={askedBy.profile_pic_small}
                alt="Avatar"
                sx={{ marginRight: 1 }}
              />
              {`${askedBy.firstName} ${askedBy.lastName}`}
            </Button>
            <Typography variant="body2" color="textSecondary">
              asked {getMetaData(new Date(q.ask_date_time))}
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </div>
  );
};

export default Question;
