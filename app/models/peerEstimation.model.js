var Mongoose = require("mongoose"),
  Schema = Mongoose.Schema;

module.exports = (mongoose) => {
  var schema = mongoose.Schema(
    {
      referencePrice: { type: String, enum: ["underestimated", "appropriate", "expensive"], required: true },
      userReasonablePrice: { type: Number, required: true },
      currentPropReferencePrice: { type: Number, required: true },
      currentPricePerSqm: { type: Number, required: true },
      ratePropertyTitle: { type: Number },
      ratePropertyPictures: { type: Number },
      rateInteriorDesign: { type: Number },
      rateLocation: { type: Number },
      rateCouldYouLiveIn: { type: Number },
      comment: { type: String },
      userId: { type: Schema.Types.ObjectId, ref: "users", required: true },
      propertyId: { type: Schema.Types.ObjectId, ref: "properties", required: true },
      campaginId: { type: Schema.Types.ObjectId, ref: "peerCampaigns" },
    },
    { timestamps: true }
  );
  const peerEstimation = mongoose.model("peerEstimations", schema);

  return peerEstimation;
};