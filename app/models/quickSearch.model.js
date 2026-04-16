// var Mongoose = require("mongoose"),
//     Schema = Mongoose.Schema;
// module.exports = (mongoose) => {
//     var schema = mongoose.Schema(
//         {
//             propertyType:{
//                 type: String,
//                 enum: ["sale", "rent", "offmarket", "directory"],
//             },
//             city: { type: String },
//             type: { type: String },
//             isDeleted: {type: Boolean, default: false}
//         },
//         { timestamps: true }
//     );

//     schema.method("toJSON", function () {
//         const { _v, id, ...object } = this.toObject();
//         object.id = _id;
//         return object;
//     });

//     const quickSearch = mongoose.model("quickSearch", schema);
//     return quickSearch;
// };
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

module.exports = (mongoose) => {
    var schema = mongoose.Schema(
        {
            propertyType: {
                type: String,
                enum: ["sale", "rent", "offmarket", "directory", "transaction"],
            },
            city: { type: String },
            type: { type: String },
            isDeleted: { type: Boolean, default: false }
        },
        { timestamps: true }
    );

    schema.method("toJSON", function () {
        const { __v, _id, ...object } = this.toObject();
        object.id = _id;
        return object;
    });

    const quickSearch = mongoose.model("quickSearch", schema);
    return quickSearch;
};
