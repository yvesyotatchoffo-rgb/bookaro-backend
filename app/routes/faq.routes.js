const faqs = require("../controllers/FaqController")
var router = require("express").Router();

router.post("/add", faqs.addFaq);
router.get("/detail", faqs.faqsDetails);
router.get("/listing", faqs.listing);
router.put("/statusChange", faqs.statusChange);
router.delete("/delete", faqs.deleteBlog);
router.put("/edit", faqs.editFaq)
module.exports = router;