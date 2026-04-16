require('dotenv').config();
const express = require("express");
var cors = require("cors");
let http = require("http");
var bcrypt = require("bcrypt");
//const agenda = require('./app/config/agenda.config.js');

const app = express();
app.use(cors());
// app.use(
//   cors({
//     origin: "*",
//     allowedHeaders: [
//       "Origin",
//       "X-Requested-With",
//       "Content-Type",
//       "Accept",
//       "Authorization",
//       "Access-Control-Allow-Origin"
//     ],
//     methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
//     credentials: false, // Set to false since credentials aren't allowed with origin: '*'
//     optionsSuccessStatus: 204
//   })
// );

// app.options("*", cors());


const corsOptions = {
  origin: true, // frontend URL here
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

app.options('*', cors(corsOptions)); // for preflight support

app.use(express.json());
let socketService = require('./app/services/sockets')

app.use(express.urlencoded({ extended: true }));
//server static files

app.use(express.static("public"));


//Adding Middleware for authenticate request
app.use("/", require("./app/middleware/auth"));
app.use("/", require("./app/middleware/responseTimeMiddleware"));

const db = require("./app/models");

let routes = require("./app/routes");

const { resetDailyMessageLimit } = require("./app/cron/message.cron");
const { checkAndSendSubscriptionReminders } = require("./app/cron/subscription.cron");
const { monthlyCampaignLimit } = require("./app/cron/campaign.cron.js");

// require('./app/routes/users.routes')(app);
// require('./app/routes/upload.routes')(app);
// require('./app/routes/category.routes')(app);
// require('./app/routes/roles.routes')(app);
// Middleware to append io instance to req
// app.use((req, res, next) => {
//     req.io = getSocketIo(); // Append io instance to req
//     next();
// });

db.mongoose.set("strictQuery", false);
db.mongoose
  .connect(db.url, {})
  .then(async () => {
    console.log("Connected to the database!");


    //load all jobs
   // const agenda = require("./app/config/agenda.config.js");
   // require("./app/jobs/agenda.jobs")(agenda, db);

   // await agenda.start();
   // console.log("Agenda started and jobs loaded.");
  })
  .catch((err) => {
    console.log("Cannot connect to the database!", err);
    process.exit();
  });

// simple route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to  Bookaroo" });
});

app.use("/", routes);
// let rolesData = [
//   { name: "admin", loginPortal: "admin", permissions: [] },
//   { name: "user", loginPortal: "front", permissions: [] },
// ];

var usersData = {
  fullName: "Bookaroo",
  password: "123456789",
  email: "bookaroo_admin@yopmail.com",
  role: "admin",
  status: "active",
  isVerified: "Y",
};

const seedDb = async () => {
  // if ((await db.users.countUsers()) == 0) {
  //   await db.users.insertMany(rolesData);
  // }

  if ((await db.users.countDocuments()) == 0) {
    // let adminRole = await db.roles.findOne({ name: "Admin" });
    // if (adminRole) {
    // for await (let itm of usersData) {
    console.log(usersData.password);
    usersData.password = await bcrypt.hashSync(
      usersData.password,
      bcrypt.genSaltSync(10)
    );
    // itm["role"] = adminRole._id;

    await db.users.create(usersData);
    // }
    // }
  }
};
seedDb();

resetDailyMessageLimit();
checkAndSendSubscriptionReminders();
monthlyCampaignLimit();
// set port, listen for requests
const PORT = process.env.PORT || 6089;

let startServer = http.createServer(app);
socketService.initializeSocket(startServer)
startServer.listen(PORT, function () {
  console.log(`Server is running on port ${PORT}.`);
});
module.exports = app;
