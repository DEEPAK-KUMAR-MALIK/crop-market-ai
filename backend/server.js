const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const nodemailer = require("nodemailer");
require("dotenv").config();


const app = express();



// =====================================================
// MIDDLEWARE
// =====================================================

app.use(cors());
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({
  extended: true,
  limit: "20mb",
}));


// =====================================================
// PHOTO UPLOAD SETUP
// =====================================================

const uploadsDir = path.join(__dirname, "uploads");
console.log("UPLOAD DIRECTORY:", uploadsDir);
console.log("UPLOAD DIRECTORY EXISTS:", fs.existsSync(uploadsDir));

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, {
    recursive: true,
  });
}

app.use(
  "/uploads",
  express.static(uploadsDir)
);

// =====================================================
// MULTER PHOTO UPLOAD SETUP
// =====================================================



// Make sure uploads folder exists
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, {
    recursive: true,
  });
}

console.log("UPLOAD DIRECTORY:", uploadsDir);
console.log(
  "UPLOAD DIRECTORY EXISTS:",
  fs.existsSync(uploadsDir)
);

// Serve uploaded photos
app.use(
  "/uploads",
  express.static(uploadsDir)
);

// =====================================================
// MULTER STORAGE
// =====================================================

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    try {
      // Make sure folder exists before upload
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, {
          recursive: true,
        });
      }

      console.log(
        "Multer upload directory:",
        uploadsDir
      );

      console.log(
        "Multer directory exists:",
        fs.existsSync(uploadsDir)
      );

      cb(null, uploadsDir);

    } catch (error) {
      console.error(
        "Upload directory error:",
        error.message
      );

      cb(error);
    }
  },

  filename: (req, file, cb) => {
    try {
      const extension = path
        .extname(file.originalname)
        .toLowerCase();

      const filename =
        `crop-${Date.now()}-${Math.round(
          Math.random() * 1e9
        )}${extension}`;

      console.log(
        "Multer generated filename:",
        filename
      );

      cb(null, filename);

    } catch (error) {
      console.error(
        "Filename creation error:",
        error.message
      );

      cb(error);
    }
  },
});

// =====================================================
// MULTER UPLOAD
// =====================================================

const upload = multer({
  storage,

  limits: {
    fileSize: 5 * 1024 * 1024,
  },

  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
    ];

    if (
      !allowedTypes.includes(
        file.mimetype
      )
    ) {
      return cb(
        new Error(
          "Only JPG, JPEG, PNG and WEBP images are allowed."
        )
      );
    }

    cb(null, true);
  },
});


// =====================================================
// MONGODB CONNECTION
// =====================================================

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log(
      "MongoDB Connected Successfully 🌱"
    );
  })
  .catch((error) => {
    console.error(
      "MongoDB Connection Error:",
      error.message
    );
  });


// =====================================================
// USER SCHEMA
// =====================================================

// =====================================================
// USER SCHEMA
// =====================================================

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
  type: String,
  enum: ["farmer", "buyer", "admin"],
  default: "buyer",
},

    verificationStatus: {
      type: String,
      enum: [
        "pending",
        "approved",
        "rejected",
      ],
      default: "pending",
    },

    identityDocument: {
      type: String,
      default: "",
    },

    profilePhoto: {
      type: String,
      default: "",
    },
    emailVerified: {
  type: Boolean,
  default: false,
},

emailOtp: {
  type: String,
  default: "",
},

emailOtpExpires: {
  type: Date,
  default: null,
},
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model(
  "User",
  userSchema
);

// =====================================================
// EMAIL OTP SETUP
// =====================================================

const emailTransporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});


// =====================================================
// CROP SCHEMA
// =====================================================

const cropSchema = new mongoose.Schema(
  {
    icon: {
      type: String,
      default: "🌱",
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      default: "Vegetables",
      trim: true,
    },

    price: {
      type: String,
      required: true,
    },

    priceValue: {
      type: Number,
      required: true,
    },

    farmer: {
      type: String,
      required: true,
      trim: true,
    },

    farmerEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    location: {
      type: String,
      required: true,
      trim: true,
    },

    quantity: {
      type: String,
      required: true,
    },

    quantityValue: {
      type: Number,
      required: true,
    },

    description: {
      type: String,
      default:
        "Fresh quality crop directly from local farmer.",
    },
  },
  {
    timestamps: true,
  }
);

const Crop = mongoose.model(
  "Crop",
  cropSchema
);


// =====================================================
// ORDER SCHEMA
// =====================================================

const orderSchema = new mongoose.Schema(
  {
    buyerEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    cropName: {
      type: String,
      required: true,
      trim: true,
    },

    cropIcon: {
      type: String,
      default: "🌾",
    },

    pricePerKg: {
      type: Number,
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    totalPrice: {
      type: Number,
      required: true,
    },

    farmer: {
      type: String,
      required: true,
      trim: true,
    },

    location: {
      type: String,
      required: true,
      trim: true,
    },
    // =================================================
// DELIVERY BOY / TRANSPORT DETAILS
// =================================================

deliveryBoyName: {
  type: String,
  default: "",
  trim: true,
},

deliveryBoyPhone: {
  type: String,
  default: "",
  trim: true,
},

deliveryBoyLocation: {
  type: String,
  default: "",
  trim: true,
},

vehicleType: {
  type: String,
  default: "",
  trim: true,
},

vehicleNumber: {
  type: String,
  default: "",
  trim: true,
},

deliveryStatus: {
  type: String,
  default: "Not Assigned",
  trim: true,
},


    // =================================================
    // PAYMENT DETAILS
    // =================================================

    paymentMode: {
      type: String,
      enum: [
        "Cash on Delivery",
        "UPI",
        "Card",
        "Net Banking",
      ],
      required: true,
    },

    paymentStatus: {
      type: String,
      enum: [
        "Pending",
        "Paid",
        "Demo Paid",
      ],
      default: "Pending",
    },

    paymentType: {
      type: String,
      default: "Demo Payment",
    },

    orderDate: {
      type: Date,
      default: Date.now,
    },

    status: {
      type: String,
      default: "Placed",
    },
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model(
  "Order",
  orderSchema
);

// =====================================================
// MANDI RATE SCHEMA
// =====================================================

const mandiRateSchema = new mongoose.Schema(
  {
    state: {
      type: String,
      default: "Odisha",
      trim: true,
    },

    district: {
      type: String,
      required: true,
      trim: true,
    },

    mandiName: {
      type: String,
      required: true,
      trim: true,
    },

    cropName: {
      type: String,
      required: true,
      trim: true,
    },

    minPrice: {
      type: Number,
      required: true,
    },

    modalPrice: {
      type: Number,
      required: true,
    },

    maxPrice: {
      type: Number,
      required: true,
    },

    priceUnit: {
      type: String,
      default: "₹/Quintal",
    },

    arrival: {
      type: Number,
      default: 0,
    },

    rateDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const MandiRate = mongoose.model(
  "MandiRate",
  mandiRateSchema
);

// =====================================================
// PREDICTION SCHEMA
// =====================================================

const predictionSchema = new mongoose.Schema(
  {
    crop: {
      type: String,
      required: true,
      trim: true,
    },

    soilType: {
      type: String,
      default: "",
      trim: true,
    },

    season: {
      type: String,
      default: "",
      trim: true,
    },

    area: {
      type: Number,
      default: 0,
    },

    rainfall: {
      type: Number,
      default: 0,
    },

    temperature: {
      type: Number,
      default: 0,
    },

    fertilizer: {
      type: Number,
      default: 0,
    },

    marketDemand: {
      type: Number,
      default: 1,
    },

    mandiName: {
      type: String,
      default: "",
      trim: true,
    },

    district: {
      type: String,
      default: "",
      trim: true,
    },

    mandiModalPrice: {
      type: Number,
      default: 0,
    },

    estimatedPrice: {
      type: Number,
      required: true,
    },

    expectedProduction: {
      type: Number,
      required: true,
    },

    totalValue: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Prediction = mongoose.model(
  "Prediction",
  predictionSchema
);

// =====================================================
// REVIEW / RATING SCHEMA
// =====================================================

const reviewSchema = new mongoose.Schema(
  {
    buyerEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    farmerEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    cropName: {
      type: String,
      required: true,
      trim: true,
    },

    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    review: {
      type: String,
      default: "",
      trim: true,
      maxlength: 500,
    },
  },
  {
    timestamps: true,
  }
);

const Review = mongoose.model(
  "Review",
  reviewSchema
);
// =====================================================
// NOTIFICATION SCHEMA
// =====================================================

const notificationSchema = new mongoose.Schema(
  {
    userEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    type: {
      type: String,
      default: "general",
      trim: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    message: {
      type: String,
      required: true,
      trim: true,
    },

    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      default: null,
    },

    read: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Notification =
  mongoose.model(
    "Notification",
    notificationSchema
  );


// =====================================================
// CROP PHOTO REQUEST SCHEMA
// =====================================================

const cropPhotoRequestSchema =
  new mongoose.Schema(
    {
      buyerEmail: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
      },

      farmerEmail: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
      },

      cropId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Crop",
        required: true,
      },

      cropName: {
        type: String,
        required: true,
        trim: true,
      },

      message: {
        type: String,
        default:
          "Please upload a fresh photo of this crop.",
        trim: true,
      },

      status: {
        type: String,
        enum: [
          "Pending",
          "Photo Uploaded",
          "Rejected",
        ],
        default: "Pending",
      },

      photoUrl: {
        type: String,
        default: "",
      },
    },
    {
      timestamps: true,
    }
  );

const CropPhotoRequest =
  mongoose.model(
    "CropPhotoRequest",
    cropPhotoRequestSchema
  );


// =====================================================
// TEST ROUTE
// =====================================================

app.get("/", (req, res) => {
  res.json({
    message:
      "CropMarket Backend is Running 🌱",
  });
});


// =====================================================
// CREATE CROP API
// =====================================================

app.post(
  "/api/crops",
  async (req, res) => {
    try {
      const {
        icon,
        name,
        category,
        price,
        priceValue,
        farmer,
        farmerEmail,
        location,
        quantity,
        quantityValue,
        description,
      } = req.body;

      if (
        !name ||
        priceValue === undefined ||
        !farmer ||
        !farmerEmail ||
        !location ||
        quantityValue === undefined
      ) {
        return res.status(400).json({
          message:
            "Please provide all required crop details including farmer email.",
        });
      }

      if (Number(priceValue) <= 0) {
        return res.status(400).json({
          message:
            "Price must be greater than 0.",
        });
      }

      if (
        Number(quantityValue) <= 0
      ) {
        return res.status(400).json({
          message:
            "Quantity must be greater than 0.",
        });
      }

      const cleanFarmerEmail =
        farmerEmail
          .trim()
          .toLowerCase();

      const newCrop = new Crop({
        icon: icon || "🌱",

        name: name.trim(),

        category:
          category || "Vegetables",

        price:
          price ||
          `₹${Number(priceValue)}/kg`,

        priceValue:
          Number(priceValue),

        farmer: farmer.trim(),

        farmerEmail:
          cleanFarmerEmail,

        location:
          location.trim(),

        quantity:
          quantity ||
          `${Number(quantityValue)} kg`,

        quantityValue:
          Number(quantityValue),

        description:
          description ||
          "Fresh quality crop directly from local farmer.",
      });

      await newCrop.save();

      console.log(
        `New crop listed: ${newCrop.name} by ${newCrop.farmer} (${newCrop.farmerEmail})`
      );

      return res.status(201).json({
        message:
          "Crop listed successfully! 🌱",

        crop: newCrop,
      });
    } catch (error) {
      console.error(
        "Create Crop Error:",
        error.message
      );

      return res.status(500).json({
        message:
          "Server error while creating crop.",
      });
    }
  }
);


// =====================================================
// GET ALL CROPS API
// =====================================================

// 
// =====================================================
// GET ALL CROPS API
// =====================================================

app.get(
  "/api/crops",
  async (req, res) => {
    try {
      const crops = await Crop.find()
        .sort({
          createdAt: -1,
        })
        .lean();

      // Send both MongoDB _id and normal id
      // so frontend can use either one.
      const formattedCrops = crops.map((crop) => ({
        ...crop,

        // MongoDB ID
        _id: crop._id,

        // Frontend-friendly ID
        id: crop._id.toString(),
      }));

      console.log(
        `MongoDB Crops fetched: ${formattedCrops.length}`
      );

      console.log(
        "Crop IDs:",
        formattedCrops.map((crop) => ({
          id: crop.id,
          _id: crop._id,
          name: crop.name,
        }))
      );

      return res.status(200).json({
        crops: formattedCrops,
      });

    } catch (error) {
      console.error(
        "Get Crops Error:",
        error.message
      );

      return res.status(500).json({
        message:
          "Failed to fetch crops.",

        error:
          error.message,
      });
    }
  }
);


// =====================================================
// GET MY CROPS BY FARMER EMAIL
// =====================================================

app.get(
  "/api/crops/farmer/:email",
  async (req, res) => {
    try {
      const email =
        req.params.email
          .trim()
          .toLowerCase();

      const crops =
        await Crop.find({
          farmerEmail: email,
        }).sort({
          createdAt: -1,
        });

      return res.status(200).json({
        crops,
      });
    } catch (error) {
      console.error(
        "Get Farmer Crops Error:",
        error.message
      );

      return res.status(500).json({
        message:
          "Failed to fetch farmer crops.",
      });
    }
  }
);


// =====================================================
// UPDATE CROP API
// =====================================================

app.put(
  "/api/crops/:id",
  async (req, res) => {
    try {
      const { id } =
        req.params;

      const {
        icon,
        name,
        category,
        price,
        priceValue,
        farmer,
        farmerEmail,
        location,
        quantity,
        quantityValue,
        description,
      } = req.body;

      if (!farmerEmail) {
        return res.status(400).json({
          message:
            "Farmer email is required.",
        });
      }

      const cleanFarmerEmail =
        farmerEmail
          .trim()
          .toLowerCase();

      const existingCrop =
        await Crop.findOne({
          _id: id,
          farmerEmail:
            cleanFarmerEmail,
        });

      if (!existingCrop) {
        return res.status(404).json({
          message:
            "Crop not found or you are not the owner.",
        });
      }

      if (
        priceValue !== undefined &&
        Number(priceValue) <= 0
      ) {
        return res.status(400).json({
          message:
            "Price must be greater than 0.",
        });
      }

      if (
        quantityValue !== undefined &&
        Number(quantityValue) <= 0
      ) {
        return res.status(400).json({
          message:
            "Quantity must be greater than 0.",
        });
      }

      existingCrop.icon =
        icon || existingCrop.icon;

      existingCrop.name =
        name !== undefined
          ? name.trim()
          : existingCrop.name;

      existingCrop.category =
        category !== undefined
          ? category.trim()
          : existingCrop.category;

      existingCrop.price =
        price !== undefined
          ? price
          : priceValue !== undefined
          ? `₹${Number(priceValue)}/kg`
          : existingCrop.price;

      existingCrop.priceValue =
        priceValue !== undefined
          ? Number(priceValue)
          : existingCrop.priceValue;

      existingCrop.farmer =
        farmer !== undefined
          ? farmer.trim()
          : existingCrop.farmer;

      existingCrop.farmerEmail =
        cleanFarmerEmail;

      existingCrop.location =
        location !== undefined
          ? location.trim()
          : existingCrop.location;

      existingCrop.quantity =
        quantity !== undefined
          ? quantity
          : quantityValue !== undefined
          ? `${Number(quantityValue)} kg`
          : existingCrop.quantity;

      existingCrop.quantityValue =
        quantityValue !== undefined
          ? Number(quantityValue)
          : existingCrop.quantityValue;

      existingCrop.description =
        description !== undefined
          ? description
          : existingCrop.description;

      await existingCrop.save();

      console.log(
        `Crop updated: ${existingCrop.name} (${existingCrop._id})`
      );

      return res.status(200).json({
        message:
          "Crop updated successfully! 🌱",

        crop: existingCrop,
      });
    } catch (error) {
      console.error(
        "Update Crop Error:",
        error.message
      );

      return res.status(500).json({
        message:
          "Server error while updating crop.",
      });
    }
  }
);


// =====================================================
// DELETE CROP API
// =====================================================

app.delete(
  "/api/crops/:id",
  async (req, res) => {
    try {
      const { id } =
        req.params;

      const farmerEmail =
        req.query.farmerEmail;

      if (!farmerEmail) {
        return res.status(400).json({
          message:
            "Farmer email is required.",
        });
      }

      const cleanFarmerEmail =
        farmerEmail
          .trim()
          .toLowerCase();

      const deletedCrop =
        await Crop.findOneAndDelete({
          _id: id,
          farmerEmail:
            cleanFarmerEmail,
        });

      if (!deletedCrop) {
        return res.status(404).json({
          message:
            "Crop not found or you are not the owner.",
        });
      }

      console.log(
        `Crop deleted: ${deletedCrop.name} (${deletedCrop._id})`
      );

      return res.status(200).json({
        message:
          "Crop deleted successfully! 🌱",

        crop: deletedCrop,
      });
    } catch (error) {
      console.error(
        "Delete Crop Error:",
        error.message
      );

      return res.status(500).json({
        message:
          "Server error while deleting crop.",
      });
    }
  }
);


// =====================================================
// REGISTER API
// =====================================================

// =====================================================
// REGISTER USER WITH IDENTITY VERIFICATION
// =====================================================

app.post(
  "/api/register",

  upload.fields([
    {
      name: "identityDocument",
      maxCount: 1,
    },
    {
      name: "profilePhoto",
      maxCount: 1,
    },
  ]),

  async (req, res) => {
    try {

      // =================================================
      // GET FORM DATA
      // =================================================

      const {
        name,
        email,
        phone,
        password,
        role,
      } = req.body;


      // =================================================
      // GET UPLOADED FILES
      // =================================================

      const identityFile =
        req.files?.identityDocument?.[0];

      const profileFile =
        req.files?.profilePhoto?.[0];


      // =================================================
      // REQUIRED FIELDS
      // =================================================

      if (
        !name ||
        !email ||
        !phone ||
        !password ||
        !role
      ) {

        // Delete uploaded files if validation fails

        if (req.files) {

          Object.values(req.files)
            .flat()
            .forEach((file) => {

              if (
                file &&
                file.path &&
                fs.existsSync(file.path)
              ) {
                fs.unlinkSync(file.path);
              }

            });

        }


        return res.status(400).json({
          message:
            "Please fill all the fields.",
        });
      }


      // =================================================
      // IDENTITY DOCUMENT REQUIRED
      // =================================================

      if (!identityFile) {

        if (profileFile?.path) {

          if (
            fs.existsSync(
              profileFile.path
            )
          ) {
            fs.unlinkSync(
              profileFile.path
            );
          }

        }


        return res.status(400).json({
          message:
            "Identity document is required.",
        });
      }


      // =================================================
      // PROFILE PHOTO REQUIRED
      // =================================================

      if (!profileFile) {

        if (
          identityFile.path &&
          fs.existsSync(
            identityFile.path
          )
        ) {
          fs.unlinkSync(
            identityFile.path
          );
        }


        return res.status(400).json({
          message:
            "Profile photo is required.",
        });
      }


      // =================================================
      // CLEAN EMAIL
      // =================================================

      const cleanEmail =
        email
          .trim()
          .toLowerCase();
          // =================================================
// GENERATE EMAIL OTP
// =================================================



      // =================================================
      // CLEAN PHONE
      // =================================================

      const cleanPhone =
        phone
          .replace(/\D/g, "");


      // =================================================
      // VALIDATE PHONE
      // =================================================

      if (
        cleanPhone.length !== 10
      ) {

        // Delete uploaded files

        if (
          identityFile.path &&
          fs.existsSync(
            identityFile.path
          )
        ) {
          fs.unlinkSync(
            identityFile.path
          );
        }

        if (
          profileFile.path &&
          fs.existsSync(
            profileFile.path
          )
        ) {
          fs.unlinkSync(
            profileFile.path
          );
        }


        return res.status(400).json({
          message:
            "Please enter a valid 10 digit phone number.",
        });
      }


      // =================================================
      // VALIDATE ROLE
      // =================================================

      if (
        role !== "farmer" &&
        role !== "buyer"
      ) {

        if (
          identityFile.path &&
          fs.existsSync(
            identityFile.path
          )
        ) {
          fs.unlinkSync(
            identityFile.path
          );
        }

        if (
          profileFile.path &&
          fs.existsSync(
            profileFile.path
          )
        ) {
          fs.unlinkSync(
            profileFile.path
          );
        }


        return res.status(400).json({
          message:
            "Invalid account type.",
        });
      }


      // =================================================
      // CHECK EXISTING USER
      // =================================================

      const existingUser =
        await User.findOne({
          email: cleanEmail,
        });


      if (existingUser) {

        // Delete uploaded files

        if (
          identityFile.path &&
          fs.existsSync(
            identityFile.path
          )
        ) {
          fs.unlinkSync(
            identityFile.path
          );
        }

        if (
          profileFile.path &&
          fs.existsSync(
            profileFile.path
          )
        ) {
          fs.unlinkSync(
            profileFile.path
          );
        }


        return res.status(409).json({
          message:
            "An account with this email already exists. Please login.",
        });
      }


      // =================================================
      // CREATE USER
      // =================================================

      const newUser =
        new User({

          name:
            name.trim(),

          email:
            cleanEmail,

          phone:
            cleanPhone,

          password:
            password,

          role:
            role,

          // IMPORTANT:
          // User cannot become verified automatically.

          verificationStatus:
            "pending",

          identityDocument:
            `/uploads/${identityFile.filename}`,

          profilePhoto:
            `/uploads/${profileFile.filename}`,
            emailVerified: false,


        });


      // =================================================
      // SAVE USER
      // =================================================

// =================================================
// SAVE USER
// =================================================

await newUser.save();

// =================================================
// SEND REGISTRATION SUCCESS EMAIL
// =================================================

try {
  await emailTransporter.sendMail({
   from: `"CropMarket" <${process.env.EMAIL_FROM}>`,
    to: cleanEmail,
    subject: "CropMarket - Account Created Successfully",
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2 style="color: #2e7d32;">
          🌱 CropMarket
        </h2>

        <p>Hello <strong>${name}</strong>,</p>

        <p>
          Your CropMarket account has been created successfully.
        </p>

        <p>
          You can now login to your CropMarket account.
        </p>

        <hr />

        <p style="color: #777;">
          Crop Marketplace with AI Price Prediction
        </p>
      </div>
    `,
  });

  console.log(
    `Registration success email sent to: ${cleanEmail}`
  );

} catch (emailError) {

  console.error(
    "Registration email error:",
    emailError.message
  );
}     
      await newUser.save();


      // =================================================
      // LOG
      // =================================================

      console.log(
        `New user registered: ${newUser.email}`
      );

      console.log(
        `Verification status: ${newUser.verificationStatus}`
      );

      console.log(
        `Identity document: ${newUser.identityDocument}`
      );

      console.log(
        `Profile photo: ${newUser.profilePhoto}`
      );


      // =================================================
      // RESPONSE
      // =================================================

      return res.status(201).json({

        message:
          "Account created successfully! Your identity verification is pending. 🌱",

        user: {

          id:
            newUser._id,

          name:
            newUser.name,

          email:
            newUser.email,

          phone:
            newUser.phone,

          role:
            newUser.role,

          verificationStatus:
            newUser.verificationStatus,

          identityDocument:
            newUser.identityDocument,

          profilePhoto:
            newUser.profilePhoto,
        },
      });


    } catch (error) {

      console.error(
        "Register Error:",
        error.message
      );


      // =================================================
      // DELETE FILES IF DATABASE SAVE FAILS
      // =================================================

      if (req.files) {

        Object.values(req.files)
          .flat()
          .forEach((file) => {

            if (
              file &&
              file.path &&
              fs.existsSync(file.path)
            ) {

              try {
                fs.unlinkSync(
                  file.path
                );
              } catch (deleteError) {

                console.error(
                  "File cleanup error:",
                  deleteError.message
                );

              }

            }

          });

      }


      return res.status(500).json({

        message:
          "Server error while creating account.",

        error:
          error.message,
      });
    }
  }
);


// =====================================================
// VERIFY EMAIL OTP API
// =====================================================

app.post(
  "/api/verify-email",
  async (req, res) => {
    try {
      const {
        email,
        otp,
      } = req.body;

      if (!email || !otp) {
        return res.status(400).json({
          message:
            "Email and OTP are required.",
        });
      }

      const cleanEmail =
        email
          .trim()
          .toLowerCase();

      const user =
        await User.findOne({
          email: cleanEmail,
        });

      if (!user) {
        return res.status(404).json({
          message:
            "Account not found.",
        });
      }

      if (user.emailVerified) {
        return res.status(400).json({
          message:
            "Email is already verified.",
        });
      }

      if (
        !user.emailOtpExpires ||
        user.emailOtpExpires < new Date()
      ) {
        return res.status(400).json({
          message:
            "OTP has expired. Please request a new OTP.",
        });
      }

      if (user.emailOtp !== otp.trim()) {
        return res.status(400).json({
          message:
            "Invalid OTP. Please try again.",
        });
      }

      user.emailVerified = true;
      user.emailOtp = "";
      user.emailOtpExpires = null;

      await user.save();

      return res.status(200).json({
        message:
          "Email verified successfully! 📧✅",
      });

    } catch (error) {

      console.error(
        "Email Verification Error:",
        error.message
      );

      return res.status(500).json({
        message:
          "Server error during email verification.",
      });
    }
  }
);
      


// =====================================================
// LOGIN API
// =====================================================

// =====================================================
// LOGIN API WITH IDENTITY VERIFICATION
// =====================================================

app.post(
  "/api/login",
  async (req, res) => {
    try {
      const {
        email,
        password,
      } = req.body;

      // =================================================
      // REQUIRED FIELDS
      // =================================================

      if (!email || !password) {
        return res.status(400).json({
          message:
            "Please enter email and password.",
        });
      }

      // =================================================
      // CLEAN EMAIL
      // =================================================

      const cleanEmail =
        email
          .trim()
          .toLowerCase();

      // =================================================
      // FIND USER
      // =================================================

      const user =
        await User.findOne({
          email: cleanEmail,
        });

      if (!user) {
        return res.status(404).json({
          message:
            "Account not found. Please create an account first.",
        });
      }

      // =================================================
      // CHECK PASSWORD
      // =================================================

      if (user.password !== password) {
        return res.status(401).json({
          message:
            "Incorrect password. Please try again.",
        });
      }
      // =================================================
// CHECK EMAIL VERIFICATION
// =================================================

if (user.emailVerified === false) {
  return res.status(403).json({
    message:
      "Please verify your email before login.",
    emailVerified: false,
  });
}

      // =================================================
      // CHECK IDENTITY VERIFICATION
      // =================================================

      if (
        user.verificationStatus === "pending"
      ) {
        return res.status(403).json({
          message:
            "Your identity verification is pending. Please wait for admin approval.",
          verificationStatus:
            "pending",
        });
      }

      if (
        user.verificationStatus === "rejected"
      ) {
        return res.status(403).json({
          message:
            "Your identity verification was rejected. Please submit valid identity documents.",
          verificationStatus:
            "rejected",
        });
      }

      if (
        user.verificationStatus !== "approved"
      ) {
        return res.status(403).json({
          message:
            "Your account is not verified. Please complete identity verification.",
          verificationStatus:
            user.verificationStatus,
        });
      }

      // =================================================
      // LOGIN SUCCESS
      // =================================================

      console.log(
        `Verified user logged in: ${user.email}`
      );

      return res.status(200).json({
        message:
          "Login successful! 🌱",

        user: {
          id:
            user._id,

          name:
            user.name,

          email:
            user.email,

          phone:
            user.phone,

          role:
            user.role,

          verificationStatus:
            user.verificationStatus,

          identityDocument:
            user.identityDocument,

          profilePhoto:
            user.profilePhoto,
        },
      });

    } catch (error) {

      console.error(
        "Login Error:",
        error.message
      );

      return res.status(500).json({
        message:
          "Server error during login.",

        error:
          error.message,
      });
    }
  }
);

// =====================================================
// ADMIN LOGIN API
// =====================================================

app.post(
  "/api/admin/login",
  async (req, res) => {
    try {
      const {
        email,
        password,
      } = req.body;

      // =================================================
      // REQUIRED FIELDS
      // =================================================

      if (!email || !password) {
        return res.status(400).json({
          message:
            "Admin email and password are required.",
        });
      }

      // =================================================
      // CLEAN EMAIL
      // =================================================

      const cleanEmail =
        email
          .trim()
          .toLowerCase();

      // =================================================
      // FIND ADMIN USER
      // =================================================

      const admin =
        await User.findOne({
          email: cleanEmail,
          role: "admin",
        });

      // =================================================
      // ADMIN NOT FOUND
      // =================================================

      if (!admin) {
        return res.status(401).json({
          message:
            "Access denied. Admin account not found.",
        });
      }

      // =================================================
      // CHECK PASSWORD
      // =================================================

      if (admin.password !== password) {
        return res.status(401).json({
          message:
            "Incorrect admin password.",
        });
      }

      // =================================================
      // ADMIN LOGIN SUCCESS
      // =================================================

      console.log(
        `Admin logged in: ${admin.email}`
      );

      return res.status(200).json({
        message:
          "Admin login successful! 🔐",

        admin: {
          id: admin._id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
        },
      });

    } catch (error) {

      console.error(
        "Admin Login Error:",
        error.message
      );

      return res.status(500).json({
        message:
          "Server error during admin login.",
      });
    }
  }
);
// =====================================================
// FORGOT PASSWORD API
// =====================================================

app.post(
  "/api/forgot-password",
  async (req, res) => {
    try {
      const {
        email,
        newPassword,
      } = req.body;

      if (!email || !newPassword) {
        return res.status(400).json({
          message:
            "Email and new password are required.",
        });
      }

      if (
        newPassword.length < 6
      ) {
        return res.status(400).json({
          message:
            "New password must be at least 6 characters.",
        });
      }

      const cleanEmail =
        email
          .trim()
          .toLowerCase();

      const user =
        await User.findOne({
          email: cleanEmail,
        });

      if (!user) {
        return res.status(404).json({
          message:
            "No account found with this email address.",
        });
      }

      user.password =
        newPassword;

      await user.save();

      console.log(
        `Password reset successfully: ${user.email}`
      );

      return res.status(200).json({
        message:
          "Password reset successfully! 🌱",
      });
    } catch (error) {
      console.error(
        "Forgot Password Error:",
        error.message
      );

      return res.status(500).json({
        message:
          "Server error while resetting password.",
      });
    }
  }
);


// =====================================================
// CREATE ORDER API + DEMO PAYMENT
// =====================================================

app.post(
  "/api/orders",
  async (req, res) => {
    try {
      const {
        buyerEmail,
        cropName,
        cropIcon,
        pricePerKg,
        quantity,
        totalPrice,
        farmer,
        location,

        // Frontend field
        paymentMethod,

        // Backend field
        paymentMode,

        paymentStatus:
          frontendPaymentStatus,

        paymentType,
      } = req.body;


      // =================================================
      // PAYMENT METHOD COMPATIBILITY
      // =================================================

      const selectedPaymentMethod =
        paymentMethod ||
        paymentMode;


      // =================================================
      // REQUIRED FIELDS
      // =================================================

      if (
        !buyerEmail ||
        !cropName ||
        pricePerKg === undefined ||
        !quantity ||
        totalPrice === undefined ||
        !farmer ||
        !location ||
        !selectedPaymentMethod
      ) {
        return res.status(400).json({
          message:
            "Please provide all order details including payment mode.",
        });
      }


      // =================================================
      // VALIDATE PAYMENT METHOD
      // =================================================

      const allowedPaymentModes = [
        "Cash on Delivery",
        "UPI",
        "Card",
        "Net Banking",
      ];

      if (
        !allowedPaymentModes.includes(
          selectedPaymentMethod
        )
      ) {
        return res.status(400).json({
          message:
            "Invalid payment mode.",
        });
      }


      // =================================================
      // VALIDATE QUANTITY
      // =================================================

      if (
        Number(quantity) < 1
      ) {
        return res.status(400).json({
          message:
            "Quantity must be at least 1 Kg.",
        });
      }


      // =================================================
      // VALIDATE PRICE
      // =================================================

      if (
        Number(pricePerKg) < 0
      ) {
        return res.status(400).json({
          message:
            "Price cannot be negative.",
        });
      }


      // =================================================
      // DEMO PAYMENT STATUS
      // =================================================

      let finalPaymentStatus;

      if (
        selectedPaymentMethod ===
        "Cash on Delivery"
      ) {
        finalPaymentStatus =
          "Pending";
      } else {
        finalPaymentStatus =
          "Demo Paid";
      }


      // =================================================
      // CREATE ORDER
      // =================================================

      const newOrder =
        new Order({
          buyerEmail:
            buyerEmail
              .trim()
              .toLowerCase(),

          cropName:
            cropName.trim(),

          cropIcon:
            cropIcon || "🌾",

          pricePerKg:
            Number(pricePerKg),

          quantity:
            Number(quantity),

          totalPrice:
            Number(totalPrice),

          farmer:
            farmer.trim(),

          location:
            location.trim(),

          paymentMode:
            selectedPaymentMethod,

          paymentStatus:
            finalPaymentStatus,

          paymentType:
            paymentType ||
            "Demo Payment",

          orderDate:
            new Date(),

          status:
            "Placed",
        });


      // =================================================
      // SAVE ORDER
      // =================================================

      await newOrder.save();

      console.log(
        "================================="
      );
      // =====================================================
// AUTOMATIC NOTIFICATION — NEW ORDER
// =====================================================

try {
  const cropForNotification =
    await Crop.findOne({
      name: newOrder.cropName,
      farmer: newOrder.farmer,
    });

  if (
    cropForNotification &&
    cropForNotification.farmerEmail
  ) {
    await Notification.create({
      userEmail:
        cropForNotification.farmerEmail
          .trim()
          .toLowerCase(),

      type: "new_order",

      title: "🛒 New Order Received",

      message:
        `You received a new order for ${newOrder.cropName}. Quantity: ${newOrder.quantity}.`,

      orderId:
        newOrder._id,

      read: false,
    });

    console.log(
      "NEW ORDER NOTIFICATION CREATED"
    );
  } else {
    console.log(
      "Farmer email not found. Notification skipped."
    );
  }

} catch (notificationError) {

  console.error(
    "New Order Notification Error:",
    notificationError.message
  );
}


      console.log(
        "NEW ORDER SAVED SUCCESSFULLY"
      );

      console.log(
        "Order ID:",
        newOrder._id
      );

      console.log(
        "Buyer:",
        newOrder.buyerEmail
      );

      console.log(
        "Crop:",
        newOrder.cropName
      );

      console.log(
        "Payment Mode:",
        newOrder.paymentMode
      );

      console.log(
        "Payment Status:",
        newOrder.paymentStatus
      );

      console.log(
        "Payment Type:",
        newOrder.paymentType
      );

      console.log(
        "================================="
      );


      return res.status(201).json({
        message:
          "Order placed successfully! 🌱",

        order: {
          id:
            newOrder._id,

          buyerEmail:
            newOrder.buyerEmail,

          cropName:
            newOrder.cropName,

          cropIcon:
            newOrder.cropIcon,

          pricePerKg:
            newOrder.pricePerKg,

          quantity:
            newOrder.quantity,

          totalPrice:
            newOrder.totalPrice,

          farmer:
            newOrder.farmer,

          location:
            newOrder.location,

          paymentMode:
            newOrder.paymentMode,

          paymentStatus:
            newOrder.paymentStatus,

          paymentType:
            newOrder.paymentType,

          orderDate:
            newOrder.orderDate,

          status:
            newOrder.status,
        },
      });
    } catch (error) {
      console.error(
        "================================="
      );

      console.error(
        "CREATE ORDER ERROR:"
      );

      console.error(error);

      console.error(
        "================================="
      );

      return res.status(500).json({
        message:
          "Server error while creating order.",

        error:
          error.message,
      });
    }
  }
);


// =====================================================
// GET MY ORDERS API
// =====================================================

app.get(
  "/api/orders/:email",
  async (req, res) => {
    try {
      const email =
        req.params.email
          .trim()
          .toLowerCase();

      const orders =
        await Order.find({
          buyerEmail: email,
        }).sort({
          orderDate: -1,
        });

      return res.status(200).json({
        orders,
      });
    } catch (error) {
      console.error(
        "Get Orders Error:",
        error.message
      );

      return res.status(500).json({
        message:
          "Failed to fetch orders.",
      });
    }
  }
);


// =====================================================
// GET ALL USERS API
// =====================================================

// =====================================================
// GET ALL USERS API - ADMIN ONLY
// =====================================================

app.get(
  "/api/users",
  async (req, res) => {
    try {

      // ===============================================
      // CHECK ADMIN EMAIL
      // ===============================================

      const adminEmail = req.headers["x-admin-email"];

      if (!adminEmail) {
        return res.status(401).json({
          message:
            "Admin authentication required.",
        });
      }

      const cleanAdminEmail =
        adminEmail
          .trim()
          .toLowerCase();


      // ===============================================
      // FIND ADMIN
      // ===============================================

      const admin =
        await User.findOne({
          email: cleanAdminEmail,
          role: "admin",
        });


      if (!admin) {
        return res.status(403).json({
          message:
            "Access denied. Admin account required.",
        });
      }


      // ===============================================
      // GET USERS
      // ===============================================

      const users =
        await User.find()
          .select("-password");


      return res.status(200).json(
        users
      );


    } catch (error) {

      console.error(
        "Get Users Error:",
        error.message
      );


      return res.status(500).json({
        message:
          "Failed to fetch users.",
      });

    }
  }
);
// =====================================================
// UPDATE USER PROFILE API
// =====================================================

app.put(
  "/api/profile/:email",
  async (req, res) => {
    try {
      const { email } = req.params;

      const {
        name,
        phone,
        role,
      } = req.body;

      // -----------------------------------------------
      // REQUIRED FIELDS
      // -----------------------------------------------

      if (!name || !phone || !role) {
        return res.status(400).json({
          message:
            "Name, phone and role are required.",
        });
      }

      // -----------------------------------------------
      // CLEAN EMAIL
      // -----------------------------------------------

      const cleanEmail =
        email
          .trim()
          .toLowerCase();

      // -----------------------------------------------
      // VALIDATE ROLE
      // -----------------------------------------------

      if (
        role !== "farmer" &&
        role !== "buyer"
      ) {
        return res.status(400).json({
          message:
            "Invalid account type.",
        });
      }

      // -----------------------------------------------
      // VALIDATE PHONE
      // -----------------------------------------------

      if (
        phone.trim().length < 10
      ) {
        return res.status(400).json({
          message:
            "Please enter a valid phone number.",
        });
      }

      // -----------------------------------------------
      // FIND USER
      // -----------------------------------------------

      const user =
        await User.findOne({
          email: cleanEmail,
        });

      if (!user) {
        return res.status(404).json({
          message:
            "User account not found.",
        });
      }

      // -----------------------------------------------
      // UPDATE PROFILE
      // -----------------------------------------------

      user.name =
        name.trim();

      user.phone =
        phone.trim();

      user.role =
        role;

      // -----------------------------------------------
      // SAVE USER
      // -----------------------------------------------

      await user.save();

      console.log(
        `Profile updated successfully: ${user.email}`
      );

      // -----------------------------------------------
      // RESPONSE
      // -----------------------------------------------

      return res.status(200).json({
        message:
          "Profile updated successfully! 🌱",

        user: {
          id:
            user._id,

          name:
            user.name,

          email:
            user.email,

          phone:
            user.phone,

          role:
            user.role,

          verificationStatus:
            user.verificationStatus,

          identityDocument:
            user.identityDocument,

          profilePhoto:
            user.profilePhoto,
        },
      });

    } catch (error) {

      console.error(
        "Update Profile Error:",
        error.message
      );

      return res.status(500).json({
        message:
          "Server error while updating profile.",

        error:
          error.message,
      });
    }
  }
);

// =====================================================
// GET ALL ORDERS API
// =====================================================

app.get(
  "/api/orders",
  async (req, res) => {
    try {
      const orders =
        await Order.find().sort({
          orderDate: -1,
        });

      return res.status(200).json({
        orders,
      });
    } catch (error) {
      console.error(
        "Get All Orders Error:",
        error.message
      );

      return res.status(500).json({
        message:
          "Failed to fetch orders.",
      });
    }
  }
);

// =====================================================
// GET MANDI RATES API
// =====================================================

app.get(
  "/api/mandi-rates",
  async (req, res) => {
    try {
      const {
        district,
        mandiName,
        cropName,
      } = req.query;

      const filter = {};

      if (district) {
        filter.district = district.trim();
      }

      if (mandiName) {
        filter.mandiName =
          mandiName.trim();
      }

      if (cropName) {
        filter.cropName =
          cropName.trim();
      }

      const rates =
        await MandiRate.find(filter)
          .sort({
            rateDate: -1,
          })
          .lean();

      return res.status(200).json({
        rates,
      });

    } catch (error) {
      console.error(
        "Get Mandi Rates Error:",
        error.message
      );

      return res.status(500).json({
        message:
          "Failed to fetch mandi rates.",
        error: error.message,
      });
    }
  }
);

// =====================================================
// ADD MANDI RATE API
// =====================================================

app.post(
  "/api/mandi-rates",
  async (req, res) => {
    try {
      const {
        district,
        mandiName,
        cropName,
        minPrice,
        modalPrice,
        maxPrice,
        arrival,
      } = req.body;

      if (
        !district ||
        !mandiName ||
        !cropName ||
        minPrice === undefined ||
        modalPrice === undefined ||
        maxPrice === undefined
      ) {
        return res.status(400).json({
          message:
            "Please provide all mandi rate details.",
        });
      }

      const newRate =
        await MandiRate.create({
          state: "Odisha",
          district:
            district.trim(),
          mandiName:
            mandiName.trim(),
          cropName:
            cropName.trim(),
          minPrice:
            Number(minPrice),
          modalPrice:
            Number(modalPrice),
          maxPrice:
            Number(maxPrice),
          arrival:
            Number(arrival) || 0,
          rateDate:
            new Date(),
        });

      return res.status(201).json({
        message:
          "Mandi rate added successfully! 🌾",
        rate: newRate,
      });

    } catch (error) {
      console.error(
        "Add Mandi Rate Error:",
        error.message
      );

      return res.status(500).json({
        message:
          "Failed to add mandi rate.",
        error: error.message,
      });
    }
  }
);

// =====================================================
// UPDATE MANDI RATE API
// =====================================================

app.put(
  "/api/mandi-rates/:id",
  async (req, res) => {
    try {
      const { id } = req.params;

      const {
        district,
        mandiName,
        cropName,
        minPrice,
        modalPrice,
        maxPrice,
        arrival,
      } = req.body;

      const updatedRate =
        await MandiRate.findByIdAndUpdate(
          id,
          {
            district: district?.trim(),
            mandiName: mandiName?.trim(),
            cropName: cropName?.trim(),
            minPrice: Number(minPrice),
            modalPrice: Number(modalPrice),
            maxPrice: Number(maxPrice),
            arrival: Number(arrival) || 0,
            rateDate: new Date(),
          },
          {
            new: true,
            runValidators: true,
          }
        );

      if (!updatedRate) {
        return res.status(404).json({
          message: "Mandi rate not found.",
        });
      }

      return res.status(200).json({
        message:
          "Mandi rate updated successfully! 🌾",
        rate: updatedRate,
      });

    } catch (error) {
      console.error(
        "Update Mandi Rate Error:",
        error.message
      );

      return res.status(500).json({
        message:
          "Failed to update mandi rate.",
        error: error.message,
      });
    }
  }
);

// =====================================================
// DELETE MANDI RATE API
// =====================================================

app.delete(
  "/api/mandi-rates/:id",
  async (req, res) => {
    try {
      const { id } = req.params;

      const deletedRate =
        await MandiRate.findByIdAndDelete(id);

      if (!deletedRate) {
        return res.status(404).json({
          message: "Mandi rate not found.",
        });
      }

      return res.status(200).json({
        message:
          "Mandi rate deleted successfully! 🗑️",
        rate: deletedRate,
      });

    } catch (error) {
      console.error(
        "Delete Mandi Rate Error:",
        error.message
      );

      return res.status(500).json({
        message:
          "Failed to delete mandi rate.",
        error: error.message,
      });
    }
  }
);

// =====================================================
// AI CROP PRICE ESTIMATE API
// Uses saved Mandi Rate data - NO ML
// =====================================================

app.post(
  "/api/predict-price",
  async (req, res) => {
    try {
      const {
        crop,
        soilType,
        season,
        area,
        rainfall,
        temperature,
        fertilizer,
        marketDemand,
      } = req.body;

      // ===============================================
      // REQUIRED DATA
      // ===============================================

      if (!crop) {
        return res.status(400).json({
          message: "Crop is required.",
        });
      }

      // ===============================================
      // FIND LATEST MANDI RATE
      // ===============================================

      const mandiRate =
        await MandiRate.findOne({
          cropName: {
            $regex: crop.trim(),
            $options: "i",
          },
        })
          .sort({
            rateDate: -1,
          })
          .lean();

      // ===============================================
      // BASE PRICE
      // ===============================================

      const basePrices = {
        Wheat: 2200,
        Rice: 2300,
        Maize: 1900,
        Tomato: 1800,
        Potato: 1600,
        Onion: 1700,
      };

      // If Mandi Rate exists use Modal Price
      // Otherwise use default base price
      let estimatedPrice =
        mandiRate?.modalPrice ||
        basePrices[crop] ||
        2000;

      // ===============================================
      // SEASON ADJUSTMENT
      // ===============================================

      if (season === "Rabi") {
        estimatedPrice += 100;
      } else if (season === "Kharif") {
        estimatedPrice += 50;
      }

      // ===============================================
      // SOIL ADJUSTMENT
      // ===============================================

      if (soilType === "Laterite") {
        estimatedPrice += 50;
      } else if (soilType === "Alluvial") {
        estimatedPrice += 100;
      }

      // ===============================================
      // RAINFALL ADJUSTMENT
      // ===============================================

      const numericRainfall =
        Number(rainfall) || 0;

      if (
        numericRainfall >= 700 &&
        numericRainfall <= 1200
      ) {
        estimatedPrice += 100;
      } else if (numericRainfall < 500) {
        estimatedPrice -= 100;
      }

      // ===============================================
      // TEMPERATURE ADJUSTMENT
      // ===============================================

      const numericTemperature =
        Number(temperature) || 0;

      if (
        numericTemperature >= 20 &&
        numericTemperature <= 30
      ) {
        estimatedPrice += 50;
      }

      // ===============================================
      // FERTILIZER ADJUSTMENT
      // ===============================================

      const numericFertilizer =
        Number(fertilizer) || 0;

      if (
        numericFertilizer >= 80 &&
        numericFertilizer <= 150
      ) {
        estimatedPrice += 75;
      }

      // ===============================================
      // MARKET DEMAND
      // ===============================================

      const demand =
        Number(marketDemand) || 1;

      estimatedPrice =
        estimatedPrice * demand;

      estimatedPrice =
        Math.round(estimatedPrice);

      // ===============================================
      // EXPECTED PRODUCTION
      // ===============================================

      const numericArea =
        Number(area) || 0;

      const productionPerHectare = 18;

      const expectedProduction =
        Math.round(
          numericArea *
          productionPerHectare
        );

      // ===============================================
      // TOTAL VALUE
      // ===============================================

      const totalValue =
        Math.round(
          estimatedPrice *
          expectedProduction
        );

        // ===============================================
// SAVE PREDICTION TO MONGODB
// ===============================================

const newPrediction = await Prediction.create({
  crop: crop.trim(),

  soilType:
    soilType || "",

  season:
    season || "",

  area:
    numericArea,

  rainfall:
    numericRainfall,

  temperature:
    numericTemperature,

  fertilizer:
    numericFertilizer,

  marketDemand:
    demand,

  mandiName:
    mandiRate?.mandiName || "",

  district:
    mandiRate?.district || "",

  mandiModalPrice:
    mandiRate?.modalPrice || 0,

  estimatedPrice:
    estimatedPrice,

  expectedProduction:
    expectedProduction,

  totalValue:
    totalValue,
});

console.log(
  "PREDICTION SAVED TO MONGODB:",
  newPrediction._id
);

      // ===============================================
      // RESPONSE
      // ===============================================

      return res.status(200).json({
        message:
          "Crop price estimated successfully! 🌾",

        source:
          mandiRate
            ? "Mandi Rate + Rule Based Estimate"
            : "Default Rate + Rule Based Estimate",

        mandiRate: mandiRate
          ? {
              mandiName:
                mandiRate.mandiName,

              district:
                mandiRate.district,

              minPrice:
                mandiRate.minPrice,

              modalPrice:
                mandiRate.modalPrice,

              maxPrice:
                mandiRate.maxPrice,

              arrival:
                mandiRate.arrival,

              rateDate:
                mandiRate.rateDate,
            }
          : null,

        result: {
          price: estimatedPrice,
          production:
            expectedProduction,
          totalValue: totalValue,
        },
      });

    } catch (error) {

      console.error(
        "Predict Price Error:",
        error.message
      );

      return res.status(500).json({
        message:
          "Server error while estimating crop price.",

        error:
          error.message,
      });
    }
  }
);

// =====================================================
// CREATE REVIEW / RATING API
// =====================================================

app.post(
  "/api/reviews",
  async (req, res) => {
    try {
      const {
        buyerEmail,
        
        cropName,
        orderId,
        rating,
        review,
      } = req.body;

      // =================================================
      // REQUIRED FIELDS
      // =================================================

      if (
        !buyerEmail ||
        
        !cropName ||
        !orderId ||
        rating === undefined
      ) {
        return res.status(400).json({
          message:
            "Buyer email,  crop name, order ID and rating are required.",
        });
      }

      // =================================================
      // VALIDATE ORDER ID
      // =================================================

      if (
        !mongoose.Types.ObjectId.isValid(orderId)
      ) {
        return res.status(400).json({
          message: "Invalid order ID.",
        });
      }

      // =================================================
      // VALIDATE RATING
      // =================================================

      const numericRating = Number(rating);

      if (
        numericRating < 1 ||
        numericRating > 5
      ) {
        return res.status(400).json({
          message: "Rating must be between 1 and 5.",
        });
      }

      // =================================================
      // CLEAN EMAILS
      // =================================================

     // =================================================
// CLEAN BUYER EMAIL
// =================================================

const cleanBuyerEmail =
  buyerEmail
    .trim()
    .toLowerCase();

// =================================================
// CHECK ORDER
// =================================================

const order =
  await Order.findOne({
    _id: orderId,
    buyerEmail: cleanBuyerEmail,
  });

if (!order) {
  return res.status(404).json({
    message:
      "Order not found or you are not the buyer.",
  });
}

// =================================================
// FIND FARMER EMAIL FROM CROP
// =================================================

const cropForReview =
  await Crop.findOne({
    name: order.cropName,
    farmer: order.farmer,
  });

if (!cropForReview) {
  return res.status(404).json({
    message:
      "Crop/farmer information not found.",
  });
}

const cleanFarmerEmail =
  cropForReview.farmerEmail
    .trim()
    .toLowerCase();
      // =================================================
      // CHECK ORDER
      // =================================================

     
      
      

      // =================================================
      // ONLY DELIVERED ORDERS CAN BE REVIEWED
      // =================================================

      if (
        order.status !== "Delivered" &&
        order.deliveryStatus !== "Delivered"
      ) {
        return res.status(400).json({
          message:
            "You can review the crop only after delivery.",
        });
      }

      // =================================================
      // PREVENT DUPLICATE REVIEW
      // =================================================

      const existingReview =
        await Review.findOne({
          orderId: order._id,
          buyerEmail: cleanBuyerEmail,
        });

      if (existingReview) {
        return res.status(409).json({
          message:
            "You have already reviewed this order.",
          review: existingReview,
        });
      }

      // =================================================
      // CREATE REVIEW
      // =================================================

      const newReview =
        await Review.create({
          buyerEmail:
            cleanBuyerEmail,

          farmerEmail:
            cleanFarmerEmail,

          cropName:
            cropName.trim(),

          orderId:
            order._id,

          rating:
            numericRating,

          review:
            review?.trim() || "",
        });
        
        
        
        // =====================================================
// AUTOMATIC NOTIFICATION — NEW RATING
// =====================================================

try {
  await Notification.create({
    userEmail: cleanFarmerEmail,

    type: "new_rating",

    title: "⭐ New Rating Received",

    message:
      `A buyer gave you ${numericRating}/5 rating for ${newReview.cropName}.`,

    orderId: newReview.orderId,

    read: false,
  });

  console.log(
    "NEW RATING NOTIFICATION CREATED"
  );

} catch (notificationError) {

  console.error(
    "New Rating Notification Error:",
    notificationError.message
  );
}

      // =================================================
      // SUCCESS
      // =================================================

      console.log(
        "Review submitted successfully:",
        newReview._id
      );

      return res.status(201).json({
        message:
          "Review submitted successfully! ⭐",

        review:
          newReview,
      });

    } catch (error) {

      console.error(
        "Create Review Error:",
        error.message
      );

      return res.status(500).json({
        message:
          "Server error while submitting review.",

        error:
          error.message,
      });
    }
  }
);

// =====================================================
// GET FARMER REVIEWS / RATINGS API
// =====================================================

app.get(
  "/api/reviews/farmer/:email",
  async (req, res) => {
    try {
      // ================================================
      // GET FARMER EMAIL
      // ================================================

      const email =
        req.params.email
          .trim()
          .toLowerCase();

      // ================================================
      // REQUIRED EMAIL
      // ================================================

      if (!email) {
        return res.status(400).json({
          message:
            "Farmer email is required.",
        });
      }

      // ================================================
      // GET REVIEWS FROM MONGODB
      // ================================================

      const reviews =
        await Review.find({
          farmerEmail: email,
        })
          .sort({
            createdAt: -1,
          })
          .lean();

      // ================================================
      // SUCCESS
      // ================================================

      console.log(
        `Farmer reviews fetched: ${email} - ${reviews.length}`
      );

      return res.status(200).json({
        reviews,
      });

    } catch (error) {

      console.error(
        "Get Farmer Reviews Error:",
        error.message
      );

      return res.status(500).json({
        message:
          "Failed to fetch farmer reviews.",

        error:
          error.message,
      });
    }
  }
);

// =====================================================
// CREATE NOTIFICATION API
// =====================================================

app.post(
  "/api/notifications",
  async (req, res) => {
    try {
      const {
        userEmail,
        type,
        title,
        message,
        orderId,
      } = req.body;

      // ================================================
      // REQUIRED FIELDS
      // ================================================

      if (
        !userEmail ||
        !title ||
        !message
      ) {
        return res.status(400).json({
          message:
            "User email, title and message are required.",
        });
      }

      // ================================================
      // CLEAN EMAIL
      // ================================================

      const cleanEmail =
        userEmail
          .trim()
          .toLowerCase();

      // ================================================
      // CREATE NOTIFICATION
      // ================================================

      const notification =
        await Notification.create({
          userEmail: cleanEmail,

          type:
            type || "general",

          title:
            title.trim(),

          message:
            message.trim(),

          orderId:
            orderId || null,

          read: false,
        });

      console.log(
        "Notification created:",
        notification._id
      );

      return res.status(201).json({
        message:
          "Notification created successfully.",

        notification,
      });

    } catch (error) {

      console.error(
        "Create Notification Error:",
        error.message
      );

      return res.status(500).json({
        message:
          "Failed to create notification.",

        error:
          error.message,
      });
    }
  }
);


// =====================================================
// GET USER NOTIFICATIONS API
// =====================================================

app.get(
  "/api/notifications/:email",
  async (req, res) => {
    try {
      const email =
        req.params.email
          .trim()
          .toLowerCase();

      const notifications =
        await Notification.find({
          userEmail: email,
        })
          .sort({
            createdAt: -1,
          })
          .lean();

      const unreadCount =
        notifications.filter(
          (notification) =>
            !notification.read
        ).length;

      return res.status(200).json({
        notifications,
        unreadCount,
      });

    } catch (error) {

      console.error(
        "Get Notifications Error:",
        error.message
      );

      return res.status(500).json({
        message:
          "Failed to fetch notifications.",

        error:
          error.message,
      });
    }
  }
);


// =====================================================
// MARK NOTIFICATION AS READ
// =====================================================

app.put(
  "/api/notifications/:id/read",
  async (req, res) => {
    try {
      const { id } =
        req.params;

      if (
        !mongoose.Types.ObjectId.isValid(id)
      ) {
        return res.status(400).json({
          message:
            "Invalid notification ID.",
        });
      }

      const notification =
        await Notification.findByIdAndUpdate(
          id,
          {
            read: true,
          },
          {
            new: true,
          }
        );

      if (!notification) {
        return res.status(404).json({
          message:
            "Notification not found.",
        });
      }

      return res.status(200).json({
        message:
          "Notification marked as read.",

        notification,
      });

    } catch (error) {

      console.error(
        "Mark Notification Read Error:",
        error.message
      );

      return res.status(500).json({
        message:
          "Failed to update notification.",

        error:
          error.message,
      });
    }
  }
);


// =====================================================
// MARK ALL NOTIFICATIONS AS READ
// =====================================================

app.put(
  "/api/notifications/read-all/:email",
  async (req, res) => {
    try {
      const email =
        req.params.email
          .trim()
          .toLowerCase();

      await Notification.updateMany(
        {
          userEmail: email,
          read: false,
        },
        {
          $set: {
            read: true,
          },
        }
      );

      return res.status(200).json({
        message:
          "All notifications marked as read.",
      });

    } catch (error) {

      console.error(
        "Mark All Notifications Read Error:",
        error.message
      );

      return res.status(500).json({
        message:
          "Failed to mark notifications as read.",

        error:
          error.message,
      });
    }
  }
);




// =====================================================
// ASSIGN / UPDATE DELIVERY BOY FOR ORDER
// =====================================================

app.put(
  "/api/orders/:orderId/delivery",
  async (req, res) => {
    try {
      const { orderId } = req.params;

      const {
        deliveryBoyName,
        deliveryBoyPhone,
        deliveryBoyLocation,
        vehicleType,
        vehicleNumber,
        deliveryStatus,
      } = req.body;

      // ================================================
      // CHECK ORDER ID
      // ================================================

      if (
        !mongoose.Types.ObjectId.isValid(orderId)
      ) {
        return res.status(400).json({
          message: "Invalid order ID.",
        });
      }

      // ================================================
      // REQUIRED DELIVERY DETAILS
      // ================================================

      if (
        !deliveryBoyName ||
        !deliveryBoyPhone ||
        !deliveryBoyLocation ||
        !vehicleType ||
        !vehicleNumber
      ) {
        return res.status(400).json({
          message:
            "Please provide delivery boy name, phone, location, vehicle type and vehicle number.",
        });
      }

      // ================================================
      // UPDATE ORDER
      // ================================================

      const updatedOrder =
        await Order.findByIdAndUpdate(
          orderId,
          {
            deliveryBoyName:
              deliveryBoyName.trim(),

            deliveryBoyPhone:
              deliveryBoyPhone.trim(),

            deliveryBoyLocation:
              deliveryBoyLocation.trim(),

            vehicleType:
              vehicleType.trim(),

            vehicleNumber:
              vehicleNumber.trim(),

            deliveryStatus:
              deliveryStatus?.trim() ||
              "Assigned",
          },
          {
            new: true,
            runValidators: true,
          }
        );

      // ================================================
      // ORDER NOT FOUND
      // ================================================

      if (!updatedOrder) {
        return res.status(404).json({
          message: "Order not found.",
        });
      }

      // ================================================
      // SUCCESS
      // ================================================

      console.log(
        "Delivery boy assigned successfully:",
        updatedOrder._id
      );

      return res.status(200).json({
        message:
          "Delivery boy assigned successfully! 🚚",

        order: updatedOrder,
      });

    } catch (error) {
      console.error(
        "Assign Delivery Boy Error:",
        error.message
      );

      return res.status(500).json({
        message:
          "Server error while assigning delivery boy.",

        error:
          error.message,
      });
    }
  }
);

// =====================================================
// BUYER REQUESTS CROP PHOTO
// =====================================================

app.post(
  "/api/crop-photo-requests",
  async (req, res) => {
    try {
      const {
        buyerEmail,
        farmerEmail,
        cropId,
        cropName,
        message,
      } = req.body;

      if (
        !buyerEmail ||
        !farmerEmail ||
        !cropId ||
        !cropName
      ) {
        return res.status(400).json({
          message:
            "Buyer email, farmer email, crop ID and crop name are required.",
        });
      }

      if (
        !mongoose.Types.ObjectId.isValid(
          cropId
        )
      ) {
        return res.status(400).json({
          message:
            "Invalid crop ID.",
        });
      }

      const cleanBuyerEmail =
        buyerEmail
          .trim()
          .toLowerCase();

      const cleanFarmerEmail =
        farmerEmail
          .trim()
          .toLowerCase();

      const crop =
        await Crop.findOne({
          _id: cropId,
          farmerEmail:
            cleanFarmerEmail,
        });

      if (!crop) {
        return res.status(404).json({
          message:
            "Crop not found or farmer does not own this crop.",
        });
      }

      const existing =
        await CropPhotoRequest.findOne({
          buyerEmail:
            cleanBuyerEmail,

          farmerEmail:
            cleanFarmerEmail,

          cropId,

          status:
            "Pending",
        });

      if (existing) {
        return res.status(409).json({
          message:
            "A photo request is already pending for this crop.",

          request:
            existing,
        });
      }

      const request =
        await CropPhotoRequest.create({
          buyerEmail:
            cleanBuyerEmail,

          farmerEmail:
            cleanFarmerEmail,

          cropId,

          cropName:
            crop.name ||
            cropName.trim(),

          message:
            message?.trim() ||
            "Please upload a fresh photo of this crop.",
        });

      console.log(
        "Crop photo request created:",
        request._id
      );

      return res.status(201).json({
        message:
          "Crop photo request sent successfully! 📸",

        request,
      });
    } catch (error) {
      console.error(
        "Create Photo Request Error:",
        error.message
      );

      return res.status(500).json({
        message:
          "Server error while creating photo request.",

        error:
          error.message,
      });
    }
  }
);


// =====================================================
// GET FARMER PHOTO REQUESTS
// =====================================================

app.get(
  "/api/crop-photo-requests/farmer/:email",
  async (req, res) => {
    try {
      const email =
        req.params.email
          .trim()
          .toLowerCase();

      const requests =
        await CropPhotoRequest.find({
          farmerEmail: email,
        }).sort({
          createdAt: -1,
        });

      return res.status(200).json({
        requests,
      });
    } catch (error) {
      console.error(
        "Get Farmer Photo Requests Error:",
        error.message
      );

      return res.status(500).json({
        message:
          "Failed to fetch farmer photo requests.",
      });
    }
  }
);


// =====================================================
// GET BUYER PHOTO REQUESTS
// =====================================================

app.get(
  "/api/crop-photo-requests/buyer/:email",
  async (req, res) => {
    try {
      const email =
        req.params.email
          .trim()
          .toLowerCase();

      const requests =
        await CropPhotoRequest.find({
          buyerEmail: email,
        }).sort({
          createdAt: -1,
        });

      return res.status(200).json({
        requests,
      });
    } catch (error) {
      console.error(
        "Get Buyer Photo Requests Error:",
        error.message
      );

      return res.status(500).json({
        message:
          "Failed to fetch buyer photo requests.",
      });
    }
  }
);


// =====================================================
// FARMER UPLOADS CROP PHOTO
// =====================================================

app.post(
  "/api/crop-photo-requests/:requestId/upload",
  upload.single("photo"),

  async (req, res) => {
    try {
      const {
        requestId,
      } = req.params;

      const farmerEmail =
        req.body.farmerEmail;

      if (
        !mongoose.Types.ObjectId.isValid(
          requestId
        )
      ) {
        if (
          req.file &&
          fs.existsSync(
            req.file.path
          )
        ) {
          fs.unlinkSync(
            req.file.path
          );
        }

        return res.status(400).json({
          message:
            "Invalid photo request ID.",
        });
      }

      if (!farmerEmail) {
        if (
          req.file &&
          fs.existsSync(
            req.file.path
          )
        ) {
          fs.unlinkSync(
            req.file.path
          );
        }

        return res.status(400).json({
          message:
            "Farmer email is required.",
        });
      }

      if (!req.file) {
        return res.status(400).json({
          message:
            "Please select a crop photo to upload.",
        });
      }

      const cleanFarmerEmail =
        farmerEmail
          .trim()
          .toLowerCase();

      const request =
        await CropPhotoRequest.findOne({
          _id: requestId,

          farmerEmail:
            cleanFarmerEmail,
        });

      if (!request) {
        if (
          fs.existsSync(
            req.file.path
          )
        ) {
          fs.unlinkSync(
            req.file.path
          );
        }

        return res.status(404).json({
          message:
            "Photo request not found or you are not the farmer.",
        });
      }

      // Delete old photo
      if (request.photoUrl) {
        const oldFile =
          path.join(
            uploadsDir,
            path.basename(
              request.photoUrl
            )
          );

        if (
          fs.existsSync(oldFile)
        ) {
          fs.unlinkSync(
            oldFile
          );
        }
      }

      request.photoUrl =
        `/uploads/${req.file.filename}`;

      request.status =
        "Photo Uploaded";

      await request.save();

      console.log(
        "Crop photo uploaded:",
        request._id
      );

      return res.status(200).json({
        message:
          "Crop photo uploaded successfully! 📸",

        request,

        photoUrl:
          request.photoUrl,
      });
    } catch (error) {
      if (
        req.file &&
        fs.existsSync(
          req.file.path
        )
      ) {
        fs.unlinkSync(
          req.file.path
        );
      }

      console.error(
        "Upload Crop Photo Error:",
        error.message
      );

      return res.status(500).json({
        message:
          "Server error while uploading crop photo.",

        error:
          error.message,
      });
    }
  }
);


// =====================================================
// FARMER REJECTS PHOTO REQUEST
// =====================================================

app.put(
  "/api/crop-photo-requests/:requestId/reject",

  async (req, res) => {
    try {
      const {
        requestId,
      } = req.params;

      const {
        farmerEmail,
      } = req.body;

      if (
        !mongoose.Types.ObjectId.isValid(
          requestId
        )
      ) {
        return res.status(400).json({
          message:
            "Invalid photo request ID.",
        });
      }

      if (!farmerEmail) {
        return res.status(400).json({
          message:
            "Farmer email is required.",
        });
      }

      const request =
        await CropPhotoRequest.findOne({
          _id: requestId,

          farmerEmail:
            farmerEmail
              .trim()
              .toLowerCase(),
        });

      if (!request) {
        return res.status(404).json({
          message:
            "Photo request not found or you are not the farmer.",
        });
      }

      request.status =
        "Rejected";

      await request.save();

      return res.status(200).json({
        message:
          "Crop photo request rejected.",

        request,
      });
    } catch (error) {
      console.error(
        "Reject Photo Request Error:",
        error.message
      );

      return res.status(500).json({
        message:
          "Server error while rejecting photo request.",
      });
    }
  }
);


// =====================================================
// DELETE PHOTO REQUEST
// =====================================================

app.delete(
  "/api/crop-photo-requests/:requestId",
  async (req, res) => {
    try {
      const {
        requestId,
      } = req.params;

      if (
        !mongoose.Types.ObjectId.isValid(
          requestId
        )
      ) {
        return res.status(400).json({
          message:
            "Invalid photo request ID.",
        });
      }

      const request =
        await CropPhotoRequest.findById(
          requestId
        );

      if (!request) {
        return res.status(404).json({
          message:
            "Photo request not found.",
        });
      }

      // Delete uploaded image
      if (request.photoUrl) {
        const filePath =
          path.join(
            uploadsDir,
            path.basename(
              request.photoUrl
            )
          );

        if (
          fs.existsSync(
            filePath
          )
        ) {
          fs.unlinkSync(
            filePath
          );
        }
      }

      await CropPhotoRequest.findByIdAndDelete(
        requestId
      );

      return res.status(200).json({
        message:
          "Photo request deleted successfully.",
      });
    } catch (error) {
      console.error(
        "Delete Photo Request Error:",
        error.message
      );

      return res.status(500).json({
        message:
          "Server error while deleting photo request.",
      });
    }
  }
);


// =====================================================
// USER IDENTITY VERIFICATION UPLOAD
// =====================================================

app.post(
  "/api/verification/upload",

  upload.fields([
    {
      name: "identityDocument",
      maxCount: 1,
    },
    {
      name: "profilePhoto",
      maxCount: 1,
    },
  ]),

  async (req, res) => {
    try {

      const {
        email,
      } = req.body;


      // -----------------------------------------------
      // EMAIL REQUIRED
      // -----------------------------------------------

      if (!email) {

        // Delete uploaded files
        if (req.files) {

          Object.values(
            req.files
          )
            .flat()
            .forEach((file) => {

              if (
                file &&
                fs.existsSync(
                  file.path
                )
              ) {
                fs.unlinkSync(
                  file.path
                );
              }

            });
        }

        return res.status(400).json({
          message:
            "Email is required.",
        });
      }


      // -----------------------------------------------
      // CLEAN EMAIL
      // -----------------------------------------------

      const cleanEmail =
        email
          .trim()
          .toLowerCase();


      // -----------------------------------------------
      // FIND USER
      // -----------------------------------------------

      const user =
        await User.findOne({
          email: cleanEmail,
        });


      if (!user) {

        // Delete uploaded files
        if (req.files) {

          Object.values(
            req.files
          )
            .flat()
            .forEach((file) => {

              if (
                file &&
                fs.existsSync(
                  file.path
                )
              ) {
                fs.unlinkSync(
                  file.path
                );
              }

            });
        }

        return res.status(404).json({
          message:
            "User account not found.",
        });
      }


      // -----------------------------------------------
      // CHECK FILES
      // -----------------------------------------------

      const identityFile =
        req.files?.identityDocument?.[0];

      const profileFile =
        req.files?.profilePhoto?.[0];


      if (
        !identityFile &&
        !profileFile
      ) {
        return res.status(400).json({
          message:
            "Please upload an identity document or profile photo.",
        });
      }


      // -----------------------------------------------
      // DELETE OLD IDENTITY DOCUMENT
      // -----------------------------------------------

      if (
        identityFile &&
        user.identityDocument
      ) {

        const oldIdentityFile =
          path.join(
            uploadsDir,
            path.basename(
              user.identityDocument
            )
          );

        if (
          fs.existsSync(
            oldIdentityFile
          )
        ) {
          fs.unlinkSync(
            oldIdentityFile
          );
        }
      }


      // -----------------------------------------------
      // DELETE OLD PROFILE PHOTO
      // -----------------------------------------------

      if (
        profileFile &&
        user.profilePhoto
      ) {

        const oldProfileFile =
          path.join(
            uploadsDir,
            path.basename(
              user.profilePhoto
            )
          );

        if (
          fs.existsSync(
            oldProfileFile
          )
        ) {
          fs.unlinkSync(
            oldProfileFile
          );
        }
      }


      // -----------------------------------------------
      // SAVE IDENTITY DOCUMENT URL
      // -----------------------------------------------

      if (identityFile) {

        user.identityDocument =
          `/uploads/${identityFile.filename}`;
      }


      // -----------------------------------------------
      // SAVE PROFILE PHOTO URL
      // -----------------------------------------------

      if (profileFile) {

        user.profilePhoto =
          `/uploads/${profileFile.filename}`;
      }


      // -----------------------------------------------
      // RESET VERIFICATION STATUS
      // -----------------------------------------------

      user.verificationStatus =
        "pending";


      // -----------------------------------------------
      // SAVE USER
      // -----------------------------------------------

      await user.save();


      console.log(
        "Identity verification documents uploaded:",
        user.email
      );


      // -----------------------------------------------
      // RESPONSE
      // -----------------------------------------------

      return res.status(200).json({

        message:
          "Verification documents uploaded successfully.",

        user: {
          id:
            user._id,

          name:
            user.name,

          email:
            user.email,

          role:
            user.role,

          verificationStatus:
            user.verificationStatus,

          identityDocument:
            user.identityDocument,

          profilePhoto:
            user.profilePhoto,
        },

      });

    } catch (error) {

      // ---------------------------------------------
      // DELETE NEWLY UPLOADED FILES ON ERROR
      // ---------------------------------------------

      if (req.files) {

        Object.values(
          req.files
        )
          .flat()
          .forEach((file) => {

            if (
              file &&
              fs.existsSync(
                file.path
              )
            ) {
              fs.unlinkSync(
                file.path
              );
            }

          });
      }


      console.error(
        "Verification Upload Error:",
        error.message
      );


      return res.status(500).json({
        message:
          "Server error while uploading verification documents.",

        error:
          error.message,
      });
    }
  }
);


// =====================================================
// GET USER VERIFICATION STATUS
// =====================================================

app.get(
  "/api/verification/:email",
  async (req, res) => {

    try {

      const email =
        req.params.email
          .trim()
          .toLowerCase();


      const user =
        await User.findOne({
          email: email,
        }).select(
          "-password"
        );


      if (!user) {
        return res.status(404).json({
          message:
            "User account not found.",
        });
      }


      return res.status(200).json({

        id:
          user._id,

        name:
          user.name,

        email:
          user.email,

        role:
          user.role,

        verificationStatus:
          user.verificationStatus,

        identityDocument:
          user.identityDocument,

        profilePhoto:
          user.profilePhoto,

      });

    } catch (error) {

      console.error(
        "Get Verification Status Error:",
        error.message
      );


      return res.status(500).json({
        message:
          "Server error while getting verification status.",
      });
    }
  }
);


// =====================================================
// ADMIN APPROVE USER VERIFICATION
// =====================================================

// =====================================================
// ADMIN APPROVE USER VERIFICATION
// =====================================================

app.put(
  "/api/verification/:userId/approve",
  async (req, res) => {
    try {

      // =================================================
      // CHECK ADMIN EMAIL
      // =================================================

      const adminEmail =
        req.headers["x-admin-email"];

      if (!adminEmail) {
        return res.status(401).json({
          message:
            "Admin authentication required.",
        });
      }

      const cleanAdminEmail =
        adminEmail
          .trim()
          .toLowerCase();


      // =================================================
      // FIND ADMIN ACCOUNT
      // =================================================

      const admin =
        await User.findOne({
          email: cleanAdminEmail,
          role: "admin",
        });

      if (!admin) {
        return res.status(403).json({
          message:
            "Access denied. Admin account required.",
        });
      }


      // =================================================
      // GET USER ID
      // =================================================

      const {
        userId,
      } = req.params;


      // =================================================
      // VALIDATE USER ID
      // =================================================

      if (
        !mongoose.Types.ObjectId.isValid(
          userId
        )
      ) {
        return res.status(400).json({
          message:
            "Invalid user ID.",
        });
      }


      // =================================================
      // FIND USER
      // =================================================

      const user =
        await User.findById(
          userId
        );

      if (!user) {
        return res.status(404).json({
          message:
            "User not found.",
        });
      }


      // =================================================
      // APPROVE VERIFICATION
      // =================================================

      user.verificationStatus =
        "approved";

      await user.save();


      // =================================================
      // SUCCESS RESPONSE
      // =================================================

      console.log(
        `Admin approved user verification: ${user.email}`
      );

      return res.status(200).json({
        message:
          "User verification approved successfully.",

        user: {
          id:
            user._id,

          name:
            user.name,

          email:
            user.email,

          role:
            user.role,

          verificationStatus:
            user.verificationStatus,
        },
      });


    } catch (error) {

      console.error(
        "Approve Verification Error:",
        error.message
      );

      return res.status(500).json({
        message:
          "Server error while approving verification.",
      });
    }
  }
);


// =====================================================
// ADMIN REJECT USER VERIFICATION
// =====================================================

// =====================================================
// ADMIN REJECT USER VERIFICATION
// =====================================================

app.put(
  "/api/verification/:userId/reject",
  async (req, res) => {

    try {

      // =================================================
      // CHECK ADMIN EMAIL
      // =================================================

      const adminEmail =
        req.headers["x-admin-email"];

      if (!adminEmail) {
        return res.status(401).json({
          message:
            "Admin authentication required.",
        });
      }

      const cleanAdminEmail =
        adminEmail
          .trim()
          .toLowerCase();


      // =================================================
      // FIND ADMIN ACCOUNT
      // =================================================

      const admin =
        await User.findOne({
          email: cleanAdminEmail,
          role: "admin",
        });

      if (!admin) {
        return res.status(403).json({
          message:
            "Access denied. Admin account required.",
        });
      }


      // =================================================
      // GET USER ID
      // =================================================

      const {
        userId,
      } = req.params;


      // =================================================
      // VALIDATE USER ID
      // =================================================

      if (
        !mongoose.Types.ObjectId.isValid(
          userId
        )
      ) {
        return res.status(400).json({
          message:
            "Invalid user ID.",
        });
      }


      // =================================================
      // FIND USER
      // =================================================

      const user =
        await User.findById(
          userId
        );

      if (!user) {
        return res.status(404).json({
          message:
            "User not found.",
        });
      }


      // =================================================
      // REJECT VERIFICATION
      // =================================================

      user.verificationStatus =
        "rejected";

      await user.save();


      // =================================================
      // SUCCESS RESPONSE
      // =================================================

      console.log(
        `Admin rejected user verification: ${user.email}`
      );

      return res.status(200).json({

        message:
          "User verification rejected.",

        user: {

          id:
            user._id,

          name:
            user.name,

          email:
            user.email,

          role:
            user.role,

          verificationStatus:
            user.verificationStatus,
        },

      });

    } catch (error) {

      console.error(
        "Reject Verification Error:",
        error.message
      );

      return res.status(500).json({
        message:
          "Server error while rejecting verification.",
      });
    }
  }
);


// =====================================================
// MULTER ERROR HANDLER
// =====================================================
// MULTER ERROR HANDLER
// =====================================================

app.use(
  (
    error,
    req,
    res,
    next
  ) => {
    if (
      error instanceof
      multer.MulterError
    ) {
      if (
        error.code ===
        "LIMIT_FILE_SIZE"
      ) {
        return res.status(400).json({
          message:
            "Image size must be less than 5 MB.",
        });
      }

      return res.status(400).json({
        message:
          error.message,
      });
    }

    if (
      error &&
      error.message &&
      error.message.includes(
        "Only JPG"
      )
    ) {
      return res.status(400).json({
        message:
          error.message,
      });
    }

    next(error);
  }
);

// =====================================================
// OLLAMA AI API
// =====================================================

app.post("/api/ai", async (req, res) => {
  try {
    const { message, image } = req.body;

    // Text aur image dono mein se kam se kam ek hona chahiye
    if ((!message || !message.trim()) && !image) {
      return res.status(400).json({
        message: "Please enter a message or upload a crop image.",
      });
    }

    // Image ko Ollama ke required base64 format mein convert karo
    let imageBase64 = null;

    if (image) {
      imageBase64 = image.replace(
        /^data:image\/[a-zA-Z0-9.+-]+;base64,/,
        ""
      );
    }

    const userQuestion =
      message && message.trim()
        ? message.trim()
        : "Please analyze this crop image and tell me what crop it appears to be.";

    const ollamaResponse = await fetch(
      "http://localhost:11434/api/generate",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gemma3:4b",

          prompt: `
You are CropMarket AI Assistant for Indian farmers.

RULES:
- Answer the user's question directly.
- Focus on India, especially Odisha, unless another location is specifically asked.
- Reply in simple English or simple Hindi/Hinglish based on the user's question.
- Do not use Marathi unless the user asks for Marathi.
- Never mention Oregon unless the user specifically asks about Oregon.
- Do not repeat words, sentences, or information.
- Do not make up facts.
- Keep the answer clear, practical, and useful for farmers.
- If a crop image is provided, carefully analyze the visible crop.
- Identify the crop only when reasonably confident.
- If you are not confident, clearly say that the image is not sufficient to identify it.
- If the user asks about crop health, mention only visible symptoms and possible causes.
- Do not claim a disease with certainty from an image alone.
- If the question is about crops, mention suitable crops and briefly explain why.
- Use numbered points when there are multiple recommendations.

USER QUESTION:
${userQuestion}

Now give the best helpful answer.
`,

          // Image hone par Gemma Vision ko image bhejo
          ...(imageBase64
            ? {
                images: [imageBase64],
              }
            : {}),

          stream: false,
        }),
      }
    );

    if (!ollamaResponse.ok) {
      throw new Error(
        `Ollama returned status ${ollamaResponse.status}`
      );
    }

    const data = await ollamaResponse.json();

    return res.status(200).json({
      reply:
        data.response ||
        "No response received from AI.",
    });

  } catch (error) {
    console.error(
      "OLLAMA AI ERROR:",
      error.message
    );

    return res.status(500).json({
      message: "AI server error.",
      error: error.message,
    });
  }
});
// =====================================================
// SERVER
// =====================================================

const PORT =
  process.env.PORT || 5000;

app.listen(
  PORT,
  () => {
    console.log(
      `CropMarket Backend running on port ${PORT} 🚀`
    );
  }
);