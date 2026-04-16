var notification = require("../controllers/NotificationsController");

var router = require("express").Router();

router.post("/send-message", notification.send_message);
router.get("/list", notification.notifications);
router.put("/change-status", notification.change_status);
router.put("/change-status-multiple", notification.change_status_multiple);
router.delete("/delete", notification.delete);





module.exports = router;