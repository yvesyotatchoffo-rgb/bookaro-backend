var draftProperty = require("../controllers/DraftController.js");
var router = require("express").Router();

router.post("/add", draftProperty.add);
router.get("/listing", draftProperty.listing);
router.delete("/delete", draftProperty.delete);

module.exports = router;