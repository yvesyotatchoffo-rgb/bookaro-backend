const db = require("../models");
const constants = require("../utls/constants");
const Favorites = db.favorites;
var mongoose = require("mongoose");
const fcm_service = require("../services/FcmServices");
module.exports = {
  add: async (req, res) => {
    try {
      const data = req.body;
      let { property_id } = req.body;
      if (!data.user_id || !data.property_id) {
        return res.status(404).json({
          success: false,
          error: { code: 404, message: constants.onBoarding.PAYLOAD_MISSING },
        });
      }
      let query = {
        isDeleted: false,
        user_id: data.user_id,
        property_id: data.property_id,
      };
      let existed = await Favorites.findOne(query);
      if (existed) {
        return res.status(400).json({
          success: false,
          error: { code: 400, message: constants.FAVORITE.ALREADY_EXIST },
        });
      }
      let findProperty = await db.property.findOne({ _id: req.body.property_id })
      let findUser = await db.users.findOne({ _id: req.identity.id })

      let propertyOwnerId = db.property.findOne({ _id: data.property_id });
      let user_id = await db.setting.findOne({ user_id: propertyOwnerId.addedBy });
      if (user_id?.new_like?.phone === true) {
        let notification_payload = {
          sendBy: req.identity.id,
          sendTo: findProperty.addedBy,
          message: `Property liked by ${findUser.firstName}`,
          title: "like Property Notification",
          type: "Property",
          property_id: findProperty._id
        };
        let create_notification = await db.notifications.create(notification_payload)
        if (create_notification) {
          let findUsers = await db.devices.find({ userId: findProperty.addedBy })
          for (let itm of findUsers) {
            notification_payload.device_token = itm.deviceToken;
            let fcm_response = await fcm_service.send_fcm_push_notification(notification_payload);
          }
        }
      }
      data.addedBy = req.identity.id;
      if (data.p2pLike === true) {
        const currentCampaign = await db.peerCampaign.findOne(
          {
            propertyId: property_id,
            status: "active"
          })
        if (currentCampaign) {
          data.campaignId = currentCampaign._id;
        } else {
          data.campaignId = null;
        }
      }
      let created = await Favorites.create(data);

      return res.status(200).json({
        success: true,
        message: constants.FAVORITE.CREATED,
      });
    } catch (err) {
      console.log(err, "=====================err")
      return res.status(500).json({
        success: false,
        error: { code: 500, message: "" + err },
      });
    }
  },

  listing: async (req, res) => {
    try {
      const { search, page, count, user_id, sortBy, status, property_id } =
        req.query;
      var query = {};
      if (search) {
        query.$or = [
          { dislike: { $regex: search, $options: "i" } },
          { like: { $regex: search, $options: "i" } },
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
      if (property_id) {
        query.property_id = new mongoose.Types.ObjectId(property_id);
      }
      if (user_id) {
        query.user_id = new mongoose.Types.ObjectId(user_id);
      }
      const pipeline = [
        {
          $match: query,
        },
        {
          $sort: sortquery,
        },
        {
          $lookup: {
            from: "properties",
            localField: "property_id",
            foreignField: "_id",
            as: "propertyDetail",
          },
        },

        {
          $unwind: {
            path: "$propertyDetail",
            preserveNullAndEmptyArrays: true,
          },
        },

        {
          $project: {
            id: "$_id",
            like: "$like",
            dislike: "$dislike",
            property_id: "$property_id",
            user_id: "$user_id",
            status: "$status",
            isDeleted: "$isDeleted",
            createdAt: "$createdAt",
            updatedAt: "$updatedAt",
            propertyDetail: "$propertyDetail",
          },
        },
      ];
      const total = await Favorites.countDocuments(query);
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
      const result = await Favorites.aggregate([...pipeline]);

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
          message: "" + error,
        },
      });
    }
  },

  edit: async (req, res) => {
    try {
      let data = req.body;
      if (!data.user_id || !data.property_id) {
        return res.status(404).json({
          success: false,
          error: { code: 404, message: constants.onBoarding.PAYLOAD_MISSING },
        });
      }
      let query = {
        isDeleted: false,
        user_id: data.user_id,
        property_id: data.property_id,
      };
      if (!data.id) {
        let existed = await Favorites.findOne(query).populate("property_id");
        if (existed) {
          if (data.like === true && data.p2pLike === true) {
            const currentCampaign = await db.peerCampaign.findOne(
              {
                propertyId: data.property_id,
                status: "active"
              })
            if (currentCampaign) {
              data.campaignId = currentCampaign._id;
            } else {
              data.campaignId = null;
            }
          }
          let updated = await Favorites.updateOne({ _id: existed.id }, data);
          if (data.like) {
            let findUser = await db.users.findOne({ _id: req.identity.id })
            let notification_payload = {
              sendBy: req.identity.id,
              sendTo: existed.property_id.addedBy,
              message: `${findUser.firstName} liked your property.`,
              title: `${existed.property_id.propertyTitle}`,
              type: "Property",
              property_id: existed.property_id._id
            };
            let create_notification = await db.notifications.create(
              notification_payload
            );
            if (create_notification) {
              let findUsers = await db.devices.find({ userId: existed.property_id.addedBy })
              for (let itm of findUsers) {
                notification_payload.device_token = itm.deviceToken;
                let fcm_response = await fcm_service.send_fcm_push_notification(notification_payload);
              }
            }
          }
          return res.status(200).json({
            success: true,
            message: constants.FAVORITE.UPDATED,
          });
        } else {
          data.addedBy = req.identity.id;
          if (data.p2pLike === true) {
            const currentCampaign = await db.peerCampaign.findOne(
              {
                propertyId: data.property_id,
                status: "active"
              })
            if (currentCampaign) {
              data.campaignId = currentCampaign._id;
            } else {
              data.campaignId = null;
            }
          }
          let created = await Favorites.create(data);
          let existedNewOne = await Favorites.findOne(query).populate(
            "property_id"
          );
          let propertyOwnerId = await db.property.findOne({ _id: data.property_id });
          let user_id = await db.setting.findOne({ user_id: propertyOwnerId.addedBy });
          if (user_id.new_like.phone === true) {
            if (data.like) {
              let findUser = await db.users.findOne({ _id: req.identity.id })
              let notification_payload = {
                sendBy: req.identity.id,
                sendTo: existedNewOne.property_id.addedBy,
                message: `${findUser.firstName} liked your property.`,
                title: `${existedNewOne.property_id.propertyTitle}`,
                type: "Property",
                property_id: existedNewOne.property_id._id
              };
              let create_notification = await db.notifications.create(
                notification_payload
              );
              if (create_notification) {
                let findUsers = await db.devices.find({ userId: existedNewOne.property_id.addedBy })
                for (let itm of findUsers) {
                  notification_payload.device_token = itm.deviceToken;
                  let fcm_response = await fcm_service.send_fcm_push_notification(notification_payload);
                }
              }
            }
          }

          return res.status(200).json({
            success: true,
            message: constants.FAVORITE.UPDATED,
          });
        }
      }

      if (data.p2pLike === true) {
        const currentCampaign = await db.peerCampaign.findOne(
          {
            propertyId: data.property_id,
            status: "active"
          })
        if (currentCampaign) {
          data.campaignId = currentCampaign._id;
        } else {
          data.campaignId = null;
        }
      }
      let updated = await Favorites.updateOne({ _id: data.id }, data);
      return res.status(200).json({
        success: true,
        message: constants.FAVORITE.UPDATED,
      });
    } catch (error) {
      console.log(error, "===============error")
      return res.status(500).json({
        success: false,
        error: {
          code: 500,
          message: "" + error,
        },
      });
    }
  },
};
