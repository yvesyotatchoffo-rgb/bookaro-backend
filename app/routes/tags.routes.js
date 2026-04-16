const tags = require("../controllers/tagsController.js");
var router = require("express").Router();

router.post("/addNew", tags.addNewTag);
router.get("/list", tags.listTags);
router.get("/detail", tags.tagDetail);
router.put("/edit", tags.editTag);
router.delete("/delete", tags.deleteTag);

module.exports = router;
