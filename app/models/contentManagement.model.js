var Mongoose = require("mongoose"),
    Schema = Mongoose.Schema;
module.exports = (mongoose) => {
    var schema = mongoose.Schema(
        {
            title: String,
            description: String,
            metaTitle: String,
            metaDescription: String,
            slug: String,
            metaKeyword:String,
            status: { type: String, default: "active" },
            addedBy: { type: Schema.Types.ObjectId, ref: "users", index: true },
            isDeleted: { type: Boolean, default: false, index: true },
            createdAt: Date,
            updatedAt: Date,
        },
        { timestamps: true }
    );

    schema.method("toJSON", function () {
        const { __v, _id, ...object } = this.toObject();
        object.id = _id;
        return object;
    });

    const content = mongoose.model("contentmanagement", schema);
    return content;
};