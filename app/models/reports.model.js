const mongoose = require('mongoose');
const Schema = mongoose.Schema;

module.exports = (mongoose) => {
    var schema = mongoose.Schema(
        {
            reason: { type: String },
            // reasonType: {
            //     type: String,
            //     enum: [
            //         "Misleading User",
            //         "Fraud and Scam related",
            //         "Trying to be someone else",
            //         "Abusive",
            //         "Other Reason"
            //     ],
            // },
            status: { type: String,enum: ["accepted", "pending", "rejected"], default: "pending" },
            addedBy: { type: Schema.Types.ObjectId, ref: "users", index: true },
            reportTo: { type: Schema.Types.ObjectId, ref: "users", index: true },
            isDeleted: { type: Boolean, default: false }
        },
        { timestamps: true }
    );

    schema.method("toJSON", function () {
        const { __v, _id, ...object } = this.toObject();
        object.id = _id;
        return object;
    });

    const reports = mongoose.model("reports", schema);
    return reports;
};
