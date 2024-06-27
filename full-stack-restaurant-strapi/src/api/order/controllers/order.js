 'use strict';

/**
 * order controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

module.exports = createCoreController('api::order.order', ({ strapi }) => ({

...createCoreController('api::order.order'),

  async create(ctx) {
    console.log(JSON.stringify(ctx))

    const { address, amount, dishes, token, city, state, userID, orderDate } = ctx.request.body.data;
    const stripeAmount = Math.floor(amount * 100);

    // charge on stripe
    const charge = await stripe.charges.create({
      amount: stripeAmount,
      currency: "usd",
      description: `Order ${new Date()} by ${userID}`,
      source: token,
    });

    // Register the order in the database
    const order = await strapi.entityService.create('api::order.order', {
      data: {
        user: userID,
        charge_id: charge.id,
        amount: stripeAmount,
        address,
        dishes,
        city,
        state,
        orderDate,
      },
    });

    return order;
  },

}));
