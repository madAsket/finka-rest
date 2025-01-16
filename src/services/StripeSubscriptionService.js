const AbstractService = require("./AbstractService");
const {sequelize, Subscription, User} = require("../db/models");
const { Op } = require("sequelize");
const AppError = require("../utils/appError");
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

class StripeSubscriptionService extends AbstractService {
    async createCheckoutSession(lookup_key){
        const prices = await stripe.prices.list({
            lookup_keys: [lookup_key],
            expand: ['data.product'],
          });
          const session = await stripe.checkout.sessions.create({
            billing_address_collection: 'auto',
            line_items: [
              {
                price: prices.data[0].id,
                // For metered billing, do not pass quantity
                quantity: 1,
        
              },
            ],
            mode: 'subscription',
            success_url: `${process.env.APP_DOMAIN}/subscription/success/{CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.APP_DOMAIN}/subscription/cancelled`,
          });
          return session;
    }
    async createPortalSession(sessionId){
        const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId);

        // This is the url to which the customer will be redirected when they are done
        // managing their billing with the portal.
        const returnUrl = process.env.APP_DOMAIN;
      
        const portalSession = await stripe.billingPortal.sessions.create({
          customer: checkoutSession.customer,
          return_url: returnUrl,
        });
        return portalSession;
    }
    async catchStripeWebhook(request){
        let event = request.body;
        const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
        // Only verify the event if you have an endpoint secret defined.
        // Otherwise use the basic event deserialized with JSON.parse
        if (endpointSecret) {
          // Get the signature sent by Stripe
          const signature = request.headers['stripe-signature'];
          try {
            event = stripe.webhooks.constructEvent(
              request.body,
              signature,
              endpointSecret
            );
          } catch (err) {
            console.log(`⚠️  Webhook signature verification failed.`, err.message);
          }
        }
        let subscription;
        let status;
        // Handle the event
        switch (event.type) {
          case 'customer.subscription.trial_will_end':
            subscription = event.data.object;
            status = subscription.status;
            console.log(`Subscription status is ${status}.`);
            // Then define and call a method to handle the subscription trial ending.
            // handleSubscriptionTrialEnding(subscription);
            break;
          case 'customer.subscription.deleted':
            subscription = event.data.object;
            status = subscription.status;
            console.log(`Subscription status is ${status}.`);
            // Then define and call a method to handle the subscription deleted.
            // handleSubscriptionDeleted(subscriptionDeleted);
            break;
          case 'customer.subscription.created':
            subscription = event.data.object;
            status = subscription.status;
            console.log(`Subscription status is ${status}.`);
            // Then define and call a method to handle the subscription created.
            // handleSubscriptionCreated(subscription);
            break;
          case 'customer.subscription.updated':
            subscription = event.data.object;
            status = subscription.status;
            console.log(`Subscription status is ${status}.`);
            // Then define and call a method to handle the subscription update.
            // handleSubscriptionUpdated(subscription);
            break;
          case 'entitlements.active_entitlement_summary.updated':
            subscription = event.data.object;
            console.log(`Active entitlement summary updated for ${subscription}.`);
            // Then define and call a method to handle active entitlement summary updated
            // handleEntitlementUpdated(subscription);
            break;
          default:
            // Unexpected event type
            console.log(`Unhandled event type ${event.type}.`);
        }
    }
}

module.exports = new StripeSubscriptionService();