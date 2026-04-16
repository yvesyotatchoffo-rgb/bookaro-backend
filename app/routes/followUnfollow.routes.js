var followUnfollow = require("../controllers/followUnfollow");

var router = require("express").Router();

router.post("/add", followUnfollow.addfollowUnfollow);
router.put("/update", followUnfollow.editFollowUnfollow);


module.exports = router;