var Mongoose = require("mongoose"),
  Schema = Mongoose.Schema;
module.exports = (mongoose) => {
  var schema = mongoose.Schema(
    {
      addedBy: { type: Schema.Types.ObjectId, ref: "users" },
      oneDayCampaignPrice: { type: Number },
      oneWeekCampaignPrice: { type: Number },
      oneMonthCampaignPrice: { type: Number },
      status: { type: String, default: "active" },
    },
    { timestamps: true }
  );

  schema.method("toJSON", function () {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
  });

  const adminSettings = mongoose.model("adminSettings", schema);
  return adminSettings;
};
