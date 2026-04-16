let mongoose = require("mongoose");
const db = require("../models");
const constants = require("../utls/constants");
const { listing, detail } = require("./CategoriesController");
const { success } = require("../services/Response");
const { message } = require("../services");
const { json } = require("express");
const Report = require("../models/reports.model");
const User = require("../models/users.model");
module.exports = {
    add: async (req, res) => {
        try {
            const { reason, addedBy, reportTo } = req.body;
            if (!addedBy && !reason && !reportTo) {
                return res.status(400).json({
                    success: false,
                    message: "Payload Missing.",
                })
            }
            let data = req.body;

            const existingReport = await db.reports.findOne({
                addedBy: new mongoose.Types.ObjectId(addedBy),
                reportTo: new mongoose.Types.ObjectId(reportTo),
                isDeleted: false,
            });

            if (existingReport) {
                return res.status(400).json({
                    success: false,
                    message: "You have already reported this user. Please wait for confirmation.",
                });
            }

            let newReport = await db.reports.create(data);
            res.status(200).json({
                success: true,
                message: "User reported succesfully.",
                data: newReport
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },
    detail: async (req, res) => {
        try {
            let _id = req.query.id;
            const report = await db.reports.findById(_id).populate("addedBy reportTo", "fullName email username");
            if (!report) {
                return res.status(404).json({
                    success: false,
                    message: "Report not found"
                });
            }
            return res.status(200).json({
                success: true,
                data: report
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Report details fetched succesfully.",
                message: error.message
            });
        }
    },
    delete: async (req, res) => {
        try {
            let id = req.query.id;
            const report = await db.reports.findByIdAndUpdate(
                id,
                { isDeleted: true },
                { new: true }
            );

            if (!report) {
                return res.status(404).json({ success: false, message: "Report not found" });
            }

            return res.status(200).json({
                success: true,
                message: "Report deleted successfully"
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },
    list: async (req, res) => {
        try {
            const { search, reasonType, addedBy, page = 1, count = 10 } = req.query;

            let query = { isDeleted: false };

            if (search) {
                query.reason = { $regex: search, $options: 'i' };
            }

            // if (reasonType) {
            //     query.reasonType = reasonType;
            // }

            if (addedBy) {
                query.addedBy = mongoose.Types.ObjectId(addedBy);
            }

            const skipNo = (page - 1) * count;

            const total = await db.reports.countDocuments(query);
            const reports = await db.reports.find(query).populate("addedBy reportTo", "fullName")
                .skip(skipNo)
                .limit(Number(count))
                .sort({ createdAt: -1 });

            res.status(200).json({
                success: true,
                total,
                // page: Number(page),
                // count: Number(count),
                data: reports,
            });
        } catch (err) {
            res.status(400).json({
                success: false,
                error: err.message,
            })
        }
    },
    blockUser: async (req, res) => {
        try {
            let { status, id } = req.query;
    
            if (!id || !status) {
                return res.status(400).json({
                    success: false,
                    message: "Payload Missing.",
                });
            }
    
            const report = await db.reports.findById(new mongoose.Types.ObjectId(id));
            if (!report) {
                return res.status(404).json({
                    success: false,
                    message: "Report not found.",
                });
            }
    
            const reportToId = report.reportTo;
            let update = {};
    
            if (status === "accepted") {
                update.isBlocked = true;
            }
    
            let user;
            if (status === "accepted") {
                // Block the user
                user = await db.users.findByIdAndUpdate(
                    new mongoose.Types.ObjectId(reportToId),
                    update,
                    { new: true }
                );
    
                if (!user) {
                    return res.status(404).json({
                        success: false,
                        message: "User not found.",
                    });
                }
            }
    
            // ✅ Update report status (Accepted or Rejected)
            report.status = status === "accepted" ? "accepted" : "rejected";
            await report.save();
    
            return res.status(200).json({
                success: true,
                message: status === "accepted"
                    ? "User blocked, and report status updated to accepted."
                    : "Report status updated to rejected.",
                data: { report, user: status === "accepted" ? user : null },
            });
    
        }
        catch (err) {
            return res.status(400).json({
                success: false,
                error: err.message,
            });
        }
    }
    ,
    update: async (req, res) => {
        try {
            const { reason, id, reasonType } = req.body;
            if (!id) {
                return res.status(400).json({
                    success: false,
                    message: "Payload missing."
                })
            }
            const report = await db.reports.findByIdAndUpdate(
                { _id: id },
                { reason, reasonType },
                { new: true }
            );

            if (!report) {
                return res.status(404).json({ success: false, message: "Report not found" });
            }

            return res.status(200).json({
                success: true,
                message: "Report updated succesfully.",
                data: report
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },
}