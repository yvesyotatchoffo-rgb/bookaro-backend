var Mongoose = require("mongoose"),
  Schema = Mongoose.Schema;

module.exports = (mongoose) => {
  var schema = mongoose.Schema(
    {
      funnelUrlId: { type: Schema.Types.ObjectId, ref: "funnelUrl", },
      addedBy: { type: Schema.Types.ObjectId, ref: "users", },
    },
    { timestamps: true }
  );
  const funnelVideoLike = mongoose.model("funnelVideoLike", schema);

  return funnelVideoLike;
};