var Mongoose = require("mongoose"),
    Schema = Mongoose.Schema;

module.exports = (mongoose) => {
    var schema = mongoose.Schema(
        {
            planId: { type: Schema.Types.ObjectId, ref: "plans" , index: true },
            userId: { type: Schema.Types.ObjectId, ref: "users" , index: true },
            amount: { type: Number, default: 0 },
            planType: String,
            interval: String,  
            stripe_price_id: { type: String },
            validUpto: {type: Date},
            subscriptionId:{ type: String },
            // subscriptionData: { type: String },
            status: { type: String, enum: ["active", "trialing", "canceled"], default: "active" },
            addedBy: { type: Schema.Types.ObjectId, ref: "users" },
            isDeleted: { type: Boolean, default: false, index: true },
            // subscription: { type: Object, },
            trialEnd: { type: Date },
            twoWeekReminder: { type: Boolean, default: false},
            oneWeekReminder: { type: Boolean, default: false},
            oneDayReminder: { type: Boolean, default: false},
        },
        { timestamps: true }
    );

    const subscriptions = mongoose.model("subscriptions", schema);

    return subscriptions;
};