"use strict";
const db = require("../models");
var mongoose = require("mongoose");

exports.create_message = async (data) => {
  let create_message = await db.messages.create(data);
  if (create_message) {
    let get_room_members = await db.roommembers
      .find({
        room_id: create_message.room_id,
        user_id: { $ne: create_message.sender },
      })
      .lean()
      .exec();
    if (get_room_members && get_room_members.length > 0) {
      for await (let item_obj of get_room_members) {
        let item = Object.assign({}, item_obj);
        let obj = {
          isRead: false,
          type: "message",
          user_id: item.user_id,
          message_id: create_message._id,
          room_id: item.room_id,
          property_id: item.property_id,
        };
        // delete obj._id;
        let unread_message = await db.chatcommonoperations.create(obj);
        // return delete_message;
      }
    }
  }

  return create_message;
};

exports.read_message = async (newdata) => {
  try {
    let data = newdata;

    if (data.user_id && data.message_id) {
      let get_read_message = await db.chatcommonoperations
        .findOne({
          type: "message",
          user_id: new mongoose.Types.ObjectId(data.user_id),
          message_id: new mongoose.Types.ObjectId(data.message_id),
        })
        .lean()
        .exec();
        // console.log("get_read_message:", get_read_message);
      if (!get_read_message) {
        data.isRead = true;
        data.type = "message";
        let read_message = await db.chatcommonoperations.create(data);
        // //.log(read_message, '==========read_message');

        return read_message;
      }

      let update_message = await db.chatcommonoperations.findByIdAndUpdate(
        get_read_message._id,
        { isRead: true },
        { new: true }
      );
      // console.log("update_message:", update_message );
      return update_message;
    }
    return true;
  } catch (error) {
    return error;
  }
};
exports.update_message = async (newdata) => {
  try {
    let data = newdata;
    if (data.message_id) {
      let update_message = await db.messages.updateOne({ _id: data.message_id }, { content: data.content });
      return update_message;
    }
    return true;
  } catch (error) {
    return error;
  }
};
exports.read_all_messages = async (newdata) => {
  try {
    let data = newdata;
    //.log(data, '=========data from function');

    if (data.user_id && data.room_id) {
      let get_read_message = await db.chatcommonoperations
        .find({
          type: "message",
          user_id: data.user_id,
          room_id: data.room_id,
        })
        .lean()
        .exec();

      if (get_read_message && get_read_message < 0) {
        data.isRead = true;
        data.type = "message";
        let read_message = await db.chatcommonoperations.create(data);
        // //.log(read_message, '==========read_message');

        return read_message;
      }

      let update_message = await db.chatcommonoperations
        .updateMany(
          { user_id: data.user_id, room_id: data.room_id },
          { isRead: true },
          { new: true }
        )
        .lean()
        .exec();
      // return
      return update_message;
    }
    return true;
  } catch (error) {
    return error;
  }
};

exports.delete_message = async (newdata) => {
  try {
    let data = newdata;
    let get_delete_message = await db.chatcommonoperations
      .findOne({
        type: "message",
        user_id: data.user_id,
        message_id: data.message_id,
      })
      .lean()
      .exec();

    if (!get_delete_message) {
      data.isDeleted = true;
      data.type = "message";
      data.delete_type = "delete_for_me";
      let delete_message = await db.chatcommonoperations.create(data);
      return delete_message;
    }
    let update_message = await db.chatcommonoperations.findByIdAndUpdate(
      get_delete_message._id,
      { isDeleted: true, delete_type: "delete_for_me" },
      { new: true }
    );
    return update_message;
  } catch (error) {
    return error;
  }
};

exports.delete_message_for_everyone = async (newdata) => {
  try {
    let data = newdata;
    if (data.room_id) {
      let get_room_members = await db.roommembers
        .find({ room_id: data.room_id })
        .lean()
        .exec();
      if (get_room_members && get_room_members.length > 0) {
        let count = 1;
        for await (let item_obj of get_room_members) {
          count += 1;
          let item = Object.assign({}, item_obj);
          let get_delete_message = await db.chatcommonoperations
            .findOne({
              type: "message",
              user_id: item.user_id,
              message_id: data.message_id,
            })
            .lean()
            .exec();

          if (!get_delete_message) {
            data.isDeleted = true;
            data.type = "message";
            data.delete_type = "delete_for_everyone";
            data.user_id = item.user_id;
            data.property_id = item.property_id;
            delete data._id;

            let delete_message = await db.chatcommonoperations.create(data);
          } else {
            let update_message =
              await db.chatcommonoperations.findByIdAndUpdate(
                get_delete_message._id,
                { isDeleted: true, delete_type: "delete_for_everyone" },
                { new: true }
              );
          }
        }
      }
      return true;
    }
    return true;
  } catch (error) {
    const SmtpController = require("../api/controllers/SmtpController");
    return error;
  }
};

exports.get_unread_messages_count = async (data) => {
  try {
    let pipeline = [
      {
        $match: {
          room_id: new mongoose.Types.ObjectId(data.room_id),
          sender: { $ne: new mongoose.Types.ObjectId(data.user_id) },
        },
      },
      {
        $lookup: {
          from: "chatcommonoperations",
          let: {
            message_id: "$_id",
            user_id: new mongoose.Types.ObjectId(data.user_id),
            type: "message",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$message_id", "$$message_id"] },
                    { $eq: ["$user_id", "$$user_id"] },
                    { $eq: ["$type", "$$type"] },
                  ],
                },
              },
            },
          ],
          as: "chatcommonoperations_details",
        },
      },
      {
        $unwind: {
          path: "$chatcommonoperations_details",
          preserveNullAndEmptyArrays: true,
        },
      },
    ];

    let projection = {
      $project: {
        isRead: {
          $cond: [
            { $ifNull: ["$chatcommonoperations_details", false] },
            "$chatcommonoperations_details.isRead",
            false,
          ],
        },
        isDeleted: {
          $cond: [
            { $ifNull: ["$chatcommonoperations_details", false] },
            "$chatcommonoperations_details.isDeleted",
            false,
          ],
        },
      },
    };
    pipeline.push(projection);

    let group_stage = {
      $group: {
        _id: null,
        read_count: {
          $sum: {
            $cond: [{ $eq: ["$isRead", true] }, 1, 0],
          },
        },
        unread_count: {
          $sum: {
            $cond: [{ $eq: ["$isRead", false] }, 1, 0],
          },
        },
      },
    };
    pipeline.push(group_stage);
    let totalResult = await db.messages.aggregate(pipeline);
    return {
      unread_count: totalResult.length > 0 ? totalResult[0].unread_count : 0,
      read_count: totalResult.length > 0 ? totalResult[0].read_count : 0,
    };
  } catch (error) {
    //.log(error)
    return error;
  }
};

exports.get_unread_messages_count_with_user_id = async (data) => {
  try {
    let pipeline = [
      {
        $match: {
          user_id: new mongoose.Types.ObjectId(data.user_id),
          type: "message",
          isRead: false,
          isDeleted: false,
        },
      },
    ];

    let projection = {
      $project: {
        _id: "$_id",
        isDeleted: "$isDeleted",
        isRead: "$isRead",
        type: "$type",
        user_id: "$user_id",
        message_id: "$message_id",
        property_id: "$property_id"
      },
    };
    pipeline.push(projection);

    let group_stage = {
      $group: {
        _id: "$_id",
        isDeleted: { $first: "$isDeleted" },
        isRead: { $first: "$isRead" },
        type: { $first: "$type" },
        user_id: { $first: "$user_id" },
        message_id: { $first: "$message_id" },
        property_id: { $first: "$property_id" },
      },
      $group: {
        _id: null,
        unread_count: {
          $sum: {
            $cond: [{ $eq: ["$isRead", false] }, 1, 0],
          },
        },
      },
    };
    pipeline.push(group_stage);
    let totalResult = await db.chatcommonoperations.aggregate(pipeline);
    return totalResult.length > 0 ? totalResult[0].unread_count : 0;
  } catch (error) {
    //.log(error, '====error')
    return error;
  }
};

/**un read  Notification count */

exports.get_unread_notification_count = async (data) => {
  try {
    let query = {
      sendTo: new mongoose.Types.ObjectId(data.user_id),
      notificationStatus: "unread",
      isDeleted: false,
    };
    let pipeline = [
      {
        $match: query,
      },
    ];

    let projection = {
      $project: {
        id: "$_id",
        title: "$title",
        sendTo: "$sendTo",
        message: "$message",
        notificationStatus: "$notificationStatus",
        sendFrom: "$sendFrom",
        type: "$type",
      },
    };
    pipeline.push(projection);
    let totalResult = await db.notifications.aggregate([...pipeline]);
    return totalResult.length;
  } catch (error) {
    //.log(error, '====error')
    return error;
  }
};

/**Read One Notification */
exports.read_notification = async (data) => {
  try {
    let updateStatus = await db.notifications.findOneAndUpdate(
      { _id: data.notification_id },
      { notificationStatus: "read" }
    );

    return updateStatus;
  } catch (err) {
    //.log(err, '====err')
    return err;
  }
};

/**Read All Notifications */
exports.read_all_notifications = async (data) => {
  try {
    let updateStatus = await db.notifications.updateMany(
      { sendTo: data.user_id },
      { $set: { notificationStatus: "read" } }
    );
    return updateStatus;
  } catch (err) {
    //.log(err, '====err')
    return err;
  }
};
// /**get all chat count of rooms */
exports.getAllRoomMembers = async (data) => {
  try {
    let { user_id, room_id, search, sortBy, isGroupChat, quickChat } = data;
    let page = data.page || 1;
    let count = data.count || 10;
    let skipNo = (Number(page) - 1) * Number(count);
    let query = {};

    if (search) {
      // search = await Services.Utils.remove_special_char_exept_underscores(search);
      query.$or = [
        { subject: { $regex: search, $options: "i" } },
        { fullName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    let sortquery = {};
    if (sortBy) {
      let typeArr = [];
      typeArr = sortBy.split(" ");
      let sortType = typeArr[1];
      let field = typeArr[0];
      sortquery[field ? field : "updatedAt"] = sortType
        ? sortType == "desc"
          ? -1
          : 1
        : -1;
    } else {
      sortquery = { updatedAt: -1 };
    }

    if (isGroupChat) {
      if (isGroupChat === "true") {
        isGroupChat = true;
      } else {
        isGroupChat = false;
      }
      query.isGroupChat = isGroupChat;
    } else {
      query.isGroupChat = false;
    }

    if (quickChat == "true") {
      query.quickChat = true;
    } else if (quickChat == "false") {
      query.quickChat = false;
    }
    if (user_id) {
      query.user_id = new mongoose.Types.ObjectId(user_id);
      var admin_data = await db.users
        .find({})
        .limit(1)
        .select(["fullName", "email", "image"]);
    }

    if (room_id) {
      query.room_id = new mongoose.Types.ObjectId(room_id);
    }

    let pipeline = [
      {
        $lookup: {
          from: "users",
          localField: "user_id",
          foreignField: "_id",
          as: "user_id_details",
        },
      },
      {
        $unwind: {
          path: "$user_id_details",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "rooms",
          localField: "room_id",
          foreignField: "_id",
          as: "room_id_details",
        },
      },
      {
        $unwind: {
          path: "$room_id_details",
          preserveNullAndEmptyArrays: true,
        },
      },
    ];

    let projection = {
      $project: {
        id: "$_id",
        isGroupChat: "$isGroupChat",
        room_id: "$room_id",
        room_details: "$room_id_details",
        subject: "$room_id_details.subject",
        user_id: "$user_id",
        user_details: "$user_id_details",
        fullName: "$user_id_details.fullName",
        email: "$user_id_details.email",
        quickChat: "$quickChat",
        chat_count: "$chat_count",
        createdAt: "$createdAt",
        updatedAt: "$updatedAt",
      },
    };

    let grouped = {
      $group: {
        _id: "$room_id",
        isGroupChat: { $first: "$isGroupChat" },
        room_id: { $first: "$room_id" },
        room_details: { $first: "$room_details" },
        user_id: { $push: "$user_id" },
        quickChat: { $first: "$quickChat" },
        fullName: { $first: "$fullName" },
        user_details: { $push: "$user_details" },
        chat_count: { $first: "$chat_count" },
        createdAt: { $first: "$createdAt" },
        updatedAt: { $first: "$updatedAt" },
      },
    };

    pipeline.push(projection);
    pipeline.push({
      $match: query,
    });
    pipeline.push({
      $sort: sortquery,
    });
    pipeline.push(grouped);
    pipeline.push({
      $sort: sortquery,
    });
    let totalResult = await db.roommembers.aggregate(pipeline);

    pipeline.push({
      $skip: Number(skipNo),
    });
    pipeline.push({
      $limit: Number(count),
    });

    let result = await db.roommembers.aggregate(pipeline);

    if (admin_data) {
      if (result && result.length > 0) {
        for await (let single of result) {
          single.admin_details = admin_data[0];
        }
      }
    }

    let resData = {
      total: totalResult ? totalResult.length : 0,
      data: result ? result : [],
    };
    if (!data.page && !data.count) {
      if (admin_data && totalResult && totalResult.length > 0) {
        for await (let single of totalResult) {
          single.admin_details = admin_data[0];
        }
      }
      resData.data = totalResult ? totalResult : [];
    }
    return resData;
  } catch (error) {
    console.log(error, "------------");
  }
};
exports.getUserProfile = async (data) => {
  let user = await db.users.findById({ _id: data }).select("chat_enabled");
  return user;
};
