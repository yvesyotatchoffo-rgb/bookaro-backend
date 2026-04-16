const analytics = require("../controllers/AnalyticsController.js");
var router = require("express").Router();

router.get("/userMetrics", analytics.userMetrics)
router.get("/propertyMetrics", analytics.propertyMetrics)

module.exports = router;
