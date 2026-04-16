const db = require("../models");
const { handleServerError } = require("../utls/helper");
// const helper = require("../helpers/helper");

module.exports = {
    addDreamHomeForm: async (req, res) => {
        try {
            const {
                firstName,
                lastName,
                phoneNumber,
                emailAddress,
                whenWouldYouLikeToBuy,
                inWhichCityAreYouLooking,
                whatTypeOfPropertyAreYouLookingFor,
                whatIsYourBudgetRange,
                categoryId
            } = req.body;

            if (
                !firstName ||
                !lastName ||
                // !phoneNumber ||
                !emailAddress ||
                // !whenWouldYouLikeToBuy ||
                // !inWhichCityAreYouLooking ||
                // !whatTypeOfPropertyAreYouLookingFor ||
                // !whatIsYourBudgetRange ||
                !categoryId
            ) {
                return res.status(400).json({
                    success: false,
                    message: "All fields are required.",
                });
            }

            // const existingForm = await db.form.findOne({
            //     firstName,
            //     lastName,
            //     phoneNumber,
            //     emailAddress,
            //     whenToBuy: whenWouldYouLikeToBuy,
            //     cityLooking: inWhichCityAreYouLooking,
            //     propertyType: whatTypeOfPropertyAreYouLookingFor,
            //     budgetRange: whatIsYourBudgetRange,
            //     isDeleted: false
            // });

            // if (existingForm) {
            //     return res.status(400).json({
            //         success: false,
            //         message: "This form has already been submitted.",
            //     });
            // }

            const formData = {
                firstName,
                lastName,
                phoneNumber,
                emailAddress,
                whenToBuy: whenWouldYouLikeToBuy,
                cityLooking: inWhichCityAreYouLooking,
                propertyType: whatTypeOfPropertyAreYouLookingFor,
                budgetRange: whatIsYourBudgetRange,
                addedBy: req.identity?.id || null,
                categoryId,
            };

            await db.form.create(formData);

            return res.status(200).json({
                success: true,
                message: "Your dream home form has been submitted successfully!",
            });
        } catch (err) {
            console.error("Error in addDreamHomeForm:", err);
            return res.status(500).json({
                success: false,
                error: {
                    code: 500,
                    message: err.message || "Internal server error",
                },
            });
        }
    },


    // addWantToSellForm: async (req, res) => {
    //     try {
    //         const {
    //             firstName,
    //             lastName,
    //             phoneNumber,
    //             emailAddress,
    //             whenWouldYouLikeToSell,
    //             whereIsYourPropertyLocated,
    //             selectTypeOfProperty,
    //         } = req.body;

    //         if (
    //             !firstName ||
    //             !lastName ||
    //             !phoneNumber ||
    //             !emailAddress ||
    //             !whenWouldYouLikeToSell ||
    //             !whereIsYourPropertyLocated ||
    //             !selectTypeOfProperty
    //         ) {
    //             return res.status(400).json({
    //                 success: false,
    //                 message: "All fields are required.",
    //             });
    //         }

    //         // const existingForm = await db.form.findOne({
    //         //     firstName,
    //         //     lastName,
    //         //     phoneNumber,
    //         //     emailAddress,
    //         //     whenToSell: whenWouldYouLikeToSell,
    //         //     propertyLocation: whereIsYourPropertyLocated,
    //         //     propertyType: selectTypeOfProperty,
    //         //     isDeleted: false
    //         // });

    //         // if (existingForm) {
    //         //     return res.status(400).json({
    //         //         success: false,
    //         //         message: "This form has already been submitted.",
    //         //     });
    //         // }

    //         const formData = {
    //             firstName,
    //             lastName,
    //             phoneNumber,
    //             emailAddress,
    //             whenToSell: whenWouldYouLikeToSell,
    //             propertyLocation: whereIsYourPropertyLocated,
    //             propertyType: selectTypeOfProperty,
    //             addedBy: req.identity?.id || null,
    //         };

    //         await db.form.create(formData);

    //         return res.status(200).json({
    //             success: true,
    //             message: "Your 'Want to Sell' form has been submitted successfully!",
    //         });
    //     } catch (err) {
    //         console.error("Error in addWantToSellForm:", err);
    //         return res.status(500).json({
    //             success: false,
    //             error: {
    //                 code: 500,
    //                 message: err.message || "Internal server error",
    //             },
    //         });
    //     }
    // },

    FormListing: async (req, res) => {
        try {
            const { categoryId, search, page = 1, limit = 10 } = req.query;

            const filters = { isDeleted: false };

            if (categoryId) {
                filters.categoryId = categoryId;
            }

            if (search) {
                filters.firstName = { $regex: search, $options: "i" };
            }

            const skip = (parseInt(page) - 1) * parseInt(limit);

            const [forms, total] = await Promise.all([
                db.form
                    .find(filters)
                    .skip(skip)
                    .limit(parseInt(limit))
                    .sort({ createdAt: -1 })
                    .populate('categoryId'),
                db.form.countDocuments(filters),
            ]);

            res.json({
                success: true,
                message: "Forms fetched successfully",
                data: forms,
                total,
            });
        } catch (error) {
            return handleServerError(res, error, "Form Listing")
        }
    },

    FormDetails: async (req, res) => {
        try {
            const { id } = req.query;

            if (!id) {
                return res.status(400).json({
                    success: false,
                    message: "Id required"
                })
            }

            const form = await db.form.findOne({ _id: id, isDeleted: false }).populate('categoryId');

            if (!form) {
                return res.status(404).json({ success: false, message: "Form not found" });
            }

            res.json({ success: true, data: form });
        } catch (error) {
            return handleServerError(res, error, "Form Details")
        }
    }
};
