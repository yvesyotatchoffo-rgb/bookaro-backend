const db = require("../models");
const constants = require("../utls/constants");
const mongoose = require("mongoose");

module.exports = {
  addFolder: async (req, res) => {
    try {
      const data = req.body;
      if (!data.name) {
        return res.status(404).json({
          success: false,
          error: { code: 404, message: constants.onBoarding.PAYLOAD_MISSING },
        });
      }
      let query = { isDeleted: false, name: data.name };
      let existed = await db.folder.findOne(query);

      if (existed) {
        return res.status(400).json({
          success: false,
          error: { code: 400, message: "Folder already exist" },
        });
      }
      data.addedBy = req.identity.id;
      let created = await db.folder.create(data);

      return res.status(200).json({
        success: true,
        message: "Folder created",
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        error: { code: 500, message: "" + err },
      });
    }
  },

  folderDetails: async (req, res) => {
    try {
      let id = req.query.id;
      let propertyType = req.query.propertyType;
      if (!id) {
        return res.status(400).json({
          success: false,
          message: "Id is required",
        });
      }

      let folderData = await db.folder.findOne({ _id: id, isDeleted: false });
      if (folderData) {
        let array = [];
        for (let ids of folderData.property_id) {
          let query = {};
          query._id = new mongoose.Types.ObjectId(ids);
          query.isDeleted = false;
          if (propertyType) {
            query.propertyType = propertyType;
          }
          let find_property = await db.property.findOne(query);
          let find_likes = await db.favorites.findOne({
            property_id: ids,
            user_id: req.identity.id,
          });
          let find_follwers = await db.followUnfollow.findOne({
            property_id: ids,
            user_id: req.identity.id,
          });
          let propertyWithLikes = {};
          if (find_property) {
            let likeCount = await db.favorites.countDocuments({
              property_id: new mongoose.Types.ObjectId(find_property._id),
              like: true,
            });
            let followerCount = await db.followUnfollow.countDocuments({
              property_id: find_property._id,
              follow_unfollow: true,
            });
            propertyWithLikes = {
              ...find_property.toObject(), // Convert Mongoose doc to plain object
              favourite_details: find_likes ? find_likes.like : null, // If found, add like data, otherwise null
              followunfollows_details: find_follwers ? find_follwers.follow_unfollow : null, // If found, add follow data, otherwise null
              likeCount: likeCount,
              followerCount: followerCount,
            };
          }

          if (Object.keys(propertyWithLikes).length > 0) {
            array.push(propertyWithLikes);
          }
        }

        // Include the array of properties with likes and follows in the response
        return res.status(200).json({
          success: true,
          data: {
            folder: folderData,
            properties: array,
          },
        });
      } else {
        return res.status(400).json({
          success: false,
          message: "Id is invalid",
        });
      }
    } catch (error) {
      console.log(error, "===========error");
      return res.status(500).json({
        success: false,
        error: {
          code: 500,
          message: "" + error,
        },
      });
    }
  },

  listing: async (req, res) => {
    try {
      const { search, page, count, sortBy, status, userId } = req.query;
      var query = {};
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: "i" } },
          { answer: { $regex: search, $options: "i" } },
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
      if (userId) {
        query.addedBy = new mongoose.Types.ObjectId(userId);
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
            property_id: "$property_id",
            isDeleted: "$isDeleted",
            createdAt: "$createdAt",
            updatedAt: "$updatedAt",
            addedBy: "$addedBy",
            status: "$status",
          },
        },
      ];
      const total = await db.folder.countDocuments(query);
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
      const result = await db.folder.aggregate([...pipeline]);

      return res.status(200).json({
        success: true,
        data: result,
        total: total,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: {
          code: 500,
          message: "" + err,
        },
      });
    }
  },

  statusChange: async (req, res) => {
    try {
      let id = req.body.id;
      if (!id) {
        return res.status(400).json({
          success: false,
          message: constants.FAQ.ID_MISSING,
        });
      } else {
        let findBlog = await Faqs.findOne({ _id: id });
        if (findBlog) {
          if (findBlog.status == "active") {
            await Faqs.updateOne({ _id: id }, { status: "deactive" });
          } else {
            await Faqs.updateOne({ _id: id }, { status: "active" });
          }
          return res.status(200).json({
            success: true,
            message: constants.FAQ.STATUS_CHANGED,
          });
        } else {
          return res.status(400).json({
            success: false,
            message: constants.FAQ.NOT_FOUND,
          });
        }
      }
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: {
          code: 500,
          message: "" + err,
        },
      });
    }
  },
  deleteFolder: async (req, res) => {
    try {
      let id = req.query.id;
      if (!id) {
        return res.status(400).json({
          success: false,
          message: constants.FAQ.ID_MISSING,
        });
      }
      let findfolder = await db.folder.findOne({ _id: id, isDeleted: false });
      if (findfolder) {
        await db.folder.updateOne({ _id: id }, { isDeleted: true });
        return res.status(200).json({
          success: true,
          message: "Data deleted",
        });
      } else {
        return res.status(400).json({
          success: false,
          message: "Data not found",
        });
      }
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: {
          code: 500,
          message: "" + err,
        },
      });
    }
  },

  editFolder: async (req, res) => {
    try {
      let data = req.body;
      let id = data.id;
      if (!id) {
        return res.status(400).json({
          success: false,
          message: "Id is required",
        });
      }
      const existingFolder = await db.folder.findById(id);
      if (!existingFolder) {
        return res.status(404).json({
          success: false,
          message: "Folder not found",
        });
      }

      let updateData = { ...data };
      if (data.property_id) {
        updateData.$addToSet = { property_id: { $each: Array.isArray(data.property_id) ? data.property_id : [data.property_id] } };
        delete updateData.property_id; // Remove original property_id to avoid replacement
    }

      // await db.folder.updateOne({ _id: data.id }, data);
      await db.folder.updateOne({ _id: id }, updateData);
      return res.status(200).json({
        success: true,
        message: "Folder Updated",
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: {
          code: 500,
          message: "" + err,
        },
      });
    }
  },
};
