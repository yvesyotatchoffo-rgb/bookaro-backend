var Mongoose = require("mongoose"),
  Schema = Mongoose.Schema;

module.exports = (mongoose) => {
  var schema = mongoose.Schema(
    {
      userId: {
        type: Schema.Types.ObjectId,
        index: true,
        required: true,
        ref: "users",
      },
      deviceId: {
        type: String,
        trim: true,
        unique: true,
      },
      deviceToken: {
        type: String,
        trim: true,
      },
    },
    {
      timestamps: true,
    }
  );
  const devices = mongoose.model("devices", schema);
  return devices;
};
