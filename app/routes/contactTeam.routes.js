const contactTeam = require("../controllers/contactTeamController.js");
var router = require("express").Router();

router.post("/addNew", contactTeam.contact);
router.get("/list", contactTeam.listAll);
router.get("/detail", contactTeam.detail);
router.delete("/delete", contactTeam.deleteContact);

module.exports = router;
