const db = require('../models');

async function listBuildingPermits({
  longitude,
  latitude,
  maxDistance,
  status,
  type,
  page = 1,
  limit = 10
}) {
  try {
    const query = { isDeleted: false };

    if (status !== undefined && status !== '') {
      // Use explicitly provided status
      query.status = status;
    } else {
      // Apply default status filter: only allow 2 or 5
      query.status = { $in: ['2', '5'] };
    }
    if (type) {
      query.type = type;
    }
    const statusMap = {
      "1": "Pending Authorization",
      "2": "Authorized",
      "4": "Cancelled",
      "5": "Started",
      "6": "Completed"
    };
    const currentYear = new Date().getFullYear();
    const cutoffYear = currentYear - 5; // only show records from this year or last
    query.authorizationYear = { $gte: cutoffYear.toString() };

    let results = [];
    let totalCount = 0;

    if (longitude && latitude) {
      const coordinates = [parseFloat(longitude), parseFloat(latitude)];
      maxDistance = maxDistance || 5000;

      const geoResults = await db.buildingPermits.aggregate([
        {
          $geoNear: {
            near: { type: "Point", coordinates },
            distanceField: "distance",
            maxDistance: parseFloat(maxDistance),
            spherical: true,
            query,
          }
        },
        {
          $facet: {
            data: [
              { $skip: (page - 1) * limit },
              { $limit: parseInt(limit) }
            ],
            totalCount: [{ $count: "count" }] // ✅ Get total matching docs
          }
        }
      ]);

      results = geoResults[0].data;
      totalCount = geoResults[0].totalCount.length ? geoResults[0].totalCount[0].count : 0;
      const mappedResults = results.map(item => ({
        ...item,
        statusLabel: statusMap[item.status] || item.status // fallback if unmapped
      }));
    } else {
      // ✅ Regular query when no lat-long filters applied
      totalCount = await db.buildingPermits.countDocuments(query);
      results = await db.buildingPermits.find(query)
        .skip((page - 1) * limit)
        .limit(parseInt(limit))
        .lean();
    }

    const mappedResults = results.map(item => ({
      ...item,
      statusLabel: statusMap[item.status] || item.status
    }));


    return { total: totalCount, data: mappedResults };
  } catch (error) {
    console.error('Error listing building permits:', error);
    throw error;
  }
}

module.exports = { listBuildingPermits };
// Example usage:
/*
const results = await listBuildingPermits({
  longitude: 5.360129,
  latitude: 45.958966,
  maxDistance: 10000, // 10km radius
  status: "2",
  type: "demolitionPermit",
  page: 1,
  limit: 20
});
*/