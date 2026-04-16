const stripe = require('stripe')(process.env.STRIPE_KEY);

exports.create_customer = async (options) => {
    let create_payload = {
        name: options.fullName,
        email: options.email,
        description: `This is ${options.fullName} details`,
    }

    let address = {};

    if (options.country) {
        address.country = options.country;
    }

    if (options.postal_code) {
        address.postal_code = options.postal_code;
    }

    if (options.line1) {
        address.line1 = options.line1;
    }

    if (options.line2) {
        address.line2 = options.line2;
    }

    if (options.city) {
        address.city = options.city;
    }
    if (options.state) {
        address.state = options.state;
    }

    if (Object.keys(address).length === 0) {
        address = null;
    }

    if (address) {
        create_payload.address = address;
    }

    const create_stripe_customer = await stripe.customers.create(create_payload);
    return create_stripe_customer;
},
exports.create_customer_source = async (options) => {
    // console.log(options, "=============options")
     const customer_source = await stripe.customers.createSource(
         options.stripe_customer_id,
         { source: options.source }
     );
     return customer_source;
 },
 exports.update_stripe_customer = async (options) => {
    let update_stripe_customer = await stripe.customers.update(
        // To make default added card
        options.stripe_customer_id,
        {
            default_source: options.source_id,
        }
    );
   // console.log(update_stripe_customer, "================update_stripe_customer")
    return update_stripe_customer;
}
 
