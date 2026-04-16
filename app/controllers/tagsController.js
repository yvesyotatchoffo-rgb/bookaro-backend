const mongoose = require('mongoose');
const { tags } = require('../models');
const { message } = require('../services');

module.exports = {
  addNewTag: async (req, res) => {
    try {
      const { title } = req.body;
      const addedBy = req.identity.id;

      const lowerTitle = title.toLowerCase();
      const findTitle = await tags.findOne({ title: lowerTitle });
      if (findTitle) {
        return res.status(200).json({
          success: true,
          data: findTitle,
          message: "Title already exists."
        })
      }
      const create = await tags.create({ title: lowerTitle, addedBy })
      return res.status(200).json({
        success: true,
        message: `${lowerTitle} added in tags.`,
        data: create
      })
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: errorMonitor.message || "Internal Server Error."
      })
    }
  },

  listTags: async (req, res) => {
    try {
      const { search } = req.query;

      const filter = {};
      if (search) {
        filter.title = { $regex: search, $options: "i" };
      }

      const allTags = await tags.find(filter);
      return res.status(200).json({
        success: true,
        message: "Tags fetched successfully.",
        data: allTags
      });
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: err.message || "Internal Server Error."
      });
    }
  },


  tagDetail: async (req, res) => {
    try {
      const { id } = req.query;
      const tag = await tags.findById(id)
        .populate("addedBy", "email fullName _id")
      if (!tag) {
        return res.status(404).json({
          success: false,
          message: "Tag not found."
        });
      }
      return res.status(200).json({
        success: true,
        message: "Tag details fetched.",
        data: tag
      });
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: err.message || "Internal Server Error."
      });
    }
  },

  editTag: async (req, res) => {
    try {
      const { title, id } = req.body;

      const lowerTitle = title.toLowerCase();
      const existingTag = await tags.findOne({ title: lowerTitle, _id: { $ne: id } });
      if (existingTag) {
        return res.status(400).json({
          success: false,
          message: "Title already exists."
        });
      }

      const updatedTag = await tags.findByIdAndUpdate(id, { title: lowerTitle }, { new: true });
      if (!updatedTag) {
        return res.status(404).json({
          success: false,
          message: "Tag not found."
        });
      }
      return res.status(200).json({
        success: true,
        message: "Tag updated successfully.",
        data: updatedTag
      });
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: err.message || "Internal Server Error."
      });
    }
  },

  deleteTag: async (req, res) => {
    try {
      const { id } = req.query;
      const deleted = await tags.findByIdAndDelete(id);
      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: "Tag not found."
        });
      }
      return res.status(200).json({
        success: true,
        message: "Tag deleted successfully."
      });
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: err.message || "Internal Server Error."
      });
    }
  }

}