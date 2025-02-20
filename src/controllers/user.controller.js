import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken";
import mongoose from "mongoose"



/// -------  FUNCTION FOR GENERATING ACCESS AND REFRESH TOKEN --------------------->
const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken()
    user.refreshToken = refreshToken;
    user.save({
      validateBeforeSave: false
    })
    return { refreshToken, accessToken };
  } catch (error) {
    throw new ApiError(500, "Something went wrog");
  }
}

/// -------  FUNCTION FOR USER REGISTERATION --------------------->
const userRegister = asyncHandler(async (req, res) => {
  // get user details from frontend
  // validation - not empty 
  // check if user already exist  with email
  // check for images,check for avatar
  // upload them to cloudinary ,avatar
  //create user object , create entry in data base
  // remove the password and refresh token fields from the response 
  // check for user creation 
  // return response 

  const { username, fullName, email, password } = req.body;
  console.log("email", email)
  if ([username, fullName, email, password].some((fields) => fields?.trim() === '')) {
    throw new ApiError(400, "All fields are required ");
  }

  const userExisted = await User.findOne({ $or: [{ username }, { email }] });
  if (userExisted) {
    throw new ApiError(409, "user already register on this email")
  }
  const avatarLocalPath = req.files?.avatar[0]?.path;
  //const coverImageLocalPath = req.files?.coverImage[0]?.path;

  let coverImageLocalPath;
  if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
    coverImageLocalPath = req.files.coverImage[0].path
  }


  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required")
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath)
  const coverImage = await uploadOnCloudinary(coverImageLocalPath)

  if (!avatar) {
    throw new ApiError(400, "Avatar file is required")
  }


  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || '',
    password,
    username,
    email: email.toLowerCase()

  })

  if (!user) {
    throw new ApiError(500, "something went wrong");
  }
  //const createdUser = await User.select("-password -refreshToken");
  return res.status(201).json(
    new ApiResponse(200, "user is register succesfully")
  )


});

/// -------  FUNCTION FOR USER LOGIN --------------------->
const loginUser = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;
  if (!email || !username) {
    throw new ApiError(400, "email or username is required");
  }

  const user = await User.findOne(
    {
      $or: [{ email }, { username }]
    }
  );

  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid Credentials");
  }

  const { refreshToken, accessToken } = await generateAccessAndRefreshToken(user._id)
    ;

  const loggedinUser = await User.findById(user._id).select('-password -refreshToken');
  const options = {
    httpOnly: true,
    secure: true
  }

  return res.status(200).cookie("accessToken", accessToken, options).
    cookie("refreshToken", refreshToken, options).json(
      new ApiResponse(
        200,
        {
          user: loggedinUser, accessToken
        }
      )
    )
}
);

/// -------  FUNCTION FOR USER LOGOUT --------------------->
const userLogout = asyncHandler(async (req, res) => {

  await User.findByIdAndUpdate(req.user._id,
    {
      $unset: {
        refreshToken: 1
      }
    },
    {
      new: true
    }

  );
  const options = {
    httpOnly: true,
    secure: true
  }

  return res.status(200).clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(
      new ApiResponse(200, {}, "User logged out")
    );
});

/// -------  FUNCTION TO REFRESH ACCESS TOKEN --------------------->
const refreshAccessToken = asyncHandler(async (req, res) => {

  const incommingRefreshToken = req.cookies.refreshToken || req.header.refreshToken;

  if (!incommingRefreshToken) {
    throw new ApiError(401, "Unauthorized access");
  }

  const decodedToken = await jwt.verify(incommingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
  const user = User.findById(decodedToken?._id);

  if (!user) {
    throw new ApiError(401, "invalid refresh token");
  }

  if (incommingRefreshToken !== user.refreshToken) {
    throw new ApiError(401, "the token is used or expired");
  }
  const options = {
    httpOnly: true,
    secure: true
  }

  const { refreshToken, accessToken } = generateAccessAndRefreshToken(user._id);

  res.status(200).cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { accessToken, refreshToken },
        "Acces token refreshed"

      )
    )
});

/// -------  FUNCTION TO CHANGE PASSWORD --------------------->
const changePassword = asyncHandler(async (req, res, next) => {
  const { oldPassword, newPassword, confirmPassword } = req.body;


  if (!oldPassword || !newPassword || !confirmPassword) {
    throw new ApiError(400, "All fields are required");
  }


  if (newPassword !== confirmPassword) {
    throw new ApiError(400, "New password and confirm password do not match");
  }

  const user = await User.findById(req.user._id);
  if (!user) {
    throw new ApiError(404, "User not found");
  }


  const isPasswordValid = await user.isPasswordCorrect(oldPassword);
  if (!isPasswordValid) {
    throw new ApiError(400, "Invalid old password");
  }


  user.password = newPassword;
  await user.save();

  return res.status(200).json(new ApiResponse(200, {}, "Password successfully changed"));
});



/// -------  FUNCTION TO GET CURRENT USER DATA --------------------->
const getCurrentUserData = asyncHandler(async (req, res) => {

  return res.status(200)
    .json(
      new ApiResponse(200, req.user, "successfully user data")
    )
});

/// -------  FUNCTION TO EDIT  USER DATA --------------------->
const editUserData = asyncHandler(async (req, res) => {
  const { fullName, email } = req.body;
  if (!fullName || !email) {
    throw new ApiError(402, "Email and Password are required")
  }

  const user = await User.findByIdAndUpdate(req.user._id, {
    $set: {
      fullName,
      email
    }
  },
    {
      new: true
    }
  );

  return res.status(200).json(new ApiResponse(200, user, "success"));
});
/// -------  FUNCTION TO UPDATE USER AVATAR --------------------->
const updateAvatar = asyncHandler(async (req, res) => {
  try {
    const avatarLocalPath = req.file?.path;
    if (!avatarLocalPath) {
      throw new ApiError(402, "Avatar is required");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);

    await User.findByIdAndUpdate(req.user_id,
      {
        $set: {
          avatar: avatar.url
        }
      }
    );
    return res.status(200).json(
      new ApiResponse(200, { url: avatar.url }, "successfully updated")
    );

  } catch (error) {
    throw new ApiError(500, error.message);
  }
})

/// -------  FUNCTION TO get Channel DATA THROUGG AGGREGATION PIPELINE --------------------->
const getUserChannelData = asyncHandler(async (req, res) => {

  const { username } = req.params;

  if (!username?.trim()) {
    throw new ApiError(400, "username is missing");
  }

  const channel = await User.aggregate([
    {
      $match: {
        username: username.toLowerCase()
      }
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscriber"
      }
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        from: "subscriber",
        as: "subscribeTo"
      }
    },
    {
      $addFields: {
        subscriberCount: {
          $size: "$subscribers"
        },
        channelSubscribedToCount: {
          $size: "$subscribeTo"
        },
        isSubscribed: {
          $cond: {
            if: { $in: [req.user?._id, "$subscribers.subscribe"] },
            then: true,
            else: false
          }
        }
      }
    },
    {
      $project: {
        fullName: 1,
        username: 1,
        subscriberCount: 1,
        channelSubscribedToCount: 1,
        isSubscribed: 1,
        avatar: 1,
        coverImage: 1,
        email: 1
      }
    }
  ]);
  if (!channel?.length) {
    throw new ApiError(404, "channel does not exists")
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, channel[0], "User channel fetched successfully")
    )
});
/// -------  FUNCTION TO get WATCH HISTORY THROUGh AGGREGATION PIPELINE --------------------->
const getWatchHistory = asyncHandler(async (req, res) => {
  const watchHistory = User.aggregate([
    {
      $match: mongoose.Types.ObjectId(req.user._id)
    },
    {
      $lookup: {
        from: "videos",
        localField: "watchHistory",
        foreignField: "_id",
        as: "watchHistory",
        pipeline: [
          {
            $lookup: {
              from: "user",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                $project,{
                  fullName: 1,
                  avatar: 1,
                  username: 1
                }
              ]

            }
          }
        ]
      }
    }
  ]);
  if (!watchHistory?.length) {
    throw new ApiError(404, " watchHistory does not exists")
}

return res
.status(200)
.json(
    new ApiResponse(200, watchHistory [0], "User watchHistory fetched successfully")
)
})

export {
  userRegister, loginUser, userLogout, refreshAccessToken, changePassword,
  getCurrentUserData, editUserData, updateAvatar, getUserChannelData
};