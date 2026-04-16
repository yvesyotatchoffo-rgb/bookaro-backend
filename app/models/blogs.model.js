var Mongoose = require("mongoose"),
    Schema = Mongoose.Schema;
module.exports = (mongoose) => {
    var schema = mongoose.Schema(
        {
            title: String,
            banner: String,
            images: Array,
            description: "string",
            metaTitle: String,
            metaDescription: String,
            duration: String,
            contentLike: [{ type: Schema.Types.ObjectId, ref: "users" }],
            contentDislike: [{ type: Schema.Types.ObjectId, ref: "users" }],
            status: { type: String, default: "active" },
            addedBy: { type: Schema.Types.ObjectId, ref: "users", index: true },
            blogOwner: { type: Schema.Types.ObjectId, ref: "users", },
            isDeleted: { type: Boolean, default: false, index: true },
            categoryId: { type: Schema.Types.ObjectId, ref: "blogCategories" },
            subCategoryId: { type: Schema.Types.ObjectId, ref: "blogSubCategories" },
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

    const blogs = mongoose.model("blogs", schema);
    return blogs;
};