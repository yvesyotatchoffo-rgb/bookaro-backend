const Services = require('../services');
let _ = require('lodash')
const response = require('../utls/Response');
const constants = require('../utls/constants');
const db = require("../models");
var mongoose = require("mongoose");
const Emails = require("../Emails/onBoarding");
const { success } = require('../services/Response');

exports.joinGroup = async (req, res, next) => {
    try {
        let { chat_by, chat_with, subject, property_id } = req.body;

        if (!req.body.chat_by) { chat_by = req.identity.id }
        if (!chat_by || !chat_with || !subject || !property_id) {
            return res.status(404).json({
                success: false,
                error: { code: 404, message: constants.onBoarding.PAYLOAD_MISSING }
            })
        }
        req.body.subject = req.body.subject.toLowerCase();
        subject = req.body.subject
        let get_chat_by_rooms = await Services.customers.get_user_rooms({
            user_id: chat_by,
            isGroupChat: false,
            property_id: property_id,

        }, {
            room_id: 1
        });
        let get_chat_with_rooms = await Services.customers.get_user_rooms({
            user_id: chat_with,
            isGroupChat: false,
            property_id: property_id
        }, {
            room_id: 1
        });
        if (get_chat_by_rooms && get_chat_by_rooms.length > 0 && get_chat_with_rooms && get_chat_with_rooms.length > 0) {
            if (get_chat_by_rooms && get_chat_by_rooms.length > 0) {
                get_chat_by_rooms = get_chat_by_rooms.map(item => `${item.room_id}`);
            }

            if (get_chat_with_rooms && get_chat_with_rooms.length > 0) {
                get_chat_with_rooms = get_chat_with_rooms.map(item => `${item.room_id}`);
            }

            let common_room_id = await Services.common.get_common_from_arr_of_strs(get_chat_by_rooms, get_chat_with_rooms);
            if (common_room_id && common_room_id.length > 0) {
                // return common_room_id[0];
                let data = {
                    room_id: common_room_id[0]
                }
                return response.success(data, constants.USER.GROUP_JOINED, req, res);

            }

        }

        let create_room = await Services.room.create_room({
            subject: subject,
            isGroupChat: false,
        });
        if (create_room) {
            let create_members = await Services.room.add_members([{
                room_id: create_room._id,
                user_id: chat_by,
                property_id: property_id
            },
            {
                room_id: create_room._id,
                user_id: chat_with,
                property_id: property_id


            }]);
            let data = {
                room_id: create_room._id
            }
            return response.success(data, constants.USER.GROUP_JOINED, req, res);
        }
    } catch (error) {
        console.log(error, "==============error")
        return response.failed(null, `${error}`, req, res);
    }
}

exports.getAllMessages = async (req, res, next) => {
    try {
        let { room_id, search, isDeleted, sortBy, user_id, login_user_id } = req.query;
        let page = req.query.page || 1;
        let count = req.query.count || 10;
        let skipNo = (Number(page) - 1) * Number(count);
        let query = {};

        if (search) {
            query.$or = [
                { content: { $regex: search, '$options': 'i' } },
            ]
        }

        const roomMembers = await db.roommembers.find({
            // isDeleted: false,
            room_id: new mongoose.Types.ObjectId(room_id),
            user_id: { $ne: new mongoose.Types.ObjectId(login_user_id) }
        })

        if (!roomMembers || roomMembers.length === 0) {
            return res.status(400).json({
                success: false,
                message: "No users found in this room."
            })
        }

        let blockedStatusMap = new Map();

        for (const member of roomMembers) {
            const memberId = member.user_id._id;

            const isBlocked = await db.blockedUsers.findOne({
                $or: [
                    { blockedBy: new mongoose.Types.ObjectId(login_user_id), blockedTo: new mongoose.Types.ObjectId(memberId) },
                    { blockedBy: new mongoose.Types.ObjectId(memberId), blockedTo: new mongoose.Types.ObjectId(login_user_id) }
                ]
            })
            blockedStatusMap.set(memberId.toString(), !!isBlocked); // Set true if blocked, false otherwise
        }






        let sortquery = {};
        if (sortBy) {
            let typeArr = [];
            typeArr = sortBy.split(" ");
            let sortType = typeArr[1];
            let field = typeArr[0];
            sortquery[field ? field : 'createdAt'] = sortType ? (sortType == 'desc' ? -1 : 1) : -1;
        } else {
            sortquery = { createdAt: 1 }
        }

        if (user_id) {
            user_id = new mongoose.Types.ObjectId(user_id)
        }

        if (login_user_id) {
            login_user_id = new mongoose.Types.ObjectId(login_user_id)
        }

        if (isDeleted) {
            query.isDeleted = isDeleted ? isDeleted === 'true' : true ? isDeleted : false;
        } else {
            query.isDeleted = false;
        }

        // let matchQuary = {};

        // matchQuary.room_id = new mongoose.Types.ObjectId(room_id);

        let matchQuary = {
            room_id: new mongoose.Types.ObjectId(room_id),
            clearedBy: { $nin: [login_user_id] },
        };

        let pipeline = [
            {
                $match: matchQuary

            },
            {
                $lookup: {
                    from: "users",
                    localField: "sender",
                    foreignField: "_id",
                    as: "sender_details"
                }
            },
            {
                $unwind: {
                    path: '$sender_details',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: "chatcommonoperations",
                    let: { message_id: "$_id", user_id: user_id, type: "message" },
                    pipeline: [{
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ["$message_id", "$$message_id"] },
                                    { $eq: ["$user_id", "$$user_id"] },
                                    { $eq: ["$type", "$$type"] },
                                ]
                            }
                        }
                    }],
                    as: "chatcommonoperations_details"
                }
            },
            {
                $unwind: {
                    path: '$chatcommonoperations_details',
                    preserveNullAndEmptyArrays: true
                }
            },

            // //------------ checking message deleted for login user or not -----------//
            {
                $lookup: {
                    from: "chatcommonoperations",
                    let: { message_id: "$_id", user_id: login_user_id, type: "message" },
                    pipeline: [{
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ["$message_id", "$$message_id"] },
                                    { $eq: ["$user_id", "$$user_id"] },
                                    { $eq: ["$type", "$$type"] },
                                ]
                            }
                        }
                    }],
                    as: "deleted_message_details"
                }
            },
            {
                $unwind: {
                    path: '$deleted_message_details',
                    preserveNullAndEmptyArrays: true
                }
            },
            //------------ checking message deleted for login user or not -----------//
        ];

        let projection = {
            $project: {
                type: "$type",
                room_id: "$room_id",
                sender: "$sender",
                sender_name: "$sender_details.fullName",
                sender_image: "$sender_details.image",
                sender_logo: "$sender_details.logo",
                content: "$content",
                media: "$media",
                inviteId: "$inviteId",
                project_id: "$project_id",
                message_type: "$message_type",
                isRead: {
                    $cond: [{ $ifNull: ['$chatcommonoperations_details', false] }, "$chatcommonoperations_details.isRead", false]
                },
                isDeleted: {
                    $cond: [{ $ifNull: ['$deleted_message_details', false] }, "$deleted_message_details.isDeleted", false]
                },
                createdAt: "$createdAt",
                updatedAt: "$updatedAt",
            }
        }
        pipeline.push(projection);
        pipeline.push({
            $match: query
        });

        let group_stage = {
            $group: {
                _id: "$_id",
                type: { $first: "$type" },
                room_id: { $first: "$room_id" },
                sender: { $first: "$sender" },
                sender_name: { $first: "$sender_name" },
                sender_image: { $first: "$sender_image" },
                sender_logo: { $first: "$sender_logo" },
                content: { $first: "$content" },
                media: { $first: "$media" },
                project_id: { $first: "$project_id" },
                inviteId: { $first: "$inviteId" },
                message_type: { $first: "$message_type" },
                isRead: { $first: "$isRead" },
                isDeleted: { $first: "$isDeleted" },
                createdAt: { $first: "$createdAt" },
                updatedAt: { $first: "$updatedAt" },
            }
        };
        pipeline.push(group_stage);
        pipeline.push({
            $sort: sortquery
        });
        // console.log(sortquery, "--------------sortquery")
        let totalResult = await db.messages.aggregate(pipeline);

        pipeline.push({
            $skip: Number(skipNo)
        });
        pipeline.push({
            $limit: Number(count)
        });

        let result = await db.messages.aggregate(pipeline);

        const finalResult = result.map((message) => {
            const senderId = message.sender.toString();
            const isBlocked = blockedStatusMap.get(senderId) || false;
            return {
                ...message,
                isBlocked,
            };
        });
        let resData = {
            total: totalResult ? totalResult.length : 0,
            data: finalResult ? finalResult : []
        }
        // if (!req.query.page && !req.query.count) {
        //     resData.data = totalResult ? totalResult : []
        // }

        if (!req.query.page && !req.query.count) {
            resData.data = totalResult.map((message) => {
                const senderId = message.sender.toString();
                const isBlocked = blockedStatusMap.get(senderId) || false;
                return {
                    ...message,
                    isBlocked,
                };
            });
        }

        return response.success(resData, "Fetched all messages", req, res);

    } catch (error) {
        console.log(error);
        return response.failed(null, `${error}`, req, res);
    }
}

// exports.getAllRoomMembers = async (req, res, next) => {
//     try {
//         let { user_id, room_id, search, property_id, sortBy, isGroupChat, quickChat } = req.query;
//         let page = req.query.page || 1;
//         let count = req.query.count || 10;
//         let skipNo = (Number(page) - 1) * Number(count);
//         let query = {};

//         if (search) {
//             // search = await Services.Utils.remove_special_char_exept_underscores(search);
//             query.$or = [
//                 { subject: { $regex: search, '$options': 'i' } },
//                 { fullName: { $regex: search, '$options': 'i' } },
//                 { email: { $regex: search, '$options': 'i' } },
//             ]
//         }

//         let sortquery = {};
//         if (sortBy) {
//             let typeArr = [];
//             typeArr = sortBy.split(" ");
//             let sortType = typeArr[1];
//             let field = typeArr[0];
//             sortquery[field ? field : 'updatedAt'] = sortType ? (sortType == 'desc' ? -1 : 1) : -1;
//         } else {
//             sortquery = { updatedAt: -1 }
//         }

//         if (isGroupChat) {
//             if (isGroupChat === 'true') {
//                 isGroupChat = true;
//             } else {
//                 isGroupChat = false;
//             }
//             query.isGroupChat = isGroupChat;
//         } else {
//             query.isGroupChat = false;
//         }

//         if (quickChat == "true") {
//             query.quickChat = true
//         } else if (quickChat == "false") {
//             query.quickChat = false
//         }
//         if (user_id) {
//             query.user_id = new mongoose.Types.ObjectId(user_id);
//             var admin_data = await db.users.find({}).limit(1).select(["fullName", "email", "image", "isOnline"])

//         }

//         if (room_id) {
//             query.room_id = new mongoose.Types.ObjectId(room_id);
//         }
//         if (property_id) {
//             query.property_id = new mongoose.Types.ObjectId(property_id);

//         }


//         let pipeline = [
//             {
//                 $lookup: {
//                     from: "users",
//                     localField: "user_id",
//                     foreignField: "_id",
//                     as: "user_id_details"
//                 }
//             },
//             {
//                 $unwind: {
//                     path: '$user_id_details',
//                     preserveNullAndEmptyArrays: true
//                 }
//             },
//             {
//                 $lookup: {
//                     from: "rooms",
//                     localField: "room_id",
//                     foreignField: "_id",
//                     as: "room_id_details"
//                 }
//             },
//             {
//                 $unwind: {
//                     path: '$room_id_details',
//                     preserveNullAndEmptyArrays: true
//                 }
//             },
//         ];

//         let projection = {
//             $project: {
//                 id: "$_id",
//                 isGroupChat: "$isGroupChat",
//                 room_id: "$room_id",
//                 room_details: "$room_id_details",
//                 subject: "$room_id_details.subject",
//                 user_id: "$user_id",
//                 user_details: "$user_id_details",
//                 fullName: "$user_id_details.fullName",
//                 email: "$user_id_details.email",
//                 isOnline: "$user_id_details.isOnline",
//                 quickChat: "$quickChat",
//                 admin_chat_count: "$admin_chat_count",
//                 user_chat_count: "$user_chat_count",
//                 createdAt: "$createdAt",
//                 updatedAt: "$updatedAt",
//                 property_id: "$property_id"
//             }
//         }

//         let grouped = {
//             $group: {
//                 _id: "$room_id",
//                 isGroupChat: { $first: "$isGroupChat" },
//                 room_id: { $first: "$room_id" },
//                 room_details: { $first: "$room_details" },
//                 user_id: { $push: "$user_id" },
//                 quickChat: { $first: "$quickChat" },
//                 fullName: { $first: "$fullName" },
//                 user_details: { $push: "$user_details" },
//                 user_chat_count: { $first: "$user_chat_count" },
//                 admin_chat_count: { $first: "$admin_chat_count" },
//                 issOnline: { $first: "$isOnline" },
//                 // admin_chat_count: {$first:"$admin_chat_count"},
//                 createdAt: { $first: "$createdAt" },
//                 updatedAt: { $first: "$updatedAt" },
//                 property_id: { $first: "$property_id" },
//             }
//         }

//         pipeline.push(projection);
//         pipeline.push({
//             $match: query
//         });
//         pipeline.push({
//             $sort: sortquery
//         });
//         pipeline.push(grouped);
//         pipeline.push({
//             $sort: sortquery
//         });
//         let totalResult = await db.roommembers.aggregate(pipeline);

//         pipeline.push({
//             $skip: Number(skipNo)
//         });
//         pipeline.push({
//             $limit: Number(count)
//         });

//         let result = await db.roommembers.aggregate(pipeline);

//         if (admin_data) {
//             if (result && result.length > 0) {

//                 for await (let single of result) {
//                     single.admin_details = admin_data[0]
//                 }
//             }
//         }

//         let resData = {
//             total: totalResult ? totalResult.length : 0,
//             data: result ? result : []
//         }
//         if (!req.query.page && !req.query.count) {
//             if (admin_data && totalResult && totalResult.length > 0) {

//                 for await (let single of totalResult) {
//                     single.admin_details = admin_data[0]
//                     // console.log(single,'single');
//                 }
//             }
//             resData.data = totalResult ? totalResult : []
//         }
//         return response.success(resData, "Fetched all room members", req, res);

//     } catch (error) {
//         return response.failed(null, `${error}`, req, res);
//     }
// }

exports.getAllRecentChats = async (req, res, next) => {
    try {
        let { user_id, room_id, search, property_id, sortBy, isGroupChat, login_user_id } = req.query;
        let page = req.query.page || 1;
        let count = req.query.count || 10;
        let skipNo = (Number(page) - 1) * Number(count);
        let query = {};

        if (search) {
            // search = await Services.Utils.remove_special_char_exept_underscores(search);
            query.$or = [
                { content: { $regex: search, '$options': 'i' } },
                { "room_members.user_name": { $regex: search, '$options': 'i' } },
            ]
        }


        let sortquery = {};
        if (sortBy) {
            let typeArr = [];
            typeArr = sortBy.split(" ");
            let sortType = typeArr[1];
            let field = typeArr[0];
            sortquery[field ? field : 'createdAt'] = sortType ? (sortType == 'desc' ? -1 : 1) : -1;
        } else {
            sortquery = { last_message_at: -1 }
        }

        if (isGroupChat) {
            if (isGroupChat === 'true') {
                isGroupChat = true;
            } else {
                isGroupChat = false;
            }
            query.isGroupChat = isGroupChat;
        } else {
            query.isGroupChat = false;
        }

        if (user_id) {
            user_id = new mongoose.Types.ObjectId(user_id);
            query.user_id = user_id;
        }

        if (room_id) {
            query.room_id = new mongoose.Types.ObjectId(room_id);
        }

        if (login_user_id) {
            login_user_id = new mongoose.Types.ObjectId(login_user_id);
        }
        if (property_id) {
            property_id = new mongoose.Types.ObjectId(property_id);

        }

        let pipeline = [
            {
                $lookup: {
                    from: "rooms",
                    localField: "room_id",
                    foreignField: "_id",
                    as: "room_id_details"
                }
            },
            {
                $unwind: {
                    path: '$room_id_details',
                    preserveNullAndEmptyArrays: true
                }
            },

            {
                $lookup: {
                    from: "properties",
                    localField: "property_id",
                    foreignField: "_id",
                    as: "property_details"
                }
            },
            {
                $unwind: {
                    path: '$property_details',
                    preserveNullAndEmptyArrays: true
                }
            },
            // ----------- Last message details --------------//

            {
                $lookup: {
                    from: "messages",
                    let: { room_id: "$room_id" },
                    pipeline: [{
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ["$room_id", "$$room_id"] },
                                ]
                            }
                        }
                    },
                    {
                        $lookup: {
                            from: "chatcommonoperations",
                            let: { message_id: "$_id", user_id: login_user_id, type: "message" },
                            pipeline: [{
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ["$message_id", "$$message_id"] },
                                            { $eq: ["$user_id", "$$user_id"] },
                                            { $eq: ["$type", "$$type"] },
                                        ]
                                    }
                                }
                            }],
                            as: "deleted_message_details"
                        }
                    },
                    {
                        $unwind: {
                            path: '$deleted_message_details',
                            preserveNullAndEmptyArrays: true
                        }
                    },
                    {
                        $addFields: {
                            isDeleted: {
                                $cond: [{ $ifNull: ['$deleted_message_details', false] }, "$deleted_message_details.isDeleted", false]
                            },
                        }
                    },
                    {
                        $unset: ["deleted_message_details"]
                    },
                    {
                        $match: {
                            isDeleted: false,
                        }
                    },
                    {
                        $sort: { createdAt: -1 }
                    },
                    {
                        $limit: 1
                    }
                    ],
                    as: "messages_details"
                }
            },
            {
                $unwind: {
                    path: '$messages_details',
                    preserveNullAndEmptyArrays: true
                }
            },
            // ----------- Last message details --------------//



            // ----------- room members details exprect login user --------------//
            {
                $lookup: {
                    from: "roommembers",
                    let: { room_id: "$room_id", user_id: user_id },
                    pipeline: [{
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ["$room_id", "$$room_id"] },
                                    { $ne: ["$user_id", "$$user_id"] },
                                ]
                            }
                        }
                    },
                    {
                        $lookup: {
                            from: "users",
                            localField: "user_id",
                            foreignField: "_id",
                            as: "user_id_details"
                        }
                    },
                    {
                        $unwind: {
                            path: '$user_id_details',
                            preserveNullAndEmptyArrays: true
                        }
                    },
                    {
                        $project: {
                            id: "$_id",
                            user_id: "$user_id",
                            user_role: "$user_id_details.role",
                            user_name: "$user_id_details.fullName",
                            user_logo: "$user_id_details.logo",
                            user_image: "$user_id_details.image",
                            isOnline: "$user_id_details.isOnline",
                        }
                    }
                    ],
                    as: "room_members_details"
                }
            },
            // ----------- room members details exprect login user --------------//


            // ----------- unread message count --------------//
            {
                $lookup: {
                    from: "messages",
                    let: { room_id: "$room_id", user_id: user_id },
                    pipeline: [{
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ["$room_id", "$$room_id"] },
                                    { $ne: ["$user_id", "$$user_id"] },
                                ]
                            }
                        }
                    },
                    {
                        $lookup: {
                            from: "chatcommonoperations",
                            let: { message_id: "$_id", user_id: user_id, type: "message" },
                            pipeline: [{
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ["$message_id", "$$message_id"] },
                                            { $eq: ["$user_id", "$$user_id"] },
                                            { $eq: ["$type", "$$type"] },
                                        ]
                                    }
                                }
                            }],
                            as: "chatcommonoperations_details"
                        }
                    },
                    {
                        $unwind: {
                            path: '$chatcommonoperations_details',
                            preserveNullAndEmptyArrays: true
                        }
                    },
                    {
                        $project: {
                            isRead: "$chatcommonoperations_details.isRead",
                            isDeleted: "$chatcommonoperations_details.isDeleted",
                        }
                    },
                    {
                        $match: {
                            isDeleted: false,
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            read_count: {
                                $sum: {
                                    $cond: [
                                        { $eq: ["$isRead", true] }, 1, 0
                                    ]
                                }
                            },
                            unread_count: {
                                $sum: {
                                    $cond: [
                                        { $eq: ["$isRead", false] }, 1, 0
                                    ]
                                }
                            }
                        }
                    },
                    ],
                    as: "chatoperations_details"
                }
            },
            {
                $unwind: {
                    path: '$chatoperations_details',
                    preserveNullAndEmptyArrays: true
                }
            },
            // ----------- unread message count --------------//
        ];

        let projection = {
            $project: {
                isGroupChat: "$isGroupChat",
                room_id: "$room_id",
                room_name: "$room_id_details.name",
                user_id: "$user_id",
                last_message: "$messages_details",
                last_message_at: "$messages_details.createdAt",
                room_members: "$room_members_details",
                unread_count: "$chatoperations_details.unread_count",
                read_count: "$chatoperations_details.read_count",
                property_id: "$property_id",
                property_details: "$property_details"
                // chatoperations_details
            }
        }
        pipeline.push(projection);
        pipeline.push({
            $match: query
        });
        pipeline.push({
            $sort: sortquery
        });

        let totalResult = await db.roommembers.aggregate(pipeline);

        pipeline.push({
            $skip: Number(skipNo)
        });
        pipeline.push({
            $limit: Number(count)
        });

        let result = await db.roommembers.aggregate(pipeline);
        let resData = {
            total: totalResult ? totalResult.length : 0,
            data: result ? result : []
        }
        if (!req.query.page && !req.query.count) {
            resData.data = totalResult ? totalResult : []
        }
        return response.success(resData, constants.USER.RECENT_CHAT_FETCHED, req, res);

    } catch (error) {
        return response.failed(null, `${error}`, req, res);
    }
}

exports.getAllUnreadCounts = async (req, res, next) => {
    try {
        let { user_id } = req.query;
        if (!user_id) {
            throw constants.USER.USER_ID_REQUIRED;
        }

        let query = {
            type: "message",
            user_id: user_id,
            isRead: false,
            isDeleted: false
        }

        let get_count = await Services.message.get_unread_messages_count_with_user_id(query)
        let resData = {
            user_id: user_id,
            unread_count: get_count ? get_count : 0
        }
        return response.success(resData, constants.messages.FETCHED_ALL, req, res);
    } catch (error) {
        return response.failed(null, `${error}`, req, res);
    }
}


exports.getAllPropertyChats = async (req, res, next) => {
    try {
        let { user_id, room_id, search, property_id, sortBy, login_user_id } = req.query;
        let page = req.query.page || 1;
        let count = req.query.count || 10;
        let skipNo = (Number(page) - 1) * Number(count);
        let query = {};

        if (search) {
            query.$or = [
                { content: { $regex: search, '$options': 'i' } },
                { "room_members.user_name": { $regex: search, '$options': 'i' } },
            ]
        }

        let sortquery = {};
        if (sortBy) {
            let typeArr = [];
            typeArr = sortBy.split(" ");
            let sortType = typeArr[1];
            let field = typeArr[0];
            sortquery[field ? field : 'createdAt'] = sortType ? (sortType == 'desc' ? -1 : 1) : -1;
        } else {
            // sortquery = { last_message_at: -1 }
            sortquery = { property_chatSorting: -1 }
        }

        if (user_id) {
            user_id = new mongoose.Types.ObjectId(user_id);
            query.user_id = user_id;
        }

        if (room_id) {
            query.room_id = new mongoose.Types.ObjectId(room_id);
        }

        if (login_user_id) {
            login_user_id = new mongoose.Types.ObjectId(login_user_id);
        }
        if (property_id) {
            property_id = new mongoose.Types.ObjectId(property_id);
        }
        let pipeline = [
            {
                $lookup: {
                    from: "rooms",
                    localField: "room_id",
                    foreignField: "_id",
                    as: "room_id_details"
                }
            },
            {
                $unwind: {
                    path: '$room_id_details',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: "properties",
                    localField: "property_id",
                    foreignField: "_id",
                    as: "property_details"
                }
            },
            {
                $unwind: {
                    path: '$property_details',
                    preserveNullAndEmptyArrays: true
                }
            },
            // ----------- Last message details --------------//

            {
                $lookup: {
                    from: "messages",
                    let: { room_id: "$room_id" },
                    pipeline: [{
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ["$room_id", "$$room_id"] },
                                ]
                            }
                        }
                    },
                    {
                        $lookup: {
                            from: "chatcommonoperations",
                            let: { user_id: login_user_id, property_id: "$property_id" },
                            pipeline: [{
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ["$user_id", "$$user_id"] },
                                            { $eq: ["$property_id", "$$property_id"] },
                                        ]
                                    }
                                }
                            }],
                            as: "deleted_message_details"
                        }
                    },
                    {
                        $unwind: {
                            path: '$deleted_message_details',
                            preserveNullAndEmptyArrays: true
                        }
                    },
                    {
                        $addFields: {
                            isDeleted: {
                                $cond: [{ $ifNull: ['$deleted_message_details', false] }, "$deleted_message_details.isDeleted", false]
                            },
                        }
                    },
                    {
                        $unset: ["deleted_message_details"]
                    },
                    {
                        $match: {
                            isDeleted: false,
                        }
                    },
                    {
                        $sort: { createdAt: -1 }
                    },
                    {
                        $limit: 1
                    }
                    ],
                    as: "messages_details"
                }
            },
            {
                $unwind: {
                    path: '$messages_details',
                    preserveNullAndEmptyArrays: true
                }
            },
            // ----------- Last message details --------------//



            // ----------- unread message count --------------//
            {
                $lookup: {
                    from: "messages",
                    let: { room_id: "$room_id", property_id: property_id },
                    pipeline: [{
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ["$room_id", "$$room_id"] },
                                    { $ne: ["$property_id", "$$property_id"] },
                                ]
                            }
                        }
                    },
                    {
                        $lookup: {
                            from: "chatcommonoperations",
                            let: { message_id: "$_id", user_id: login_user_id, type: "message" },
                            pipeline: [{
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ["$message_id", "$$message_id"] },
                                            { $eq: ["$type", "$$type"] },
                                            { $eq: ["$user_id", "$$user_id"] },
                                        ]
                                    }
                                }
                            }],
                            as: "chatcommonoperations_details"
                        }
                    },
                    {
                        $unwind: {
                            path: '$chatcommonoperations_details',
                            preserveNullAndEmptyArrays: true
                        }
                    },
                    {
                        $project: {
                            isRead: "$chatcommonoperations_details.isRead",
                            isDeleted: "$chatcommonoperations_details.isDeleted",
                        }
                    },
                    {
                        $match: {
                            isDeleted: false,
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            read_count: {
                                $sum: {
                                    $cond: [
                                        { $eq: ["$isRead", true] }, 1, 0
                                    ]
                                }
                            },
                            unread_count: {
                                $sum: {
                                    $cond: [
                                        { $eq: ["$isRead", false] }, 1, 0
                                    ]
                                }
                            }
                        }
                    },
                    ],
                    as: "chatoperations_details"
                }
            },
            {
                $unwind: {
                    path: '$chatoperations_details',
                    preserveNullAndEmptyArrays: true
                }
            }, {

                $project: {
                    isGroupChat: "$isGroupChat",
                    room_id: "$room_id",
                    room_name: "$room_id_details.name",
                    user_id: "$user_id",
                    last_message: "$messages_details",
                    last_message_at: "$messages_details.createdAt",
                    room_members: "$room_members_details",
                    unread_count: "$chatoperations_details.unread_count",
                    read_count: "$chatoperations_details.read_count",
                    property_id: "$property_id",
                    property_name: "$property_details.name",
                    property_images: "$property_details.images",
                    property_address: "$property_details.address",
                    propertyType: "$property_details.propertyType",
                    content: "$property_details.content",
                    propertyTitle: "$property_details.propertyTitle",
                    property_addedby: "$property_details.addedBy",
                    property_chatSorting: "$property_details.chatSorting"
                }
            },
            {
                $match: query,

            }

            // ----------- unread message count --------------//
        ];
        let group_stage = {
            $group: {
                _id: "$property_id",
                isGroupChat: { $first: "$isGroupChat" },
                room_id: { $first: "$room_id" },
                room_name: { $first: "$room_name" },
                user_id: { $push: "$user_id" },
                last_message: { $first: "$last_message" },
                last_message_at: { $first: "$last_message_at" },
                room_members: { $first: "$room_members" },
                unread_count: { $first: "$unread_count" },
                read_count: { $first: "$read_count" },
                property_id: { $first: "$property_id" },
                property_name: { $first: "$property_name" },
                property_images: { $first: "$property_images" },
                property_address: { $first: "$property_address" },
                propertyType: { $first: "$propertyType" },
                content: { $first: "$content" },
                propertyTitle: { $first: "$propertyTitle" },
                property_addedby: { $first: "$property_addedby" },
                property_chatSorting: { $first: "$property_chatSorting" }
            }
        };
        let unread_count_group_stage = {
            $group: {
                _id: null,
                total_unread_count: { $sum: "$unread_count" },
                results: { $push: "$$ROOT" }
            }
        };
        // pipeline.push(projection);
        pipeline.push(group_stage);
        // pipeline.push({
        //     $match: query
        // });
        pipeline.push({
            $sort: sortquery
        });
        let totalUnreadCountResult = await db.roommembers.aggregate([...pipeline, unread_count_group_stage]);
        let totalUnreadCount = totalUnreadCountResult.length > 0 ? totalUnreadCountResult[0].total_unread_count : 0;
        let totalResult = await db.roommembers.aggregate(pipeline);
        pipeline.push({
            $skip: Number(skipNo)
        });
        pipeline.push({
            $limit: Number(count)
        });
        let result = await db.roommembers.aggregate(pipeline);
        let resData = {
            total: totalResult ? totalResult.length : 0,
            total_unread_count: totalUnreadCount,
            data: result ? result : []
        };
        if (!req.query.page && !req.query.count) {
            resData.data = totalResult ? totalResult : [];
        }
        return response.success(resData, constants.USER.RECENT_CHAT_FETCHED, req, res);
    } catch (error) {
        return response.failed(null, `${error}`, req, res);
    }
}


// exports.getAllRoomMembers = async (req, res, next) => {
//     try {
//         let { user_id, room_id, search, property_id, sortBy, isGroupChat, quickChat } = req.query;
//         let page = req.query.page || 1;
//         let count = req.query.count || 10;
//         let skipNo = (Number(page) - 1) * Number(count);
//         let query = {};

//         if (search) {
//             // search = await Services.Utils.remove_special_char_exept_underscores(search);
//             query.$or = [
//                 { subject: { $regex: search, '$options': 'i' } },
//                 { fullName: { $regex: search, '$options': 'i' } },
//                 { email: { $regex: search, '$options': 'i' } },
//             ]
//         }

//         let sortquery = {};
//         if (sortBy) {
//             let typeArr = [];
//             typeArr = sortBy.split(" ");
//             let sortType = typeArr[1];
//             let field = typeArr[0];
//             sortquery[field ? field : 'updatedAt'] = sortType ? (sortType == 'desc' ? -1 : 1) : -1;
//         } else {
//             sortquery = { updatedAt: -1 }
//         }

//         if (isGroupChat) {
//             if (isGroupChat === 'true') {
//                 isGroupChat = true;
//             } else {
//                 isGroupChat = false;
//             }
//             query.isGroupChat = isGroupChat;
//         } else {
//             query.isGroupChat = false;
//         }

//         if (quickChat == "true") {
//             query.quickChat = true
//         } else if (quickChat == "false") {
//             query.quickChat = false
//         }
//         if (user_id) {
//             query.user_id = new mongoose.Types.ObjectId(user_id);

//         }

//         if (room_id) {
//             query.room_id = new mongoose.Types.ObjectId(room_id);
//         }
//         if (property_id) {
//             query.property_id = new mongoose.Types.ObjectId(property_id);

//         }


//         let pipeline = [
//             {
//                 $lookup: {
//                     from: "users",
//                     localField: "user_id",
//                     foreignField: "_id",
//                     as: "user_id_details"
//                 }
//             },
//             {
//                 $unwind: {
//                     path: '$user_id_details',
//                     preserveNullAndEmptyArrays: true
//                 }
//             },
//             {
//                 $lookup: {
//                     from: "rooms",
//                     localField: "room_id",
//                     foreignField: "_id",
//                     as: "room_id_details"
//                 }
//             },
//             {
//                 $unwind: {
//                     path: '$room_id_details',
//                     preserveNullAndEmptyArrays: true
//                 }
//             },
//         ];

//         let projection = {
//             $project: {
//                 id: "$_id",
//                 isGroupChat: "$isGroupChat",
//                 room_id: "$room_id",
//                 room_details: "$room_id_details",
//                 subject: "$room_id_details.subject",
//                 user_id: "$user_id",
//                 user_details: "$user_id_details",
//                 fullName: "$user_id_details.fullName",
//                 email: "$user_id_details.email",
//                 isOnline: "$user_id_details.isOnline",
//                 quickChat: "$quickChat",
//                 admin_chat_count: "$admin_chat_count",
//                 user_chat_count: "$user_chat_count",
//                 createdAt: "$createdAt",
//                 updatedAt: "$updatedAt",
//                 property_id: "$property_id"
//             }
//         }

//         let grouped = {
//             $group: {
//                 _id: "$user_id_details._id",
//                 isGroupChat: { $first: "$isGroupChat" },
//                 room_id: { $push: "$room_id" },
//                 room_details: { $push: "$room_details" },
//                 user_id: { $first: "$user_id" },
//                 quickChat: { $first: "$quickChat" },
//                 fullName: { $first: "$fullName" },
//                 user_details: { $first: "$user_details" },
//                 user_chat_count: { $first: "$user_chat_count" },
//                 admin_chat_count: { $first: "$admin_chat_count" },
//                 issOnline: { $first: "$isOnline" },
//                 // admin_chat_count: {$first:"$admin_chat_count"},
//                 createdAt: { $first: "$createdAt" },
//                 updatedAt: { $first: "$updatedAt" },
//                 property_id: { $first: "$property_id" },
//             }
//         }

//         pipeline.push(projection);
//         pipeline.push({
//             $match: query
//         });
//         pipeline.push({
//             $sort: sortquery
//         });
//         pipeline.push(grouped);
//         pipeline.push({
//             $sort: sortquery
//         });
//         let totalResult = await db.roommembers.aggregate(pipeline);

//         pipeline.push({
//             $skip: Number(skipNo)
//         });
//         pipeline.push({
//             $limit: Number(count)
//         });

//         let result = await db.roommembers.aggregate(pipeline);


//         let resData = {
//             total: totalResult ? totalResult.length : 0,
//             data: result ? result : []
//         }
//         if (!req.query.page && !req.query.count) {

//             resData.data = totalResult ? totalResult : []
//         }
//         return response.success(resData, "Fetched all room members", req, res);

//     } catch (error) {
//         return response.failed(null, `${error}`, req, res);
//     }
// }
exports.getAllRoomMembers = async (req, res, next) => {
    try {
        let { user_id, room_id, search, property_id, login_user_id, sortBy, isGroupChat, quickChat } = req.query;
        let page = req.query.page || 1;
        let count = req.query.count || 10;
        let skipNo = (Number(page) - 1) * Number(count);
        let query = {};

        if (search) {
            query.$or = [
                { subject: { $regex: search, '$options': 'i' } },
                { fullName: { $regex: search, '$options': 'i' } },
                { email: { $regex: search, '$options': 'i' } },
            ]
        }

        let sortquery = {};
        if (sortBy) {
            let typeArr = sortBy.split(" ");
            let sortType = typeArr[1];
            let field = typeArr[0];
            sortquery[field ? field : 'updatedAt'] = sortType ? (sortType == 'desc' ? -1 : 1) : -1;
        } else {
            sortquery = { updatedAt: -1 }
        }

        if (isGroupChat) {
            isGroupChat = isGroupChat === 'true';
            query.isGroupChat = isGroupChat;
        }

        if (quickChat == "true") {
            query.quickChat = true;
        } else if (quickChat == "false") {
            query.quickChat = false;
        }

        if (user_id) {
            query.user_id = new mongoose.Types.ObjectId(user_id);
        }

        if (room_id) {
            query.room_id = new mongoose.Types.ObjectId(room_id);
        }

        if (property_id) {
            query.property_id = new mongoose.Types.ObjectId(property_id);
        }
        if (login_user_id) {
            login_user_id = new mongoose.Types.ObjectId(login_user_id);
        }

        let pipeline = [
            {
                $lookup: {
                    from: "users",
                    localField: "user_id",
                    foreignField: "_id",
                    as: "user_id_details"
                }
            },
            {
                $unwind: {
                    path: '$user_id_details',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: "rooms",
                    localField: "room_id",
                    foreignField: "_id",
                    as: "room_id_details"
                }
            },
            {
                $unwind: {
                    path: '$room_id_details',
                    preserveNullAndEmptyArrays: true
                }
            },

            {
                $lookup: {
                    from: "messages",
                    let: { room_id: "$room_id" },
                    pipeline: [{
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ["$room_id", "$$room_id"] },
                                ]
                            }
                        }
                    },
                    {
                        $lookup: {
                            from: "chatcommonoperations",
                            let: { message_id: "$_id", user_id: login_user_id, type: "message" },
                            pipeline: [{
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ["$message_id", "$$message_id"] },
                                            { $eq: ["$user_id", "$$user_id"] },
                                            { $eq: ["$type", "$$type"] },
                                        ]
                                    }
                                }
                            }],
                            as: "deleted_message_details"
                        }
                    },
                    {
                        $unwind: {
                            path: '$deleted_message_details',
                            preserveNullAndEmptyArrays: true
                        }
                    },
                    {
                        $addFields: {
                            isDeleted: {
                                $cond: [{ $ifNull: ['$deleted_message_details', false] }, "$deleted_message_details.isDeleted", false]
                            },
                        }
                    },
                    {
                        $unset: ["deleted_message_details"]
                    },
                    {
                        $match: {
                            isDeleted: false,
                        }
                    },
                    {
                        $sort: { createdAt: -1 }
                    },
                    {
                        $limit: 1
                    }
                    ],
                    as: "messages_details"
                }
            },
            {
                $unwind: {
                    path: '$messages_details',
                    preserveNullAndEmptyArrays: true
                }
            },
            // ----------- Last message details --------------//

            {
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
                    isOnline: "$user_id_details.isOnline",
                    quickChat: "$quickChat",
                    admin_chat_count: "$admin_chat_count",
                    user_chat_count: "$user_chat_count",
                    createdAt: "$createdAt",
                    updatedAt: "$updatedAt",
                    property_id: "$property_id",
                    messages_details: "$messages_details"
                },
            },
            {
                $match: query
            }
        ];

        let grouped = {
            $group: {
                _id: "$user_id",
                isGroupChat: { $first: "$isGroupChat" },
                room_id: { $push: "$room_id" },
                room_details: { $push: "$room_details" },
                user_id: { $first: "$user_id" },
                fullName: { $first: "$fullName" },
                user_details: { $first: "$user_details" },
                user_chat_count: { $sum: "$user_chat_count" },
                admin_chat_count: { $first: "$admin_chat_count" },
                isOnline: { $first: "$isOnline" },
                createdAt: { $first: "$createdAt" },
                updatedAt: { $first: "$updatedAt" },
                property_id: { $first: "$property_id" },
                messages_details: { $first: "$messages_details" },
            }
        };

        pipeline.push(grouped);
        pipeline.push({ $sort: sortquery });
        let totalResult = await db.roommembers.aggregate(pipeline);
        pipeline.push({ $skip: Number(skipNo) });
        pipeline.push({ $limit: Number(count) });
        let result = await db.roommembers.aggregate(pipeline);

        let resData = {
            total: totalResult ? totalResult.length : 0,
            data: result ? result : []
        };

        if (!req.query.page && !req.query.count) {
            resData.data = totalResult ? totalResult : [];
        }

        return response.success(resData, "Fetched all room members", req, res);

    } catch (error) {
        return response.failed(null, `${error}`, req, res);
    }
};
