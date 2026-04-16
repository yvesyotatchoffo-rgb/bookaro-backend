const location = require("../controllers/LocationController");
var router = require("express").Router();

router.post("/add", location.addlocation);
router.get("/listing", location.listing);

module.exports = router;
