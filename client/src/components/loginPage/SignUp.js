import React, { useState } from "react";
import { Grid, Typography, TextField, Checkbox, Button } from "@mui/material";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./signup.css";

function SignUpForm({ handleregisterUser }) {
  const [state, setState] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    interestedFields: [],
    image: null,
    about_me: "",
  });

  const interestList = ["java", "react", "javascript", "graphql", "docker"];

  const handleChange = (evt) => {
    const { name, value, type, checked } = evt.target;
    setState((prevState) => ({
      ...prevState,
      [name]:
        type === "checkbox"
          ? checked
            ? [...prevState.interestedFields, value]
            : prevState.interestedFields.filter((item) => item !== value)
            : value,
            image: type === "file" ? evt.target.files[0] : prevState.image,
          }));
        };

  const isValidEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  const handleOnSubmit = async (evt) => {
    evt.preventDefault();

    const {
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      interestedFields,
      image,
      about_me,
    } = state;

    if (password !== confirmPassword) {
      toast.error("Passwords Do Not Match", { containerId: 'signup' });
      return;
    }

    try {
      handleregisterUser({
        firstName,
        lastName,
        email,
        password,
        interestedFields,
        image,
        about_me,
      });
    } catch (error) {
      toast.error("Error registering user. Please try again.", { containerId: 'signup' });
    }

    // Clear form fields
    setState({
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      about_me: "",
      interestedFields: [],
      image: null,
    });
  };
  const areAllFieldsFilled = () => {
    const {
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      about_me,
      interestedFields,
    } = state;
    const isAtLeastOneCheckboxSelected = interestedFields.length > 0;
    return (
      firstName !== "" &&
      lastName !== "" &&
      email !== "" &&
      password !== "" &&
      confirmPassword !== "" &&
      about_me !== "" &&
      isAtLeastOneCheckboxSelected
    );
  };
  return (
    <>
      <div className="form-container sign-up-container">
        <form onSubmit={handleOnSubmit}>
          <h1>Create Account</h1>
          <br />
          <br />
          <div className="name-container">
            <Grid container spacing={1} alignItems="center">
              <Grid item container spacing={2} alignItems="center">
                <Grid item xs={6}>
                  <TextField
                    sx={{ width: 1 }}
                    required
                    onChange={handleChange}
                    value={state.firstName}
                    name="firstName"
                    id="first-name"
                    label="First Name"
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    sx={{ width: 1 }}
                    required
                    onChange={handleChange}
                    value={state.lastName}
                    name="lastName"
                    id="last-name"
                    label="Last Name"
                    variant="outlined"
                  />
                </Grid>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  sx={{ width: 1 }}
                  type="email"
                  value={state.email}
                  required
                  onChange={handleChange}
                  name="email"
                  id="email"
                  label="Email"
                  variant="outlined"
                  inputProps={{
                    pattern: "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
                  }}
                  error={!!state.email && !isValidEmail(state.email)}
                  helperText={
                    !!state.email && !isValidEmail(state.email)
                      ? "Please enter a valid email address"
                      : ""
                  }
                />
              </Grid>

              <Grid item container spacing={2} alignItems="center">
                <Grid item xs={6}>
                  <TextField
                    sx={{ width: 1 }}
                    type="password"
                    required
                    onChange={handleChange}
                    value={state.password}
                    name="password"
                    id="password"
                    label="Password"
                    variant="outlined"
                    inputProps={{ minLength: 8 }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    sx={{ width: 1 }}
                    type="password"
                    required
                    onChange={handleChange}
                    value={state.confirmPassword}
                    name="confirmPassword"
                    id="confirmPassword"
                    label="Confirm Password"
                    variant="outlined"
                    inputProps={{ minLength: 8 }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    sx={{ width: 1 }}
                    required
                    onChange={handleChange}
                    value={state.about_me}
                    name="about_me"
                    id="about-me"
                    label="About me"
                    variant="outlined"
                    multiline
                    minRows={2}
                  />
                </Grid>
              </Grid>

              <Grid item container spacing={1} alignItems="center">
                <Grid item xs={12}>
                  <Typography>What fields are you interested in ?</Typography>
                </Grid>
                <div
                  style={{
                    display: "flex",
                    width: "100%",
                    justifyContent: "center",
                  }}
                >
                  {interestList.map((item, index) => (
                    <Grid key={index} item>
                      <Checkbox
                        onChange={handleChange}
                        value={item}
                        name="interestedFields"
                      />
                      {item}
                    </Grid>
                  ))}
                </div>
              </Grid>

              <Grid
                container
                item
                spacing={3}
                alignItems="center"
                justifyContent="center"
              >
                <div style={{ display: "flex", marginTop: "20px" }}>
                  <div>
                    <Typography>Upload your profile picture.</Typography>
                  </div>
                  <div style={{ marginLeft: "10px" }}>
                    <input
                      accept="image/*"
                      style={{ display: "none" }}
                      id="file-upload"
                      type="file"
                      name="image"
                      onChange={handleChange}
                    />
                    <label htmlFor="file-upload">
                      <Button variant="outlined" component="span">
                        Upload File
                      </Button>
                    </label>
                  </div>
                </div>

                <Grid item xs={12}>
                  {state.image && (
                    <div>
                      <h3>:</h3>
                      <img
                        src={URL.createObjectURL(state.image)}
                        alt="Uploaded"
                        style={{ width: "128px", height: "128px" }}
                      />
                    </div>
                  )}
                </Grid>
              </Grid>

              <Grid container item justifyContent="center" alignItems="center">
                <Button
                  variant="contained"
                  type="submit"
                  id = "signUpBtn"
                  disabled={!areAllFieldsFilled()}
                >
                  Sign Up
                </Button>
              </Grid>
            </Grid>
          </div>
        </form>
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
        containerId="signup"
      />
    </>
  );
}

export default SignUpForm;
