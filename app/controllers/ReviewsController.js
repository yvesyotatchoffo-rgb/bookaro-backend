const db = require("../models");
const { message } = require("../services");
const { success } = require("../services/Response");

module.exports = {
    getPropertyReviews: async (req, res) => {
        try {
            let { propertyId, userId, interestId } = req.query;

            let query = { isDeleted: false };

            if (propertyId) query.propertyId = propertyId;
            if (userId) query.userId = userId;
            if (interestId) query.interestId = interestId;

            const getReviews = await db.reviews.find(query);
            if (!getReviews || getReviews.length === 0) {
                return res.status(200).json({
                    success: false,
                    message: "No reviews found",
                })
            }

            const findReviews = await db.reviews
                .find(query)
                .populate({ path: "userId", select: "fullName" })
                .populate({ path: "propertyId", select: "propertyTitle" })

            return res.status(200).json({
                success: true,
                message: "Reviews listed",
                data: findReviews,
                total: findReviews.length
            })
        }
        catch (err) {
            return res.status(400).json({
                success: false,
                message: "Failed to get reviews for the properties",
                error: err.message
            })
        }
    }
}