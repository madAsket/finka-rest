const router = require("express").Router();
const { addStorage, getAllStorages, updateStorage,
    addDeposit, getAllDeposits, 
    addExpenseCategory, getMonthsExpenseCategories,
    addExpense, getExpenses,
    addTransfer, getAllTransfers, 
    balanceData,
    deleteExpense,
    deleteTransfer, updateTransfer,
    deleteDeposit, updateDeposit,
    updateExpense,
    updateExpenseCategory,
    } = require("../controller/balanceController");
const { createProject, getAllProjects, getProjectById, 
    updateProject, deleteProject, getProjectUsers, 
    switchProject, 
    inviteUserToProject} = require("../controller/projectController");
const { authentication } = require("../controller/authController");
const { expensesAnalytic } = require("../controller/analyticController");

//projects controllers
router.route("/").post(authentication, createProject)
                 .get(authentication, getAllProjects);
router.route("/:id").get(authentication, getProjectById)
                    .patch(authentication, updateProject)
                    .delete(authentication, deleteProject);
                    
router.route("/:id/switch").post(authentication, switchProject);

//project users conrollers
router.route("/:id/users/").get(authentication, getProjectUsers)
                            .post(authentication, inviteUserToProject);

//project storages conrollers
router.route("/:id/storages/").post(authentication, addStorage)
                                .get(authentication, getAllStorages);
router.route("/:id/storages/:storageId").patch(authentication, updateStorage);                         

//project deposits controllers
router.route("/:id/deposits/").post(authentication, addDeposit)
                                .get(authentication, getAllDeposits);
router.route("/:id/deposits/:depositId").delete(authentication, deleteDeposit).patch(authentication, updateDeposit);

//project expense categories controllers
router.route("/:id/expensecategories/").post(authentication, addExpenseCategory).get(authentication, getMonthsExpenseCategories);
router.route("/:id/expensecategories/:catId").patch(authentication, updateExpenseCategory);

//project transfers controllers
router.route("/:id/transfers/").post(authentication, addTransfer).get(authentication, getAllTransfers);
router.route("/:id/transfers/:transferId").delete(authentication, deleteTransfer)
                                        .patch(authentication, updateTransfer);

//project expense controllers
router.route("/:id/expenses/").post(authentication, addExpense)
                                .get(authentication, getExpenses)
router.route("/:id/expenses/:expenseId").delete(authentication, deleteExpense)
                                        .patch(authentication, updateExpense)

router.route("/:id/balance/").get(authentication, balanceData);

//project analytic
router.route("/:id/analytic/expenses/").get(authentication, expensesAnalytic);

module.exports = router;