const setting = require("../controllers/SettingController");
var router = require("express").Router();

router.post("/add", setting.add);
router.get("/detail", setting.getOneId);
router.put("/update", setting.editSetting);


module.exports = router;