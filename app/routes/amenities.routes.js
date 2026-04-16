const amenities = require("../controllers/AmenitiesController")
var router = require("express").Router();
router.post("/add", amenities.add)
router.get("/detail", amenities.detail)
router.put("/update", amenities.update)
router.delete("/delete", amenities.delete)
router.get("/listing", amenities.listing)
router.put("/status/change", amenities.changeStatus)




module.exports = router;