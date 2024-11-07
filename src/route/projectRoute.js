const router = require("express").Router();
const { createProject, checkAccessByOwner, getAllProjects, getProjectById, updateProject, deleteProject } = require("../controller/projectController");
const { authentication } = require("../controller/authController");

router.route("/").post(authentication, createProject)
                 .get(authentication, getAllProjects);
router.route("/:id").get(authentication, getProjectById)
                    .patch(authentication, updateProject)
                    .delete(authentication, deleteProject);

module.exports = router;