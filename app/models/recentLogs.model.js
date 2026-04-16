var Mongoose = require("mongoose"),
  Schema = Mongoose.Schema;

module.exports = (mongoose) => {
  var schema = mongoose.Schema(
    {
      userId: { type: Schema.Types.ObjectId, ref: "users" },
      // propertyId: { type: Schema.Types.ObjectId, ref: "properties" },
      // zipcode: { type: String,},
      // propertyType: {
      //   type: String,
      //   enum: ["sale", "rent", "offmarket", "directory",],
      // },
      propertyIds: [{ type: Schema.Types.ObjectId, ref: "properties" }],
      zipcodes: [{ type: String }],
      propertyTypes: [{
        type: String,
        enum: ["sale", "rent", "offmarket", "directory"],
      }],
    },
    { timestamps: true }
  );
  const recentLogs = mongoose.model("recentLogs", schema);

  return recentLogs;
}