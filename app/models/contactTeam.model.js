var Mongoose = require("mongoose"),
  Schema = Mongoose.Schema;

module.exports = (mongoose) => {
  var schema = mongoose.Schema(
    {
      name: { type: String },
      type: { type: String },
      email: { type: String },
      message: { type: String },
      subSubject: { type: String },
      phoneNumber: { type: String },
      whenToSell: { type: String },
      propertyLocation: { type: String },
      propertyType: { type: String },
      addedBy: { type: Schema.Types.ObjectId, ref: "users", },
    },
    { timestamps: true }
  );
  const contactTeam = mongoose.model("contactTeam", schema);

  return contactTeam;
};