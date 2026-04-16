const db = require("../models");
const services = require('../services')
// const axios = require("axios");
const generateFileName = (type) => {
  return uuid() + type;
};
const generateVerificationCode = (length) => {
  const characters = "0123456789";
  let code = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    code += characters[randomIndex];
  }

  return code;
};

const customSort = (arr, key) => {
  arr.sort(function (a, b) {
    if (a[key] < b[key]) return -1;
    if (a[key] > b[key]) return 1;
    return 0;
  });

  return arr;
};

const generateOTP = (length) => {
  // For random OTP

  // let charset = '1234567890',
  //   retVal = '';

  // for (let i = 0, n = charset.length; i < length; ++i) {
  //   retVal += charset.charAt(Math.floor(Math.random() * n));
  // }
  // return retVal;

  // For random string code
  let length1 = length ? length : 6,
    charset = "0123456789",
    retVal = "";

  for (let i = 0, n = charset.length; i < length1; ++i) {
    retVal += charset.charAt(Math.floor(Math.random() * n));
  }
  return retVal;
};

const generateNumericOTP = (length) => {
  let length1 = 4,
    charset = "0123456789",
    retVal = "";

  for (let i = 0, n = charset.length; i < length1; ++i) {
    retVal += charset.charAt(Math.floor(Math.random() * n));
  }
  return retVal;
};

const get_chunks = (array, chunkSize) => {
  const chunks = [];
  for (const item of array) {
    const lastChunk = chunks[chunks.length - 1];
    if (!lastChunk || lastChunk.length === chunkSize) {
      chunks.push([item]);
    } else {
      lastChunk.push(item);
    }
  }
  return chunks;
};

const array_of_obj_sort = (arr, key, sort_type = "asc") => {
  // if (sort_type == "asc") {
  //   let sorted_arr = arr.sort((a, b) => a[key] - b[key]);      // asc
  //   return sorted_arr;
  // } else {
  //   let sorted_arr = arr.sort((a, b) => b[key] - a[key]);    //desc
  //   return sorted_arr;
  // }

  const sortOrder = sort_type === "desc" ? -1 : 1;

  arr.sort((a, b) => {
    const keyA = a[key];
    const keyB = b[key];

    if (keyA < keyB) return -1 * sortOrder;
    if (keyA > keyB) return 1 * sortOrder;
    return 0;
  });

  return arr;
};

const paginate = (array, count, page_no) => {
  return array.slice((page_no - 1) * count, page_no * count);
};

const trim_and_lowercase = (str) => {
  return str.toLowerCase().trim();
};

const sortByDayMonthYear = (a, b) => {
  if (a.year !== b.year) {
    return a.year - b.year;
  }
  if (a.month !== b.month) {
    return a.month - b.month;
  }
  return a.day - b.day;
};

const phoneNumberFormatter = function (number) {
  // 1. Removes characters other than numbers
  let formatted = number.replace(/\D/g, "");

  // 2. Remove the number 0 in front (prefix)
  if (formatted.startsWith("0")) {
    formatted = formatted.substr(1);
  }

  if (!formatted.endsWith("@c.us")) {
    formatted += "@c.us";
  }

  return formatted;
};

const generateSlug = async function (text) {
  let slug = text
    .toString()
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");

  return slug
}
const slugify = async function (text) {
  let slug = text
    .toString()
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "_")
    .replace(/^-+/, "")
    .replace(/-+$/, "");

  return slug
}

const generatePassword = async function generatePassword() {
  // action are perform to generate VeificationCode for user
  var length = 4;
  var charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  var retVal = "";

  for (var i = 0, n = charset.length; i < length; ++i) {
    retVal += charset.charAt(Math.floor(Math.random() * n));
  }

  var lowercase = "abcdefghijklmnopqrstuvwxyz";
  var lowercaseCharacterLength = 2;
  for (var i = 0, n = lowercase.length; i < lowercaseCharacterLength; ++i) {
    retVal += lowercase.charAt(Math.floor(Math.random() * n));
  }

  let specialCharacter = "@%$#&-!";
  let specialCharacterLength = 1;

  for (
    var i = 0, n = specialCharacter.length;
    i < specialCharacterLength;
    ++i
  ) {
    retVal += specialCharacter.charAt(Math.floor(Math.random() * n));
  }
  var numeric = "0123456789";
  var numericLength = 2;
  for (var i = 0, n = numeric.length; i < numericLength; ++i) {
    retVal += numeric.charAt(Math.floor(Math.random() * n));
  }
  return retVal;
}
const promoCode = async () => {
  let length = 9,
    charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
    retVal = '';

  for (let i = 0, n = charset.length; i < length; ++i) {
    retVal += charset.charAt(Math.floor(Math.random() * n));
  }
  return retVal;
}

const handleServerError = (res, error, contextMessage = "Server error") => {
  console.error(`${contextMessage}:`, error);
  return res.status(500).json({
    success: false,
    message: `Failed to retrieve ${contextMessage.toLowerCase()}`,
    error: error.message
  });
};

module.exports = {
  generateFileName,
  generateVerificationCode,
  customSort,
  generateOTP,
  get_chunks,
  array_of_obj_sort,
  generateSlug,
  paginate,
  slugify,
  trim_and_lowercase,
  paginate,
  sortByDayMonthYear,
  generateNumericOTP,
  phoneNumberFormatter,
  generatePassword,
  promoCode,
  handleServerError



};
