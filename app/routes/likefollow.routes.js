var user = require("../controllers/EventController");

var router = require("express").Router();

router.post("/like", user.likeEvent);
router.post("/follow", user.followEvent);

module.exports = router;
