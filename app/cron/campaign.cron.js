const cron = require('node-cron');
const db = require("../models");
const Users = db.users;

const monthlyCampaignLimit = () => {

  cron.schedule('0 0 1 * *', async () => {
    console.log("Updating campaign limits...");

    await db.users.updateMany(
      { isDeleted: false },
      {
        $set: {
          dailyCampaignUsage: 0,
          weeklyCampaignUsage: 0,
          monthlyCampaignUsage: 0
        }
      }
    );

    console.log("Campaign limits reset for all users.");
  })
};

module.exports = { monthlyCampaignLimit };