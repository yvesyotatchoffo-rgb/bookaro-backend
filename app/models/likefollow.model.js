var Mongoose = require("mongoose"),
  Schema = Mongoose.Schema;
module.exports = (mongoose) => {
  var schema = mongoose.Schema(
    {
      event_id: { type: Schema.Types.ObjectId, ref: "events" },
      status: { type: String, default: "active" },
      addedBy: { type: Schema.Types.ObjectId, ref: "users" },
      isDeleted: { type: Boolean, default: false },
      type: { type: String, enum: ["like", "follow"] },
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

  const Like = mongoose.model("like", schema);
  return Like;
};
