const { signup, login, getCurrenUser, authentication } = require("../controller/authController");

const router = require("express").Router();

router.route("/signup").post(signup);
router.route("/login").post(login);
router.route("/current").get(authentication, getCurrenUser);

module.exports = router;