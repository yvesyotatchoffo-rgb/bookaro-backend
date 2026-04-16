var Mongoose = require("mongoose"),
    Schema = Mongoose.Schema;
module.exports = (mongoose) => {
    var schema = mongoose.Schema(
        {
            searchBy: { type: Schema.Types.ObjectId, ref: "users", index: true },
            propertyType: {
                type: String,
                enum: ["sale", "rent", "offmarket", "directory"],
            },
            zipcode: { type: String },
            searchLocation: { type: String },
            searchByCount: { type: Number, default: 0 },
            propertyTypeCount: { type: Number, default: 0 },
            searchLocationCount: { type: Number, default: 0 },
            // terraceSearch: { type: Array, default: [] },
            // gardenSearch: { type: Array, default: [] }, 
        },
        { timestamps: true }
    );

    schema.method("toJSON", function () {
        const { _v, id, ...object } = this.toObject();
        object.id = _id;
        return object;
    });

    const savesearch = mongoose.model("savesearch", schema);
    return savesearch;
};
