const quickSearch = require("../controllers/QuickSearchController.js");
var router = require("express").Router();

router.post("/add", quickSearch.create);
router.post("/edit", quickSearch.update);
router.get("/list", quickSearch.listing);
router.delete("/delete", quickSearch.delete);
router.get("/details", quickSearch.detail);

module.exports = router;
