const dashboardService = require("../services/dashboard");

exports.overview = async (req, res) => {
  try {
    const payload = await dashboardService.getDashboardOverview({
      period: req.query.period,
      explicitUserId: req.query.userId,
      identityUserId: req.identity?.id,
    });

    return res.status(200).json({
      success: true,
      data: payload,
    });
  } catch (error) {
    console.log("DASHBOARD_OVERVIEW_ERROR", error);
    return res.status(500).json({
      success: false,
      error: {
        code: 500,
        message: "Unable to build dashboard overview.",
      },
    });
  }
};

exports.activity = async (_req, res) => {
  try {
    const activity = await dashboardService.getDashboardActivity();
    return res.status(200).json({
      success: true,
      data: activity,
    });
  } catch (error) {
    console.log("DASHBOARD_ACTIVITY_ERROR", error);
    return res.status(500).json({
      success: false,
      error: {
        code: 500,
        message: "Unable to build dashboard activity.",
      },
    });
  }
};
