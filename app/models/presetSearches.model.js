var Mongoose = require("mongoose"),
  Schema = Mongoose.Schema;

module.exports = (mongoose) => {
  var schema = mongoose.Schema(
    {
      type: { type: String },
      title: { type: String },
      link: { type: String },
      addedBy: { type: Schema.Types.ObjectId, ref: "users", },
    },
    { timestamps: true }
  );
  const presetSearches = mongoose.model("presetSearches", schema);

  return presetSearches;
};