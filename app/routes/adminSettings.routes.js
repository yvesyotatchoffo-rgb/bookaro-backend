const express = require("express");
const router = express.Router();
const adminSettingsController = require("../controllers/adminSettingsController.js");

router.put("/add-update", adminSettingsController.addUpdateSetting);
router.get("/detail", adminSettingsController.getSettingDetail);


module.exports = router;
