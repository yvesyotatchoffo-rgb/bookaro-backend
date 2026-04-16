var Mongoose = require("mongoose"),
    Schema = Mongoose.Schema;

module.exports = (mongoose) => {
    var schema = mongoose.Schema(
        {
            userId: { type: Schema.Types.ObjectId, ref: "users" , index: true },
            amount: { type: Number, default: 0 },
            currency: String,
            planId: { type: Schema.Types.ObjectId, ref: "plans", },
            planType: {
                type: String,
                enum: ["free", "paid", "trial"],
                default: "paid",
            },
            paymentIntendId: {type: String},
            customerId: { type: String },
            paymentStatus: { type: String, enum: ["failed", "successfull", "pending"], default: "pending"},
            status: { type: String, enum: ["active", "inactive"], default: "active" },
            addedBy: { type: Schema.Types.ObjectId, ref: "users", index: true },
            doneBy: String,
            isDeleted: { type: Boolean, default: false, index: true },
            paymentMethod: { type: String, },
        },
        { timestamps: true }
    );

    const payments = mongoose.model("payments", schema);

    return payments;
};
