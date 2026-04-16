const db = require("../models");

module.exports = (agenda, db) => {
  agenda.define("deactivate-trial-plan", async (job) => {
    const { userId } = job.attrs.data;

    try {
      await db.users.updateOne(
        { _id: userId },
        {
          $set: {
            planId: null,
            planType: null,
            planDuration: null,
            freeTrialStatus: "done"
          }
        }
      );

      console.log(`Trial plan deactivated for user ${userId}`);
    } catch (err) {
      console.error("Error deactivating trial plan:", err);
    }
  });

  //agenda to expire the active campaign
  agenda.define("expire-active-campaign", async (job) => {
    const { campaginId } = job.attrs.data;
    try {
      await db.peerCampaign.updateOne(
        { _id: campaginId },
        {
          $set: {
            status: "inactive"
          }
        }
      );
      console.log(`Active campaign expired ${campaginId}`);
    } catch (err) {
      console.error("Error expiring the active campaign:", err);
    }
  });
  //// agenda to delete the unused records
  //   agenda.define("cleanup-agenda-jobs", async () => {
  //   try {
  //     const result = await db.agendaJobs.deleteMany({
  //       nextRunAt: null,
  //       repeatInterval: null,
  //       lastFinishedAt: { $exists: true },
  //       lockedAt: null
  //     });

  //     console.log(`Cleaned up ${result.deletedCount} completed one-time jobs.`);
  //   } catch (err) {
  //     console.error("Error cleaning up agenda jobs:", err);
  //   }
  // });

};
