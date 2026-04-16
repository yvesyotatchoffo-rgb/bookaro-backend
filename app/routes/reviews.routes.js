const reviews = require("../controllers/ReviewsController.js");
var router = require("express").Router();

router.get("/admin/propertyReviews", reviews.getPropertyReviews);

module.exports = router;