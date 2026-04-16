const plans = require("../controllers/PlansController");
var router = require("express").Router();

router.post("/add", plans.createPlans);
router.get("/detail", plans.planDetail);
router.put("/update", plans.updateplan);
router.get("/listing", plans.getPlansList);
router.put("/status/change", plans.statusChange);
router.delete("/delete", plans.delete_plan);

module.exports = router;
