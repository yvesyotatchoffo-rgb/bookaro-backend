const BuildingPermitController = require("../controllers/BuildingPermitController")
var router = require("express").Router();

router.get("/listing",BuildingPermitController.listing)

module.exports = router;