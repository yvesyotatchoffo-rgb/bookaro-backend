const db = require("../models");
const setting = db.setting;
exports.add = async (req, res) => {
    try {
        let data = req.body;
        if (!data.new_messages) {
            return res.status(400).json({
                success: false,
                Message: "payload missing"
            })
        }
        data.addedBy = req.identity.id;
        await setting.create(data);
        return res.status(200).json({
            success: true,
            message: "Data added"
        })

    } catch (error) {
        console.log(error, "===============")
        return res.status(500).json({
            success: false,
            Message: error
        })
    }
};
exports.getOneId = async (req, res) => {
    try {
        const user_id = req.query.user_id;

        if (!user_id) {
            return res.status(400).json({
                success: false,
                message: "user id required"
            });
        }
        const settings = await setting.findOne({ user_id: user_id });
        if (settings) {
            return res.status(200).json({
                success: true,
                data: settings,
                message: "setting retrieved successfully"
            })
        } else {
            return res.status(400).json({
                success: false,
                message: "Data not found"
            })
        }
    } catch (error) {
        console.log(error, "==================")
        return res.status(500).json({
            success: false,
            message: "error"
        });
    }
};
exports.editSetting = async (req, res) => {
    try {
        let data = req.body;
        if (!data.user_id) {
            return res.status(400).json({
                success: false,
                message: "Id is required"
            })
        }
        await setting.updateOne({ user_id: data.user_id }, data)
        return res.status(200).json({
            success: true,
            message: "data updated successfully"
        })

    } catch (error) {
        console.log(error), "==============";
        return res.status(500).json({
            success: false,
            error: {
                code: 500,
                message: error,
            },
        });
    }
}