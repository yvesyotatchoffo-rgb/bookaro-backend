var Mongoose = require("mongoose"),
  Schema = Mongoose.Schema;
module.exports = (mongoose) => {
  var schema = mongoose.Schema(
    {
      like: { type: Boolean, default: false },
      dislike: { type: Boolean, default: false },
      property_id: { type: Schema.Types.ObjectId, ref: "properties" },
      p2pLike: { type: Boolean, default: false },
      campaignId: { type: Schema.Types.ObjectId, ref: 'peerCampaigns' },
      user_id: { type: Schema.Types.ObjectId, ref: "users" },
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

  const Favorites = mongoose.model("favorites", schema);
  return Favorites;
};
