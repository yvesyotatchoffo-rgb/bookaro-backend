const db = require("../models");
const presetSearchesModel = require("../models/presetSearches.model");
const { handleServerError } = require("../utls/helper")

module.exports = {
  create: async (req, res) => {
    try {
      const { type, title, link } = req.body;
      console.log("BODY", req.body)
      let addedBy = req.identity.id;
      if (!type || !title || !link) {
        return res.status(400).json({
          success: false,
          message: "Payload Missing"
        });
      }

      const existing = await db.presetSearches.findOne({ title });
      if (existing) {
        return res.status(409).json({
          success: false,
          message: "PresetSearch with this title already exists"
        });
      }

      const presetSearch = await db.presetSearches.create({ type, title, link, addedBy });

      return res.status(201).json({
        success: true,
        message: "PresetSearch created successfully",
        data: presetSearch
      });
    } catch (err) {
      handleServerError(res, err, "Create preset search")
    }
  },

  detail: async (req, res) => {
    try {
      const { id } = req.query;
      const presetSearch = await db.presetSearches
        .findById(id)
        .populate("addedBy", "fullName email");

      if (!presetSearch) {
        return res.status(404).json({ success: false, error: "PresetSearch not found" });
      }

      res.status(200).json({
        success: true,
        message: "Detial fetched",
        data: presetSearch
      });
    } catch (err) {
      handleServerError(res, err, "Preset Detail")
    }
  },

  update: async (req, res) => {
    try {
      const { id } = req.query;
      const updates = req.body;

      const updated = await db.presetSearches.findOneAndUpdate(
        { _id: id },
        updates,
        { new: true, runValidators: true }
      );

      if (!updated) {
        return res.status(404).json({
          success: false,
          message: "PresetSearch not found"
        });
      }

      res.status(200).json({
        success: true,
        message: "PresetSearch updated successfully",
        data: updated
      });
    } catch (err) {
      handleServerError(res, err, "Preset update")
    }
  },

  listing: async (req, res) => {
    try {
      const { page = 1, limit = 10, search = "" } = req.query;

      const pageNum = Math.max(parseInt(page), 1);
      const limitNum = Math.max(parseInt(limit), 1);

      const filter = search
        ? { title: { $regex: search, $options: "i" } }
        : {};

      const total = await db.presetSearches.countDocuments(filter);

      const results = await db.presetSearches.find(filter)
        .populate("addedBy", "fullName email")
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .sort({ createdAt: -1 });

      res.status(200).json({
        success: true,
        total,
        data: results,
      });
    } catch (err) {
      handleServerError(res, err, "Preset listing")
    }
  },

  delete: async (req, res) => {
    try {
      const { id } = req.query;
      const deleted = await db.presetSearches.findOneAndDelete({ _id: id });

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: "PresetSearch not found"
        });
      }
      res.status(200).json({
        success: true,
        message: "PresetSearch deleted successfully"
      });
    } catch (err) {
      handleServerError(res, err, "Preset delete")
    }
  },
}