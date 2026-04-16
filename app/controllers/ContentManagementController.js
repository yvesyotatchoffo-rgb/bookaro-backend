const db = require("../models");
const { success } = require("../services/Response");
const constants = require("../utls/constants");
const Contents = db.content;

module.exports = {

    add: async (req, res) => {
        try {
            const data = req.body;

            if (!data.slug) {
                return res.status(500).json({
                    success: false,
                    message: constants.onBoardingPAYLOAD_MISSING
                });
            }
            let query = { isDeleted: false, slug: data.slug };
            let existed = await Contents.findOne(query);

            if (existed) {
                return res.status(500).json({
                    success: false,
                    message: constants.CONTENT_MANAGEMENT.ALREADY_EXIST

                })
            }
            data.addedBy = req.identity.id;
            let created = await Contents.create(data);

            return res.status(200).json({
                success: true,
                message: constants.CONTENT_MANAGEMENT.CREATED,
            });
        } catch (err) {
            return res.status(500).json({
                success: false,
                error: {
                    code: 500,
                    message: "" + err,
                },
            });
        }
    },
    list: async (req, res) => {
        try {
            const { search, page, count, sortBy, status ,slug} = req.query;
            var query = {};

            if (search) {
                query.$or = [
                    { title: { $regex: search, $options: "i" } },
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
            if(slug){
                query.slug = slug
            }
            const pipeline = [
                {
                    $match: query,
                },
                {
                    $sort: sortquery,
                },

                {
                    $project: {
                        id: "$_id",
                        title: "$title",
                        metaTitle: "$metaTitle",
                        description: "$description",
                        slug: "$slug",
                        metaDescription: "$metaDescription",
                        metaKeyword: "$metaKeyword",
                        status: "$status",
                        createdAt: "$createdAt",
                        updatedAt: "$updatedAt",
                        isDeleted: "$isDeleted",
                    },
                },
            ];

            const total = await Contents.countDocuments(query);

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

            const result = await Contents.aggregate([...pipeline]);

            return res.status(200).json({
                success: true,
                data: result,
                total: total,
            });
        } catch (err) {
            return res.status(500).json({
                success: false,
                error: {
                    code: 500,
                    message: "" + err,
                },
            });
        }
    },
    detail: async (req, res) => {
        try {
            let { slug } = req.query;
            if (!slug) {
                return res.status(500).json({
                    success: false,
                    message: constants.onBoarding.PAYLOAD_MISSING
                });
            }

            const details = await Contents.find({ slug: slug });
            let detail = details[0];
            return res.status(200).json({
                success: true,
                data: detail,
                message: constants.CONTENT_MANAGEMENT.FOUND_SUCCESS
            });
        } catch (err) {
            return res.status(500).json({
                success: false,
                error: {
                    code: 500,
                    message: "" + err,
                },
            });
        }
    },
    update: async (req, res) => {
        try {
            const slug = req.body.slug;
            const data = req.body;

            if (!slug) {
                return res.status(500).json({
                    success: false,
                    message: constants.onBoarding.PAYLOAD_MISSING,
                });
            }

            const updatedStatus = await Contents.updateOne(
                { slug: slug },
                data
            );

            return res.status(200).json({
                success: true,
                data: updatedStatus,
                message: constants.CONTENT_MANAGEMENT.UPDATED,

            });
        } catch (err) {
            return res.status(500).json({
                success: false,
                error: {
                    code: 500,
                    message: "" + err,
                },
            });
        }
    },
    changeStatus: async (req, res) => {
        try {
            const id = req.body.id;
            const status = req.body.status;
            console.log(req.body);
            if (!id) {
                return res.status(404).json({
                    success: false,
                    error: { code: 404, message: constants.onBoarding.PAYLOAD_MISSING },
                });
            }

            const updatedStatus = await Contents.updateOne(
                { _id: id },
                { status: status }
            );

            return res.status(200).json({
                success: true,
                message: constants.CONTENT_MANAGEMENT.STATUS_CHANGED,
            });
        } catch (err) {
            return res.status(400).json({
                success: false,
                error: { code: 400, message: "" + err },
            });
        }
    },
    delete: async (req, res) => {
        try {
            const { slug } = req.query;

            if (!slug) {
                return res.status(404).json({
                    success: false,
                    error: { code: 404, message: constants.onBoarding.PAYLOAD_MISSING },
                });
            }

            const updatedStatus = await Contents.updateOne(
                { slug: slug },
                { isDeleted: true }
            );

            return res.status(200).json({
                success: false,
                message: constants.CONTENT_MANAGEMENT.DELETED
            });
        } catch (err) {
            return res.status(400).json({
                success: false,
                error: { code: 400, message: "" + err },
            });
        }
    },
}