var Mongoose = require("mongoose"),
  Schema = Mongoose.Schema;
module.exports = (mongoose) => {
  var schema = mongoose.Schema(
    {
      featureType:{ type: String, enum: ["home", "owner","sales-mandats", "real-estate" ]},
      name: String,
      status: { type: String, default: "active" },
      isDeleted: { type: Boolean, default: false },
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

  const Features = mongoose.model("features", schema);
  return Features;
};
