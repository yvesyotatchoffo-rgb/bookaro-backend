const db = require("../models");

module.exports = {

  add: async (req, res) => {
    try {
      const { name, email, message } = req.body;

      if (!name || !email) {
        return res.status(400).json({
          success: false,
          message: "Name and email are required",
        });
      }

      // const userExist = await db.users.findOne({
      //   email: email,
      //   isDeleted: false,
      // }).lean();

      // if (!userExist) {
      //   return res.status(400).json({
      //     success: false,
      //     message: "User with this email does not exist",
      //   });
      // }

      await db.supports.create({
        name,
        email,
        message,
        // addedBy: userExist._id,
      });

      return res.status(200).json({
        success: true,
        message: "Support request submitted successfully",
      });

    } catch (err) {
      return res.status(500).json({
        success: false,
        message: err.message || "Internal server error",
      });
    }
  },

  list: async (req, res) => {
    try {
      const { search, page, count, status, sortBy } = req.query;

      let query = { isDeleted: false };

      if (status) {
        query.status = status;
      }

      if (search) {
        query.$or = [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ];
      }

      let sortQuery = {};
      if (sortBy) {
        const order = sortBy.split(" ");
        sortQuery[order[0]] = order[1] === "asc" ? 1 : -1;
      } else {
        sortQuery.createdAt = -1;
      }

      const pipeline = [
        { $match: query },
        { $sort: sortQuery },
        {
          $project: {
            id: "$_id",
            name: 1,
            email: 1,
            message: 1,
            status: 1,
            createdAt: 1,
            updatedAt: 1,
          },
        },
      ];

      const total = await db.supports.aggregate(pipeline);

      if (page && count) {
        const skip = (Number(page) - 1) * Number(count);
        pipeline.push(
          { $skip: skip },
          { $limit: Number(count) }
        );
      }

      const result = await db.supports.aggregate(pipeline);

      return res.status(200).json({
        success: true,
        data: result,
        total: total.length,
      });

    } catch (err) {
      return res.status(500).json({
        success: false,
        message: err.message || "Internal server error",
      });
    }
  },

  delete: async (req, res) => {
    try {
      const { id } = req.query;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: "Support id is required",
        });
      }

      await db.supports.updateOne(
        { _id: id },
        { isDeleted: true }
      );

      return res.status(200).json({
        success: true,
        message: "Support request deleted successfully",
      });

    } catch (err) {
      return res.status(500).json({
        success: false,
        message: err.message || "Internal server error",
      });
    }
  },

};
