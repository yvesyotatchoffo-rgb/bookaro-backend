const db = require("../models");
const { success } = require("../services/Response");
const constants = require("../utls/constants");
const Faqs = db.faqs;


module.exports = {
    addFaq: async (req, res) => {
        try {
            const data = req.body
            if (!data.question || !data.answer) {
                return res.status(404).json({
                    success: false,
                    error: { code: 404, message: constants.onBoarding.PAYLOAD_MISSING }
                })
            }
            let query = { isDeleted: false, question: data.question }
            let existed = await Faqs.findOne(query)

            if (existed) {
                return res.status(400).json({
                    success: false,
                    error: { code: 400, message: constants.FAQ.ALREADY_EXIST }
                })
            }
            data.addedBy = req.identity.id
            let created = await Faqs.create(data)

            return res.status(200).json({
                success: true,
                message: constants.FAQ.CREATED
            })
        } catch (err) {
            return res.status(500).json({
                success: false,
                error: { code: 500, message: "" + err }
            })
        }
    },

    faqsDetails: async (req, res) => {
        try {
            let id = req.query.id;
            if (!id) {
                return res.status(400).json({
                    success: false,
                    message: constants.FAQ.ID_MISSING
                })
            }
            let faqData = await Faqs.findOne({ _id: id, isDeleted: false });
            if (faqData) {
                return res.status(200).json({
                    success: true,
                    data: faqData,
                    message: constants.FAQ.RETRIEVED
                })
            } else {
                return res.status(400).json({
                    success: false,
                    message: constants.FAQ.NOT_FOUND
                })
            }
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

    listing: async (req, res) => {
        try {
            const { search, page, type, count, sortBy, status } = req.query;
            var query = {};
            if (search) {
                query.$or = [
                    { question: { $regex: search, $options: "i" } },
                    { answer: { $regex: search, $options: "i" } },
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
            if (type) {
                query.type = type;

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
                        question: 1,
                        answer: 1,
                        type: "$type",
                        status: "$status",
                        createdAt: "$createdAt",
                        updatedAt: "$updatedAt",
                        isDeleted: "$isDeleted",
                        addedBy: "$addedBy",
                    },
                },
            ];
            const total = await Faqs.countDocuments(query);
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
            const result = await Faqs.aggregate([...pipeline]);

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

    statusChange: async (req, res) => {
        try {
            let id = req.body.id;
            if (!id) {
                return res.status(400).json({
                    success: false,
                    message: constants.FAQ.ID_MISSING
                })
            } else {
                let findBlog = await Faqs.findOne({ _id: id });
                if (findBlog) {
                    if (findBlog.status == "active") {
                        await Faqs.updateOne({ _id: id }, { status: "deactive" })
                    } else {
                        await Faqs.updateOne({ _id: id }, { status: "active" })
                    }
                    return res.status(200).json({
                        success: true,
                        message: constants.FAQ.STATUS_CHANGED
                    })
                } else {
                    return res.status(400).json({
                        success: false,
                        message: constants.FAQ.NOT_FOUND
                    })
                }
            }
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
    deleteBlog: async (req, res) => {
        try {
            let id = req.query.id;
            if (!id) {
                return res.status(400).json({
                    success: false,
                    message: constants.FAQ.ID_MISSING
                })
            }
            let findBlog = await Faqs.findOne({ _id: id, isDeleted: false });
            if (findBlog) {
                await Faqs.updateOne({ _id: id }, { isDeleted: true })
                return res.status(200).json({
                    success: true,
                    message: constants.FAQ.DELETED
                })
            } else {
                return res.status(400).json({
                    success: false,
                    message: constants.FAQ.NOT_FOUND
                })
            }

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

    editFaq: async (req, res) => {
        try {
            let data = req.body;
            let faqData = await Faqs.find({ question: data.question, isDeleted: false });
            // if (faqData.length > 0) {
            //     return res.status(500).json({
            //         success: false,
            //         message: constants.FAQ.QUESTION_EXIST
            //     })
            // } else {
            await Faqs.updateOne({ _id: data.id }, data)
            return res.status(200).json({
                success: true,
                message: constants.FAQ.UPDATED
            })
            // }
        } catch (error) {
            return res.status(500).json({
                success: false,
                error: {
                    code: 500,
                    message: "" + err,
                },
            });
        }
    }
}