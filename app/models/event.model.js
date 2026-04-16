var Mongoose = require("mongoose"),
  Schema = Mongoose.Schema;
module.exports = (mongoose) => {
  var schema = mongoose.Schema(
    {
      title: String,
      description: String,
      venue_location: String,
      location: String,
      country: String,
      state: String,
      city: String,
      isOnline: Boolean,
      zipCode: String,
      short_description: String,
      audience: String,
      attention: String,
      extraFood: String,
      link: String,
      images: Array,
      host: [{ type: Schema.Types.ObjectId, ref: "users" }],
      category: { type: Schema.Types.ObjectId, ref: "categories" },
      tickets: Number,
      venue: { type: Schema.Types.ObjectId, ref: "users" },
      foods: Array,
      drinks: Array,
      price_of_ticket: String,
      like_count: { type: Number, default: 0 },
      follow_count: { type: Number, default: 0 },
      menu_item_format: { type: String },
      foodImages: Array,
      type: { type: String },
      coordinates: Object,
      eventStartDate: Date,
      eventEndDate: Date,
      status: { type: String, default: "active" },
      isDeleted: { type: Boolean, default: false },
      createdAt: Date,
      updatedAt: Date,
    },

    { timestamps: true }
  );

  schema.method("toJSON", function () {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
  });

  const Events = mongoose.model("events", schema);
  return Events;
};
