var Mongoose = require("mongoose"),
    Schema = Mongoose.Schema;

module.exports = (mongoose) => {
    var schema = mongoose.Schema(
        {
            cardId: {type: String },
            userId: { type: Schema.Types.ObjectId, ref: "users" , index: true },
            last4: String,
            brand: String,
            exp_month: String,  
            exp_year: String,
            // firstName: String,
            pincode: String,
            country: String,
            fullName:  String,
            paymentMethod: String,
            isPrimary: { type: Boolean, default: false },
            status: { type: String, enum: ["active", "inactive"], default: "active" },
            // addedBy: { type: Schema.Types.ObjectId, ref: "users" },
            isDeleted: { type: Boolean, default: false },
        },
        { timestamps: true }
    );

    const cards = mongoose.model("cards", schema);

    return cards;
};