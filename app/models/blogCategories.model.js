var Mongoose = require("mongoose"),
  Schema = Mongoose.Schema;

module.exports = (mongoose) => {
  var schema = mongoose.Schema(
    {
      addedBy: { type: Schema.Types.ObjectId, ref: "users", required: true },
      CategoryName: { type: String, required: true },
      status: { type: String, enum: ["active", "inactive"], default: "active" }
    },
    { timestamps: true }
  );

  schema.virtual("subCategories", {
    ref: "blogSubCategories",
    localField: "_id",
    foreignField: "categoryId"
  });

  schema.set("toObject", { virtuals: true });
  schema.set("toJSON", { virtuals: true });

  const blogCategories = mongoose.model("blogCategories", schema);

  return blogCategories;
}