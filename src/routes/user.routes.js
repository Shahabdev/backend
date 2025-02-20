import { Router } from "express";
import { userRegister,loginUser ,userLogout ,refreshAccessToken,
    changePassword,getCurrentUserData,editUserData,updateAvatar,getUserChannelData} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js"
import {verifyJwt} from  "../middlewares/auth.middleware.js"


const router = Router();

router.route("/register").post(upload.fields(
    [{
        name : "avatar",
         maxCount : 1
    },
{
    name : "coverImage",
    maxCount : 1
}]
),userRegister);

router.route("/login").post(loginUser);

/// ------- Secure routes --------------->
router.route("/logout").post(verifyJwt,userLogout);
router.route("/refresh-AccessToken").post(refreshAccessToken);
router.route("/change-password").post(verifyJwt,changePassword);
router.route("/current-user").get(verifyJwt,getCurrentUserData);
router.route("/edit-user").patch(verifyJwt,editUserData);
router.route("/avatar").patch(verifyJwt, upload.single("avatar"), updateAvatar);
router.route("/channel-data/:username").get(verifyJwt,getUserChannelData)

export  default router;

