const { signup, login, getCurrenUser, changePassword, 
    changeProfile, authentication, googleAuth,generateResetPasswordToken, resetPassword, checkResetPasswordToken } = require("../controller/authController");

const router = require("express").Router();

router.route("/signup").post(signup);
router.route("/login").post(login);
router.route("/google").post(googleAuth);
router.route("/current").get(authentication, getCurrenUser);
router.route("/changepassword").patch(authentication, changePassword);
router.route("/changeprofile").patch(authentication, changeProfile);
router.route("/resetpassword").post(generateResetPasswordToken);
router.route("/resetpassword/:token").get(checkResetPasswordToken).patch(resetPassword);
module.exports = router;