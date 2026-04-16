const saveSearch = require("../controllers/SaveSearchController.js");
var router = require("express").Router();

router.post("/add", saveSearch.addSaveSearch);
router.get("/list", saveSearch.getSavedSearch);

module.exports = router;
