const router = require("express").Router();
const { addStorage, getAllStorages, addDeposit, getAllDeposits} = require("../controller/balanceController");
const { createProject, getAllProjects, getProjectById, updateProject, deleteProject } = require("../controller/projectController");
const { authentication } = require("../controller/authController");

//projects controllers
router.route("/").post(authentication, createProject)
                 .get(authentication, getAllProjects);
router.route("/:id").get(authentication, getProjectById)
                    .patch(authentication, updateProject)
                    .delete(authentication, deleteProject);

// storages conrollers
router.route("/:id/storages/").post(authentication, addStorage).get(authentication, getAllStorages);
router.route("/:id/deposits/").post(authentication, addDeposit).get(authentication, getAllDeposits);

module.exports = router;