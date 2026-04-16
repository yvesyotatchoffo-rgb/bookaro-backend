var Mongoose = require("mongoose"),
    Schema = Mongoose.Schema;

module.exports = (mongoose) => {
    var schema = mongoose.Schema(
        {
            blockedBy: { type: Schema.Types.ObjectId, ref: "users" },
            blockedTo: { type: Schema.Types.ObjectId, ref: "users" },
            reason: { type: String,},
            // isDeleted: { type: Boolean, default: false },
        },
        { timestamps: true }
    );

    const blockedUsers = mongoose.model("blockedUsers", schema);

    return blockedUsers;
};