exports.get_unique_from_arr_of_str = async (arr) => {
    let unique_arr = arr.filter((value, index, array) => {
        return array.indexOf(value) === index;
    });

    return unique_arr;
}

exports.get_common_from_arr_of_strs = async (arr1, arr2) => {
    let common_arr = arr1.filter(value => arr2.includes(value));
    return common_arr;
}
exports.getRole=async(role)=>{
    let adminRole=await db.roles.findOne({name:"Admin"})
}
