const Favorites = require("../controllers/FavoritePropertyController")
var router = require("express").Router();

router.post("/add", Favorites.add);
router.get("/listing", Favorites.listing);
router.put("/edit", Favorites.edit)
module.exports = router;