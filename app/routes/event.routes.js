var user = require("../controllers/EventController");

var router = require("express").Router();

router.post("/add-events", user.addEvent);
router.put("/update-events", user.updateEvent);
router.put("/change-event-status", user.activateDeactivateEvent);
router.delete("/delete-events", user.DeleteEvents);
router.get("/get-all-events", user.getAllEvents);
router.get("/get-events-detail", user.getEventDetail);
router.get("/listing", user.getAllEventsForUser);
router.get("/upcoming", user.getUpcomingEvents);
router.get("/detail", user.getEventDetailForUser);
router.get("/similar", user.listOutSimilarEvents);
router.get("/list/venueId", user.listEventByVenueId);
router.get("/listingByUserId", user.getAllEventsFollowAndLikeByUs);

module.exports = router;
