// const Model = require('../MODELS/index');
const db = require('../models');

exports.create_room = async (data) => {
    let create_room = await db.rooms.create(data);
    return create_room;
}

exports.add_members = async (data) => {
    let add_member = await db.roommembers.create(data);
    return add_member;
}

exports.get_member_except_me = async (data) => {
    let get_members = await db.roommembers.find({
        room_id : data.room_id,
        user_id : {$ne : data.user_id}
    });
    return get_members;
}

