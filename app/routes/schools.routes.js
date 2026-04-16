const schools = require("../controllers/SchoolsController.js");
var router = require("express").Router();

router.post("/add", schools.addNewSchool);
router.get("/list", schools.getAllSchools);
router.delete("/delete", schools.deleteSchoolById);
router.get("/detail", schools.getSchoolById);
router.put("/edit", schools.updateById);
router.put("/bulkDelete", schools.bulkDeleteSchools);

module.exports = router;
