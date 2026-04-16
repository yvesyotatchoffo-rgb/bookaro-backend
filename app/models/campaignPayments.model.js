var Mongoose = require("mongoose"),
  Schema = Mongoose.Schema;

module.exports = (mongoose) => {
  var schema = mongoose.Schema(
    {
      campaignType: { type: String, enum: ["1Day", "1Month", "1Week"], required: true, },
      amount: { type: Number },
      currency: { type: String },
      userId: { type: Schema.Types.ObjectId, ref: "users" },
      propertyId: { type: Schema.Types.ObjectId, ref: "properties" },
      paymentIntendId: { type: String },
      paymentStatus: { type: String, enum: ["failed", "successfull", "pending"] },
    },
    { timestamps: true }
  );
  const campaignPayments = mongoose.model("campaignPayments", schema);

  return campaignPayments;
}