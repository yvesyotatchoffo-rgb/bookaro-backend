const Folders = require("../controllers/FolderController")
var router = require("express").Router();

router.post("/add", Folders.addFolder);
router.get("/details", Folders.folderDetails);
router.get("/list", Folders.listing)
router.put("/edit", Folders.editFolder)
router.delete("/delete", Folders.deleteFolder)


module.exports = router;