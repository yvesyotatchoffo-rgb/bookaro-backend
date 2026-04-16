const db = require('../models');
const constants = require('../utls/constants');
var mongoose = require('mongoose');

exports.getRole = async (role) => {
    let findRole = await db.roles.findOne({name:role})

    return findRole ? findRole.name :"";
}