import React from "react";
function SignInForm({ handleLogin }) {
  const [state, setState] = React.useState({
    email: "",
    password: "",
  });
  const handleChange = (evt) => {
    const value = evt.target.value;
    setState({
      ...state,
      [evt.target.name]: value,
    });
  };

  const handleOnSubmit = (evt) => {
    evt.preventDefault();
    handleLogin(state);
  };

  return (
    <div className="form-container sign-in-container">
      <form onSubmit={handleOnSubmit}>
        <h1>Sign in</h1>
        <input
          type="email"
          autoComplete="username"
          placeholder="Email"
          id = "email-id"
          name="email"
          value={state.email}
          onChange={handleChange}
        />
        <input
          type="password"
          name="password"
          autoComplete="current-password"
          id = "login-password"
          placeholder="Password"
          value={state.password}
          onChange={handleChange}
        />
        <button type="submit" style={{cursor: "pointer"}} id = "sign-in">Sign In</button>
      </form>
    </div>
  );
}

export default SignInForm;
