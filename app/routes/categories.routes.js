const category = require("../controllers/CategoriesController");

var router = require("express").Router();

router.post("/add", category.add);
router.get("/detail", category.detail);
router.get("/listing", category.listing);
router.put("/update", category.update);
router.delete("/delete", category.delete);
router.put("/status/change", category.changeStatus);
router.get("/sub-cat/listing", category.subCategorylisting);

//categoryType
router.post("/addcategoryType", category.addCategoryType);
router.get("/listingCategoryType", category.listingCategoryType);
router.get("/detailCategoryType", category.detailCategoryType);
router.put("/updateCategoryType", category.updateCategoryType);
router.delete("/deleteCategoryType", category.deleteCategoryType);
router.put("/status/changeCategoryType", category.changeStatus);


module.exports = router;