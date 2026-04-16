const express = require("express");
const router = express.Router();
const FormController = require("../controllers/FormController");

router.post("/blog-form", FormController.addDreamHomeForm);
// router.post("/want-to-sell", FormController.addWantToSellForm);
router.get("/listing", FormController.FormListing);
router.get("/detail", FormController.FormDetails);


module.exports = router;
