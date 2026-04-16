var mongoose = require("mongoose"),
 Schema = mongoose.Schema;

 module.exports = (mongoose) => {
    var schema = new Schema(
        {
            userId: { type: Schema.Types.ObjectId, ref: "users", index: true },            //review added by
            propertyId: { type: Schema.Types.ObjectId, ref: "properties", index: true },   // to property id
            interestId: { type: Schema.Types.ObjectId, ref: "interests" },    // if on interest then on what interest
            location: { type: Number, min: 1, max: 5 },
            luminosity: { type: Number },
            condition: { type: Number },
            areaCondition: { type: Number },
            propertyInformation: { type: Number },
            peacefullSetting: { type: Number },
            note: String,
            isDeleted: { type: Boolean, default: false },
        },
        {
             timestamps: true
        }
    );

    schema.index({propertyId: 1, userId: 1});
    
    const reviews = mongoose.model("reviews", schema);

    return reviews;
 }