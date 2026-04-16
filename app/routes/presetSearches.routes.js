const presetSearches = require("../controllers/PresetSearchesController.js");
var router = require("express").Router();

router.post("/add", presetSearches.create);
router.get("/details", presetSearches.detail);
router.put("/edit", presetSearches.update);
router.get("/list", presetSearches.listing);
router.delete("/delete", presetSearches.delete);

module.exports = router;
