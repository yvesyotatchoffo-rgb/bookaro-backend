const db = require("../models");
const services = require("../services");
const { message } = require("../services");
const { success } = require("../services/Response");
const constants = require("../utls/constants");
var mongoose = require("mongoose");
const { ObjectId } = require("mongoose").Types;

module.exports = {
    userMetrics: async (req, res) => {
        try {
            let { interval, prevInterval } = req.query;
            // query.isDeleted = false;

            let start, end, prevDayStart, prevDayEnd;

            if (interval === "daily") {
                start = new Date();
                start.setHours(0, 0, 0, 0);

                end = new Date();
                end.setHours(23, 59, 59, 999);
            } else if (interval === "monthly") {
                start = new Date();
                start.setDate(1);
                start.setHours(0, 0, 0, 0);

                end = new Date();
                end.setMonth(end.getMonth() + 1);
                end.setDate(0);
                end.setHours(23, 59, 59, 999);
            } else if (interval === "yearly") {
                start = new Date();
                start.setMonth(0);
                start.setDate(1);
                start.setHours(0, 0, 0, 0);

                end = new Date();
                end.setMonth(11);
                end.setDate(31);
                end.setHours(23, 59, 59, 999);
            }

            if (prevInterval === "lastDay") {
                prevDayStart = new Date();
                prevDayStart.setDate(prevDayStart.getDate() - 1);
                prevDayStart.setHours(0, 0, 0, 0);

                prevDayEnd = new Date();
                prevDayEnd.setDate(prevDayEnd.getDate() - 1);
                prevDayEnd.setHours(23, 59, 59, 999);
            } else if (prevInterval === "lastMonth") {
                prevDayStart = new Date();
                prevDayStart.setMonth(prevDayStart.getMonth() - 1);
                prevDayStart.setDate(1);
                prevDayStart.setHours(0, 0, 0, 0);

                prevDayEnd = new Date(prevDayStart);
                prevDayEnd.setMonth(prevDayEnd.getMonth() + 1);
                prevDayEnd.setDate(0);
                prevDayEnd.setHours(23, 59, 59, 999);
            } else if (prevInterval === "lastYear") {
                prevDayStart = new Date();
                prevDayStart.setFullYear(prevDayStart.getFullYear() - 1);
                prevDayStart.setMonth(0);
                prevDayStart.setDate(1);
                prevDayStart.setHours(0, 0, 0, 0);

                prevDayEnd = new Date(prevDayStart);
                prevDayEnd.setFullYear(prevDayEnd.getFullYear() + 1);
                prevDayEnd.setMonth(0);
                prevDayEnd.setDate(0);
                prevDayEnd.setHours(23, 59, 59, 999);
            }

            const newUsers = await db.users.countDocuments({
                isDeleted: false,
                isBlocked: false,
                createdAt: { $gte: start, $lt: end }
            })
            const totalUsers = await db.users.countDocuments({
                createdAt: { $gte: start, $lt: end }
            });
            const lostUsers = await db.users.countDocuments({
                isDeleted: false,
                isBlocked: false,
                updatedAt: { $gte: prevDayStart, $lt: prevDayEnd }
            });
            return res.status(400).json({
                success: false,
                message: "Data Fetched.",
                Data: {
                    totalUsersJoined: totalUsers,
                    newUsersJoined: newUsers,
                    lostUsers: lostUsers
                }
            })
        }
        catch (err) {
            return res.status(400).json({
                success: false,
                message: "Failed to load Analytics",
                error: err.message

            })
        }
    },

    propertyMetrics: async (req, res) => {
        try {
            let { interval, prevInterval, type, propertyType } = req.query;
            let start, end, prevDayStart, prevDayEnd;

            if (interval === "daily") {
                start = new Date();
                start.setHours(0, 0, 0, 0);

                end = new Date();
                end.setHours(23, 59, 59, 999);
            } else if (interval === "monthly") {
                start = new Date();
                start.setDate(1);
                start.setHours(0, 0, 0, 0);

                end = new Date(start);
                end.setMonth(end.getMonth() + 1);
                end.setDate(0);
                end.setHours(23, 59, 59, 999);
            } else if (interval === "yearly") {
                start = new Date();
                start.setMonth(0);
                start.setDate(1);
                start.setHours(0, 0, 0, 0);

                end = new Date();
                end.setMonth(11);
                end.setDate(31);
                end.setHours(23, 59, 59, 999);
            }

            if (prevInterval === "lastDay") {
                prevDayStart = new Date();
                prevDayStart.setDate(prevDayStart.getDate() - 1);
                prevDayStart.setHours(0, 0, 0, 0);

                prevDayEnd = new Date();
                prevDayEnd.setDate(prevDayEnd.getDate() - 1);
                prevDayEnd.setHours(23, 59, 59, 999);
            } else if (prevInterval === "lastMonth") {
                prevDayStart = new Date();
                prevDayStart.setMonth(prevDayStart.getMonth() - 1);
                prevDayStart.setDate(1);
                prevDayStart.setHours(0, 0, 0, 0);

                prevDayEnd = new Date(prevDayStart);
                prevDayEnd.setMonth(prevDayEnd.getMonth() + 1);
                prevDayEnd.setDate(0);
                prevDayEnd.setHours(23, 59, 59, 999);
            } else if (prevInterval === "lastYear") {
                prevDayStart = new Date();
                prevDayStart.setFullYear(prevDayStart.getFullYear() - 1);
                prevDayStart.setMonth(0);
                prevDayStart.setDate(1);
                prevDayStart.setHours(0, 0, 0, 0);

                prevDayEnd = new Date(prevDayStart);
                prevDayEnd.setFullYear(prevDayEnd.getFullYear() + 1);
                prevDayEnd.setMonth(0);
                prevDayEnd.setDate(0);
                prevDayEnd.setHours(23, 59, 59, 999);
            }

            const newProperties = await db.property.countDocuments({
                isDeleted: false,
                createdAt: { $gte: start, $lt: end }
            });
            
            const totalProperties = await db.property.countDocuments({
                createdAt: { $gte: start, $lt: end }
            });
            
            const lostProperties = await db.property.countDocuments({
                isDeleted: false,
                updatedAt: { $lt: prevDayStart }
            });

            const numberOfPropertyType = await db.property.countDocuments({
                isDeleted: false,
                propertyType: propertyType
            })
            const numberOfPropertyPerType = await db.property.countDocuments({
                isDeleted: false,
                type: type
            })
            
            return res.status(200).json({
                success: true,
                message: "Data Fetched.",
                data: {
                    totalPropertiesAdded: totalProperties,
                    newPropertiesAdded: newProperties,
                    lostProperties: lostProperties,
                    numberOfPropertyType,
                    numberOfPropertyPerType
                }
            });
        }
        catch (err) {
            return res.status(400).json({
                success: false,
                message: "Failed to load Analytics",
                error: err.message
            })
        }
    }
}