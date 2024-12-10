const { signup, login, getCurrenUser, changePassword, changeProfile, authentication } = require("../controller/authController");

const router = require("express").Router();

router.route("/signup").post(signup);
router.route("/login").post(login);
router.route("/current").get(authentication, getCurrenUser);
router.route("/changepassword").patch(authentication, changePassword);
router.route("/changeprofile").patch(authentication, changeProfile);

module.exports = router;