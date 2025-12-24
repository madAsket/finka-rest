const { upload, uploadAvatar } = require("../controller/mediaUploadController");
const { authentication } = require("../controller/authController");

const router = require("express").Router();

router.route("/avatar").post(authentication, upload.single("avatar"), uploadAvatar);

module.exports = router;