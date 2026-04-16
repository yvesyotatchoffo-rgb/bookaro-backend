"use strict";

const db = require("../models");
const constants = require("../utls/constants");
const multer = require("multer");
const csvParser = require("csv-parser");

module.exports = {
  /**
   * @authenticated
   *
   */
  addMultipleFeatures: async (req, res) => {
    try {
      const features = req.body.features;

      if (!features || !Array.isArray(features)) {
        return res.status(400).json({
          success: false,
          error: {
            code: 400,
            message: constants.onBoarding.PAYLOAD_MISSING,
          },
        });
      }

      const createdFeatures = [];
      const errors = [];

      for (const feature of features) {
        feature.createdAt = new Date();
        feature.updatedAt = new Date();
        feature.isDeleted = false;

        const isExist = await db.features.findOne({
          name: feature.name,
          featureType: feature.featureType,
          isDeleted: false,
        });

        if (isExist) {
          errors.push({
            name: feature.name,
            message: constants.FEATURE.ALREADY_EXIST,
          });
          continue;
        }

        try {
          const createdFeature = await db.features.create(feature);
          createdFeatures.push(createdFeature);
        } catch (err) {
          errors.push({
            name: feature.name,
            message: constants.FEATURE.ERROR_IN_CREATING,
            error: err.message,
          });
        }
      }

      if (errors.length > 0) {
        return res.status(400).json({
          success: false,
          errors,
        });
      }

      return res.status(200).json({
        success: true,
        message: constants.FEATURE.CREATED,
        data: createdFeatures,
      });
    } catch (err) {
      return res.status(400).json({
        success: false,
        error: {
          code: 400,
          message: "Error: " + err.message,
        },
      });
    }
  },
  updateFeature: async (req, res) => {
    try {
      let id = req.body.id;
      if (!id) {
        return res.status(400).json({
          success: false,
          error: {
            code: 400,
            message: constants.onBoarding.PAYLOAD_MISSING,
          },
        });
      }

      const Feature = await db.features.findOne({
        _id: id,
      });
      if (!Feature) {
        return res.status(404).json({
          success: false,
          error: {
            code: "404",
            message: constants.FEATURE.NOT_FOUND,
          },
        });
      }
      const data = req.body;

      const updatedFeature = await db.features.updateOne(
        {
          _id: id,
        },
        data
      );

      return res.status(200).json({
        success: true,
        message: constants.FEATURE.UPDATED,
      });
    } catch (err) {
      return res.status(400).json({
        success: false,
        error: {
          code: 400,
          message: "" + err,
        },
      });
    }
  },
  activateDeactivateFeature: async (req, res) => {
    try {
      let id = req.body.id;
      if (!id) {
        return res.status(400).json({
          success: false,
          error: {
            code: 400,
            message: constants.onBoarding.PAYLOAD_MISSING,
          },
        });
      }
      const Feature = await db.features.findOne({
        _id: id,
      });
      if (!Feature) {
        return res.status(404).json({
          success: false,
          message: constants.FEATURE.NOT_FOUND,
        });
      }
      const query = {
        status: "active",
      };
      let message;
      let message1;
      if (Feature.status == "active") {
        query.status = "deactive";
        message = constants.FEATURE.STATUS_CHANGED;
      } else {
        query.status = "active";
        message1 = constants.FEATURE.STATUS_CHANGED;
      }
      const updateData = await db.features.updateOne(
        {
          _id: id,
        },
        query
      );
      if (updateData) {
        return res.status(200).json({
          success: true,
          message: Feature.status === "deactive" ? message1 : message,
        });
      }
    } catch (err) {
      return res.status(400).json({
        success: false,
        error: {
          code: 400,
          message: "" + err,
        },
      });
    }
  },
  /** for get list of Feature */
  getAllFeaturesList: async (req, res) => {
    try {
      let { search, sortBy, page, count, status } = req.query;
      var query = {};
      if (search) {
        query.$or = [
          {
            name: {
              $regex: search,
              $options: "i",
            },
          },
        ];
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
      console.log(query);
      const pipeline = [
        {
          $project: {
            status: "$status",
            name: "$name",
            featureType: "$featureType",
            createdAt: "$createdAt",
            updatedAt: "$updatedAt",
            isDeleted: "$isDeleted",
          },
        },
        {
          $match: query,
        },
        {
          $sort: sortquery,
        },
      ];

      const total = await db.features.aggregate([...pipeline]);

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

      const result = await db.features.aggregate([...pipeline]);
      console.log("total", result);

      return res.status(200).json({
        success: true,
        data: result,
        total: total.length,
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        error: {
          code: 400,
          message: "" + err,
        },
      });
    }
  },

  /** for delete Feature */
  deleteFeature: async (req, res) => {
    try {
      let id = req.query.id;
      if (!id) {
        return res.status(400).json({
          success: false,
          error: {
            code: 400,
            message: constants.onBoarding.PAYLOAD_MISSING,
          },
        });
      }
      const Feature = await db.features.findOne({
        _id: id,
      });
      if (!Feature) {
        return res.status(404).json({
          success: false,
          error: {
            code: "404",
            message: constants.FEATURE.NOT_FOUND,
          },
        });
      }

      const updateFeature = await db.features.findByIdAndUpdate(
        { _id: id },
        { isDeleted: true }
      );

      return res.status(200).json({
        success: true,
        message: constants.FEATURE.DELETED,
      });
    } catch (err) {
      return res.status(400).json({
        success: false,
        error: {
          code: 400,
          message: "" + err,
        },
      });
    }
  },
  /** for get Fetaure Post detail */
  getFeatureDetail: async (req, res) => {
    try {
      const id = req.query.id;
      if (!id) {
        return res.status(401).json({
          success: false,
          error: {
            code: 401,
            message: constants.onBoarding.PAYLOAD_MISSING,
          },
        });
      }
      const getFeature = await db.features.findById({
        _id: id,
      });
      if (getFeature) {
        return res.status(200).json({
          success: true,
          message: constants.FEATURE.RETRIEVED,
          payload: getFeature,
        });
      } else {
        return res.status(404).json({
          success: false,
          error: {
            code: 404,
            message: constants.FEATURE.NOT_FOUND,
          },
        });
      }
    } catch (err) {
      return res.status(400).json({
        success: false,
        error: {
          code: 400,
          message: "" + err,
        },
      });
    }
  },
};

const upload = multer({
  dest: "uploads/", // Destination folder
  limits: {
    fileSize: 10485760,
  }, // 10 MB limit
}).single("file");

const parseCSV = (data) => {
  return new Promise((resolve, reject) => {
    const results = [];
    data
      .pipe(csvParser())
      .on("data", (row) => {
        results.push(row);
      })
      .on("end", () => {
        resolve(results);
      })
      .on("error", (error) => {
        reject(error);
      });
  });
};
