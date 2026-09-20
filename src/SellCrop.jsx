import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./App.css";

function SellCrop() {
  const navigate = useNavigate();

  // =========================
  // FORM STATES
  // =========================

  const [cropName, setCropName] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [farmerName, setFarmerName] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // =========================
  // CROP ICON
  // =========================

  const getCropIcon = (name) => {
    const icons = {
      Wheat: "🌾",
      Maize: "🌽",
      Potato: "🥔",
      Tomato: "🍅",
      Onion: "🧅",
      Carrot: "🥕",
    };

    return icons[name] || "🌱";
  };

  // =========================
  // SUBMIT FORM
  // =========================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    // =========================
    // VALIDATION
    // =========================

    if (
      !cropName ||
      !price ||
      !quantity ||
      !farmerName ||
      !location
    ) {
      setError(
        "Please fill all required fields."
      );

      return;
    }

    if (Number(price) <= 0) {
      setError(
        "Price must be greater than 0."
      );

      return;
    }

    if (Number(quantity) <= 0) {
      setError(
        "Quantity must be greater than 0."
      );

      return;
    }

    try {
      setLoading(true);

      // =========================
      // GET LOGGED-IN USER
      // =========================

      const userData =
        localStorage.getItem("cropMarketUser") ||
        localStorage.getItem("user");

      let loggedInUser = null;

      try {
        loggedInUser = userData
          ? JSON.parse(userData)
          : null;
      } catch (userError) {
        console.error(
          "User data error:",
          userError
        );
      }

      const farmerEmail =
        loggedInUser?.email || "";

      // =========================
      // CHECK LOGIN EMAIL
      // =========================

      if (!farmerEmail) {
        setError(
          "Please login first before listing a crop."
        );

        setLoading(false);

        return;
      }

      console.log(
        "Listing crop for:",
        farmerEmail
      );

      // =========================
      // CROP INFORMATION
      // =========================

      const cropIcon =
        getCropIcon(cropName);

      const category =
        cropName === "Wheat" ||
        cropName === "Maize"
          ? "Grains"
          : "Vegetables";

      // =========================
      // SEND TO MONGODB BACKEND
      // =========================

      const response = await fetch(
        "http://localhost:5000/api/crops",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            icon: cropIcon,

            name: cropName.trim(),

            category: category,

            price: `₹${Number(price)}/kg`,

            priceValue:
              Number(price),

            farmer:
              farmerName.trim(),

            // NEW:
            // Logged-in user's email
            farmerEmail:
              farmerEmail.trim().toLowerCase(),

            location:
              location.trim(),

            quantity:
              `${Number(quantity)} kg`,

            quantityValue:
              Number(quantity),

            description:
              description.trim() ||
              "Fresh quality crop directly from local farmer.",
          }),
        }
      );

      // =========================
      // READ BACKEND RESPONSE
      // =========================

      const data =
        await response.json();

      console.log(
        "Crop API Response:",
        data
      );

      // =========================
      // BACKEND ERROR
      // =========================

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to list crop."
        );
      }

      // =========================
      // SUCCESS
      // =========================

      alert(
        `🌱 Crop Listed Successfully!\n\n` +
        `${cropIcon} ${cropName}\n` +
        `💰 ₹${price}/kg\n` +
        `📦 ${quantity} kg\n` +
        `👨‍🌾 ${farmerName}\n` +
        `📍 ${location}`
      );

      // =========================
      // RESET FORM
      // =========================

      setCropName("");
      setPrice("");
      setQuantity("");
      setFarmerName("");
      setLocation("");
      setDescription("");

      // =========================
      // GO TO CROPS PAGE
      // =========================

      navigate("/crops");

    } catch (error) {
      console.error(
        "Sell Crop Error:",
        error
      );

      setError(
        error.message ||
          "Cannot connect to CropMarket backend. Please make sure the backend is running on port 5000."
      );

    } finally {
      setLoading(false);
    }
  };

  // =========================
  // RESET FORM
  // =========================

  const handleReset = () => {
    setCropName("");
    setPrice("");
    setQuantity("");
    setFarmerName("");
    setLocation("");
    setDescription("");
    setError("");
  };

  // =========================
  // PAGE
  // =========================

  return (
    <div className="sell-page">

      {/* =================================================
          NAVBAR
      ================================================= */}

      <nav className="navbar">

        <Link
          to="/"
          className="logo"
        >

          <span>
            🌱
          </span>

          <strong>
            CropMarket
          </strong>

        </Link>

        <div className="nav-links">

          <Link to="/">
            Home
          </Link>

          <Link to="/crops">
            Crops
          </Link>

          <Link
            to="/sell"
            className="active-link"
          >
            Sell Crop
          </Link>

          <a href="/#about">
            About
          </a>

          <Link
            to="/login"
            className="login-btn"
          >
            🔐 Login
          </Link>

        </div>

      </nav>


      {/* =================================================
          HEADER
      ================================================= */}

      <section className="sell-header">

        <div className="badge">
          🚜 FARMER MARKETPLACE
        </div>

        <h1>
          Sell Your{" "}
          <span>
            Crop
          </span>
        </h1>

        <p>
          List your fresh crops and connect
          directly with buyers.
        </p>

      </section>


      {/* =================================================
          MAIN SELL SECTION
      ================================================= */}

      <section className="sell-section">

        {/* =================================================
            FORM CARD
        ================================================= */}

        <div className="sell-card">

          <div className="form-icon">
            {getCropIcon(cropName)}
          </div>

          <h2>
            Crop Details
          </h2>

          <p className="form-subtitle">
            Enter your crop information below
          </p>


          {/* ERROR */}

          {error && (

            <div
              style={{
                background: "#ffecec",
                color: "#c62828",
                padding: "12px 15px",
                borderRadius: "10px",
                marginBottom: "18px",
                fontWeight: "600",
                fontSize: "14px",
              }}
            >
              ⚠️ {error}
            </div>

          )}


          {/* FORM */}

          <form
            onSubmit={handleSubmit}
          >

            {/* ================= CROP ================= */}

            <div className="form-group">

              <label>
                Crop Name *
              </label>

              <select
                value={cropName}
                onChange={(e) =>
                  setCropName(
                    e.target.value
                  )
                }
              >

                <option value="">
                  Select Crop
                </option>

                <option value="Wheat">
                  🌾 Wheat
                </option>

                <option value="Maize">
                  🌽 Maize
                </option>

                <option value="Potato">
                  🥔 Potato
                </option>

                <option value="Tomato">
                  🍅 Tomato
                </option>

                <option value="Onion">
                  🧅 Onion
                </option>

                <option value="Carrot">
                  🥕 Carrot
                </option>

              </select>

            </div>


            {/* ================= PRICE + QUANTITY ================= */}

            <div className="form-row">

              <div className="form-group">

                <label>
                  Price per Kg *
                </label>

                <input
                  type="number"
                  min="1"
                  placeholder="₹ Price"
                  value={price}
                  onChange={(e) =>
                    setPrice(
                      e.target.value
                    )
                  }
                />

              </div>


              <div className="form-group">

                <label>
                  Quantity (Kg) *
                </label>

                <input
                  type="number"
                  min="1"
                  placeholder="Quantity"
                  value={quantity}
                  onChange={(e) =>
                    setQuantity(
                      e.target.value
                    )
                  }
                />

              </div>

            </div>


            {/* ================= FARMER ================= */}

            <div className="form-group">

              <label>
                Farmer Name *
              </label>

              <input
                type="text"
                placeholder="Enter your name"
                value={farmerName}
                onChange={(e) =>
                  setFarmerName(
                    e.target.value
                  )
                }
              />

            </div>


            {/* ================= LOCATION ================= */}

            <div className="form-group">

              <label>
                Location *
              </label>

              <input
                type="text"
                placeholder="Enter village / city"
                value={location}
                onChange={(e) =>
                  setLocation(
                    e.target.value
                  )
                }
              />

            </div>


            {/* ================= DESCRIPTION ================= */}

            <div className="form-group">

              <label>
                Crop Description
              </label>

              <textarea
                rows="4"
                placeholder="Tell buyers about your crop..."
                value={description}
                onChange={(e) =>
                  setDescription(
                    e.target.value
                  )
                }
              />

            </div>


            {/* ================= BUTTONS ================= */}

            <div
              style={{
                display: "flex",
                gap: "12px",
                marginTop: "10px",
              }}
            >

              <button
                type="submit"
                className="submit-crop-btn"
                disabled={loading}
                style={{
                  flex: 1,
                  opacity:
                    loading ? 0.7 : 1,
                  cursor:
                    loading
                      ? "not-allowed"
                      : "pointer",
                }}
              >

                {loading
                  ? "⏳ Listing..."
                  : "🚜 List My Crop"}

              </button>


              <button
                type="button"
                onClick={handleReset}
                disabled={loading}
                style={{
                  padding: "14px 20px",
                  border:
                    "1px solid #d9e6da",
                  borderRadius: "12px",
                  background:
                    "#f5faf5",
                  color: "#35633b",
                  fontWeight: "700",
                  cursor:
                    loading
                      ? "not-allowed"
                      : "pointer",
                }}
              >
                Reset
              </button>

            </div>

          </form>

        </div>


        {/* =================================================
            INFORMATION SIDE
        ================================================= */}

        <div className="sell-info">

          <div className="sell-farmer-art">
            👨‍🌾
          </div>

          <h2>
            Sell Directly to Buyers
          </h2>

          <p>
            CropMarket helps farmers connect
            with buyers directly and get better
            opportunities for their fresh produce.
          </p>


          {/* BENEFITS */}

          <div className="sell-benefits">

            <div>

              <span>
                🌱
              </span>

              <p>

                <strong>
                  Easy Listing
                </strong>

                <br />

                Add your crop in minutes.

              </p>

            </div>


            <div>

              <span>
                💰
              </span>

              <p>

                <strong>
                  Better Price
                </strong>

                <br />

                Connect directly with buyers.

              </p>

            </div>


            <div>

              <span>
                🤝
              </span>

              <p>

                <strong>
                  Trusted Marketplace
                </strong>

                <br />

                Build connections with buyers.

              </p>

            </div>


            <div>

              <span>
                📦
              </span>

              <p>

                <strong>
                  Easy Crop Management
                </strong>

                <br />

                Your listed crops appear in the
                marketplace.

              </p>

            </div>

          </div>


          {/* QUICK LINK */}

          <Link
            to="/crops"
            style={{
              display: "inline-block",
              marginTop: "20px",
              textDecoration: "none",
              color: "#218c3a",
              fontWeight: "700",
            }}
          >
            🌾 View Available Crops →
          </Link>

        </div>

      </section>


      {/* =================================================
          FOOTER
      ================================================= */}

      <footer>

        <div className="footer-logo">
          🌱 CropMarket
        </div>

        <p>
          Smart Agriculture Marketplace
        </p>

        <p>
          © 2026 CropMarket |
          All Rights Reserved
        </p>

      </footer>

    </div>
  );
}

export default SellCrop;