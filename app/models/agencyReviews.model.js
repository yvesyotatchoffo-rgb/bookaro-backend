var Mongoose = require("mongoose"),
    Schema = Mongoose.Schema;
module.exports = (mongoose) => {
    var schema = mongoose.Schema(
        {
            comment: { type: String, trim: true },
            stars: {
                type: Number,
                required: true,
                min: [1, "Stars must be at least 1"],
                max: [5, "Stars cannot exceed 5"]
            },
            source: { type: String, trim: true },
            reviewerName: { type: String, trim: true },
            agencyId: { type: Schema.Types.ObjectId, ref: "users", index: true },
            addedBy: { type: Schema.Types.ObjectId, ref: "users", index: true },
            isDeleted: { type: Boolean, default: false, },
        },
        { timestamps: true }
    );

    schema.method("toJSON", function () {
        const { __v, _id, ...object } = this.toObject();
        object.id = _id;
        return object;
    });

    const agencyReviews = mongoose.model("agencyReviews", schema);
    return agencyReviews;
};