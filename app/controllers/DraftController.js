const db = require("../models");
let mongoose = require("mongoose");
const constants = require("../utls/constants");
const { success } = require("../services/Response");
const { message } = require("../services");

module.exports = {
  add: async (req, res) => {
    try {
      let data = req.body;

      if (!data.type || !data.propertyType || !data.address || !data.country || !data.step) {
        return res.status(400).json({
          success: false,
          message: constants.DRAFTPROPERTY.CANNOTSAVE,
        });
      }

      const finddraft = await db.draftProperty.find({ propertyType: data.propertyType, addedBy: req.identity.id });
      console.log(finddraft)
      if (finddraft.length > 0) {
        return res.status(400).json({
          success: false,
          message: `You already have a draft for ${data.propertyType} type of property.`
        })
      }
      data.addedBy = req.identity.id;
      let property = await db.draftProperty.create(data);
      return res.status(200).json({
        success: true,
        data: property._id,
        message: constants.DRAFTPROPERTY.CREATED,
      });
    } catch (err) {
      return res.status(400).json({
        success: false,
        error: {
          code: 400,
          message: err,
        },
      });
    }
  },

  listing: async (req, res) => {
    try {
      const { propertyType, userId } = req.query;
      if (!userId) {
        return res.status(400).json({
          success: false,
          message: constants.DRAFTPROPERTY.PAYLOAD_MISSING,
        })
      }

      let query = {
        addedBy: userId
      }

      if (propertyType) {
        query.propertyType = propertyType
      }

      const getAllDrafts = await db.draftProperty.find(query);
      return res.status(200).json({
        success: true,
        message: constants.DRAFTPROPERTY.DATA_FETCH,
        data: getAllDrafts,
        total: getAllDrafts.length
      })

    } catch (err) {
      return res.status(400).json({
        success: false,
        error: {
          code: 400,
          message: err,
        },
      });
    }
  },

  delete: async (req, res) => {
    try {
      const { propertyType, userId } = req.query;
      if (!userId || !propertyType) {
        return res.status(400).json({
          success: false,
          message: constants.DRAFTPROPERTY.PAYLOAD_MISSING,
        })
      }
      const findDraft = await db.draftProperty.findOne({ addedBy: userId, propertyType });
      if (!findDraft) {
        return res.status(400).json({
          success: false,
          message: constants.DRAFTPROPERTY.NOT_FOUND,
        })
      }
      await db.draftProperty.deleteOne({ addedBy: userId, propertyType })
      return res.status(200).json({
        success: true,
        message: constants.DRAFTPROPERTY.DELTED,
      })
    } catch (err) {
      console.log(err.message);
      return res.status(400).json({
        success: false,
        error: {
          code: 400,
          message: err,
        },
      });
    }
  }
}