const transaction = require("../controllers/TransactionController");
var router = require("express").Router();

router.get("/list", transaction.transactionList);

module.exports = router;
