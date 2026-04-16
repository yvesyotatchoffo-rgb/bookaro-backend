const revenue = require("../controllers/RevenueManagement")
var router = require("express").Router();

router.post("/add", revenue.add);
router.get("/details", revenue.revenueDetails);
router.put("/edit", revenue.editrevenue);
router.put("/statusChange", revenue.statusChange);
router.delete("/delete", revenue.deleteRevenue);
router.get("/listing",revenue.listing)

module.exports = router;