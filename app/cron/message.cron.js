const cron = require('node-cron');
const db = require("../models");
const Users = db.users;

const resetDailyMessageLimit = () => {
    cron.schedule('0 4 1 * *', async () => { //cron job run on every 1st of the month at 4 AM
        try {
            console.log("Resetting daily message limits...");

            const findUsers = await db.users.find({ isDeleted: false });

            for (const user of findUsers) {
                let success = false;
                let maxRetries = 3;
                let attempts = 0;
                while (!success && attempts < maxRetries) {
                    try {
                        await db.users.updateOne(
                            { _id: user._id },
                            { directoryMessageUsage: 0, totalOwnerMessages: 0 }
                        );
                        console.log(`Successfully reset limits for user: ${user._id}`);
                        success = true;
                    }
                    catch (err) {
                        attempts++;
                        console.warn(`Attempt ${attempts} failed for user ${user._id}:`, err.message);

                        if (attempts >= maxRetries) {
                            console.error(`Failed to reset for user ${user._id} after ${maxRetries} attempts.`);
                        }
                    }
                }

            }
            console.log("Daily message limits reset successfully!");
        } catch (error) {
            console.error("Error resetting message limits:", error);
        }
    });
};

// Export the function
module.exports = { resetDailyMessageLimit };