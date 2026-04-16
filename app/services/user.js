const db = require('../models');

exports.get_user_rooms = async (criteria, projection) => {
    let get_rooms = await db.roommembers.find(criteria, projection).lean().exec();

    return get_rooms;
}

exports.online_offline = async (id, status = false) => {
    let update_status = await db.users.findByIdAndUpdate(id, {
        $set: {
            isOnline: status
        }
    }, {
        new: true
    });
    return update_status;
}
exports.get_first_letter_from_each_word = async (string) => {
    let new_string = "";
    string = string.replace(/\s+/g, ' ').trim()             // To Remove extra whitespaces from the string like double, triple or more whitespaces
    let string_arr = string.split(' ');

    if (string_arr && string_arr.length > 0) {
        for await (let item of string_arr) {
            new_string += item[0]
        }
    }

    return new_string
}


exports.get_unred_notification_count = async (user_id) => {
    if (!db?.mongoose?.Types?.ObjectId?.isValid(user_id)) {
        return 0;
    }

    let get_count = await db.notifications.countDocuments({
        sendTo: user_id,
        isDeleted: false,
        status: "unread"
    });
    return get_count;
}