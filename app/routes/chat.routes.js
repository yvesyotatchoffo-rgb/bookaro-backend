const chat = require("../controllers/ChatController")
var router = require("express").Router();

router.post("/join-group",chat.joinGroup)
router.get("/messages",chat.getAllMessages)
router.get("/room-members",chat.getAllRoomMembers)
router.get("/recent-chats",chat.getAllRecentChats)
router.get("/unread-counts",chat.getAllUnreadCounts)
router.get('/property-chats', chat.getAllPropertyChats)
// router.get('/messageusers', controller.user.getInviteApplyList);

module.exports = router;