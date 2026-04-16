const { default: mongoose } = require("mongoose");
const db = require("../models");
const constants = require("../utls/constants");
const Blogs = db.blogs;


module.exports = {
    addBlogs: async (req, res) => {
        try {
            let data = req.body;
            let title = data.title;
            if (!data.title || !data.categoryId || !data.subCategoryId) {
                return res.status(400).json({
                    success: false,
                    message: constants.BLOG.PAYLOAD_MISSING,
                });
            }
            let blogsData = await Blogs.findOne({ title: title, isDeleted: false });

            const findCategory = await db.blogCategories.findOne({ _id: data.categoryId });
            if (!findCategory) {
                return res.status(400).json({
                    success: false,
                    message: "Category not found."
                })
            }

            const findSubCategory = await db.blogSubCategories.findOne({ _id: data.subCategoryId });
            if (!findSubCategory) {
                return res.status(400).json({
                    success: false,
                    message: "Sub-Category not found."
                })
            }
            if (!blogsData) {
                data.addedBy = req.identity.id;
                const createBlog = await Blogs.create(data);
                return res.status(200).json({
                    success: true,
                    message: constants.BLOG.CREATED
                })
            } else {
                return res.status(400).json({
                    success: false,
                    message: constants.BLOG.ALREADY_EXIST,
                });
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


    blogDetails: async (req, res) => {
        try {
            const { id, loggedinUser } = req.query;
            if (!id) {
                return res.status(400).json({
                    success: false,
                    message: constants.BLOG.ID_MISSING
                })
            }
            let blogData = await Blogs.findOne({ _id: id, isDeleted: false }).populate('categoryId').populate('subCategoryId').populate('blogOwner', 'fullName email')
            if (!blogData) {
                return res.status(400).json({
                    success: false,
                    message: constants.BLOG.NOT_FOUND
                });
            }

            const contentLikeCount = Array.isArray(blogData.contentLike) ? blogData.contentLike.length : 0;
            const contentDislikeCount = Array.isArray(blogData.contentDislike) ? blogData.contentDislike.length : 0;

            const userId = loggedinUser ? loggedinUser.toString() : null;

            const isLikedByUser = userId
                ? blogData.contentLike?.some((id) => id.toString() === userId)
                : false;

            const isDislikedByUser = userId
                ? blogData.contentDislike?.some((id) => id.toString() === userId)
                : false;

            return res.status(200).json({
                success: true,
                data: {
                    ...blogData.toObject(),
                    contentLikeCount,
                    contentDislikeCount,
                    isLikedByUser,
                    isDislikedByUser
                },
                message: constants.BLOG.RETRIEVED
            });
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

    editBlogs: async (req, res) => {
        try {
            const { id, contentLike, contentDislike, loggedinUser } = req.body;
            if (!id) {
                return res.status(400).json({
                    success: false,
                    message: constants.BLOG.ID_MISSING
                });
            }

            const updateQuery = {};

            if (contentLike === true) {
                updateQuery.$addToSet = { contentLike: loggedinUser };
                updateQuery.$pull = { contentDislike: loggedinUser };
            } else if (contentLike === false) {
                updateQuery.$pull = { contentLike: loggedinUser };
            }

            if (contentDislike === true) {
                updateQuery.$addToSet = { contentDislike: loggedinUser };
                updateQuery.$pull = { ...updateQuery.$pull, contentLike: loggedinUser };
            } else if (contentDislike === false) {
                updateQuery.$pull = { ...updateQuery.$pull, contentDislike: loggedinUser };
            }

            await Blogs.updateOne({ _id: id }, updateQuery);

            return res.status(200).json({
                success: true,
                message: constants.BLOG.UPDATED
            });
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
    statusChange: async (req, res) => {
        try {
            let id = req.body.id;
            if (!id) {
                return res.status(400).json({
                    success: false,
                    message: constants.BLOG.ID_MISSING
                })
            } else {
                let findBlog = await Blogs.findOne({ _id: id });
                if (findBlog) {
                    if (findBlog.status == "active") {
                        await Blogs.updateOne({ _id: id }, { status: "deactive" })
                    } else {
                        await Blogs.updateOne({ _id: id }, { status: "active" })
                    }
                    return res.status(200).json({
                        success: true,
                        message: constants.BLOG.STATUS_CHANGED
                    })
                } else {
                    return res.status(400).json({
                        success: false,
                        message: constants.BLOG.NOT_FOUND
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
                    message: constants.BLOG.ID_MISSING
                })
            }
            let findBlog = await Blogs.findOne({ _id: id, isDeleted: false });
            if (findBlog) {
                await Blogs.updateOne({ _id: id }, { isDeleted: true })
                return res.status(200).json({
                    success: true,
                    message: constants.BLOG.DELETED
                })
            } else {
                return res.status(400).json({
                    success: false,
                    message: constants.BLOG.NOT_FOUND
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
            const { search, page, count, sortBy, status, categoryId, subCategoryId, blogOwner, loggedinUser } = req.query;
            var query = {};
            if (search) {
                query.$or = [
                    { title: { $regex: search, $options: "i" } },
                    // { description: { $regex: search, $options: "i" } },
                    { "categoryData.CategoryName": { $regex: search, $options: "i" } },
                    { "subCategoryData.SubCategoryName": { $regex: search, $options: "i" } }
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
            if (categoryId) {
                query.categoryId = new mongoose.Types.ObjectId(categoryId);
            }
            if (subCategoryId) {
                query.subCategoryId = new mongoose.Types.ObjectId(subCategoryId);
            }

            if (blogOwner) {
                query.blogOwner = new mongoose.Types.ObjectId(blogOwner);
            }
            const pipeline = [

                {
                    $lookup: {
                        from: "blogcategories",
                        localField: "categoryId",
                        foreignField: "_id",
                        as: "categoryData",
                    },
                },
                { $unwind: { path: "$categoryData", preserveNullAndEmptyArrays: true } },

                {
                    $lookup: {
                        from: "blogsubcategories",
                        localField: "subCategoryId",
                        foreignField: "_id",
                        as: "subCategoryData",
                    },
                },
                { $unwind: { path: "$subCategoryData", preserveNullAndEmptyArrays: true } },

                {
                    $lookup: {
                        from: "users",
                        localField: "blogOwner",
                        foreignField: "_id",
                        as: "blogOwnerData",
                    },
                },
                { $unwind: { path: "$blogOwnerData", preserveNullAndEmptyArrays: true } },
                {
                    $match: query,
                },
                {
                    $sort: sortquery,
                },
                {
                    $project: {
                        id: "$_id",
                        title: { $toLower: "$title" },
                        description: "$description",
                        images: "$images",
                        status: "$status",
                        banner: 1,
                        metaTitle: 1,
                        metaDesciption: 1,
                        createdAt: "$createdAt",
                        updatedAt: "$updatedAt",
                        isDeleted: "$isDeleted",
                        addedBy: "$addedBy",
                        subCategoryId: 1,
                        categoryId: 1,
                        blogOwner: 1,
                        duration: 1,
                        category: "$categoryData.CategoryName",
                        subCategory: "$subCategoryData.SubCategoryName",
                        categoryData: "$categoryData",
                        subCategoryData: "$subCategoryData",
                        blogOwnerData: "$blogOwnerData",
                        contentLikeCount: { $size: { $ifNull: ["$contentLike", []] } },
                        contentDislikeCount: { $size: { $ifNull: ["$contentDislike", []] } },
                        isLikedByUser: {
                            $cond: {
                                if: {
                                    $in: [
                                        new mongoose.Types.ObjectId(loggedinUser),
                                        { $ifNull: ["$contentLike", []] }
                                    ]
                                },
                                then: true,
                                else: false
                            }
                        },
                        isDislikedByUser: {
                            $cond: {
                                if: {
                                    $in: [
                                        new mongoose.Types.ObjectId(loggedinUser),
                                        { $ifNull: ["$contentDislike", []] }
                                    ]
                                },
                                then: true,
                                else: false
                            }
                        }
                    },
                },
            ];
            const total = await Blogs.countDocuments(query);
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
            const result = await Blogs.aggregate([...pipeline]);

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