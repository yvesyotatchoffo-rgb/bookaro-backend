const payment = require("../controllers/PaymentsController.js");
var router = require("express").Router();

router.post("/stripePay", payment.payWithCard);
router.get("/history", payment.getAllPayments);
router.post("/webhook",payment.webhook )
router.post("/trial/purchase", payment.purchaseTrialplan);
router.put("/plan-update", payment.updateSubscriptionPlan);

module.exports = router;
