var user = require("../controllers/FeaturesController");

var router = require("express").Router();

router.post("/add-features", user.addMultipleFeatures);
router.put("/update-feature", user.updateFeature);
router.put("/change-feature-status", user.activateDeactivateFeature);
router.delete("/delete-feature", user.deleteFeature);
router.get("/get-feature-list", user.getAllFeaturesList);
router.get("/get-feature-detail", user.getFeatureDetail);

module.exports = router;
