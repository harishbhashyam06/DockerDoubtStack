import React from 'react';
import { TextField } from '@mui/material';

const Textarea = ({
  title,
  hint,
  id,
  val,
  setState,
  err,
}) => {
  return (
    <>   
      <TextField
        id={id}
        multiline
        required
        label = {title}
        rows={4}
        variant="outlined"
        fullWidth
        color="secondary"
        value={val}
        onChange={(e) => setState(e.target.value)}
        error={!!err} 
        helperText={err || hint} 
        sx={{marginBottom:"15px"}}
      />
    </>
  );
};

export default Textarea;
