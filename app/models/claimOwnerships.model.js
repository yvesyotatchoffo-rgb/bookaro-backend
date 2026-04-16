var Mongoose = require("mongoose"),
  Schema = Mongoose.Schema;

module.exports = (mongoose) => {
  var schema = mongoose.Schema(
    {
      name: { type: String, required: true },
      email: { type: String, required: true },
      mobileNo: { type: String },
      claimMessage: { type: String },
      status: { type: String, default: "pending", enum: ["accept", "reject", "pending"] },
      userId: { type: Schema.Types.ObjectId, ref: "users" },
      propertyId: { type: Schema.Types.ObjectId, ref: "properties" },
      docs: Array
    },
    { timestamps: true }
  );
  schema.method("toJSON", function () {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
  });

  const claimOwnerships = mongoose.model("claimOwnerships", schema);
  return claimOwnerships;
};
