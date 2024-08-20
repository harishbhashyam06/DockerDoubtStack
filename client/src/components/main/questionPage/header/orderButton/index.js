import { Button } from "@mui/material";
import "./index.css";

const OrderButton = ({
  message,
  setQuestionOrder,
  currentFilter,
  setCurrentFilter,
}) => {
  return (
    <>
      <Button
        variant={currentFilter === message ? "contained" : "outlined"}
        color="secondary"
        sx={{ marginRight: "10px" }}
        onClick={() => {
          setCurrentFilter(message);
          setQuestionOrder(message);
        }}
      >
        {message}
      </Button>
    </>
  );
};

export default OrderButton;
