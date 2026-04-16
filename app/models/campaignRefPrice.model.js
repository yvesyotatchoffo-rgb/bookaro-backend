var Mongoose = require("mongoose"),
  Schema = Mongoose.Schema;

module.exports = (mongoose) => {
  var schema = mongoose.Schema(
    {
      postalCode: { type: Number, required: true, unique: true },
      INSEE_COM: { type: Number },
      annee: { type: Number },           // year
      nb_mutations: { type: Number },    // nb_mutations
      NbMaisons: { type: Number },       // NbHouses
      NbApparts: { type: Number },       // NbApparts
      PropMaison: { type: Number },      // PropHouse
      PropAppart: { type: Number },      // PropAppart
      PrixMoyen: { type: Number },       // Average Price
      refPrice: { type: Number, required: true },     // Prixm2Moyen   -> actual reference price
      SurfaceMoy: { type: Number },      // Area Avg
    },
    { timestamps: true }
  );
  const campaignRefPrice = mongoose.model("campaignRefPrice", schema);

  return campaignRefPrice;
}