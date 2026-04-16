var mongoose = require("mongoose");
var Schema = mongoose.Schema;

module.exports = (mongoose) => {
  var schema = mongoose.Schema(
    {
      type: { type: String, enum: ["message"] },
      user_id: { type: mongoose.Types.ObjectId, ref: "users" },
      message_id: { type: mongoose.Types.ObjectId, ref: "messages" },
      delete_type: {
        type: String,
        enum: ["delete_for_me", "delete_for_everyone", ""],
      },
      property_id: {
        type: Schema.Types.ObjectId,
        ref: 'properties',
      },
      isDeleted: { type: Boolean, default: false },
      isRead: { type: Boolean, default: false },
      room_id: { type: Schema.Types.ObjectId, ref: "Rooms" },
    },
    { timestamps: true }
  );

  const ChatCommonOperations = mongoose.model("ChatCommonOperations", schema);

  return ChatCommonOperations;
};
