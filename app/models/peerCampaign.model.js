var Mongoose = require("mongoose"),
  Schema = Mongoose.Schema;

module.exports = (mongoose) => {
  var schema = mongoose.Schema(
    {
      referencePrice: { type: Number },
      pricePerSqm: { type: Number },
      campaignName: { type: String },
      startDate: { type: Date },
      endDate: { type: Date },
      duration: { type: String, enum: ["1Day", "1Week", "1Month"], required: true },
      status: { type: String, enum: ["active", "inactive"], required: true },
      userId: { type: Schema.Types.ObjectId, ref: "users", required: true },
      propertyId: { type: Schema.Types.ObjectId, ref: "properties", required: true },
      shareCount: { type: Number },
    },
    { timestamps: true }
  );

  schema.virtual("peerEstimations", {
    ref: "peerEstimations",
    localField: "_id",
    foreignField: "campaginId"
  });
  schema.set('toObject', { virtuals: true });
  schema.set('toJSON', { virtuals: true });
  const peerCampaign = mongoose.model("peerCampaigns", schema);
  return peerCampaign;
};