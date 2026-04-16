const content = require("../controllers/ContentManagementController")
var router = require("express").Router();

router.post("/add", content.add);
router.get("/detail", content.detail);
router.get("/listing", content.list);
router.put("/update", content.update);
router.delete("/delete", content.delete);
router.put("/statusChange", content.changeStatus)

module.exports = router;