const express = require("express");
const router = express.Router();
const AgencyReviewsController = require("../controllers/AgencyReviewsController.js");

router.post("/add-review", AgencyReviewsController.createReview);
router.get("/listing", AgencyReviewsController.getReviews);
router.get("/detail", AgencyReviewsController.getReviewById);
router.put("/update", AgencyReviewsController.updateReview);
router.delete("/delete", AgencyReviewsController.deleteReview);


module.exports = router;
