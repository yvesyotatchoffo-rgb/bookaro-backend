const { default: mongoose } = require("mongoose");
const { blogCategories, blogSubCategories } = require("../models");
const { handleServerError } = require("../utls/helper");
const { read } = require("xlsx");
const db = require("../models");

module.exports = {
  createNewCategory: async (req, res) => {
    try {
      const { CategoryName } = req.body;
      let addedBy = req.identity.id;
      if (!CategoryName) {
        return res.status(400).json({
          success: false,
          message: "Category name is required."
        })
      }
      const trimmedName = CategoryName.trim();
      const existingCategory = await blogCategories.findOne({ CategoryName: trimmedName });
      if (existingCategory) {
        return res.status(400).json({
          success: false,
          message: "Category already exists."
        })
      }
      await blogCategories.create({
        CategoryName: trimmedName,
        addedBy
      })
      return res.status(200).json({
        success: true,
        message: "New category created"
      })
    } catch (error) {
      return handleServerError(res, error, "Create new category")
    }
  },

  createNewSubCategory: async (req, res) => {
    try {
      const { categoryId, SubCategoryName } = req.body;
      if (!categoryId || !SubCategoryName) {
        return res.status(400).json({
          success: false,
          message: "Category Id and sub category name is required"
        })
      }
      let addedBy = req.identity.id;
      const trimmedName = SubCategoryName.trim();
      const existingCategory = await blogSubCategories.findOne({
        SubCategoryName: trimmedName,
        categoryId
      });
      if (existingCategory) {
        return res.status(400).json({
          success: false,
          message: "Sub-Category already exists."
        })
      }
      const findCategory = await blogCategories.findOne({ _id: categoryId });
      if (!findCategory) {
        return res.status(400).json({
          success: false,
          message: "Category not found."
        })
      }
      await blogSubCategories.create({
        SubCategoryName: trimmedName,
        categoryId,
        addedBy
      })
      return res.status(200).json({
        success: true,
        message: "New Sub-Category created"
      })

    } catch (error) {
      return handleServerError(res, error, "Create new category")
    }
  },

  getCategoryDetails: async (req, res) => {
    try {
      const { id } = req.query;
      if (!id) {
        return res.status(400).json({
          success: false,
          message: "id required."
        });
      }
      const category = await blogCategories.findById(id).populate('subCategories').populate('addedBy', 'email fullName')
      if (!category) {
        return res.status(400).json({
          success: false,
          message: "Category not found."
        });
      }
      return res.status(200).json({
        success: true,
        data: category
      });
    } catch (error) {
      return handleServerError(res, error, "Get category details");
    }
  },

  getSubCategoryDetails: async (req, res) => {
    try {
      const { id } = req.query;
      if (!id) {
        return res.status(400).json({
          success: false,
          message: "id required."
        });
      }
      const subCategory = await blogSubCategories.findById(id).populate('categoryId').populate('addedBy', 'email fullName')
      if (!subCategory) {
        return res.status(400).json({
          success: false,
          message: "Sub-Category not found."
        });
      }
      return res.status(200).json({ success: true, data: subCategory });
    } catch (error) {
      return handleServerError(res, error, "Get sub-category details");
    }
  },

  listCategories: async (req, res) => {
    try {
      const { page = 1, limit = 10, search = "", status } = req.query;
      const query = search
        ? { CategoryName: { $regex: search.trim(), $options: "i" } }
        : {};
      if (status) {
        query.status = status;
      }

      const categories = await blogCategories
        .find(query)
        .populate('subCategories')
        .populate('addedBy', 'fullName email')
        .skip((page - 1) * limit)
        .limit(parseInt(limit))
        .sort({ createdAt: -1 });

      const total = await blogCategories.countDocuments(query);

      return res.status(200).json({
        success: true,
        data: categories,
        total,
      });
    } catch (error) {
      return handleServerError(res, error, "List categories");
    }
  },

  listSubCategories: async (req, res) => {
    try {
      const { page = 1, limit = 10, search = "", categoryId, status } = req.query;
      const query = search
        ? { SubCategoryName: { $regex: search.trim(), $options: "i" } }
        : {};
      if (categoryId) {
        query.categoryId = new mongoose.Types.ObjectId(categoryId);
      }
      if (status) {
        query.status = status;
      }

      const subCategories = await blogSubCategories
        .find(query)
        .populate("categoryId")
        .populate('addedBy', 'fullName email')
        .skip((page - 1) * limit)
        .limit(parseInt(limit))
        .sort({ createdAt: -1 });

      const total = await blogSubCategories.countDocuments(query);

      return res.status(200).json({
        success: true,
        data: subCategories,
        total,
      });
    } catch (error) {
      return handleServerError(res, error, "List sub-categories");
    }
  },

  updateCategory: async (req, res) => {
    try {
      const { id, CategoryName, status } = req.body;
      let data = req.body;

      const updatedCategory = await blogCategories.findByIdAndUpdate(id, data, { new: true });
      if (!updatedCategory) {
        return res.status(400).json({
          success: false,
          message: "Category not found."
        });
      }
      if (status) {
        await blogSubCategories.updateMany(
          { categoryId: id },
          { $set: { status } }
        );

        await db.blogs.updateMany(
          { categoryId: id },
          { $set: { status } }
        );
      }

      return res.status(200).json({
        success: true,
        message: "Category updated."
      })
    } catch (error) {
      return handleServerError(res, error, "List sub-categories");
    }
  },

  updatesubCategory: async (req, res) => {
    try {
      const { id, SubCategoryName, status } = req.body;
      const data = req.body;

      const updatedSubCategory = await blogSubCategories.findByIdAndUpdate(id, data, { new: true });
      if (!updatedSubCategory) {
        return res.status(400).json({
          success: false,
          message: "Sub-category not found."
        });
      }

      if (status) {
        await db.blogs.updateMany(
          { subCategoryId: id },
          { $set: { status } }
        );
      }

      return res.status(200).json({
        success: true,
        message: "Sub-category and related blogs updated."
      });
    } catch (error) {
      return handleServerError(res, error, "Update sub-category")
    }
  },

  deleteCategory: async (req, res) => {
    try {
      const { id } = req.query;
      if (!id) {
        return res.status(400).json({
          success: false,
          message: "id required."
        });
      }
      const category = await blogCategories.findById(id);
      if (!category) {
        return res.status(404).json({
          success: false,
          message: "Category not found."
        });
      }

      await db.blogs.deleteMany({ categoryId: id });

      await blogSubCategories.deleteMany({ categoryId: id });
      await blogCategories.deleteOne({ _id: id });

      return res.status(200).json({
        success: true,
        message: "Sub-category and related blogs deleted successfully."
      });
    } catch (error) {
      return handleServerError(res, error, "Delete category")
    }
  },

  deleteSubCategory: async (req, res) => {
    try {
      const { id } = req.query;
      if (!id) {
        return res.status(400).json({
          success: false,
          message: "id required."
        });
      }
      const deleted = await blogSubCategories.findByIdAndDelete(id);
      await db.blogs.deleteMany({ subCategoryId: id });
      if (!deleted) {
        return res.status(400).json({
          success: false,
          message: "Sub-Category not found."
        });
      }
      return res.status(200).json({ success: true, message: "Sub-Category deleted." });
    } catch (error) {
      return handleServerError(res, error, "Delete sub-category");
    }
  }

}