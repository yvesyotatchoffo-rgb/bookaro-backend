var mongoose = require("mongoose"),
    Schema = mongoose.Schema;

module.exports = (mongoose) => {
    var schema = mongoose.Schema(
        {
            firstName: { type: String },
            lastName: { type: String },
            phoneNumber: { type: String },
            emailAddress: { type: String },
            whenToBuy: { type: String },
            whenToSell: { type: String },
            propertyLocation: { type: String },
            cityLooking: { type: String },
            propertyType: { type: String, enum: ["apartment", "castle", "farm", "building", "house"], },
            budgetRange: { type: String },
            categoryId: { type: Schema.Types.ObjectId, ref: "blogCategories" },
            addedBy: { type: Schema.Types.ObjectId, ref: "users", index: true },
            isDeleted: { type: Boolean, default: false, index: true },
            status: { type: String, default: "active" },
        },
        { timestamps: true }
    );

    schema.method("toJSON", function () {
        const { __v, _id, ...object } = this.toObject();
        object.id = _id;
        return object;
    });

    const Form = mongoose.model("form", schema);
    return Form;
};
