const { sumBy } = require("lodash");
const db = require("../models");
const agencyReviewsModel = require("../models/agencyReviews.model");
const usersModel = require("../models/users.model");
const { handleServerError } = require("../utls/helper");

module.exports = {
  createReview: async (req, res) => {
    try {
      const { comment, stars, source, reviewerName, agencyId } = req.body;
      let addedBy = req.identity.id;
      if (!agencyId || !stars || !comment || !source || !reviewerName) {
        return res.status(400).json({
          success: false,
          message: "Payload Missing."
        });
      }
      const findAgency = await db.users.findById(agencyId);
      if (findAgency.accountType !== "pro" && findAgency.role !== "agency") {
        return res.status(400).json({
          success: false,
          message: "Only agencies can be reviewed."
        });
      }

      const savedReview = await db.agencyReviews.create({
        comment,
        stars,
        source,
        reviewerName,
        agencyId,
        addedBy,
      });
      return res.status(201).json({
        success: true,
        savedReview
      });
    } catch (error) {
      return handleServerError(res, error, "Adding agency review")
    }
  },

  getReviews: async (req, res) => {
    try {
      let { page = 1, limit = 10, search = "", agencyId } = req.query;
      page = parseInt(page);
      limit = parseInt(limit);

      const query = { isDeleted: false };

      if (agencyId) query.agencyId = agencyId;
      if (search) {
        query.$or = [
          { reviewerName: { $regex: search, $options: "i" } },
        ];
      }

      const reviews = await db.agencyReviews.find(query)
        .populate("agencyId", "fullName companyName email")
        .populate("addedBy", "fullName email")
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ createdAt: -1 });

      const total = await db.agencyReviews.countDocuments(query);

      return res.status(200).json({
        success: true,
        data: reviews,
        total,
      });
    } catch (error) {
      return handleServerError(res, error, "Listing of agency review")
    }
  },

  getReviewById: async (req, res) => {
    try {
      if (!req.query.id) {
        return res.status(400).json({
          success: false,
          message: "Id required."
        });
      }
      const review = await db.agencyReviews.findById(req.query.id)
        .populate("agencyId", "fullName companyName email")
        .populate("addedBy", "fullName email")
      if (!review || review.isDeleted) {
        return res.status(404).json({
          success: false,
          message: "Review not found"
        });
      }
      return res.status(200).json({
        success: true,
        review
      });
    } catch (error) {
      return handleServerError(res, error, "agency review detail")
    }
  },

  updateReview: async (req, res) => {
    try {
      if (!req.query.id) {
        return res.status(400).json({
          success: false,
          message: "Id required."
        });
      }
      const { comment, stars, source, reviewerName } = req.body;

      const review = await db.agencyReviews.findById(req.query.id);
      if (!review || review.isDeleted) {
        return res.status(404).json({
          success: false,
          message: "Review not found"
        });
      }

      if (comment !== undefined) review.comment = comment;
      if (stars !== undefined) review.stars = stars;
      if (source !== undefined) review.source = source;
      if (reviewerName !== undefined) review.reviewerName = reviewerName;

      const updatedReview = await review.save();
      return res.status(200).json({
        success: true,
        updatedReview
      });
    } catch (error) {
      return handleServerError(res, error, "agency review updated")
    }
  },

  deleteReview: async (req, res) => {
    try {
      if (!req.query.id) {
        return res.status(400).json({
          success: false,
          message: "Id required."
        });
      }
      const review = await db.agencyReviews.findById(req.query.id);
      if (!review || review.isDeleted) {
        return res.status(404).json({ message: "Review not found" });
      }

      review.isDeleted = true;
      await review.save();

      return res.status(200).json({
        success: true,
        message: "Review deleted successfully"
      });
    } catch (error) {
      return handleServerError(res, error, "agency review deteteds")
    }
  }
}