var mongoose = require("mongoose");
var Schema = mongoose.Schema;

module.exports = (mongoose) => {
    var schema = mongoose.Schema(
        {
            search: { type: String },
            price: { type: String },
            propertyType: { type: String },
            type: { type: String },
            proposal: { type: String },
            location: { type: String },
            user_id: { type: Schema.Types.ObjectId, ref: 'users', },
            lastSearch: { type: Boolean, default: false },
            isDeleted: { type: Boolean, default: false },
            createdAt: Date,
            updatedAt: Date,

        },
        { timestamps: true }
    );

    const location = mongoose.model("location", schema);

    return location;
};
