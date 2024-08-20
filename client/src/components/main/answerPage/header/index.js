import { Grid, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import Paper from '@mui/material/Paper';
import { Button, Avatar } from '@mui/material';
import CountUp from 'react-countup';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import { memo } from 'react';

// eslint-disable-next-line react/display-name
const AnswerHeader = memo(({ question, meta }) => {
    const Item = styled(Paper)(({ theme }) => ({
        backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
        ...theme.typography.body2,
        padding: theme.spacing(2),
        textAlign: 'center',
        color: theme.palette.text.secondary,
        height: "86px"
    }));
    const CustomButton = styled(Button)({
        textTransform: 'none', 
        
      });
    const fullName = `${question.asked_by?.firstName || ''} ${question.asked_by?.lastName || ''}`;

    return (
        <Grid container spacing={2} alignItems="center">
            <Grid item xs={3}>
                <Item>
                    <CustomButton color="primary" variant="text" startIcon={<VisibilityIcon style={{fontSize: "25px"}}/>} >
                        <CountUp
                            start={0}
                            end={question?.views || 0}
                            duration={2}
                            style={{ fontSize: '20px', marginRight: '0.5rem', fontWeight: "bold" }}
                        />
                        <Typography variant="body2" fontSize="20px">Views</Typography>
                    </CustomButton>
                </Item>
            </Grid>
            <Grid item xs={3}>
                <Item>
                    <CustomButton color="primary" variant="text" startIcon={<QuestionAnswerIcon style={{fontSize: "25px"}}/>}>
                        <CountUp
                            start={0}
                            end={question?.answers?.length || 0}
                            duration={2}
                            style={{ fontSize: '20px', marginRight: '0.5rem', fontWeight: "bold" }}
                        />
                        <Typography variant="body2" fontSize="20px">Answers</Typography>
                    </CustomButton>
                </Item>
            </Grid>
            <Grid item xs={3}>
                <Item>
                    <CustomButton color="primary" variant="text">
                        {question?.asked_by?.profile_pic_small && (
                            <Avatar src={question.asked_by.profile_pic_small} alt="Avatar" sx={{ marginRight: 1 }} />
                        )}
                        <Typography variant="body2" fontSize="20px">{fullName}</Typography>
                    </CustomButton>
                </Item>
            </Grid>
            <Grid item xs={3}>
                <Item>
                    <CustomButton color="primary" variant="text" style={{marginTop: "5px"}} startIcon={<AccessTimeIcon style={{fontSize: "25px"}} />}>
                        <Typography variant="body1" style={{ fontSize: '1.1rem'}}>{meta}</Typography>
                    </CustomButton>
                </Item>
            </Grid>
        </Grid>
    );
});

export default AnswerHeader;
