
var Mongoose = require("mongoose"),
    Schema = Mongoose.Schema;

module.exports = (mongoose) => {
    var schema = mongoose.Schema(
        {
            oldOwner: { type: Schema.Types.ObjectId, ref: "users" },
            newOwner: { type: Schema.Types.ObjectId, ref: "users" },
            owner: { type: Schema.Types.ObjectId, ref: "users" },
            renter: { type: Schema.Types.ObjectId, ref: "users" },
            propertyId: { type: Schema.Types.ObjectId, ref: "properties" },
            transferDate: { type: Date },
            // reason: { type: String,},
            transferStatus: { type: String, enum: ["completed", "pending"], default: "pending"},
            propertyType: { type: String, enum: ["rent", "sale"] },
            // OldOwnerData: Object,
            isDeleted: { type: Boolean, default: false },
        },
        { timestamps: true }
    );

    const propertyTransfers = mongoose.model("propertyTransfers", schema);

    return propertyTransfers;
};