var Mongoose = require("mongoose"),
    Schema = Mongoose.Schema;

module.exports = (mongoose) => {
    var schema = mongoose.Schema(
        {
            userId: { type: Schema.Types.ObjectId, ref: "users" },
            ipAddress: { type: String },
            browser: { type: String },
            deviceToken: { type: String },
            deviceId: {  type: String},
            LoginTime: { type: Date },
            LogoutTime: { type: Date },
            status: { type: String, enum: ["active", "logged-out"], default: "active" },
            // addedBy: { type: Schema.Types.ObjectId, ref: "users" },
            isDeleted: { type: Boolean, default: false },
        },
        { timestamps: true }
    );

    const sessions = mongoose.model("sessions", schema);

    return sessions;
};