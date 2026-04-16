const reports = require("../controllers/Reports.js");
var router = require("express").Router();

router.post("/add", reports.add);
router.get("/list", reports.list);
router.delete("/delete", reports.delete);
router.get("/details", reports.detail);
router.get("/edit", reports.blockUser);

module.exports = router;
