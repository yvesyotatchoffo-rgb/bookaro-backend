const express = require("express");
var cors = require("cors");
const router = express.Router();
/**Image upload using multer */
var multer = require("multer");
const archiver = require("archiver");
const fs = require('fs');
const path = require("path");
const csv = require("csv-parser");
const xlsx = require('xlsx');
const streamifier = require("streamifier");
const stream = require("stream");
const reader = require("xlsx");
const { v4: uuidv4 } = require('uuid');
const db = require("../models/index");
const { error } = require("console");
const BuildingPermits = require("../models/buildingPermit.model");
// const { pastTransaction } = require("../models/past"); // Assuming your model is located in `models`
function createGeoLocation(longitude, latitude) {
  if (!isNaN(longitude) && !isNaN(latitude)) {
    return {
      type: "Point",
      coordinates: [parseFloat(longitude), parseFloat(latitude)]
    };
  }
  return null; // Return null if coords are invalid
}

function parseDecimalSafe(value) {
  const parsed = parseFloat(value);
  return !isNaN(parsed) && isFinite(parsed) ? parsed : undefined;
}
const normalizeSchoolType = (type) => {
  const map = {
    "Ecole elementaire": "elementarySchool",
    "Collège": "college",
    "Ecole maternelle": "kindergarten",
    "Elementaire/primaire": "elementaryPrimary",
    "Lycée": "highschool",
  };
  return map[type?.trim()] || type?.trim();
};

const normalizeEstType = (type) => {
  const map = {
    "Ecole": "school",
    "Collège": "college",
    "Lycée": "highschool",
  };
  return map[type?.trim()] || type?.trim();
};

const excelStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./public/static");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const uploadExcel = multer({ storage: excelStorage, limits: { fileSize: 5242880 } }); // 5 MB limit



var storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./public/img");
  },
  filename: (req, file, cb) => {
    // console.log(file);
    var filetype = "";
    let extension = file.originalname.split(".")[1]

    if (file.mimetype === "image/gif") {
      filetype = "gif";
    }
    if (file.mimetype === "image/png") {
      filetype = "png";
    }
    if (file.mimetype === "image/jpeg") {
      filetype = "jpg";
    }
    const randomSuffix = Math.floor(Math.random() * 10000);

    cb(null, "image-" + Date.now() + "-" + randomSuffix + "." + extension);
  },
});
var upload = multer({ storage: storage });

var fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./public/document");
  },
  filename: (req, file, cb) => {
    console.log(file);
    var ext = file.mimetype.split("/")[1];

    cb(null, "document-" + Date.now() + `.${ext}`);
  },
});
var uploadJson = multer({ storage: fileStorage });

const videoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./public/videos");
  },
  filename: (req, file, cb) => {
    var ext = file.originalname.split(".").pop(); // Get the file extension from original filename

    cb(null, "video-" + Date.now() + `.${ext}`);
  },
});

const uploadVideo = multer({ storage: videoStorage });

const audioStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./public/audios");
  },
  filename: (req, file, cb) => {
    var ext = file.originalname.split(".").pop(); // Get the file extension from original filename

    cb(null, "audio-" + Date.now() + `.${ext}`);
  },
});

const uploadAudio = multer({ storage: audioStorage });

const storageZip = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = "./uploads";
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext);
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e4);
    cb(null, base + "-" + uniqueSuffix + ext);
  }
});
const uploadZip = multer({ storageZip })

// ----------------------------
const uploadDir = path.resolve(__dirname, "../../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer setup
const storageCSV = multer.memoryStorage();
const uploadCSV = multer({ storageCSV });

// const uploadSchool = multer({ dest: "uploads/" });
const storageSchool = multer.memoryStorage();
const uploadSchool = multer({ storageSchool });

const stroageEstimationPrice = multer.memoryStorage();
const uploadEstimationPrice = multer({ stroageEstimationPrice });

router.post("/image", upload.single("file"), function (req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: { code: 400, message: "Please upload a valid file." },
      });
    }
    return res.json({
      success: true,
      filePath: "img/" + req.file.filename,
      fileName: req.file.filename,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      error: { code: 400, message: error },
    });
  }
});

router.post("/document", uploadJson.single("file"), function (req, res, next) {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      error: { code: 400, message: "Please upload a valid document file." },
    });
  }
  return res.json({
    success: true,
    filePath: "document/" + req.file.filename,
    fileName: req.file.filename,
  });
});

router.post(
  "/multiple-images",
  cors(),
  upload.array("files"), // 'file' is the field name for multiple file
  function (req, res, next) {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: { code: 400, message: "Please upload at least one valid file." },
      });
    }

    const allowedExtensions = [".xlsx", ".csv", ".jpeg", ".jpg", ".pdf", ".png", ".svg"];

    const invalidFiles = req.files.filter((file) => {
      const ext = path.extname(file.originalname || "").toLowerCase();
      return !allowedExtensions.includes(ext);
    });

    if (invalidFiles.length > 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 400,
          message: `One or more files are not in valid format: ${invalidFiles
            .map((f) => f.originalname)
            .join(", ")}. Allowed: ${allowedExtensions.join(", ")}`
        },
      });
    }
    const fileDetails = req.files.map((files) => ({
      filePath: "img/" + files.filename,
      fileName: files.filename,
      originalname: files.originalname,

    }));

    return res.json({
      success: true,
      files: fileDetails,
    });
  }
);

router.post("/video", uploadVideo.single("file"), function (req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: { code: 400, message: "Please upload a valid file." },
      });
    }
    return res.json({
      success: true,
      filePath: "videos/" + req.file.filename,
      fileName: req.file.filename,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      error: { code: 400, message: error },
    });
  }
});
router.post(
  "/multiple-videos",
  uploadVideo.array("files"), // 'file' is the field name for multiple file
  function (req, res, next) {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: { code: 400, message: "Please upload at least one valid file." },
      });
    }
    const fileDetails = req.files.map((files) => ({
      filePath: "videos/" + files.filename,
      fileName: files.filename,
    }));

    return res.json({
      success: true,
      files: fileDetails,
    });
  }
);

router.post("/audio", uploadAudio.single("file"), function (req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: { code: 400, message: "Please upload a valid file." },
      });
    }
    return res.json({
      success: true,
      filePath: "audios/" + req.file.filename,
      fileName: req.file.filename,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      error: { code: 400, message: error },
    });
  }
});
router.post("/importPastTransactions", uploadExcel.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      error: { code: 400, message: "Please upload a valid Excel file." },
    });
  }

  try {
    const fileLocation = req.file.path;
    const file = reader.readFile(fileLocation);
    let data = [];
    const temp = reader.utils.sheet_to_json(file.Sheets[file.SheetNames[0]]);

    let successImport = 0;
    let successUpdatedImport = 0;

    for (let res of temp) {
      res = Object.keys(res).reduce((acc, key) => {
        acc[key.toLowerCase()] = res[key];
        return acc;
      }, {});
      res.is_imported = "Y";
      successImport++;
      data.push(res);
    }

    let addedTransaction = await db.pastTransaction.insertMany(data)

    if (addedTransaction && addedTransaction.length > 0) {
      return res.json({
        success: true,
        message: `${successImport} Data Imported successfully`,
      });
    } else {
      return res.json({
        success: true,
        message: `${successUpdatedImport} Data Updated & Imported successfully`,
      });
    }
  } catch (error) {
    console.log(error, "===============error")
    return res.status(400).json({
      success: false,
      error: { code: 400, message: error.message || "An error occurred during the import." },
    });
  }
});

router.post("/zip-files", async (req, res) => {
  try {
    const { files } = req.body;

    if (!files || !Array.isArray(files) || files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No files provided."
      });
    }
    const allowedExtensions = [".xlsx", ".csv", ".jpeg", ".jpg", ".pdf", ".png", ".svg"];
    const invalidFiles = files.filter((filename) => {
      const ext = path.extname(filename || "").toLowerCase();
      return !allowedExtensions.includes(ext);
    });

    if (invalidFiles.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Invalid file format detected: ${invalidFiles.join(", ")}. Allowed formats are: ${allowedExtensions.join(", ")}`
      });
    }
    // Set headers for ZIP download
    res.setHeader("Content-Type", "application/zip");
    res.setHeader("Content-Disposition", "attachment; filename=download.zip");

    const archive = archiver("zip", { zlib: { level: 9 } });

    archive.on("error", (err) => {
      console.error("Archiver error:", err);
      res.status(500).send({ success: false, message: "ZIP error", error: err.message });
    });

    archive.pipe(res); // Pipe archive to response

    // Add each file from uploads directory
    files.forEach(filename => {
      const filePath = path.join(__dirname, "../../public/img", filename);
      console.log("Checking:", filePath, fs.existsSync(filePath))
      if (fs.existsSync(filePath)) {
        archive.file(filePath, { name: filename });
      } else {
        console.warn("File not found:", filePath);
      }
    });

    // Finalize the ZIP archive
    archive.finalize().then(() => {
      console.log("Archive finalized");
    });

  } catch (err) {
    console.error("ZIP creation failed:", err);
    return res.status(500).json({
      success: false,
      message: "Error while creating zip.",
      error: err.message
    });
  }
});

router.post("/importBuildingPermits", uploadCSV.single("file"), async (req, res) => {
  try {
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({
        success: false,
        message: "Uploaded file not found in memory.",
      });
    }

    const results = [];
    let insertedCount = 0;

    const bufferStream = new stream.PassThrough();
    bufferStream.end(req.file.buffer);

    bufferStream
      .pipe(csv())
      .on("data", (row) => {
        const isValidCoords =
          !isNaN(row.latitude) &&
          !isNaN(row.longitude) &&
          !isNaN(row.xAxis) &&
          !isNaN(row.yAxis);

        if (isValidCoords && insertedCount < 300) {   // here limitter added to limit the number of docs getting added 
          results.push({
            type: "residential",   // demolitionPermit or nonResdential
            requestType: row.requestType,
            requestId: row.requestId,
            status: parseInt(row.status),
            authorizationDate: row.authorizationDate,
            authorizationYear: parseInt(row.authorizationYear),
            requestSubmissionYear: parseInt(row.requestSubmissionYear),
            requesterName: row.requesterName,
            requesterSiren: parseInt(row.requesterSiren),
            number: parseInt(row.number),
            roadType: row.roadType,
            roadName: row.roadName,
            city: row.city,
            postalCode: parseInt(row.postalCode),
            address: row.address,
            address1: row.address1,
            latitude: row.latitude,
            longitude: row.longitude,
            projectOwner: row.projectOwner,
            xAxis: row.xAxis,
            yAxis: row.yAxis,
            worksStartDate: row.worksStartDate,
            elevationIndicator: row.elevationIndicator === "true",
            additionalLevelCreation: row.additionalLevelCreation === "true",
            highestLevel: row.highestLevel,
          });

          insertedCount++;
        }
      })
      .on("end", async () => {
        if (results.length > 0) {
          await db.buildingPermits.insertMany(results);
        }

        return res.status(200).json({
          success: true,
          inserted: results.length,
          message: "CSV import completed (max 500 rows).",
        });
      })
      .on("error", (err) => {
        console.error("CSV parse error:", err);
        res.status(500).json({
          success: false,
          message: "Failed to parse CSV.",
          error: err.message,
        });
      });
  }
  catch (err) {
    console.error("CSV import failed:", err);
    return res.status(500).json({
      success: false,
      message: "Error while importing building permits.",
      error: err.message,
    });
  }
})



router.post("/importSchools", uploadSchool.single("file"), async (req, res) => {
  try {
    console.log(req.file.buffer);
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({
        success: false,
        message: "Uploaded file not found in memory."
      })
    }


    const stream = streamifier.createReadStream(req.file.buffer);
    const chunks = [];

    stream.on('data', (chunk) => chunks.push(chunk));
    stream.on('end', async () => {
      const buffer = Buffer.concat(chunks);
      const workbook = xlsx.read(buffer, { type: "buffer" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const rows = xlsx.utils.sheet_to_json(sheet);
      const results = [];
      let insertedCount = 0;

      for (const row of rows) {
        const isValidCoords =
          // !isNaN(row.SPI) &&
          // !isNaN(row.distinctionRate) &&
          // !isNaN(row.examGrade) &&
          !isNaN(row.latitude) &&
          !isNaN(row.longitude) &&
          // !isNaN(row.successRate) &&
          !isNaN(row.coordY_origin) &&
          !isNaN(row.coordX_origin) &&
          !isNaN(row.numberOfStudents) &&
          !isNaN(row.postalCode);

        if (isValidCoords && insertedCount < 2000) {
          results.push({
            schoolId: row.schoolId,
            EstablishmentName: row.EstablishmentName,
            establishmentType: normalizeEstType(row.establishmentType),
            schoolStatus: row.schoolStatus,
            address: row.address,
            postalCode: Number(row.postalCode),
            schoolType: normalizeSchoolType(row.schoolType),
            phone: row.phone,
            website: row.website,
            email: row.email,
            numberOfStudents: parseDecimalSafe(row.numberOfStudents),
            position: row.position,
            coordX_origin: parseDecimalSafe(row.coordX_origin),
            coordY_origin: parseDecimalSafe(row.coordY_origin),
            latitude: parseDecimalSafe(row.latitude),
            longitude: parseDecimalSafe(row.longitude),
            successRate: parseDecimalSafe(row.successRate),
            examGrade: parseDecimalSafe(row.examGrade),
            distinctionRate: parseDecimalSafe(row.distinctionRate),
            SPI: parseDecimalSafe(row.SPI),
            location: createGeoLocation(row.longitude, row.latitude),
          });
          insertedCount++;
        }
      }

      if (results.length > 0) {
        await db.schools.insertMany(results);
      }

      return res.status(200).json({
        success: true,
        inserted: results.length,
        message: "XLSX import completed (max 1200 rows).",
      });
    });
  } catch (err) {
    console.error("Import error:", err);
    res.status(500).json({
      success: false,
      message: "Something went wrong.",
      error: err.message,
    });
  }
});

router.post("/importReferencePrice", uploadEstimationPrice.single("file"), async (req, res) => {
  console.log(req.file.buffer);
  if (!req.file || !req.file.buffer) {
    return res.status(400).json({
      success: false,
      message: "Uploaded file not found in memory.",
    });
  }

  const results = [];
  let insertedCount = 0;

  const bufferStream = new stream.PassThrough();
  bufferStream.end(req.file.buffer);

  bufferStream
    .pipe(csv())
    .on("data", (row) => {
      const isValidCoords =
        !isNaN(row.Prixm2Moyen) &&
        !isNaN(row.postalCode);
      if (isValidCoords) {
        results.push({
          postalCode: parseInt(row.postalCode),
          INSEE_COM: parseInt(row.INSEE_COM),
          annee: parseInt(row.annee),
          nb_mutations: parseInt(row.nb_mutations),
          NbMaisons: parseInt(row.NbMaisons),
          NbApparts: parseInt(row.NbApparts),
          PropMaison: parseInt(row.PropMaison),
          PropAppart: parseInt(row.PropAppart),
          PrixMoyen: parseInt(row.PrixMoyen),
          refPrice: parseInt(row.Prixm2Moyen),
          SurfaceMoy: parseInt(row.SurfaceMoy)
        })
        insertedCount++;
      }
    })
    .on("end", async () => {
      if (results.length > 0) {
        await db.campaignRefPrice.insertMany(results);
      }
      return res.status(200).json({
        success: true,
        inserted: results.length,
        message: `CSV import completed${insertedCount}.`
      })
    })

});

module.exports = router;
