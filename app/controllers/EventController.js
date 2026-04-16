"use strict";

const db = require("../models");
const constants = require("../utls/constants");
const multer = require("multer");
var mongoose = require("mongoose");
const fuzzball = require("fuzzball");

module.exports = {
  /**
   * @authenticated
   *
   */
  addEvent: async (req, res) => {
    try {
      const data = req.body;

      if (!req.body.title && req.body.location) {
        return res.status(400).json({
          success: false,
          error: {
            code: 400,
            message: constants.onBoarding.PAYLOAD_MISSING,
          },
        });
      }
      data.createdAt = new Date();
      data.updatedAt = new Date();
      data.isDeleted = false;
      var query = {};
      query.isDeleted = false;
      query.title = req.body.title;
      const existedEvent = await db.events.findOne(query);

      if (existedEvent) {
        return res.status(400).json({
          success: false,
          error: {
            code: 400,
            message: constants.EVENTS.ALREADY_EXIST,
          },
        });
      }

      const createdEvent = await db.events.create(data);
      if (createdEvent) {
        return res.status(200).json({
          success: true,
          message: constants.EVENTS.CREATED,
          data: createdEvent,
        });
      }
    } catch (err) {
      return res.status(400).json({
        success: false,
        error: {
          code: 400,
          message: "error" + err,
        },
      });
    }
  },
  updateEvent: async (req, res) => {
    try {
      let id = req.body.id;
      if (!id) {
        return res.status(400).json({
          success: false,
          error: {
            code: 400,
            message: constants.onBoarding.PAYLOAD_MISSING,
          },
        });
      }

      const Events = await db.events.findOne({
        _id: id,
      });
      if (!Events) {
        return res.status(404).json({
          success: false,
          error: {
            code: "404",
            message: constants.EVENTS.NOT_FOUND,
          },
        });
      }
      const data = req.body;

      const updatedEvents = await db.events.updateOne(
        {
          _id: id,
        },
        data
      );

      return res.status(200).json({
        success: true,
        message: constants.EVENTS.UPDATED,
      });
    } catch (err) {
      return res.status(400).json({
        success: false,
        error: {
          code: 400,
          message: "" + err,
        },
      });
    }
  },
  activateDeactivateEvent: async (req, res) => {
    try {
      let id = req.body.id;
      if (!id) {
        return res.status(400).json({
          success: false,
          error: {
            code: 400,
            message: constants.onBoarding.PAYLOAD_MISSING,
          },
        });
      }
      const Event = await db.events.findOne({
        _id: id,
      });
      if (!Event) {
        return res.status(404).json({
          success: false,
          message: constants.EVENTS.NOT_FOUND,
        });
      }
      const query = {
        status: "active",
      };
      let message;
      let message1;
      if (Event.status == "active") {
        query.status = "deactive";
        message = constants.EVENTS.STATUS_CHANGED;
      } else {
        query.status = "active";
        message1 = constants.EVENTS.STATUS_CHANGED;
      }
      const updateData = await db.events.updateOne(
        {
          _id: id,
        },
        query
      );
      if (updateData) {
        return res.status(200).json({
          success: true,
          message: Event.status === "deactive" ? message1 : message,
        });
      }
    } catch (err) {
      return res.status(400).json({
        success: false,
        error: {
          code: 400,
          message: "" + err,
        },
      });
    }
  },
  /** for get list of events */
  getAllEvents: async (req, res) => {
    try {
      let { search, sortBy, page, count, status, category, venue, host, type } =
        req.query;
      var query = {};
      if (search) {
        query.$or = [
          {
            title: {
              $regex: search,
              $options: "i",
            },
          },
          {
            location: {
              $regex: search,
              $options: "i",
            },
          },
        ];
      }

      query.isDeleted = false;
      var sortquery = {};
      if (sortBy) {
        var order = sortBy.split(" ");
        var field = order[0];
        var sortType = order[1];
      }

      sortquery[field ? field : "createdAt"] = sortType
        ? sortType == "desc"
          ? -1
          : 1
        : -1;
      if (status) {
        query.status = status;
      }
      if (host) {
        query["host._id"] = mongoose.Types.ObjectId.createFromHexString(host);
      }
      if (category) {
        query["category._id"] =
          mongoose.Types.ObjectId.createFromHexString(category);
      }
      if (venue) {
        query["venue._id"] = mongoose.Types.ObjectId.createFromHexString(venue);
      }
      if (type) {
        query.type = type;
      }
      console.log(query);
      const pipeline = [
        {
          $lookup: {
            from: "users",
            localField: "host",
            foreignField: "_id",
            as: "hostdetail",
          },
        },
        {
          $lookup: {
            from: "categories",
            localField: "category",
            foreignField: "_id",
            as: "categoryDetail",
          },
        },
        {
          $unwind: {
            path: "$categoryDetail",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "venue",
            foreignField: "_id",
            as: "venuedetail",
          },
        },
        {
          $unwind: {
            path: "$venuedetail",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            id: "$_id",
            title: "$title",
            description: "$description",
            location: "$location",
            venue_location: "$venue_location",
            country: "$country",
            state: "$state",
            city: "$city",
            isOnline: "$isOnline",
            link: "$link",
            images: "$images",
            host: "$hostdetail",
            menu_item_format: "$menu_item_format",
            foodImages: "$foodImages",
            zipCode: "$zipCode",
            coordinates: "$coordinates",
            short_description: "$short_description",
            audience: "$audience",
            attention: "$attention",
            extraFood: "$extraFood",
            category: "$categoryDetail",
            tickets: "$tickets",
            venue: "$venuedetail",
            foods: "$foods",
            drinks: "$drinks",
            type: "$type",
            price_of_ticket: "$price_of_ticket",
            eventStartDate: "$eventStartDate",
            eventEndDate: "$eventEndDate",
            status: "$status",
            isDeleted: "$isDeleted",
            createdAt: "$createdAt",
            updatedAt: "$updatedAt",
          },
        },
        {
          $match: query,
        },
        {
          $sort: sortquery,
        },
      ];

      const total = await db.events.aggregate([...pipeline]);

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

      const result = await db.events.aggregate([...pipeline]);

      return res.status(200).json({
        success: true,
        data: result,
        total: total.length,
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        error: {
          code: 400,
          message: "" + err,
        },
      });
    }
  },

  /** for delete Events */
  DeleteEvents: async (req, res) => {
    try {
      let id = req.query.id;
      if (!id) {
        return res.status(400).json({
          success: false,
          error: {
            code: 400,
            message: constants.onBoarding.PAYLOAD_MISSING,
          },
        });
      }
      const Events = await db.events.findOne({
        _id: id,
      });
      if (!Events) {
        return res.status(404).json({
          success: false,
          error: {
            code: "404",
            message: constants.EVENTS.NOT_FOUND,
          },
        });
      }

      const updateEvents = await db.events.findByIdAndUpdate(
        { _id: id },
        { isDeleted: true }
      );

      return res.status(200).json({
        success: true,
        message: constants.EVENTS.DELETED,
      });
    } catch (err) {
      return res.status(400).json({
        success: false,
        error: {
          code: 400,
          message: "" + err,
        },
      });
    }
  },
  /** for get Events Post detail */
  getEventDetail: async (req, res) => {
    try {
      const id = req.query.id;
      console.log("id", id);

      if (!id) {
        return res.status(401).json({
          success: false,
          error: {
            code: 401,
            message: constants.onBoarding.PAYLOAD_MISSING,
          },
        });
      }
      let total = await db.events
        .findOne({ _id: id, isDeleted: false })
        .populate("host")
        .populate("category")
        .populate("venue");
      if (total) {
        return res.status(200).json({
          success: true,
          message: constants.EVENTS.RETRIEVED,
          payload: total,
        });
      } else {
        return res.status(404).json({
          success: false,
          error: {
            code: 404,
            message: constants.VENUES.NOT_FOUND,
          },
        });
      }
    } catch (err) {
      return res.status(400).json({
        success: false,
        error: {
          code: 400,
          message: "" + err,
        },
      });
    }
  },

  /** for get all events for frontend   */

  getAllEventsForUser: async (req, res) => {
    try {
      let {
        search,
        sortBy,
        page,
        count,
        status,
        type,
        date,
        host,
        category,
        venue,
        value,
      } = req.query;
      const currentDate = new Date();
      const query = { isDeleted: false };
      if (search) {
        query.$or = [
          { title: { $regex: search, $options: "i" } },
          { location: { $regex: search, $options: "i" } },
        ];
      }

      if (value === "upcoming") {
        query.eventEndDate = { $gte: currentDate };
      } else if (value === "past") {
        query.eventStartDate = { $lte: currentDate };
      }

      if (status) {
        query.status = status;
      }

      if (date) {
        const startOfDay = new Date(date);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);
        query.$or = [
          { eventStartDate: { $gte: startOfDay, $lte: endOfDay } },
          { eventEndDate: { $gte: startOfDay, $lte: endOfDay } },
        ];
      }

      if (host) {
        query["host._id"] = mongoose.Types.ObjectId.createFromHexString(host);
      }
      if (category) {
        query["category._id"] =
          mongoose.Types.ObjectId.createFromHexString(category);
      }
      if (venue) {
        query["venue._id"] = mongoose.Types.ObjectId.createFromHexString(venue);
      }
      if (type) {
        query.type = type;
      }

      const sortquery = {};
      if (sortBy) {
        const [field, sortType] = sortBy.split(" ");
        sortquery[field || "createdAt"] = sortType === "desc" ? -1 : 1;
      } else {
        sortquery.createdAt = -1;
      }

      const pipeline = [
        {
          $lookup: {
            from: "users",
            localField: "host",
            foreignField: "_id",
            as: "hostdetail",
          },
        },
        {
          $lookup: {
            from: "categories",
            localField: "category",
            foreignField: "_id",
            as: "categoryDetail",
          },
        },
        {
          $unwind: {
            path: "$categoryDetail",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "venue",
            foreignField: "_id",
            as: "venuedetail",
          },
        },
        { $unwind: { path: "$venuedetail", preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: "likes",
            localField: "_id",
            foreignField: "event_id",
            as: "Details",
          },
        },
        {
          $project: {
            id: "$_id",
            title: "$title",
            description: "$description",
            location: "$location",
            venue_location: "$venue_location",
            country: "$country",
            state: "$state",
            city: "$city",
            isOnline: "$isOnline",
            link: "$link",
            images: "$images",
            host: "$hostdetail",
            zipCode: "$zipCode",
            coordinates: "$coordinates",
            short_description: "$short_description",
            menu_item_format: "$menu_item_format",
            foodImages: "$foodImages",
            audience: "$audience",
            like_count: {
              $size: {
                $filter: {
                  input: "$Details",
                  as: "like",
                  cond: {
                    $and: [
                      { $eq: ["$$like.type", "like"] },
                      { $eq: ["$$like.isDeleted", false] },
                    ],
                  },
                },
              },
            },
            follow_count: {
              $size: {
                $filter: {
                  input: "$Details",
                  as: "follow",
                  cond: {
                    $and: [
                      { $eq: ["$$follow.type", "follow"] },
                      { $eq: ["$$follow.isDeleted", false] },
                    ],
                  },
                },
              },
            },
            attention: "$attention",
            extraFood: "$extraFood",
            category: "$categoryDetail",
            tickets: "$tickets",
            venue: "$venuedetail",
            foods: "$foods",
            drinks: "$drinks",
            type: "$type",
            price_of_ticket: "$price_of_ticket",
            eventStartDate: "$eventStartDate",
            eventEndDate: "$eventEndDate",
            status: "$status",
            isDeleted: "$isDeleted",
            createdAt: "$createdAt",
            updatedAt: "$updatedAt",
          },
        },
        { $match: query },
        { $sort: sortquery },
      ];

      const total = await db.events.aggregate([...pipeline]);
      const totalCount = total.length;

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

      const result = await db.events.aggregate([...pipeline]);

      return res.status(200).json({
        success: true,
        data: result,
        total: totalCount,
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        error: {
          code: 400,
          message: err.message,
        },
      });
    }
  },

  /**
   * get upcoming events for user
   */
  getUpcomingEvents: async (req, res) => {
    try {
      let { search, sortBy, page, count, status, type, date } = req.query;
      var query = {};
      if (search) {
        query.$or = [
          {
            title: {
              $regex: search,
              $options: "i",
            },
          },
          {
            location: {
              $regex: search,
              $options: "i",
            },
          },
          { eventStartDate: new Date(date) },
          { eventEndDate: new Date(date) },
        ];
      }
      let currentDate = new Date();
      query.eventEndDate = { $gte: currentDate };
      query.isDeleted = false;
      var sortquery = {};
      if (sortBy) {
        var order = sortBy.split(" ");
        var field = order[0];
        var sortType = order[1];
      }

      sortquery[field ? field : "createdAt"] = sortType
        ? sortType == "desc"
          ? -1
          : 1
        : -1;
      if (status) {
        query.status = status;
      }

      console.log(query, "query");

      if (host) {
        query["host._id"] = mongoose.Types.ObjectId.createFromHexString(host);
      }
      if (category) {
        query["category._id"] =
          mongoose.Types.ObjectId.createFromHexString(category);
      }
      if (venue) {
        query["venue._id"] = mongoose.Types.ObjectId.createFromHexString(venue);
      }
      if (type) {
        query.type = type;
      }
      const pipeline = [
        {
          $lookup: {
            from: "users",
            localField: "host",
            foreignField: "_id",
            as: "hostdetail",
          },
        },
        {
          $lookup: {
            from: "categories",
            localField: "category",
            foreignField: "_id",
            as: "categoryDetail",
          },
        },
        {
          $unwind: {
            path: "$categoryDetail",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "venue",
            foreignField: "_id",
            as: "venuedetail",
          },
        },
        {
          $unwind: {
            path: "$venuedetail",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            id: "$_id",
            title: "$title",
            description: "$description",
            location: "$location",
            venue_location: "$venue_location",
            country: "$country",
            state: "$state",
            city: "$city",
            isOnline: "$isOnline",
            link: "$link",
            images: "$images",
            host: "$hostdetail",
            zipCode: "$zipCode",
            coordinates: "$coordinates",
            short_description: "$short_description",
            audience: "$audience",
            attention: "$attention",
            extraFood: "$extraFood",
            category: "$categoryDetail",
            tickets: "$tickets",
            venue: "$venuedetail",
            foods: "$foods",
            drinks: "$drinks",
            menu_item_format: "$menu_item_format",
            foodImages: "$foodImages",
            type: "$type",
            price_of_ticket: "$price_of_ticket",
            eventStartDate: "$eventStartDate",
            eventEndDate: "$eventEndDate",
            status: "$status",
            isDeleted: "$isDeleted",
            createdAt: "$createdAt",
            updatedAt: "$updatedAt",
          },
        },
        {
          $match: query,
        },
        {
          $sort: sortquery,
        },
      ];

      const total = await db.events.aggregate([...pipeline]);

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

      const result = await db.events.aggregate([...pipeline]);

      return res.status(200).json({
        success: true,
        data: result,
        total: total.length,
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        error: {
          code: 400,
          message: "" + err,
        },
      });
    }
  },

  /**
   * for get details of event
   */
  getEventDetailForUser: async (req, res) => {
    try {
      const id = req.query.id;
      if (!id) {
        return res.status(401).json({
          success: false,
          error: {
            code: 401,
            message: constants.onBoarding.PAYLOAD_MISSING,
          },
        });
      }
      let query = {};
      query.id = mongoose.Types.ObjectId.createFromHexString(id);
      console.log("query", query);
      const pipeline = [
        {
          $lookup: {
            from: "users",
            localField: "host",
            foreignField: "_id",
            as: "hostdetail",
          },
        },
        {
          $lookup: {
            from: "categories",
            localField: "category",
            foreignField: "_id",
            as: "categoryDetail",
          },
        },
        {
          $unwind: {
            path: "$categoryDetail",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "venue",
            foreignField: "_id",
            as: "venuedetail",
          },
        },
        // { $unwind: { path: "$venuedetail", preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: "amenities",
            localField: "venuedetail.amenities",
            foreignField: "_id",
            as: "amenitiesDetails",
          },
        },
        {
          $lookup: {
            from: "likes",
            localField: "_id",
            foreignField: "event_id",
            as: "Details",
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "Details.addedBy",
            foreignField: "_id",
            as: "userDetails",
          },
        },
        {
          $project: {
            id: "$_id",
            title: "$title",
            description: "$description",
            location: "$location",
            venue_location: "$venue_location",
            country: "$country",
            state: "$state",
            city: "$city",
            isOnline: "$isOnline",
            link: "$link",
            images: "$images",
            host: "$hostdetail",
            zipCode: "$zipCode",
            coordinates: "$coordinates",
            short_description: "$short_description",
            menu_item_format: "$menu_item_format",
            foodImages: "$foodImages",
            audience: "$audience",
            like_count: {
              $size: {
                $filter: {
                  input: "$Details",
                  as: "like",
                  cond: {
                    $and: [
                      { $eq: ["$$like.type", "like"] },
                      { $eq: ["$$like.isDeleted", false] },
                    ],
                  },
                },
              },
            },
            follow_count: {
              $size: {
                $filter: {
                  input: "$Details",
                  as: "follow",
                  cond: {
                    $and: [
                      { $eq: ["$$follow.type", "follow"] },
                      { $eq: ["$$follow.isDeleted", false] },
                    ],
                  },
                },
              },
            },
            like_data: {
              $map: {
                input: {
                  $filter: {
                    input: "$Details",
                    as: "like",
                    cond: {
                      $and: [
                        { $eq: ["$$like.type", "like"] },
                        { $eq: ["$$like.isDeleted", false] },
                      ],
                    },
                  },
                },
                as: "like",
                in: {
                  $mergeObjects: [
                    "$$like",
                    { addedBy: { $first: "$userDetails" } },
                  ],
                },
              },
            },
            follow_data: {
              $map: {
                input: {
                  $filter: {
                    input: "$Details",
                    as: "follow",
                    cond: {
                      $and: [
                        { $eq: ["$$follow.type", "follow"] },
                        { $eq: ["$$follow.isDeleted", false] },
                      ],
                    },
                  },
                },
                as: "follow",
                in: {
                  $mergeObjects: [
                    "$$follow",
                    { addedBy: { $first: "$userDetails" } },
                  ],
                },
              },
            },
            attention: "$attention",
            extraFood: "$extraFood",
            category: "$categoryDetail",
            tickets: "$tickets",
            venue: {
              $map: {
                input: "$venuedetail",
                as: "venue",
                in: {
                  $mergeObjects: [
                    "$$venue",
                    { amenities: "$amenitiesDetails" },
                  ],
                },
              },
            },
            foods: "$foods",
            drinks: "$drinks",
            type: "$type",
            price_of_ticket: "$price_of_ticket",
            eventStartDate: "$eventStartDate",
            eventEndDate: "$eventEndDate",
            status: "$status",
            isDeleted: "$isDeleted",
            createdAt: "$createdAt",
            updatedAt: "$updatedAt",
          },
        },
        { $match: query },
      ];

      const total = await db.events.aggregate([...pipeline]);
      if (total) {
        return res.status(200).json({
          success: true,
          message: constants.EVENTS.RETRIEVED,
          payload: total[0],
        });
      } else {
        return res.status(404).json({
          success: false,
          error: {
            code: 404,
            message: constants.EVENTS.NOT_FOUND,
          },
        });
      }
    } catch (err) {
      return res.status(500).json({
        success: false,
        error: {
          code: 400,
          message: "" + err,
        },
      });
    }
  },

  listOutSimilarEvents: async (req, res) => {
    try {
      let { search, sortBy, page, count, status, type, date, category } =
        req.query;
      var query = {};
      if (search) {
        query.$or = [
          {
            title: {
              $regex: search,
              $options: "i",
            },
          },
          {
            location: {
              $regex: search,
              $options: "i",
            },
          },

          { eventStartDate: new Date(date) },
          { eventEndDate: new Date(date) },
        ];
      }
      query.isDeleted = false;
      var sortquery = {};
      if (sortBy) {
        var order = sortBy.split(" ");
        var field = order[0];
        var sortType = order[1];
      }

      sortquery[field ? field : "createdAt"] = sortType
        ? sortType == "desc"
          ? -1
          : 1
        : -1;
      if (status) {
        query.status = status;
      }
      if (category) {
        query["category.name"] = { $regex: category, $options: "i" };
      }
      if (type) {
        query.type = type;
      }
      const pipeline = [
        {
          $lookup: {
            from: "categories",
            localField: "category",
            foreignField: "_id",
            as: "categoryDetail",
          },
        },
        {
          $unwind: {
            path: "$categoryDetail",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            id: "$_id",
            title: "$title",
            description: "$description",
            location: "$location",
            venue_location: "$venue_location",
            country: "$country",
            state: "$state",
            city: "$city",
            isOnline: "$isOnline",
            link: "$link",
            images: "$images",
            zipCode: "$zipCode",
            short_description: "$short_description",
            audience: "$audience",
            attention: "$attention",
            coordinates: "$coordinates",
            extraFood: "$extraFood",
            category: "$categoryDetail",
            tickets: "$tickets",
            menu_item_format: "$menu_item_format",
            foodImages: "$foodImages",
            foods: "$foods",
            drinks: "$drinks",
            type: "$type",
            price_of_ticket: "$price_of_ticket",
            eventStartDate: "$eventStartDate",
            eventEndDate: "$eventEndDate",
            status: "$status",
            isDeleted: "$isDeleted",
            createdAt: "$createdAt",
            updatedAt: "$updatedAt",
          },
        },
        {
          $match: query,
        },
        {
          $sort: sortquery,
        },
      ];

      const total = await db.events.aggregate([...pipeline]);

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

      const result = await db.events.aggregate([...pipeline]);
      result.filter(
        (doc) => fuzzball.token_sort_ratio(category, doc.name) > 60
      );
      return res.status(200).json({
        success: true,
        data: result,
        total: total.length,
      });
    } catch (err) {
      return res.status(400).json({
        success: false,
        error: {
          code: "400",
          message: "" + err,
        },
      });
    }
  },
  listEventByVenueId: async (req, res) => {
    try {
      let {
        search,
        sortBy,
        page,
        count,
        status,
        category,
        host,
        type,
        value,
        date,
        venueId,
      } = req.query;
      let currentDate = new Date();
      var query = {};
      if (search) {
        query.$or = [
          {
            title: {
              $regex: search,
              $options: "i",
            },
          },
          {
            location: {
              $regex: search,
              $options: "i",
            },
          },
        ];
      }

      query.isDeleted = false;
      var sortquery = {};
      if (sortBy) {
        var order = sortBy.split(" ");
        var field = order[0];
        var sortType = order[1];
      }

      sortquery[field ? field : "createdAt"] = sortType
        ? sortType == "desc"
          ? -1
          : 1
        : -1;
      if (value === "upcoming") {
        query.eventStartDate = { $gte: currentDate };
      } else if (value === "past") {
        query.eventStartDate = { $lte: currentDate };
      }

      if (status) {
        query.status = status;
      }

      if (date) {
        const startOfDay = new Date(date);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);
        query.$or = [
          { eventStartDate: { $gte: startOfDay, $lte: endOfDay } },
          { eventEndDate: { $gte: startOfDay, $lte: endOfDay } },
        ];
      }
      if (host) {
        query["host._id"] = mongoose.Types.ObjectId.createFromHexString(host);
      }
      if (category) {
        query["category._id"] =
          mongoose.Types.ObjectId.createFromHexString(category);
      }
      if (venueId) {
        query["venue._id"] =
          mongoose.Types.ObjectId.createFromHexString(venueId);
      }
      if (type) {
        query.type = type;
      }

      const pipeline = [
        {
          $lookup: {
            from: "users",
            localField: "host",
            foreignField: "_id",
            as: "hostdetail",
          },
        },
        {
          $lookup: {
            from: "categories",
            localField: "category",
            foreignField: "_id",
            as: "categoryDetail",
          },
        },
        {
          $unwind: {
            path: "$categoryDetail",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "venue",
            foreignField: "_id",
            as: "venuedetail",
          },
        },
        {
          $unwind: {
            path: "$venuedetail",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: "likes",
            localField: "_id",
            foreignField: "event_id",
            as: "Details"
          }
        },
        {
          $project: {
            id: "$_id",
            title: "$title",
            description: "$description",
            location: "$location",
            country: "$country",
            state: "$state",
            city: "$city",
            isOnline: "$isOnline",
            link: "$link",
            images: "$images",
            host: "$hostdetail",
            zipCode: "$zipCode",
            coordinates: "$coordinates",
            short_description: "$short_description",
            audience: "$audience",
            attention: "$attention",
            extraFood: "$extraFood",
            category: "$categoryDetail",
            tickets: "$tickets",
            venue: "$venuedetail",
            foods: "$foods",
            drinks: "$drinks",
            menu_item_format: "$menu_item_format",
            foodImages: "$foodImages",
            type: "$type",
            price_of_ticket: "$price_of_ticket",
            like_count: {
              $size: {
                $filter: {
                  input: "$Details",
                  as: "like",
                  cond: {
                    $and: [
                      { $eq: ["$$like.type", "like"] },
                      { $eq: ["$$like.isDeleted", false] },
                    ],
                  },
                },
              },
            },
            follow_count: {
              $size: {
                $filter: {
                  input: "$Details",
                  as: "follow",
                  cond: {
                    $and: [
                      { $eq: ["$$follow.type", "follow"] },
                      { $eq: ["$$follow.isDeleted", false] },
                    ],
                  },
                },
              },
            },
            eventStartDate: "$eventStartDate",
            eventEndDate: "$eventEndDate",
            status: "$status",
            isDeleted: "$isDeleted",
            createdAt: "$createdAt",
            updatedAt: "$updatedAt",
          },
        },
        {
          $match: query,
        },
        {
          $sort: sortquery,
        },
      ];

      const total = await db.events.aggregate([...pipeline]);

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

      const result = await db.events.aggregate([...pipeline]);

      return res.status(200).json({
        success: true,
        data: result,
        total: total.length,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: {
          code: "400",
          message: " " + error,
        },
      });
    }
  },

  /**
   * for get evnets which are followed or liked  by us
   */
  getAllEventsFollowAndLikeByUs: async (req, res) => {
    try {
      let {
        search,
        sortBy,
        page,
        count,
        status,
        type,
        date,
        host,
        category,
        venue,
        value,
        userId,
      } = req.query;

      const query = { isDeleted: false };
      if (search) {
        query.$or = [
          { title: { $regex: search, $options: "i" } },
          { location: { $regex: search, $options: "i" } },
        ];
      }
      query.details = { $elemMatch: { isDeleted: false } };

      if (value === "like") {
        query.details.$elemMatch.type = "like";
      } else if (value === "follow") {
        query.details.$elemMatch.type = "follow";
      }

      if (userId) {
        query.details.$elemMatch.addedBy =
          mongoose.Types.ObjectId.createFromHexString(userId);
      }
      if (status) {
        query.status = status;
      }

      if (date) {
        const startOfDay = new Date(date);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);
        query.$or = [
          { eventStartDate: { $gte: startOfDay, $lte: endOfDay } },
          { eventEndDate: { $gte: startOfDay, $lte: endOfDay } },
        ];
      }

      if (host) {
        query["host._id"] = mongoose.Types.ObjectId.createFromHexString(host);
      }
      if (category) {
        query["category._id"] =
          mongoose.Types.ObjectId.createFromHexString(category);
      }
      if (venue) {
        query["venue._id"] = mongoose.Types.ObjectId.createFromHexString(venue);
      }
      if (type) {
        query.type = type;
      }

      const sortquery = {};
      if (sortBy) {
        const [field, sortType] = sortBy.split(" ");
        sortquery[field || "createdAt"] = sortType === "desc" ? -1 : 1;
      } else {
        sortquery.createdAt = -1;
      }
      console.log("query", query);
      const pipeline = [
        {
          $lookup: {
            from: "users",
            localField: "host",
            foreignField: "_id",
            as: "hostdetail",
          },
        },
        {
          $lookup: {
            from: "categories",
            localField: "category",
            foreignField: "_id",
            as: "categoryDetail",
          },
        },
        {
          $unwind: {
            path: "$categoryDetail",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "venue",
            foreignField: "_id",
            as: "venuedetail",
          },
        },
        { $unwind: { path: "$venuedetail", preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: "likes",
            localField: "_id",
            foreignField: "event_id",
            as: "Details",
          },
        },
        {
          $project: {
            id: "$_id",
            title: "$title",
            description: "$description",
            location: "$location",
            venue_location: "$venue_location",
            country: "$country",
            state: "$state",
            city: "$city",
            isOnline: "$isOnline",
            link: "$link",
            images: "$images",
            host: "$hostdetail",
            zipCode: "$zipCode",
            coordinates: "$coordinates",
            short_description: "$short_description",
            menu_item_format: "$menu_item_format",
            foodImages: "$foodImages",
            audience: "$audience",
            details: "$Details",
            like_count: {
              $size: {
                $filter: {
                  input: "$Details",
                  as: "like",
                  cond: {
                    $and: [
                      { $eq: ["$$like.type", "like"] },
                      { $eq: ["$$like.isDeleted", false] },
                    ],
                  },
                },
              },
            },
            follow_count: {
              $size: {
                $filter: {
                  input: "$Details",
                  as: "follow",
                  cond: {
                    $and: [
                      { $eq: ["$$follow.type", "follow"] },
                      { $eq: ["$$follow.isDeleted", false] },
                    ],
                  },
                },
              },
            },
            attention: "$attention",
            extraFood: "$extraFood",
            category: "$categoryDetail",
            tickets: "$tickets",
            venue: "$venuedetail",
            foods: "$foods",
            drinks: "$drinks",
            type: "$type",
            price_of_ticket: "$price_of_ticket",
            eventStartDate: "$eventStartDate",
            eventEndDate: "$eventEndDate",
            status: "$status",
            isDeleted: "$isDeleted",
            createdAt: "$createdAt",
            updatedAt: "$updatedAt",
          },
        },
        { $match: query },
        { $sort: sortquery },
      ];

      const total = await db.events.aggregate([...pipeline]);
      const totalCount = total.length;

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

      const result = await db.events.aggregate([...pipeline]);

      return res.status(200).json({
        success: true,
        data: result,
        total: totalCount,
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        error: {
          code: 400,
          message: err.message,
        },
      });
    }
  },
};

const upload = multer({
  dest: "uploads/", // Destination folder
  limits: {
    fileSize: 10485760,
  }, // 10 MB limit
}).single("file");

const parseCSV = (data) => {
  return new Promise((resolve, reject) => {
    const results = [];
    data
      .pipe(csvParser())
      .on("data", (row) => {
        results.push(row);
      })
      .on("end", () => {
        resolve(results);
      })
      .on("error", (error) => {
        reject(error);
      });
  });
};
