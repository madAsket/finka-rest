const catchAsync = require("../utils/catchAsync");
const StripeSubscriptionService = require("../services/StripeSubscriptionService");

const createCheckoutSession = catchAsync(async (req,res,next)=>{
    const { lookup_key } = req.body;
    const session = await StripeSubscriptionService.createCheckoutSession(lookup_key);
    res.redirect(303, session.url);
});

const createPortalSession = catchAsync(async (req,res,next)=>{
    const { session_id } = req.body;
    const portalSession = await StripeSubscriptionService.createPortalSession(session_id);
    res.redirect(303, portalSession.url);
});

const catchStripeWebhook = catchAsync(async (req,res,next)=>{
    try{
        await StripeSubscriptionService.catchStripeWebhook(req);
        return res.send();
    }catch(e){
        return res.sendStatus(400);
    }
});

module.exports = {
    createCheckoutSession,
    createPortalSession,
    catchStripeWebhook
}