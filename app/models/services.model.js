var Mongoose = require("mongoose"),
  Schema = Mongoose.Schema;

module.exports = (mongoose) => {
  var schema = mongoose.Schema(
    {
      name: { type: String, required: true },
      status: { type: String, default: "active" },
      isDeleted: { type: Boolean, default: false, index: true },
      addedBy: { type: Schema.Types.ObjectId, ref: "users" },
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

  const services = mongoose.model("services", schema);
  return services;
};
