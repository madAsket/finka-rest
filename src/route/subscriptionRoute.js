const {createCheckoutSession,
    createPortalSession,
    catchStripeWebhook } = require("../controller/subscriptionController");
const { authentication  } = require("../controller/authController");

const router = require("express").Router();

router.route("/stripe/create-checkout-session").post(authentication, createCheckoutSession);
router.route("/stripe/create-portal-session").post(authentication, createPortalSession);
router.route("/stripe/webhook").post(catchStripeWebhook);

module.exports = router;