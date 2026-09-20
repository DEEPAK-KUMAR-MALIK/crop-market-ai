const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

// =====================================================
// MIDDLEWARE
// =====================================================

app.use(cors());
app.use(express.json());

// =====================================================
// MONGODB CONNECTION
// =====================================================

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected Successfully 🌱");
  })
  .catch((error) => {
    console.error("MongoDB Connection Error:", error.message);
  });

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
      default: "buyer",
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

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

const Crop = mongoose.model("Crop", cropSchema);

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

const Order = mongoose.model("Order", orderSchema);

// =====================================================
// TEST ROUTE
// =====================================================

app.get("/", (req, res) => {
  res.json({
    message: "CropMarket Backend is Running 🌱",
  });
});

// =====================================================
// CREATE CROP API
// =====================================================

app.post("/api/crops", async (req, res) => {
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
        message: "Price must be greater than 0.",
      });
    }

    if (Number(quantityValue) <= 0) {
      return res.status(400).json({
        message: "Quantity must be greater than 0.",
      });
    }

    const cleanFarmerEmail = farmerEmail
      .trim()
      .toLowerCase();

    const newCrop = new Crop({
      icon: icon || "🌱",
      name: name.trim(),
      category: category || "Vegetables",
      price:
        price || `₹${Number(priceValue)}/kg`,
      priceValue: Number(priceValue),
      farmer: farmer.trim(),
      farmerEmail: cleanFarmerEmail,
      location: location.trim(),
      quantity:
        quantity || `${Number(quantityValue)} kg`,
      quantityValue: Number(quantityValue),
      description:
        description ||
        "Fresh quality crop directly from local farmer.",
    });

    await newCrop.save();

    console.log(
      `New crop listed: ${newCrop.name} by ${newCrop.farmer} (${newCrop.farmerEmail})`
    );

    return res.status(201).json({
      message: "Crop listed successfully! 🌱",
      crop: newCrop,
    });
  } catch (error) {
    console.error(
      "Create Crop Error:",
      error.message
    );

    return res.status(500).json({
      message: "Server error while creating crop.",
    });
  }
});

// =====================================================
// GET ALL CROPS API
// =====================================================

app.get("/api/crops", async (req, res) => {
  try {
    const crops = await Crop.find().sort({
      createdAt: -1,
    });

    return res.status(200).json({
      crops,
    });
  } catch (error) {
    console.error(
      "Get Crops Error:",
      error.message
    );

    return res.status(500).json({
      message: "Failed to fetch crops.",
    });
  }
});

// =====================================================
// GET MY CROPS BY FARMER EMAIL
// =====================================================

app.get(
  "/api/crops/farmer/:email",
  async (req, res) => {
    try {
      const email = req.params.email
        .trim()
        .toLowerCase();

      const crops = await Crop.find({
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
        message: "Failed to fetch farmer crops.",
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
      const { id } = req.params;

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
          message: "Farmer email is required.",
        });
      }

      const cleanFarmerEmail =
        farmerEmail.trim().toLowerCase();

      const existingCrop =
        await Crop.findOne({
          _id: id,
          farmerEmail: cleanFarmerEmail,
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
          message: "Price must be greater than 0.",
        });
      }

      if (
        quantityValue !== undefined &&
        Number(quantityValue) <= 0
      ) {
        return res.status(400).json({
          message: "Quantity must be greater than 0.",
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
        message: "Crop updated successfully! 🌱",
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
      const { id } = req.params;

      const farmerEmail =
        req.query.farmerEmail;

      if (!farmerEmail) {
        return res.status(400).json({
          message: "Farmer email is required.",
        });
      }

      const cleanFarmerEmail =
        farmerEmail.trim().toLowerCase();

      const deletedCrop =
        await Crop.findOneAndDelete({
          _id: id,
          farmerEmail: cleanFarmerEmail,
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
        message: "Crop deleted successfully! 🌱",
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

app.post(
  "/api/register",
  async (req, res) => {
    try {
      const {
        name,
        email,
        phone,
        password,
        role,
      } = req.body;

      if (
        !name ||
        !email ||
        !phone ||
        !password
      ) {
        return res.status(400).json({
          message: "Please fill all the fields.",
        });
      }

      const cleanEmail = email
        .trim()
        .toLowerCase();

      const existingUser =
        await User.findOne({
          email: cleanEmail,
        });

      if (existingUser) {
        return res.status(409).json({
          message:
            "An account with this email already exists. Please login.",
        });
      }

      const newUser = new User({
        name: name.trim(),
        email: cleanEmail,
        phone: phone.trim(),
        password: password,
        role: role || "buyer",
      });

      await newUser.save();

      console.log(
        `New user registered: ${newUser.email}`
      );

      return res.status(201).json({
        message:
          "Account created successfully! 🌱",
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          phone: newUser.phone,
          role: newUser.role,
        },
      });
    } catch (error) {
      console.error(
        "Register Error:",
        error.message
      );

      if (error.code === 11000) {
        return res.status(409).json({
          message:
            "An account with this email already exists.",
        });
      }

      return res.status(500).json({
        message:
          "Server error during registration.",
      });
    }
  }
);

// =====================================================
// LOGIN API
// =====================================================

app.post(
  "/api/login",
  async (req, res) => {
    try {
      const {
        email,
        password,
      } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          message:
            "Please enter email and password.",
        });
      }

      const cleanEmail = email
        .trim()
        .toLowerCase();

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

      if (user.password !== password) {
        return res.status(401).json({
          message:
            "Incorrect password. Please try again.",
        });
      }

      console.log(
        `User logged in: ${user.email}`
      );

      return res.status(200).json({
        message:
          "Login successful! 🌱",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
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

      if (newPassword.length < 6) {
        return res.status(400).json({
          message:
            "New password must be at least 6 characters.",
        });
      }

      const cleanEmail = email
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

      user.password = newPassword;

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

      // =================================================
      // RECEIVE ORDER DATA
      // =================================================

      const {
        buyerEmail,
        cropName,
        cropIcon,
        pricePerKg,
        quantity,
        totalPrice,
        farmer,
        location,

        // NEW FRONTEND FIELD
        paymentMethod,

        // OLD/BACKEND FIELD
        paymentMode,

        paymentStatus: frontendPaymentStatus,
        paymentType,
      } = req.body;

      // =================================================
      // PAYMENT METHOD COMPATIBILITY FIX
      // =================================================

      // BuyCrop.jsx sends paymentMethod.
      // If paymentMode is already sent, use it.
      // This keeps both versions compatible.

      const selectedPaymentMethod =
        paymentMethod || paymentMode;

      // =================================================
      // CHECK REQUIRED FIELDS
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

      if (Number(quantity) < 1) {
        return res.status(400).json({
          message:
            "Quantity must be at least 1 Kg.",
        });
      }

      // =================================================
      // VALIDATE PRICE
      // =================================================

      if (Number(pricePerKg) < 0) {
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
        // COD is paid when delivered
        finalPaymentStatus = "Pending";
      } else {
        // UPI/Card/Net Banking are only DEMO
        finalPaymentStatus = "Demo Paid";
      }

      // =================================================
      // CREATE ORDER
      // =================================================

      const newOrder = new Order({
        buyerEmail: buyerEmail
          .trim()
          .toLowerCase(),

        cropName: cropName.trim(),

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

        // IMPORTANT
        // Save frontend paymentMethod
        // into MongoDB paymentMode field.

        paymentMode:
          selectedPaymentMethod,

        paymentStatus:
          finalPaymentStatus,

        paymentType:
          paymentType || "Demo Payment",

        orderDate:
          new Date(),

        status:
          "Placed",
      });

      // =================================================
      // SAVE ORDER TO MONGODB
      // =================================================

      await newOrder.save();

      console.log(
        "================================="
      );

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

      // =================================================
      // SUCCESS RESPONSE
      // =================================================

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

      console.error(
        error
      );

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
      const email = req.params.email
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

app.get(
  "/api/users",
  async (req, res) => {
    try {
      const users =
        await User.find().select(
          "-password"
        );

      return res.status(200).json(users);
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