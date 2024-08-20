import * as React from "react";
import { styled, alpha } from "@mui/material/styles";
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  InputBase,
  MenuItem,
  Menu,
  Avatar,
  Button,
} from "@mui/material";
import {
  Search as SearchIcon,
  AccountCircle,
  MoreVert as MoreIcon,
} from "@mui/icons-material";
import DropdownMenu from './dropdown'; 

const Search = styled("div")(({ theme }) => ({
  position: "relative",
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  "&:hover": {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: "100%",
  [theme.breakpoints.up("sm")]: {
    marginLeft: theme.spacing(3),
    width: "auto",
  },
}));

const SearchIconWrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: "100%",
  position: "absolute",
  pointerEvents: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: "inherit",
  "& .MuiInputBase-input": {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create("width"),
    width: "100%",
    [theme.breakpoints.up("md")]: {
      width: "20ch",
    },
  },
}));

export default function Header({
  search,
  setQuesitonPage,
  profileIcon,
  handleProfile,
  initial,
  handleLogout,
  page,
}) {
  const [mobileMoreAnchorEl, setMobileMoreAnchorEl] = React.useState(null);
  // eslint-disable-next-line no-unused-vars
  const [loggedIn, setLoggedIn] = React.useState(true);
  const [searchVal, setSearchVal] = React.useState(search);
    // eslint-disable-next-line no-unused-vars
  const [isMenuOpen, setMenuOpen] = React.useState(false);

  const isMobileMenuOpen = Boolean(mobileMoreAnchorEl);

  const handleProfileMenuOpen = () => {
    if(isMenuOpen) {
      setMenuOpen(false);
    } else {
      setMenuOpen(true);
    }
  };

  const handleMobileMenuClose = () => {
    setMobileMoreAnchorEl(null);
    setMenuOpen(false);

  };

    // eslint-disable-next-line no-unused-vars
  const handleProfileButtonClick = () => {
    setMenuOpen(false)
    handleMobileMenuClose();
    handleProfile();
  };

  const handleMobileMenuOpen = (event) => {
    setMobileMoreAnchorEl(event.currentTarget);
    setMenuOpen(true);
  };

  const menuId = "primary-search-account-menu";
  const renderMenu = (
    <DropdownMenu 
              handleProfileButtonClick={handleProfileButtonClick} 
              handleLogout={handleLogout} 
              isMenuOpened={isMenuOpen}
              setMenuOpen= {setMenuOpen}
            />
  );

  const mobileMenuId = "primary-search-account-menu-mobile";
  const renderMobileMenu = (
    <Menu
      anchorEl={mobileMoreAnchorEl}
      anchorOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      id={mobileMenuId}
      keepMounted
      transformOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      open={isMobileMenuOpen}
      onClose={handleMobileMenuClose}
    >
      <MenuItem onClick={handleProfileMenuOpen}>
        <IconButton
          size="large"
          aria-label="account of current user"
          aria-controls="primary-search-account-menu"
          aria-haspopup="true"
          color="inherit"
        >
          <AccountCircle />
        </IconButton>
        <p>Profile</p>
      </MenuItem>
    </Menu>
  );
  return (
    <>
      <AppBar position="fixed">
        <Toolbar>
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ display: { xs: "none", sm: "block" } }}
          >
            Fake StackOverFlow
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          {page == "home" || page == "userHome" ? (
            <Search>
              <SearchIconWrapper>
                <SearchIcon />
              </SearchIconWrapper>
              <StyledInputBase
                placeholder="Search…"
                inputProps={{ "aria-label": "search" }}
                value={searchVal}
                id="searchBar"
                onChange={(e) => {
                  setSearchVal(e.target.value);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    setQuesitonPage(e.target.value, "Search Results");
                  }
                }}
              />
            </Search>
          ) : (
            <></>
          )}

          <Box sx={{ display: { xs: "none", md: "flex" } }}>
            {loggedIn ? (
              <>
                <IconButton
                  size="large"
                  edge="end"
                  aria-label="account of current user"
                  aria-controls={menuId}
                  aria-haspopup="true"
                  onClick={handleProfileMenuOpen}
                  id="profileIcon"
                  color="inherit"
                >
                  {profileIcon ? (
                    <Avatar src={profileIcon} />
                  ) : (
                    <Avatar>{initial}</Avatar>
                  )}
                </IconButton>
              </>
            ) : (
              <>
                <Button
                  variant="contained"
                  color="inherit"
                  sx={{
                    color: "#1976D2",
                    fontWeight: "bold",
                    mr: 2,
                  }}
                >
                  Sign Up
                </Button>
                <Button
                  variant="contained"
                  color="inherit"
                  sx={{
                    color: "#1976D2",
                    fontWeight: "bold",
                  }}
                >
                  Sign In
                </Button>
              </>
            )}
          </Box>
          <Box sx={{ display: { xs: "flex", md: "none" } }}>
            <IconButton
              size="large"
              aria-label="show more"
              aria-controls={mobileMenuId}
              aria-haspopup="true"
              onClick={handleMobileMenuOpen}
              color="inherit"
            >
              <MoreIcon />
            </IconButton>
          </Box>
        </Toolbar>
        {renderMobileMenu}
        {renderMenu}
      </AppBar>
      <Toolbar />
    </>
  );
}
