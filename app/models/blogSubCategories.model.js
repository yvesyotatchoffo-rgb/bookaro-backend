var Mongoose = require("mongoose"),
  Schema = Mongoose.Schema;

module.exports = (mongoose) => {
  var schema = mongoose.Schema(
    {
      addedBy: { type: Schema.Types.ObjectId, ref: "users" },
      SubCategoryName: { type: String },
      categoryId: { type: Schema.Types.ObjectId, ref: "blogCategories" },
      status: { type: String, enum: ["active", "inactive"], default: "active" }
    },
    { timestamps: true }
  );
  const blogSubCategories = mongoose.model("blogSubCategories", schema);

  return blogSubCategories;
}