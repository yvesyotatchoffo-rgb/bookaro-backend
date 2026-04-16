const contactUs = require("../controllers/ContactUsController")
var router = require("express").Router();

router.post("/add", contactUs.contactUs);
router.get("/detail", contactUs.detail);
router.get("/listing", contactUs.listing);
router.delete("/delete", contactUs.delete);
module.exports = router;