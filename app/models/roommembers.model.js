var mongoose = require('mongoose');
var Schema = mongoose.Schema;


module.exports = (mongoose) => {
    var schema = mongoose.Schema(
        {
            room_id: { type: mongoose.Types.ObjectId, ref: 'rooms' },
            user_id: { type: mongoose.Types.ObjectId, ref: 'users' },
            isGroupChat: { type: Boolean, default: false },
            quickChat: { type: Boolean, default: false },
            user_chat_count : {type:Number,default : 0},
            admin_chat_count : {type:Number,default : 0},
            property_id: { type: Schema.Types.ObjectId, ref: "properties" },

            
            createdAt: Date,
            updatedAt: Date,
            // isDeleted: {type: Boolean, default: false},
            // project_id: { type: mongoose.Types.ObjectId, ref: 'Projects' },
        },
        { timestamps: true }
    );

    const RoomMembers = mongoose.model("RoomMembers", schema);

    return RoomMembers;
};

