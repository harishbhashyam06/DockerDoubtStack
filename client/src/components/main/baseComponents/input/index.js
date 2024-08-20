import React from 'react';
import TextField from '@mui/material/TextField';

const Input = ({ title, hint, id, val, setState, err }) => {
  return (
    <>
      <TextField
        id={id}
        className="input_input"
        type="text"
        value={val}
        label={title}
        required
        color="secondary"
        variant="outlined"
        error={!!err}
        fullWidth
        helperText={err || hint} 
        onChange={(e) => {
          setState(e.target.value);
        }}
        sx={{marginBottom:"15px"}}
      />
    </>
  );
};

export default Input;
