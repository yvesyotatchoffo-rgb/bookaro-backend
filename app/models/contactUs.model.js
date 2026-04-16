var Mongoose = require('mongoose'),
    Schema = Mongoose.Schema;
module.exports = (mongoose) => {
    var schema = mongoose.Schema(
        {
            firstName: String,
            lastName: String,
            email: String,
            mobileNo: String,
            type: String,
            property_to_sell: { type: Boolean, default: false },
            not_want_to_receive_advices: { type: Boolean, default: false },
            property_id: { type: Schema.Types.ObjectId, ref: 'properties' },
            isDeleted: { type: Boolean, default: false },
            createdAt: Date,
            updatedAt: Date,
            addedBy: {
                type: Schema.Types.ObjectId,
                ref: 'users',
            },

            status: { type: String, default: 'active' },
            createdAtTimestamp: Number,
            updatedAtTimestamp: Number,
        },
        { timestamps: true }
    );

    schema.method('toJSON', function () {
        const { __v, _id, ...object } = this.toObject();
        object.id = _id;
        return object;
    });


    schema.pre("save", function (next) {
        if (this.createdAt) {
            this.createdAtTimestamp = new Date(this.createdAt)
        }

        if (this.updatedAt) {
            this.updatedAtTimestamp = new Date(this.updatedAt)
        }

        next();
    });

    const contactUs = mongoose.model('contactUs', schema);
    return contactUs;
};