const express = require("express");
const dashboard = require("../controllers/DashboardController");

const router = express.Router();

router.get("/overview", dashboard.overview);
router.get("/activity", dashboard.activity);

module.exports = router;
