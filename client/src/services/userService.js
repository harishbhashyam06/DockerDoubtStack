import { REACT_APP_API_URL, api } from "./config";

const USER_API_URL = `${REACT_APP_API_URL}/auth`;
const USER_PROFILE_URL = `${REACT_APP_API_URL}/user`;

// -------------- Ignore These Methods ------------------------- START
const loginUser = async (email, password) => {
  try {
    const response = await api.post(`${USER_API_URL}/login`, {
      username: email,
      password: password,
    });
    if (response.data == undefined || response.data == null) {
      if (response.response.data.msg == "Invalid Credentials") {
        return false;
      }
    }
    return true;
  } catch (e) {
    console.log("Error Logging In User: ", e);
  }
};

const registerUser = async (userData) => {
  try {
    let image128 = null;
    let image75 = null;

    const image = userData.image;
    if (image) {
      image128 = await resizeImageToBase64(image, 128, 128);
      image75 = await resizeImageToBase64(image, 75, 75);
    }

    // eslint-disable-next-line no-unused-vars
    const { image: _, ...userDataWithoutImage } = userData;

    const userDataWithImages = {
      ...userDataWithoutImage,
      image128,
      image75,
    };

    const response = await api.post(`${USER_API_URL}/register`, {
      userDataWithImages,
    });

    if (response.data == undefined || response.data == null) {
      if (
        response.response.data.error == "User with this email already exists"
      ) {
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error("Error Registering User: ", error);
    throw error;
  }
};

const resizeImageToBase64 = (imageFile, maxWidth, maxHeight) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const img = new Image();

      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width *= ratio;
          height *= ratio;
        }
        const canvas = document.createElement("canvas");
        canvas.width = maxWidth;
        canvas.height = maxHeight;
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        const offsetX = (maxWidth - width) / 2;
        const offsetY = (maxHeight - height) / 2;
        ctx.drawImage(img, offsetX, offsetY, width, height);
        const resizedImageBase64 = canvas.toDataURL("image/jpeg");
        resolve(resizedImageBase64);
      };
      img.onerror = (error) => reject(error);
      img.src = event.target.result;
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(imageFile);
  });
};

const isAuthorized = async () => {
  try {
    const response = await api.get(`${USER_API_URL}/isAuthorized`);
    const { authorized, accessTokenExpired } = response.data;

    if (!authorized) {
      if (accessTokenExpired) {
        const isRefreshed = await refreshToken();
        if (isRefreshed) {
          return isAuthorized();
        } else {
          return { status: "Login Needed" };
        }
      } else {
        return { status: "Login" };
      }
    } else {
      return { status: "authorized" };
    }
  } catch (error) {
    console.error("Error Checking Authorization: ", error);
    throw error;
  }
};

const refreshToken = async () => {
  try {
    const response = await api.post(`${USER_API_URL}/refreshToken`);
    if (!response.data.refreshTokenExpired) {
      return true;
    } else if (response.data.refreshTokenExpired) {
      return false;
    } else {
      throw new Error("Error refreshing access token");
    }
  } catch (error) {
    console.error("Error refreshing access token: ", error);
    throw error;
  }
};

const logoutUser = async () => {
  // eslint-disable-next-line no-unused-vars
  const res = await api.post(`${USER_API_URL}/logout`);
};

// -------------- Ignore These Methods ------------------------- END

const getAllUsers = async () => {
  const res = await api.get(`${USER_PROFILE_URL}/getAllUsers`);
  return res.data;
};

const getSearchedUsers = async (user) => {
  const res = await api.get(
    `${USER_PROFILE_URL}/getSearchedUsers?searchedUser=${user}`
  );
  return res.data;
};

const getUserProfile = async () => {
  const res = await api.get(`${USER_PROFILE_URL}/getUserProfile`);
  return res.data[0];
};

const getUserOtherProfile = async (email) => {
  const res = await api.get(
    `${USER_PROFILE_URL}/getUserProfileByEmail/${email}`
  );
  return res.data;
};

const getUserPosts = async (type = null, id = null) => {
  const res = await api.get(
    `${USER_PROFILE_URL}/getUserPosts?type=${type}&id=${id}`
  );
  return res.data;
};

export {
  logoutUser,
  getUserProfile,
  getSearchedUsers,
  loginUser,
  registerUser,
  isAuthorized,
  refreshToken,
  getAllUsers,
  getUserOtherProfile,
  getUserPosts,
};
