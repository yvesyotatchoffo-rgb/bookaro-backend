const cards = require("../controllers/CardsController.js");
var router = require("express").Router();

router.post("/addCard", cards.addCard);
router.delete("/deleteCard", cards.deleteCard)
router.get("/details", cards.cardDetails)
router.get("/list", cards.listCards)
router.post("/status", cards.statusChange)


module.exports = router;

