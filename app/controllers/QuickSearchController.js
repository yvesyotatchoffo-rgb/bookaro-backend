const db = require("../models");
let mongoose = require("mongoose");
const constants = require("../utls/constants");
const { listing, detail } = require("./CategoriesController");
const { success } = require("../services/Response");
const { message } = require("../services");
const { json } = require("express");
// const quickSearch = require('../models/quickSearch')(mongoose);

// Create a new QuickSearch
module.exports = {
    create: async (req, res) => {
        const { propertyType, city, type } = req.body;
        try {
            let lcity = city.toLowerCase()
            const newQuickSearch = new db.quickSearch({
                propertyType,
                city: lcity,
                type,
            });

            const savedQuickSearch = await newQuickSearch.save();
            res.status(201).json({
                success: true,
                message: "Data Saved Succesfully",
                // data: savedQuickSearch
            });
        } catch (err) {
            console.log("error", err);
            return res.status(400).json({
                success: false,
                message: "Error Creating.",
                error: err.message,
            })
        }
    },
    update: async (req, res) => {
        // const { id } = req.params;
        const { id, propertyType, city, type } = req.body;
        try {
            let lcity;
            if (city) {
                lcity = city.toLowerCase()
            }
            const updatedQuickSearch = await db.quickSearch.findByIdAndUpdate(
                id,
                { propertyType, city: lcity, type },
                { new: true }
            );
            if (!updatedQuickSearch) {
                return res.status(404).json({
                    success: false,
                    message: 'QuickSearch not found'
                });
            }
            res.status(201).json({
                success: true,
                message: "Data updated  Succesfully",
                // data: savedQuickSearch
            });
        } catch (err) {
            return res.status(400).json({
                success: false,
                message: "Error Updating.",
                error: err.message,
            })
        }
    },
    delete: async (req, res) => {
        const { id } = req.query;
        try {
            const deletedQuickSearch = await db.quickSearch.updateOne({ _id: id }, { isDeleted: true })
            if (!deletedQuickSearch) {
                return res.status(404).json({
                    success: false,
                    message: 'QuickSearch not found'
                });
            }
            res.status(200).json({
                success: true,
                message: 'QuickSearch deleted successfully'
            });
        } catch (err) {
            return res.status(400).json({
                success: false,
                message: "Error fetching list",
                error: err.message,
            })
        }
    },
    listing: async (req, res) => {
        try {
            const { page = 1, count = 10, sortBy = 'updatedAt', order = 'desc', propertyType, type } = req.query;

            let filter = {};
            filter.isDeleted = false;
            if (propertyType) {
                filter.propertyType = propertyType;
            }
            if(type) {
                filter.type = type;
            }
            const quickSearches = await db.quickSearch.find(filter)
                .sort({ [sortBy]: order === 'desc' ? -1 : 1 })
                .skip((page - 1) * count)
                .limit(parseInt(count));

            const total = await db.quickSearch.countDocuments(filter);

            res.status(200).json({
                success: true,
                total,
                page: parseInt(page),
                limit: parseInt(count),
                data: quickSearches
            });
        }
        catch (err) {
            return res.status(400).json({
                success: false,
                message: "Error fetching list",
                error: err.message,
            });
        }
    },
    detail: async (req, res) => {
        try {
            const id = req.query.id;
            const user = await db.quickSearch.findOne({ _id: id, isDeleted: false });
            if (!user) {
                return req.status(400).json({
                    success: false,
                    message: "Record doesn't exists."
                })
            }
            return res.status(200).json({
                success: true,
                message: "Data Fetched Successfully",
                data: user,
            })
        }
        catch {
            return res.status(400).json({
                success: false,
                message: "Failed to fetch details."
            })
        }
    }
}
