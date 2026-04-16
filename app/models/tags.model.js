var Mongoose = require("mongoose"),
  Schema = Mongoose.Schema;

module.exports = (mongoose) => {
  var schema = mongoose.Schema(
    {
      title: { type: String },
      addedBy: { type: Schema.Types.ObjectId, ref: "users", },
    },
    { timestamps: true }
  );
  const tags = mongoose.model("tags", schema);

  return tags;
};