import "./index.css";
import { Box, CardContent, IconButton, Typography } from "@mui/material";
import { QuestionAnswer } from "@mui/icons-material";

const Tag = ({ t, clickTag }) => {
  return (
    <div
      className="tagNode"
      onClick={() => clickTag(t.name)}
      style={{ position: "relative" }}
    >
      <CardContent>
        <Typography
          variant="h6"
          component="div"
          className="tagName"
          sx={{ cursor: "pointer" }}
        >
          {t.name}
        </Typography>
        <Typography
          variant="body2"
          component="div"
          sx={{
            fontSize: "0.8rem",
            overflow: "hidden",
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
          }}
        >
          {t.description}
        </Typography>
        <Box
          display="flex"
          alignItems="center"
          sx={{ position: "absolute", bottom: 20, right: 20, padding: "8px" }}
        >
          <IconButton size="small" disabled>
            <QuestionAnswer fontSize="small" />
          </IconButton>
          <Typography variant="body2" color="textSecondary" component="div">
            {t.qcnt} questions
          </Typography>
        </Box>
      </CardContent>
    </div>
  );
};

export default Tag;
