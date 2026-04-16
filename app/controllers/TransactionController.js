const db = require("../models");
const Transaction = db.pastTransaction;
const User = db.users;
const constants = require("../utls/constants");
const mongoose = require("mongoose");

module.exports = {
  transactionList: async (req, res) => {
    try {
      let {
        search,
        page,
        count,
        sortBy,
        status,
        number_of_main_pieces,
        year,
        minPrice,
        maxPrice,
        minSurface,
        maxSurface,
        maxDistance,
        userLat,
        userLng,
        local_type
      } = req.query;
      var query = {};

      if (local_type) {
        query.local_type = local_type;
      }

      if (search) {
        query.$or = [{ name: { $regex: search, $options: "i" } }];
      }
      var sortquery = {};
      if (sortBy) {
        var order = sortBy.split(" ");
        var field = order[0];
        var sortType = order[1];
      }
      if (number_of_main_pieces) {
        const number_of_main_pieces_array = number_of_main_pieces.split(',').map(String);
        query.number_of_main_pieces = { $in: number_of_main_pieces_array };
      }
      if (year) {
        const yearArray = year.split(',').map(Number);
        query.year = { $in: yearArray };
      }
      if (maxDistance) {
        maxDistance = Number(maxDistance);
      }

      if (minPrice || maxPrice) {
        const priceFilter = {};
        if (!isNaN(minPrice)) {
          priceFilter.$gte = Number(minPrice);
        }
        if (!isNaN(maxPrice)) {
          priceFilter.$lte = Number(maxPrice);
        }
        if (Object.keys(priceFilter).length) {
          query.$expr = {
            $and: [
              priceFilter.$gte !== undefined
                ? { $gte: [{ $toDouble: "$land_value" }, priceFilter.$gte] }
                : {},
              priceFilter.$lte !== undefined
                ? { $lte: [{ $toDouble: "$land_value" }, priceFilter.$lte] }
                : {},
            ].filter(Boolean),
          };
        }
      }

      if (minSurface || maxSurface) {
        const surfaceFilter = {};
        if (!isNaN(minSurface)) {
          surfaceFilter.$gte = Number(minSurface);
        }
        if (!isNaN(maxSurface)) {
          surfaceFilter.$lte = Number(maxSurface);
        }
        if (Object.keys(surfaceFilter).length) {
          query.$expr = {
            $and: [
              surfaceFilter.$gte !== undefined
                ? { $gte: [{ $toDouble: "$lot1_surface_carrez" }, surfaceFilter.$gte] }
                : {},
              surfaceFilter.$lte !== undefined
                ? { $lte: [{ $toDouble: "$lot1_surface_carrez" }, surfaceFilter.$lte] }
                : {},
            ].filter(Boolean),
          };
        }
      }

      sortquery[field ? field : "createdAt"] = sortType
        ? sortType == "desc"
          ? -1
          : 1
        : -1;
      if (status) {
        query.status = status;
      }

      let pipeline = [];
       
      if(userLat && userLng){
        pipeline.push(
          {
            $geoNear: {
              near: {
                type: "Point",
                coordinates: [Number(userLng), Number(userLat)]
              },
              distanceField: "distance",
              spherical: true,
              maxDistance: 100
            }
          }
        )
      }


      pipeline.push(
        // {
        //   $geoNear: {
        //     near: {
        //       type: "Point",
        //       coordinates: [Number(userLng), Number(userLat)] // Convert to [longitude, latitude]
        //     },
        //     distanceField: "distance",
        //     spherical: true,
        //     maxDistance : 100,
        //   }
        // },
        { $match: query },
        { $sort: sortquery },
        {
          $project: {
            id: "$_id",
            id_mutation: "$id_mutation",
            mutation_date: "$mutation_date",
            provision_number: "$provision_number",
            nature_mutation: "$nature_mutation",
            land_value: "$land_value",
            address_number: "$address_number",
            address_suffix: "$address_suffix",
            address_channel_name: "$address_channel_name",
            channel_code_address: "$channel_code_address",
            postal_code: "$postal_code",
            community_code: "$community_code",
            community_name: "$community_name",
            department_code: "$department_code",
            old_community_code: "$old_community_code",
            old_community_name: "$old_community_name",
            plot_id: "$plot_id",
            old_plot_id: "$old_plot_id",
            volume_number: "$volume_number",
            lot1_number: "$lot1_number",
            lot1_surface_carrez: "$lot1_surface_carrez",
            lot2_number: "$lot2_number",
            lot2_surface_carrez: "$lot2_surface_carrez",
            lot3_number: "$lot3_number",
            lot3_surface_carrez: "$lot3_surface_carrez",
            lot4_number: "$lot4_number",
            lot4_surface_carrez: "$lot4_surface_carrez",
            lot5_number: "$lot5_number",
            lot5_surface_carrez: "$lot5_surface_carrez",
            number_lots: "$number_lots",
            local_type_code: "$local_type_code",
            year: "$year",
            local_type: "$local_type",
            real_built_surface: "$real_built_surface",
            number_of_main_pieces: "$number_of_main_pieces",
            code_nature_culture: "$code_nature_culture",
            nature_culture: "$nature_culture",
            code_nature_culture_special: "$code_nature_culture_special",
            nature_culture_special: "$nature_culture_special",
            land_surface: "$land_surface",
            longitude: "$longitude",
            latitude: "$latitude",
            createdAt: "$createdAt",
            updatedAt: "$updatedAt",
          },
        },
      );
      const total = await Transaction.aggregate([...pipeline]);

      if (page && count) {
        var skipNo = (Number(page) - 1) * Number(count);

        pipeline.push(
          {
            $skip: Number(skipNo),
          },
          {
            $limit: Number(count),
          }
        );
      }

      const result = await Transaction.aggregate([...pipeline]);
      return res.status(200).json({
        success: true,
        data: result,
        total: total.length,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  },
};
