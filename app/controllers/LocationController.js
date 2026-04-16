const db = require("../models");
const location = db.location;
var mongoose = require("mongoose");

module.exports = {
    addlocation: async (req, res) => {
        try {
            let data = req.body;
            if (!data.user_id) {
                return res.status(400).json({
                    success: false,
                    message: "Payload is missing",
                });
            }
            if (data.lastSearch === true) {
                let locationData = await location.findOne({ user_id: data.user_id, lastSearch: true });
                if (locationData) {
                    const deletelocation = await location.deleteOne({ user_id: data.user_id, lastSearch: true });
                    const createlocation = await location.create(data);
                    return res.status(200).json({
                        success: true,
                        message: "Data added"
                    })
                } else {
                    const createlocation = await location.create(data);
                    return res.status(200).json({
                        success: true,
                        message: "Data added"
                    })
                }
            } else {
                const createlocation = await location.create(data);
                return res.status(200).json({
                    success: true,
                    message: "Data added"
                })
            }
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

    listing: async (req, res) => {
        try {
            const { search, page, count, user_id, sortBy, status, lastSearch } = req.query;
            var query = {};
            if (search) {
                query.$or = [
                    { location: { $regex: search, $options: "i" } },
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
            if (user_id) {
                query.user_id =new mongoose.Types.ObjectId(user_id);

            }
            if (lastSearch === "true") {
                query.lastSearch = true
            } else if (lastSearch === "false") {
                query.lastSearch = false
            }
            const pipeline = [
                {
                    $project: {
                        id: "$_id",
                        proposal: "$proposal",
                        user_id: "$user_id",
                        search: "$search",
                        price: "$price",
                        propertyType: "$propertyType",
                        type: "$type",
                        lastSearch: "$lastSearch",
                        isDeleted: "$isDeleted",
                        createdAt: "$createdAt",
                        updatedAt: "$updatedAt",
                    },
                },
                {
                    $match: query,
                },
                {
                    $sort: sortquery,
                },
            ];
            const total = await location.countDocuments(query);
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
            const result = await location.aggregate([...pipeline]);
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
                    message: "" + err,
                },
            });
        }
    },
}