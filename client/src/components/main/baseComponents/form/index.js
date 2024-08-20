import { styled } from '@mui/material/styles';

const StyledForm = styled('div')(({ theme }) => ({
  backgroundColor: '#ffffff',
  borderRadius: 10,
  boxShadow: `0 4px 20px ${theme.palette.primary.main}`,
  padding: 30,
  width: '70%',
  maxWidth: 600,
  margin: '20px auto',
}));


const Form = ({ children }) => {
  return <StyledForm>{children}</StyledForm>;
};

export default Form;
