"use strict";
const dotenv = require("dotenv");
const assert = require("assert");

dotenv.config();

const { PORT, HOST, DB_PORT, DB_NAME, MONGODB_URI } = process.env;

assert(PORT, "PORT is required");

if (!MONGODB_URI) {
  assert(HOST, "HOST is required");
  assert(DB_PORT, "DB_PORT is required");
  assert(DB_NAME, "DB_NAME is required");
}

module.exports = {
  url: MONGODB_URI || `mongodb://${HOST}:${DB_PORT}/${DB_NAME}`,
};