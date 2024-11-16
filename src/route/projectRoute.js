const router = require("express").Router();
const { addStorage, getAllStorages, 
    addDeposit, getAllDeposits, 
    addExpenseCategory, getMonthsExpenseCategories,
    addExpense, getMonthExpenses} = require("../controller/balanceController");
const { createProject, getAllProjects, getProjectById, updateProject, deleteProject, getProjectUsers } = require("../controller/projectController");
const { authentication } = require("../controller/authController");

//projects controllers
router.route("/").post(authentication, createProject)
                 .get(authentication, getAllProjects);
router.route("/:id").get(authentication, getProjectById)
                    .patch(authentication, updateProject)
                    .delete(authentication, deleteProject);
//project users conrollers
router.route("/:id/users/").get(authentication, getProjectUsers);

//project storages conrollers
router.route("/:id/storages/").post(authentication, addStorage).get(authentication, getAllStorages);
router.route("/:id/deposits/").post(authentication, addDeposit).get(authentication, getAllDeposits);

//project expense categories controllers
router.route("/:id/expensecategories/").post(authentication, addExpenseCategory).get(authentication, getMonthsExpenseCategories);

//project expense controllers
router.route("/:id/expenses/").post(authentication, addExpense).get(authentication, getMonthExpenses);

module.exports = router;