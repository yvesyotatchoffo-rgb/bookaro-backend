const agencies = require("../controllers/AgencyController")
var router = require("express").Router();
router.post("/add", agencies.add);
router.get("/detail", agencies.agencyDetails);
router.put("/editAgencyDetails", agencies.editAgencyDetails);
router.delete("/deleteAgency", agencies.deleteAgency);
router.get("/agencyListing", agencies.agencyListing);
router.get("/exportAgencyListing", agencies.exportAgencyListing);
router.post("/importAgencyListing", agencies.importAgencyListing)

module.exports = router;