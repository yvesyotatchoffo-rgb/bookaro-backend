const db = require("../models");
const { handleServerError } = require("../utls/helper");

module.exports = {
  addUpdateSetting: async (req, res) => {
    try {
      let settings = await db.adminSettings.findOne({ status: "active" });
      const validateuser = await db.users.findById(req.identity.id);
      if (validateuser.role !== "admin") {
        return res.status(400).json({
          success: false,
          message: "You are not authorized for this resource",
        });
      }
      if (settings) {
        Object.assign(settings, req.body);
        await settings.save();
        return res.status(200).json({
          success: true,
          message: "Settings updated successfully",
          data: settings
        });
      } else {
        const newSettings = new db.adminSettings(req.body);
        await newSettings.save();
        return res.status(201).json({
          success: true,
          message: "Settings created successfully",
          data: newSettings
        });
      }
    } catch (err) {
      return handleServerError(res, err, "Admin Settings")
    }
  },

  getSettingDetail: async (req, res) => {
    try {
      const settings = await db.adminSettings.findOne().populate('addedBy', "fullName email")
      if (!settings) {
        return res.status(404).json({
          success: false,
          message: "No admin settings found"
        });
      }
      return res.status(200).json({
        success: true,
        settings
      });
    }
    catch (err) {
      return handleServerError(res, err, "Admin Settings Details")
    }
  }
}