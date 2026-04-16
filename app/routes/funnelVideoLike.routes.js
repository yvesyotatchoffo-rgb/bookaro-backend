const funnelVideoLike = require("../controllers/funnelVideoLikeController.js");
var router = require("express").Router();

router.post("/likeDislike", funnelVideoLike.likeDislike);
router.put("/watching", funnelVideoLike.viewCount);

module.exports = router;
