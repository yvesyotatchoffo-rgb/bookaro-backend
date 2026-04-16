const support = require("../controllers/SupportController.js");
const router = require("express").Router();

router.post("/add", support.add);
router.get("/list", support.list);
router.delete("/delete", support.delete);

module.exports = router;
