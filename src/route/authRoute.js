const { signup, login, getCurrenUser, authentication } = require("../controller/authController");
const catchAsync = require("../utils/catchAsync");

const router = require("express").Router();

router.route("/signup").post(catchAsync(signup));
router.route("/login").post(catchAsync(login));
router.route("/current").get(authentication, catchAsync(getCurrenUser));

module.exports = router;