const timeline = require("../controllers/TimelineController.js");
var router = require("express").Router();

router.post("/add", timeline.add);
router.get("/list", timeline.list);
router.put("/liketimeline", timeline.statusChange)

module.exports = router;
