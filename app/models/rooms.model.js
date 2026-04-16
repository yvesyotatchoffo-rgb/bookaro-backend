var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = (mongoose) => {
    var schema = mongoose.Schema(
        {
            subject: { type: String },
            image: { type: String },
            isGroupChat: { type: Boolean, default: false },
            // isDeleted: {type: Boolean, default: false},
        },
        { timestamps: true }
    );

    const Rooms = mongoose.model("Rooms", schema);

    return Rooms;
};
