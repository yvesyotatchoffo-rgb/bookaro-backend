const Service = require("../controllers/ServiceController");
var router = require("express").Router();

router.post("/add", Service.add);
router.get("/detail", Service.detail);
router.put("/update", Service.update);
router.get("/list", Service.list);
router.delete("/delete", Service.delete);
router.put("/status", Service.changeStatus);

module.exports = router;
