const db = require("../models");

const PERIODS = new Set(["day", "week", "month", "year"]);
const IS_PRODUCTION = process.env.NODE_ENV === "production";
const ENABLE_DASHBOARD_DEV_FALLBACKS = process.env.DASHBOARD_DEV_FALLBACKS === "true" || !IS_PRODUCTION;

const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const asObjectId = (value) => {
  if (!value) return null;
  return db.mongoose.Types.ObjectId.isValid(value) ? value : null;
};

const buildPropertyRoute = (propertyId) => `/property-details?id=${encodeURIComponent(propertyId)}`;
const buildTimelineRoute = (propertyId) => `/property-timeline?id=${encodeURIComponent(propertyId)}`;

const getPropertyCover = (property) => property?.images?.[0]?.fileName || "/assets/img/placeholder.png";

const toDisplayPropertyStatus = (property = {}) => {
  if (property?.offMarket) return "Off-market";
  if (property?.propertyType === "rent") return "Loue";
  if (property?.status === "inactive") return "Inactif";
  return "A vendre";
};

const resolveUser = async (explicitUserId, identityUserId) => {
  const explicitId = asObjectId(explicitUserId);
  if (explicitId) {
    const explicitUser = await db.users.findOne({ _id: explicitId, isDeleted: false }).lean();
    if (explicitUser) return explicitUser;
  }

  const identityId = asObjectId(identityUserId);
  if (identityId) {
    const identityUser = await db.users.findOne({ _id: identityId, isDeleted: false }).lean();
    if (identityUser) return identityUser;
  }

  return db.users.findOne({ isDeleted: false, status: "active" }).lean();
};

const getOwnerProperties = async (userId) => {
  if (!userId) return [];

  return db.property
    .find({ addedBy: userId, isDeleted: false, status: "active" })
    .sort({ createdAt: -1 })
    .limit(12)
    .lean();
};

const buildSyntheticTodoItems = (userId) => {
  const ownerId = String(userId || "dev-owner");
  return [
    {
      id: `todo-dev-${ownerId}-1`,
      type: "SEND_SELLER_FILE",
      role: "OWNER",
      priority: 1,
      label: "Completer votre dossier vendeur",
      property: {
        id: "dev-prop-1",
        coverUrl: "/assets/img/placeholder.png",
        type: "Maison",
        surface: 95,
        city: "Paris",
      },
      action: { route: "/seller-file" },
    },
    {
      id: `todo-dev-${ownerId}-2`,
      type: "OPEN_VISIT_SLOTS",
      role: "OWNER",
      priority: 2,
      label: "Ouvrir des creneaux de visite",
      property: {
        id: "dev-prop-2",
        coverUrl: "/assets/img/placeholder.png",
        type: "Appartement",
        surface: 68,
        city: "Lyon",
      },
      action: { route: "/property-details?id=dev-prop-2" },
    },
  ];
};

const buildSyntheticNewsItems = () => {
  const now = Date.now();
  return [
    {
      id: "news-dev-1",
      occurredAt: new Date(now - 2 * 60 * 60 * 1000).toISOString(),
      newsTitle: "Changement de prix",
      property: {
        id: "dev-prop-1",
        title: "Maison familiale",
        status: "A vendre",
        rooms: 5,
        surface: 110,
        location: "Paris",
        imageUrl: "/assets/img/placeholder.png",
        timelineRoute: "/property-timeline?id=dev-prop-1",
      },
    },
    {
      id: "news-dev-2",
      occurredAt: new Date(now - 26 * 60 * 60 * 1000).toISOString(),
      newsTitle: "Travaux renseignes",
      property: {
        id: "dev-prop-2",
        title: "Appartement lumineux",
        status: "Off-market",
        rooms: 3,
        surface: 64,
        location: "Lyon",
        imageUrl: "/assets/img/placeholder.png",
        timelineRoute: "/property-timeline?id=dev-prop-2",
      },
    },
  ];
};

const buildSyntheticTrainingItems = () => {
  return [
    {
      id: "train-dev-1",
      authorName: "AnyHomes Team",
      authorAvatarUrl: "/assets/img/placeholder.png",
      imageUrl: "/assets/img/placeholder.png",
      category: "Owning",
      title: "Comment definir le bon prix de vente",
      contentType: "written",
      consumptionTime: "3 minutes",
      route: "/training",
    },
    {
      id: "train-dev-2",
      authorName: "AnyHomes Team",
      authorAvatarUrl: "/assets/img/placeholder.png",
      imageUrl: "/assets/img/placeholder.png",
      category: "Renting",
      title: "5 conseils pour organiser vos visites",
      contentType: "video",
      consumptionTime: "5 minutes",
      route: "/training",
    },
  ];
};

const buildSyntheticP2PReportProperties = () => {
  return [
    {
      propertyId: "p2p-dev-1",
      defaultExpanded: true,
      property: {
        title: "Maison familiale",
        rooms: 5,
        surface: 95,
        postalCode: "75018",
        city: "Paris",
        country: "France",
        imageUrl: "/assets/img/placeholder.png",
      },
      pricing: {
        appropriate: 12,
        underEstimated: 6,
        overEstimated: 3,
        minPrice: 720000,
        avgPrice: 780000,
        maxPrice: 840000,
        minUsers: 5,
        avgUsers: 9,
        maxUsers: 7,
      },
      qualitativeAssessment: {
        title: 4.1,
        pictures: 3.9,
        interiorDesign: 4.0,
        location: 4.3,
        couldLiveIn: 4.2,
        titleUsers: 21,
        picturesUsers: 19,
        interiorDesignUsers: 18,
        locationUsers: 22,
        couldLiveInUsers: 20,
      },
      action: { route: "/social-estimation?propertyId=p2p-dev-1" },
    },
  ];
};

const getRecentActiveProperties = async (limit = 10) => {
  return db.property
    .find({ isDeleted: false, status: "active" })
    .sort({ updatedAt: -1 })
    .limit(limit)
    .lean();
};

const getTodoSection = async (userId, properties) => {
  const sourceProperties = properties.length ? properties : await getRecentActiveProperties(6);
  const propertyById = new Map(sourceProperties.map((property) => [String(property._id), property]));
  const propertyIds = sourceProperties.map((property) => property._id);

  let todoFromInterests = [];
  if (userId && propertyIds.length) {
    const interests = await db.interests
      .find({
        propertyId: { $in: propertyIds },
        isDeleted: false,
        status: "active",
      })
      .sort({ updatedAt: -1 })
      .limit(24)
      .populate("buyerId", "firstName lastName fullName")
      .lean();

    todoFromInterests = interests
      .map((interest) => {
        const property = propertyById.get(String(interest.propertyId));
        if (!property) return null;

        let type = "BOOK_VISIT";
        let label = `Inviter un lead a visiter ${property.propertyTitle || "ce bien"}`;

        if (toNumber(interest?.makeOfferAmount) > 0 || interest?.interestType === "offer sent") {
          type = "ANSWER_OFFER";
          label = `Repondre a une offre pour ${property.propertyTitle || "ce bien"}`;
        } else if (/application/i.test(interest?.funnelStatus || "")) {
          type = "ANSWER_APPLICATION";
          label = `Traiter une candidature pour ${property.propertyTitle || "ce bien"}`;
        } else if (!interest?.ownerVisitDate) {
          type = "OPEN_VISIT_SLOTS";
          label = `Ouvrir des creneaux de visite pour ${property.propertyTitle || "ce bien"}`;
        }

        const buyer = interest?.buyerId || {};
        const firstName = buyer?.firstName || buyer?.fullName || "";
        const lastName = buyer?.lastName || "";

        return {
          id: `todo-interest-${interest._id}`,
          type,
          role: "OWNER",
          priority: type === "ANSWER_OFFER" ? 1 : type === "ANSWER_APPLICATION" ? 2 : 3,
          label,
          property: {
            id: String(property._id),
            coverUrl: getPropertyCover(property),
            type: property.type || "Maison",
            surface: toNumber(property.surface),
            city: property.city || "-",
          },
          lead: firstName || lastName ? { id: String(buyer?._id || ""), firstName, lastName } : undefined,
          action: { route: buildPropertyRoute(String(property._id)) },
        };
      })
      .filter(Boolean)
      .sort((a, b) => a.priority - b.priority);
  }

  const existingPropertyIds = new Set(todoFromInterests.map((item) => item?.property?.id));
  const fallbackItems = sourceProperties
    .filter((property) => !existingPropertyIds.has(String(property._id)))
    .slice(0, 5)
    .map((property, index) => ({
      id: `todo-property-${property._id}`,
      type: property?.sellerFiles ? "OPEN_VISIT_SLOTS" : "SEND_SELLER_FILE",
      role: "OWNER",
      priority: 10 + index,
      label: property?.sellerFiles
        ? `Mettre a jour les disponibilites de ${property.propertyTitle || "votre bien"}`
        : `Completer le dossier vendeur de ${property.propertyTitle || "votre bien"}`,
      property: {
        id: String(property._id),
        coverUrl: getPropertyCover(property),
        type: property.type || "Maison",
        surface: toNumber(property.surface),
        city: property.city || "-",
      },
      action: { route: buildPropertyRoute(String(property._id)) },
    }));

  const items = [...todoFromInterests, ...fallbackItems].slice(0, 6);

  return {
    visible: true,
    title: "To do list",
    subtitle: "Actions to drive your real-estate project",
    emptyMessage:
      "Here will be displayed actions you need to take to drive your real estate project to success",
    items: items.length ? items : (ENABLE_DASHBOARD_DEV_FALLBACKS ? buildSyntheticTodoItems(userId) : []),
  };
};

const getAttractivitySection = (period, properties) => ({
  visible: true,
  period,
  emptyState: properties.length
    ? null
    : {
        message: "No property available yet.",
        ctaLabel: "Create property",
        ctaRoute: "/property1",
      },
  cards: properties.slice(0, 3).map((property) => ({
    propertyId: String(property._id),
    property: {
      title: property.propertyTitle || "Property",
      coverUrl: property.images?.[0]?.fileName || "/assets/img/placeholder.png",
    },
    metrics: {
      views: { value: toNumber(property.propertyViewerCount), deltaPct: 0 },
      followers: { value: Array.isArray(property.follow) ? property.follow.length : 0, deltaPct: 0 },
      shares: { value: toNumber(property.shareCount), deltaPct: 0 },
      messages: { value: 0, deltaPct: 0 },
    },
  })),
});

const getSavedSearchSection = async (userId, properties) => {
  if (!userId) {
    return {
      visible: true,
      emptyState: {
        message: "You will find new results from your saved searches here.",
        ctaLabel: "New search",
        ctaRoute: "/properties",
      },
      cards: [],
    };
  }

  const searches = await db.savesearch.find({ searchBy: userId }).sort({ createdAt: -1 }).limit(3).lean();

  return {
    visible: true,
    emptyState: searches.length
      ? null
      : {
          message: "You will find new results from your saved searches here.",
          ctaLabel: "New search",
          ctaRoute: "/properties",
        },
    cards: searches.map((search, index) => ({
      savedSearchId: String(search._id),
      name: `Search ${index + 1}`,
      criteriaLabel: `${search.propertyType || "sale"}, ${search.searchLocation || search.zipcode || "-"}`,
      newResultsCount: properties.length,
      previewProperties: properties.slice(0, 3).map((property) => ({
        id: String(property._id),
        coverUrl: property.images?.[0]?.fileName || "/assets/img/placeholder.png",
        route: buildPropertyRoute(String(property._id)),
      })),
      action: { route: "/properties?search=true" },
    })),
  };
};

const mapTimelineTypeToNews = (timelineItem) => {
  switch (timelineItem?.type) {
    case "newPrice":
      return "Changement de prix";
    case "propertyType":
      return "Changement de statut";
    case "revenue_detail":
      return "Revenus locatifs ajoutes";
    case "ownerChange":
      return "Changement de proprietaire";
    default:
      return "Mise a jour du bien";
  }
};

const inferTrainingContentType = (blog) => {
  const duration = `${blog?.duration || ""}`.toLowerCase();
  if (duration.includes("video") || duration.includes("vid")) return "video";
  return "written";
};

const nearestToAverageCount = (values, average) => {
  if (!values.length) return 0;
  let bestDistance = Number.POSITIVE_INFINITY;
  let count = 0;
  values.forEach((value) => {
    const distance = Math.abs(value - average);
    if (distance < bestDistance) {
      bestDistance = distance;
      count = 1;
    } else if (distance === bestDistance) {
      count += 1;
    }
  });
  return count;
};

const getFollowedNewsSection = async (userId, ownerProperties) => {
  let followedPropertyIds = [];

  if (userId) {
    const follows = await db.followUnfollow
      .find({ user_id: userId, follow_unfollow: true, isDeleted: false, status: "active" })
      .sort({ updatedAt: -1 })
      .limit(10)
      .lean();

    followedPropertyIds = follows.map((item) => item.property_id).filter(Boolean);
  }

  if (!followedPropertyIds.length) {
    followedPropertyIds = ownerProperties.slice(0, 8).map((property) => property._id);
  }

  if (!followedPropertyIds.length) {
    const recentProperties = await getRecentActiveProperties(8);
    followedPropertyIds = recentProperties.map((property) => property._id);
  }

  let followedProperties = [];
  if (followedPropertyIds.length) {
    followedProperties = await db.property
      .find({ _id: { $in: followedPropertyIds }, isDeleted: false })
      .sort({ updatedAt: -1 })
      .limit(10)
      .lean();
  }

  const timelines = followedPropertyIds.length
    ? await db.timeline
        .find({ propertyId: { $in: followedPropertyIds } })
        .sort({ createdAt: -1 })
        .limit(10)
        .populate("propertyId")
        .lean()
    : [];

  const timelineItems = timelines
    .filter((timeline) => timeline.propertyId)
    .map((timeline) => {
      const property = timeline.propertyId;
      return {
        id: String(timeline._id),
        occurredAt: timeline.createdAt || new Date().toISOString(),
        newsTitle: mapTimelineTypeToNews(timeline),
        property: {
          id: String(property._id),
          title: property.propertyTitle || "Property",
          status: toDisplayPropertyStatus(property),
          rooms: toNumber(property.rooms),
          surface: toNumber(property.surface),
          location: property.city || property.zipcode || "-",
          imageUrl: getPropertyCover(property),
          timelineRoute: buildTimelineRoute(String(property._id)),
        },
      };
    });

  const timelinePropertyIds = new Set(timelineItems.map((item) => item?.property?.id));
  const syntheticItems = followedProperties
    .filter((property) => !timelinePropertyIds.has(String(property._id)))
    .slice(0, 10)
    .map((property) => ({
      id: `news-property-${property._id}`,
      occurredAt: property.updatedAt || property.createdAt || new Date().toISOString(),
      newsTitle: "Mise a jour du bien",
      property: {
        id: String(property._id),
        title: property.propertyTitle || "Property",
        status: toDisplayPropertyStatus(property),
        rooms: toNumber(property.rooms),
        surface: toNumber(property.surface),
        location: property.city || property.zipcode || "-",
        imageUrl: getPropertyCover(property),
        timelineRoute: buildTimelineRoute(String(property._id)),
      },
    }));

  const items = [...timelineItems, ...syntheticItems]
    .sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime())
    .slice(0, 10);

  const resolvedItems = items.length ? items : (ENABLE_DASHBOARD_DEV_FALLBACKS ? buildSyntheticNewsItems() : []);

  return {
    visible: true,
    items: resolvedItems,
  };
};

const getPastTransactionsSection = async () => {
  const tx = await db.pastTransaction
    .find({})
    .sort({ createdAt: -1 })
    .limit(6)
    .lean();

  return {
    visible: true,
    items: tx.map((item) => ({
      id: String(item._id),
      imageUrl: "/assets/img/placeholder.png",
      propertyType: item.local_type || "House",
      price: toNumber(item.land_value),
      surface: toNumber(item.real_built_surface),
      rooms: toNumber(item.number_of_main_pieces),
      locationLabel: [item.community_name, item.postal_code].filter(Boolean).join(" ") || "-",
      soldAt: item.mutation_date || item.createdAt,
    })),
  };
};

const getP2PEstimationSection = async (userId) => {
  const criteria = { isDeleted: false, status: "active" };
  if (userId) criteria.addedBy = { $ne: userId };

  const properties = await db.property.find(criteria).sort({ createdAt: -1 }).limit(6).lean();

  return {
    visible: true,
    title: "Properties in your area are waiting for your peer-to-peer estimation",
    subtitle: "Help owners by giving your opinion",
    items: properties.map((property) => ({
      propertyId: String(property._id),
      imageUrl: property.images?.[0]?.fileName || "/assets/img/placeholder.png",
      route: buildPropertyRoute(String(property._id)),
    })),
    action: { ctaLabel: "Estimate properties", route: "/estimation" },
  };
};

const getP2PReportSection = async (userId, ownerProperties) => {
  if (!userId) {
    return {
      visible: true,
      emptyState: {
        message: "List your property to start peer estimations.",
        ctaLabel: "List my property",
        ctaRoute: "/property1",
      },
      action: null,
      properties: [],
    };
  }

  const campaigns = await db.peerCampaign
    .find({ userId, status: "active" })
    .sort({ createdAt: -1 })
    .limit(3)
    .populate("propertyId")
    .lean();

  if (!campaigns.length) {
    return {
      visible: true,
      emptyState: ownerProperties.length
        ? null
        : {
            message: "List your property to start peer estimations.",
            ctaLabel: "List my property",
            ctaRoute: "/property1",
          },
      action: ownerProperties.length
        ? { ctaLabel: "Start peer campaign", route: "/estimation" }
        : null,
      properties: ENABLE_DASHBOARD_DEV_FALLBACKS ? buildSyntheticP2PReportProperties() : [],
    };
  }

  const properties = [];

  for (const campaign of campaigns) {
    const estimations = await db.peerEstimation.find({ campaginId: campaign._id }).lean();

    const appropriate = estimations.filter((item) => item.referencePrice === "appropriate").length;
    const underEstimated = estimations.filter((item) => item.referencePrice === "underestimated").length;
    const overEstimated = estimations.filter((item) => item.referencePrice === "expensive").length;

    const avg = (arr) => {
      if (!arr.length) return 0;
      return arr.reduce((sum, value) => sum + toNumber(value), 0) / arr.length;
    };

    const prices = estimations.map((item) => toNumber(item.userReasonablePrice)).filter((value) => value > 0);
    const minPrice = prices.length ? Math.min(...prices) : 0;
    const maxPrice = prices.length ? Math.max(...prices) : 0;
    const avgPrice = prices.length ? Math.round(avg(prices)) : 0;

    const maxUsers = prices.filter((value) => value === maxPrice).length;
    const minUsers = prices.filter((value) => value === minPrice).length;
    const avgUsers = nearestToAverageCount(prices, avgPrice);

    const titleRatings = estimations.map((item) => toNumber(item.ratePropertyTitle)).filter((value) => value > 0);
    const pictureRatings = estimations.map((item) => toNumber(item.ratePropertyPictures)).filter((value) => value > 0);
    const interiorRatings = estimations.map((item) => toNumber(item.rateInteriorDesign)).filter((value) => value > 0);
    const locationRatings = estimations.map((item) => toNumber(item.rateLocation)).filter((value) => value > 0);
    const desirabilityRatings = estimations.map((item) => toNumber(item.rateCouldYouLiveIn)).filter((value) => value > 0);

    const property = campaign.propertyId || {};

    properties.push({
      propertyId: String(campaign.propertyId?._id || campaign.propertyId || campaign._id),
      defaultExpanded: properties.length === 0,
      property: {
        title: property.propertyTitle || campaign.campaignName || "Property",
        rooms: toNumber(property.rooms),
        surface: toNumber(property.surface),
        postalCode: property.zipcode || "",
        city: property.city || "",
        country: property.country || "",
        imageUrl: property.images?.[0]?.fileName || "/assets/img/placeholder.png",
      },
      pricing: {
        appropriate,
        underEstimated,
        overEstimated,
        minPrice,
        avgPrice,
        maxPrice,
        minUsers,
        avgUsers,
        maxUsers,
      },
      qualitativeAssessment: {
        title: Number(avg(titleRatings).toFixed(1)),
        pictures: Number(avg(pictureRatings).toFixed(1)),
        interiorDesign: Number(avg(interiorRatings).toFixed(1)),
        location: Number(avg(locationRatings).toFixed(1)),
        couldLiveIn: Number(avg(desirabilityRatings).toFixed(1)),
        titleUsers: titleRatings.length,
        picturesUsers: pictureRatings.length,
        interiorDesignUsers: interiorRatings.length,
        locationUsers: locationRatings.length,
        couldLiveInUsers: desirabilityRatings.length,
      },
      action: {
        route: buildPropertyRoute(String(campaign.propertyId?._id || campaign.propertyId || campaign._id)),
      },
    });
  }

  return {
    visible: true,
    emptyState: null,
    action: null,
    properties,
  };
};

const getTrainingSection = async () => {
  const blogs = await db.blogs
    .find({ isDeleted: false, status: "active" })
    .sort({ createdAt: -1 })
    .limit(3)
    .populate("addedBy")
    .populate("categoryId")
    .lean();

  const mappedBlogs = blogs.map((blog) => ({
    id: String(blog._id),
    authorName: blog.addedBy?.fullName || blog.addedBy?.firstName || "AnyHomes",
    authorAvatarUrl: blog.addedBy?.image || "",
    imageUrl: blog.banner || blog.images?.[0] || "/assets/img/placeholder.png",
    category: blog.categoryId?.CategoryName || "Owning",
    title: blog.title || "Content",
    contentType: inferTrainingContentType(blog),
    consumptionTime: blog.duration || "3 minutes",
    route: `/blog-detail?id=${encodeURIComponent(String(blog._id))}`,
  }));

  return {
    visible: true,
    items: mappedBlogs.length ? mappedBlogs : (ENABLE_DASHBOARD_DEV_FALLBACKS ? buildSyntheticTrainingItems() : []),
  };
};

const getSearchPipelineSection = async (userId) => {
  if (!userId) {
    return {
      visible: true,
      emptyState: { message: "No search activity available yet." },
      metrics: null,
    };
  }

  const [propertiesFollowed, propertiesInTransactionFlow, propertiesVisited, visitReviewsReceived, applicationsSent, offersSent] =
    await Promise.all([
      db.followUnfollow.countDocuments({ user_id: userId, follow_unfollow: true, isDeleted: false, status: "active" }),
      db.interests.countDocuments({ buyerId: userId, isDeleted: false, status: "active" }),
      db.interests.countDocuments({ buyerId: userId, isDeleted: false, userVisitDate: { $ne: null } }),
      db.interests.countDocuments({ buyerId: userId, isDeleted: false, review: { $exists: true, $ne: null } }),
      db.interests.countDocuments({ buyerId: userId, isDeleted: false, funnelStatus: /application/i }),
      db.interests.countDocuments({ buyerId: userId, isDeleted: false, interestType: "offer sent" }),
    ]);

  const propertyProfileViewed = propertiesFollowed * 3;

  return {
    visible: true,
    emptyState: null,
    metrics: {
      propertyProfileViewed,
      propertiesFollowed,
      propertiesInTransactionFlow,
      propertiesVisited,
      visitReviewsReceived,
      applicationSentToOwners: applicationsSent,
      purchaseProposalsSentToOwners: offersSent,
    },
  };
};

const getOwnerPipelineSection = async (ownerProperties) => {
  if (!ownerProperties.length) {
    return {
      visible: true,
      emptyState: {
        message: "List your property to start your owner pipeline.",
        ctaLabel: "List my property",
        ctaRoute: "/property1",
      },
      properties: [],
    };
  }

  const properties = [];

  for (const property of ownerProperties.slice(0, 3)) {
    const interests = await db.interests.find({ propertyId: property._id, isDeleted: false }).lean();

    properties.push({
      propertyId: String(property._id),
      property: {
        title: property.propertyTitle || "Property",
        transactionType: property.propertyType === "rent" ? "rental" : "sale",
        rooms: toNumber(property.rooms),
        surface: toNumber(property.surface),
        postalCode: property.zipcode || "",
        city: property.city || "",
        country: property.country || "",
        price: toNumber(property.price || property.propertyMonthlyCharges),
        pricePerSqm:
          toNumber(property.pricePerSqm) ||
          (toNumber(property.price || property.propertyMonthlyCharges) > 0 && toNumber(property.surface) > 0
            ? Math.round(toNumber(property.price || property.propertyMonthlyCharges) / toNumber(property.surface))
            : 0),
        imageUrl: property.images?.[0]?.fileName || "/assets/img/placeholder.png",
      },
      metrics: {
        propertyProfileViews: toNumber(property.propertyViewerCount),
        interestsReceived: interests.length,
        buyerFinancialProfileAnalyzed: interests.filter((item) => item?.applicationFile).length,
        renterFinancialProfileAnalyzed: interests.filter((item) => item?.documents).length,
        visitsHosted: interests.filter((item) => item?.ownerVisitDate).length,
        visitReviewsReceived: interests.filter((item) => item?.review).length,
        offerReceived: interests.filter((item) => item?.interestType === "offer sent" || toNumber(item?.makeOfferAmount) > 0).length,
        applicationReceived: interests.filter((item) => /application/i.test(item?.funnelStatus || "")).length,
      },
    });
  }

  return {
    visible: true,
    emptyState: null,
    properties,
  };
};

const getActivity = async () => {
  const timelineItems = await db.timeline.find({}).sort({ createdAt: -1 }).limit(3).lean();

  if (!timelineItems.length) {
    return [
      { id: 1, title: "Nouveau lead recu", time: "Il y a quelques minutes" },
      { id: 2, title: "Un bien a ete ajoute aux favoris", time: "Recemment" },
      { id: 3, title: "Recherche sauvegardee creee", time: "Recemment" },
    ];
  }

  return timelineItems.map((item, index) => ({
    id: index + 1,
    title: mapTimelineTypeToNews(item),
    time: new Date(item.createdAt || Date.now()).toLocaleString("fr-FR"),
  }));
};

exports.getDashboardOverview = async ({ period = "day", explicitUserId, identityUserId }) => {
  const safePeriod = PERIODS.has(period) ? period : "day";
  const user = await resolveUser(explicitUserId, identityUserId);
  const userId = user?._id || null;

  const ownerProperties = await getOwnerProperties(userId);

  const [todoList, savedSearchResults, followedPropertyNews, pastTransactions, p2pEstimation, p2pReport, trainingCenter, propertySearchPipeline, ownerPipeline] =
    await Promise.all([
      getTodoSection(userId, ownerProperties),
      getSavedSearchSection(userId, ownerProperties),
      getFollowedNewsSection(userId, ownerProperties),
      getPastTransactionsSection(),
      getP2PEstimationSection(userId),
      getP2PReportSection(userId, ownerProperties),
      getTrainingSection(),
      getSearchPipelineSection(userId),
      getOwnerPipelineSection(ownerProperties),
    ]);

  return {
    user: {
      id: String(user?._id || "user-123"),
      firstName: user?.firstName || user?.fullName || "User",
    },
    meta: {
      generatedAt: new Date().toISOString(),
      period: safePeriod,
    },
    sections: {
      todoList,
      propertyAttractivity: getAttractivitySection(safePeriod, ownerProperties),
      savedSearchResults,
      followedPropertyNews,
      pastTransactions,
      p2pEstimation,
      p2pReport,
      trainingCenter,
      propertySearchPipeline,
      ownerPipeline,
    },
  };
};

exports.getDashboardActivity = async () => {
  return getActivity();
};
