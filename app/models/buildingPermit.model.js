var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = (mongoose) => {
  var schema = mongoose.Schema(
    {
      type: { type: String, enum: ["demolitionPermit", "nonResdential", "residential"] },  //type of file
      requestType: { type: String }, //Type de DAU -- demande d’autorisation d’urbanisme (PC ou DP généralement, rarement PA)
      requestId: { type: String },  // NumÃ©ro d'enregistrement du permis de dÃ©molir (PD) --- / --- Numéro d’enregistrement de la DAU
      status: { type: String }, // Etat d'avancement du projet --- / --- Etat d’avancement du projet
      authorizationDate: { type: String }, // Date rÃ©elle d'autorisation initiale
      authorizationYear: { type: String }, // AnnÃ©e authorisation
      requestSubmissionYear: { type: String },// AnnÃ©e de dÃ©pÃ´t de la DAU --- / --- Année de dépôt de la DAU
      requesterName: { type: String },// DÃ©nomination d'un demandeur avÃ©rÃ© en tant que personne morale
      requesterSiren: { type: String },  // NumÃ©ro SIREN d'un demandeur avÃ©rÃ© en tant que personne morale
      number: { type: String }, //NumÃ©ro de voie du terrain
      roadType: { type: String },// Type de voie du terrain
      roadName: { type: String }, // LibellÃ© de la voie du terrain
      city: { type: String }, // LocalitÃ© du terrain
      postalCode: { type: String }, // Code postal du terrain
      address: { type: String }, // Address
      address1: { type: String }, // Adresse
      projectOwner: { type: String }, // Maitre d'ouvrage
      latitude: { type: String }, // latitude
      longitude: { type: String }, // longitude
      xAxis: { type: String }, // x
      yAxis: { type: String }, // y
      worksStartDate: { type: String }, // Date réelle d’ouverture de chantier
      elevationIndicator: { type: Boolean },// Indicateur de surélévation
      additionalLevelCreation: { type: Boolean },// Indicateur de création de niveau(x) supplémentaire(s)
      highestLevel: { type: String }, //Nombre de niveaux du bâtiment le plus élevé
      isDeleted: { type: Boolean, default: false },
      location: {  // lng+lat
        type: Object
      }
    },
    { timestamps: true }
  );

  schema.index({ location: "2dsphere" });
  const BuildingPermits = mongoose.model("buildingPermits", schema);

  return BuildingPermits;
};
