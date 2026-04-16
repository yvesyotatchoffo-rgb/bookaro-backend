const blogCategories = require("../controllers/blogCategoriesController.js");
var router = require("express").Router();


router.post("/create", blogCategories.createNewCategory);
router.post("/subCategory/create", blogCategories.createNewSubCategory);
router.get("/detail", blogCategories.getCategoryDetails);
router.get("/subCategory/detail", blogCategories.getSubCategoryDetails);
router.get("/list", blogCategories.listCategories);
router.get("/subCategory/list", blogCategories.listSubCategories);
router.put("/update", blogCategories.updateCategory);
router.put("/subCategory/update", blogCategories.updatesubCategory);
router.put("/update", blogCategories.updateCategory);
router.delete("/delete", blogCategories.deleteCategory);
router.delete("/subCategory/delete", blogCategories.deleteSubCategory);

module.exports = router;
