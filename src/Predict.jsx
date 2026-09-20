import React, { useState } from "react";
import { Link } from "react-router-dom";

function Predict() {
  const [form, setForm] = useState({
    crop: "Wheat",
    soilType: "Laterite",
    season: "Rabi",
    area: 2,
    rainfall: 900,
    temperature: 27,
    fertilizer: 100,
    marketDemand: 1.0,
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =====================================================
  // RUN PRICE ESTIMATE
  // Connects React with server.js
  // =====================================================

  const runEstimate = async () => {
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch(
        "http://localhost:5000/api/predict-price",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            crop: form.crop,
            soilType: form.soilType,
            season: form.season,
            area: Number(form.area),
            rainfall: Number(form.rainfall),
            temperature: Number(form.temperature),
            fertilizer: Number(form.fertilizer),
            marketDemand: Number(form.marketDemand),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to estimate crop price."
        );
      }

      setResult(data);
    } catch (error) {
      console.error("Prediction Error:", error);

      setError(
        error.message ||
          "Unable to connect to CropMarket backend."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#a9f3ae",
        color: "#222",
      }}
    >
      {/* =====================================================
          NAVBAR
      ===================================================== */}

      <header
        style={{
          background: "#ffffff",
          borderBottom: "1px solid #ddd",
          padding: "18px 6%",
          position: "sticky",
          top: 0,
          zIndex: 1000,
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "20px",
            flexWrap: "wrap",
          }}
        >
          {/* Logo */}

          <Link
            to="/"
            style={{
              textDecoration: "none",
              color: "#006b3c",
              fontSize: "30px",
              fontWeight: "700",
            }}
          >
            🌱 CropMarket
          </Link>

          {/* Navigation */}

          <nav
            style={{
              display: "flex",
              alignItems: "center",
              gap: "20px",
              flexWrap: "wrap",
            }}
          >
            <Link to="/" style={navStyle}>
              Home
            </Link>

            <Link to="/crops" style={navStyle}>
              Crops
            </Link>

            <Link to="/sell" style={navStyle}>
              Sell Crop
            </Link>

            <Link to="/my-orders" style={navStyle}>
              📦 My Orders
            </Link>

            <Link to="/dashboard" style={navStyle}>
              👤 Dashboard
            </Link>

            <Link to="/my-listings" style={navStyle}>
              🌾 My Listings
            </Link>

            <Link
              to="/predict"
              style={{
                ...navStyle,
                color: "#ffffff",
                background: "#222222",
                padding: "9px 15px",
                borderRadius: "5px",
              }}
            >
              🤖 Predict
            </Link>
          </nav>
        </div>
      </header>

      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <main
        style={{
          padding: "50px 8%",
        }}
      >
        <div
          style={{
            maxWidth: "900px",
            margin: "auto",
          }}
        >
          <p
            style={{
              letterSpacing: "3px",
              fontSize: "14px",
              marginBottom: "15px",
            }}
          >
            — AI CROP PRICE ESTIMATE
          </p>

          <h1
            style={{
              fontSize: "42px",
              marginBottom: "12px",
            }}
          >
            Get an estimated crop price
          </h1>

          <p
            style={{
              fontSize: "17px",
              marginBottom: "35px",
            }}
          >
            Enter your crop and farming conditions to get an
            estimated market price.
          </p>

          {/* =====================================================
              FORM
          ===================================================== */}

          <div
            style={{
              background: "#fff",
              padding: "30px",
              border: "1px solid #ddd",
              borderRadius: "8px",
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(250px, 1fr))",
                gap: "22px",
              }}
            >
              {/* Crop */}

              <label>
                CROP

                <select
                  name="crop"
                  value={form.crop}
                  onChange={handleChange}
                  style={inputStyle}
                >
                  <option>Wheat</option>
                  <option>Rice</option>
                  <option>Maize</option>
                  <option>Tomato</option>
                  <option>Potato</option>
                  <option>Onion</option>
                </select>
              </label>

              {/* Soil */}

              <label>
                SOIL TYPE

                <select
                  name="soilType"
                  value={form.soilType}
                  onChange={handleChange}
                  style={inputStyle}
                >
                  <option>Laterite</option>
                  <option>Alluvial</option>
                  <option>Black Soil</option>
                  <option>Red Soil</option>
                </select>
              </label>

              {/* Season */}

              <label>
                SEASON

                <select
                  name="season"
                  value={form.season}
                  onChange={handleChange}
                  style={inputStyle}
                >
                  <option>Rabi</option>
                  <option>Kharif</option>
                  <option>Zaid</option>
                </select>
              </label>

              {/* Area */}

              <label>
                AREA (HECTARES)

                <input
                  type="number"
                  name="area"
                  value={form.area}
                  onChange={handleChange}
                  min="0.1"
                  step="0.1"
                  style={inputStyle}
                />
              </label>

              {/* Rainfall */}

              <label>
                RAINFALL (MM)

                <input
                  type="number"
                  name="rainfall"
                  value={form.rainfall}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </label>

              {/* Temperature */}

              <label>
                TEMPERATURE (°C)

                <input
                  type="number"
                  name="temperature"
                  value={form.temperature}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </label>

              {/* Fertilizer */}

              <label>
                FERTILIZER (KG/HA)

                <input
                  type="number"
                  name="fertilizer"
                  value={form.fertilizer}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </label>

              {/* Market Demand */}

              <label>
                MARKET DEMAND (0.7–1.3)

                <input
                  type="number"
                  name="marketDemand"
                  value={form.marketDemand}
                  onChange={handleChange}
                  min="0.7"
                  max="1.3"
                  step="0.1"
                  style={inputStyle}
                />
              </label>
            </div>

            {/* =====================================================
                BUTTON
            ===================================================== */}

            <button
              onClick={runEstimate}
              disabled={loading}
              style={{
                marginTop: "30px",
                padding: "15px 28px",
                background: loading ? "#777" : "#222",
                color: "#fff",
                border: "none",
                borderRadius: "5px",
                cursor: loading
                  ? "not-allowed"
                  : "pointer",
                fontSize: "15px",
              }}
            >
              {loading
                ? "CALCULATING..."
                : "RUN AI ESTIMATE"}
            </button>

            {/* Error */}

            {error && (
              <div
                style={{
                  marginTop: "20px",
                  padding: "15px",
                  background: "#ffe5e5",
                  border: "1px solid #ffb3b3",
                  borderRadius: "6px",
                  color: "#b00000",
                }}
              >
                ❌ {error}
              </div>
            )}
          </div>

          {/* =====================================================
              RESULT
          ===================================================== */}

          {result && (
            <div
              style={{
                marginTop: "30px",
                background: "#fff",
                padding: "30px",
                borderRadius: "8px",
                border: "1px solid #ddd",
              }}
            >
              <h2
                style={{
                  marginBottom: "20px",
                }}
              >
                🌾 Estimated Result
              </h2>

              {/* Source */}

              <p>
                <strong>Data Source:</strong>{" "}
                {result.source}
              </p>

              {/* Mandi Data */}

              {result.mandiRate && (
                <div
                  style={{
                    marginTop: "20px",
                    padding: "18px",
                    background: "#f1f8f1",
                    border: "1px solid #d5e8d5",
                    borderRadius: "6px",
                  }}
                >
                  <h3>🏪 Latest Mandi Rate</h3>

                  <p>
                    <strong>Mandi:</strong>{" "}
                    {result.mandiRate.mandiName}
                  </p>

                  <p>
                    <strong>District:</strong>{" "}
                    {result.mandiRate.district}
                  </p>

                  <p>
                    <strong>Minimum:</strong>{" "}
                    ₹{result.mandiRate.minPrice}
                  </p>

                  <p>
                    <strong>Modal:</strong>{" "}
                    ₹{result.mandiRate.modalPrice}
                  </p>

                  <p>
                    <strong>Maximum:</strong>{" "}
                    ₹{result.mandiRate.maxPrice}
                  </p>

                  <p>
                    <strong>Arrival:</strong>{" "}
                    {result.mandiRate.arrival}
                  </p>
                </div>
              )}

              {/* Estimated Price */}

              <p
                style={{
                  marginTop: "22px",
                  fontSize: "20px",
                }}
              >
                <strong>Estimated Price:</strong>{" "}
                ₹{result.result.price} / Quintal
              </p>

              {/* Production */}

              <p>
                <strong>Expected Production:</strong>{" "}
                {result.result.production} Quintal
              </p>

              {/* Total Value */}

              <p>
                <strong>Estimated Total Value:</strong>{" "}
                ₹{result.result.totalValue}
              </p>

              <small>
                This estimate uses saved Mandi Rate data and
                rule-based calculations. It does not use a
                machine-learning model.
              </small>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

/* =====================================================
   NAVIGATION STYLE
===================================================== */

const navStyle = {
  textDecoration: "none",
  color: "#006b3c",
  fontWeight: "600",
  fontSize: "15px",
};

/* =====================================================
   INPUT STYLE
===================================================== */

const inputStyle = {
  display: "block",
  width: "100%",
  marginTop: "8px",
  padding: "13px",
  boxSizing: "border-box",
  border: "1px solid #ccc",
  borderRadius: "4px",
  fontSize: "16px",
  background: "#fff",
};

export default Predict;