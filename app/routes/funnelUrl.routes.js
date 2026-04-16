const funnelUrl = require("../controllers/funnelUrlController.js");
var router = require("express").Router();

router.post("/add", funnelUrl.addFunnelUrl);
router.put("/update", funnelUrl.updateFunnelUrl);
router.delete("/delete", funnelUrl.deleteFunnelUrlById);
router.get("/getAll", funnelUrl.getAllFunnelUrlById);
router.get("/get", funnelUrl.getFunnelUrlById);
router.put("/statusChange", funnelUrl.statusChange);

module.exports = router;
