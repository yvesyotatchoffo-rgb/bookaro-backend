const db = require("../models");
const Service = db.services;
const constants = require("../utls/constants");

module.exports = {
  add: async (req, res) => {
    try {
      const data = req.body;
      if (!data.name) {
        return res.status(404).json({
          success: false,
          error: { code: 404, message: constants.onBoarding.PAYLOAD_MISSING },
        });
      }
      let query = { isDeleted: false, name: data.name };
      let existed = await Service.findOne(query);

      if (existed) {
        return res.status(400).json({
          success: false,
          error: { code: 400, message: constants.Services.ALREADY_EXIST },
        });
      }
      data.addedBy = req.identity.id;
      let created = await Service.create(data);

      return res.status(200).json({
        success: true,
        message: constants.Services.CREATED,
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        error: { code: 500, message: "" + err },
      });
    }
  },

  list: async (req, res) => {
    try {
      const { search, page, count, sortBy, status } = req.query;
      var query = {};

      if (search) {
        query.$or = [{ name: { $regex: search, $options: "i" } }];
      }
      query.isDeleted = false;
      var sortquery = {};
      if (sortBy) {
        var order = sortBy.split(" ");
        var field = order[0];
        var sortType = order[1];
      }

      sortquery[field ? field : "createdAt"] = sortType
        ? sortType == "desc"
          ? -1
          : 1
        : -1;
      if (status) {
        query.status = status;
      }

      const pipeline = [
        {
          $match: query,
        },
        {
          $sort: sortquery,
        },
        {
          $project: {
            id: "$_id",
            name: "$name",
            status: "$status",
            createdAt: "$createdAt",
            updatedAt: "$updatedAt",
          },
        },
      ];

      const total = await Service.aggregate([...pipeline]);

      if (page && count) {
        var skipNo = (Number(page) - 1) * Number(count);

        pipeline.push(
          {
            $skip: Number(skipNo),
          },
          {
            $limit: Number(count),
          }
        );
      }

      const result = await Service.aggregate([...pipeline]);

      return res.status(200).json({
        success: true,
        data: result,
        total: total.length,
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        error: { code: 500, message: "" + err },
      });
    }
  },
  detail: async (req, res) => {
    try {
      let { id } = req.query;
      let query = {
        _id: id,
        isDeleted: false,
      };
      const detail = await Service.findById(query).lean().exec();
      if (detail) {
        return res.status(200).json({
          success: true,
          data: detail,
        });
      } else {
        return res.status(200).json({
          success: true,
          data: null,
        });
      }
    } catch (err) {
      return res.status(500).json({
        success: false,
        error: { code: 500, message: "" + err },
      });
    }
  },

  update: async (req, res) => {
    try {
      const id = req.body.id;
      const data = req.body;

      const updatedStatus = await Service.updateOne({ _id: id }, data);

      return res.status(200).json({
        success: true,
        message: constants.Services.UPDATED,
      });
    } catch (err) {
      return res.status(400).json({
        success: false,
        error: { code: 400, message: "" + err },
      });
    }
  },

  changeStatus: async (req, res) => {
    try {
      let { id, status } = req.body;
      const updatedStatus = await Service.updateOne(
        { _id: id },
        { status: status }
      );
      return res.status(200).json({
        success: true,
        message: constants.Services.STATUS_CHANGED,
      });
    } catch (err) {
      return res.status(400).json({
        success: false,
        error: { code: 400, message: "" + err },
      });
    }
  },

  delete: async (req, res) => {
    try {
      const { id } = req.query;
      if (!req.query.id) {
        return res.status(404).json({
          success: false,
          error: { code: 404, message: constants.onBoarding.PAYLOAD_MISSING },
        });
      }

      const updatedStatus = await Service.updateOne(
        { _id: id },
        { isDeleted: true }
      );
      return res.status(200).json({
        success: true,
        message: constants.Services.DELETED,
      });
    } catch (err) {
      return res.status(400).json({
        success: false,
        error: { code: 400, message: "" + err },
      });
    }
  },
};
