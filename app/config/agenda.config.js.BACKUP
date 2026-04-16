const Agenda = require('agenda');
const mongoose = require('mongoose');
const dotenv = require("dotenv");

dotenv.config();

const {
  DB_URL
} = process.env;

const agenda = new Agenda({
  db: { address: DB_URL, collection: 'agendaJobs' }
});

module.exports = agenda;