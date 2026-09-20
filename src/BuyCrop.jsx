import { useEffect, useState } from "react";
import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";
import "./App.css";

const API_BASE_URL = "http://127.0.0.1:5000";

function BuyCrop() {
  const location = useLocation();
  const navigate = useNavigate();

  const crop = location.state?.crop;

  const [quantity, setQuantity] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [loading, setLoading] = useState(false);

  // =====================================================
  // PHOTO REQUEST STATES
  // =====================================================

  const [photoRequestLoading, setPhotoRequestLoading] =
    useState(false);

  const [photoRequestSent, setPhotoRequestSent] =
    useState(false);

  const [photoRequestMessage, setPhotoRequestMessage] =
    useState("");

  const [photoRequest, setPhotoRequest] =
    useState(null);

  const [farmerPhoto, setFarmerPhoto] =
    useState("");

  const [photoLoading, setPhotoLoading] =
    useState(false);

  // =====================================================
  // GET LOGGED-IN BUYER
  // =====================================================

  const getLoggedInUser = () => {
    const savedUser =
      localStorage.getItem("cropMarketLoggedInUser") ||
      localStorage.getItem("user");

    if (!savedUser) {
      return null;
    }

    try {
      return JSON.parse(savedUser);
    } catch (error) {
      console.error("Invalid login data:", error);
      return null;
    }
  };

  // =====================================================
  // GET BUYER PHOTO REQUEST
  // =====================================================

  const fetchBuyerPhotoRequest = async () => {
    if (!crop?._id) {
      return;
    }

    const loggedInUser = getLoggedInUser();

    if (!loggedInUser?.email) {
      return;
    }

    try {
      setPhotoLoading(true);

      const buyerEmail =
        loggedInUser.email.trim().toLowerCase();

      const response = await fetch(
        `${API_BASE_URL}/api/crop-photo-requests/buyer/${encodeURIComponent(
          buyerEmail
        )}`
      );

      if (!response.ok) {
        throw new Error(
          `Server returned ${response.status}`
        );
      }

      const data = await response.json();

      console.log(
        "Buyer photo requests:",
        data
      );

      const requests = Array.isArray(data.requests)
        ? data.requests
        : [];

      // Find request for current crop
      const matchingRequest = requests.find(
        (request) =>
          String(request.cropId) ===
          String(crop._id)
      );

      if (matchingRequest) {
        console.log(
          "Matching photo request:",
          matchingRequest
        );

        setPhotoRequest(
          matchingRequest
        );

        if (
          matchingRequest.photoUrl
        ) {
          const fullPhotoUrl =
            matchingRequest.photoUrl.startsWith(
              "http"
            )
              ? matchingRequest.photoUrl
              : `${API_BASE_URL}${matchingRequest.photoUrl}`;

          console.log(
            "Farmer photo URL:",
            fullPhotoUrl
          );

          setFarmerPhoto(
            fullPhotoUrl
          );

          setPhotoRequestSent(true);
        }
      }
    } catch (error) {
      console.error(
        "Fetch buyer photo request error:",
        error
      );
    } finally {
      setPhotoLoading(false);
    }
  };

  // =====================================================
  // CHECK PHOTO WHEN PAGE OPENS
  // =====================================================

  useEffect(() => {
    if (!crop?._id) {
      return;
    }

    fetchBuyerPhotoRequest();
  }, [crop?._id]);

  // =====================================================
  // AUTOMATICALLY CHECK EVERY 5 SECONDS
  // =====================================================

  useEffect(() => {
    if (!crop?._id) {
      return;
    }

    const interval = setInterval(() => {
      fetchBuyerPhotoRequest();
    }, 5000);

    return () => {
      clearInterval(interval);
    };
  }, [crop?._id]);

  // =====================================================
  // NO CROP SELECTED
  // =====================================================

  if (!crop) {
    return (
      <div className="buy-page">
        <nav className="navbar">
          <Link
            to="/"
            className="logo"
          >
            <span>🌱</span>
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

            <Link to="/sell">
              Sell Crop
            </Link>

            <Link to="/login">
              🔐 Login
            </Link>
          </div>
        </nav>

        <div className="empty-buy">
          <div>🌱</div>

          <h2>
            No Crop Selected
          </h2>

          <p>
            Please select a crop from
            the crops page.
          </p>

          <Link
            to="/crops"
            className="primary-btn"
          >
            Browse Crops
          </Link>
        </div>
      </div>
    );
  }

  // =====================================================
  // PRICE
  // =====================================================

  const pricePerKg =
    Number(
      String(crop.price || "")
        .replace(/[^\d.]/g, "")
    ) || 0;

  const totalPrice =
    pricePerKg * quantity;

  // =====================================================
  // AVAILABLE QUANTITY
  // =====================================================

  const availableQuantity =
    parseInt(
      String(
        crop.quantity || ""
      ).replace(/[^\d]/g, "")
    ) || 999999;

  // =====================================================
  // INCREASE QUANTITY
  // =====================================================

  const increaseQuantity = () => {
    if (
      loading ||
      photoRequestLoading
    ) {
      return;
    }

    if (
      quantity >=
      availableQuantity
    ) {
      alert(
        `Only ${availableQuantity} Kg is available.`
      );

      return;
    }

    setQuantity(
      (previous) =>
        previous + 1
    );
  };

  // =====================================================
  // DECREASE QUANTITY
  // =====================================================

  const decreaseQuantity = () => {
    if (
      loading ||
      photoRequestLoading
    ) {
      return;
    }

    setQuantity(
      (previous) =>
        Math.max(
          1,
          previous - 1
        )
    );
  };

  // =====================================================
  // REQUEST FRESH CROP PHOTO
  // =====================================================

  const handlePhotoRequest = async () => {
    if (photoRequestLoading) {
      return;
    }

    const savedUser =
      localStorage.getItem(
        "cropMarketLoggedInUser"
      ) ||
      localStorage.getItem(
        "user"
      );

    if (!savedUser) {
      alert(
        "Please login first to request a crop photo."
      );

      navigate("/login");
      return;
    }

    let loggedInUser;

    try {
      loggedInUser =
        JSON.parse(
          savedUser
        );
    } catch (error) {
      console.error(
        "Invalid login data:",
        error
      );

      localStorage.removeItem(
        "cropMarketLoggedInUser"
      );

      localStorage.removeItem(
        "user"
      );

      alert(
        "Your login session is invalid. Please login again."
      );

      navigate("/login");
      return;
    }

    if (
      !loggedInUser ||
      !loggedInUser.email
    ) {
      alert(
        "User email not found. Please login again."
      );

      navigate("/login");
      return;
    }

    if (!crop._id) {
      alert(
        "Crop ID is missing. Please refresh the crops page and try again."
      );

      return;
    }

    const farmerEmail =
      crop.farmerEmail ||
      crop.farmer_email ||
      crop.ownerEmail ||
      "";

    if (!farmerEmail) {
      alert(
        "Farmer email is not available for this crop."
      );

      return;
    }

    const confirmRequest =
      window.confirm(
        `Request a fresh photo of ${crop.name} from the farmer?`
      );

    if (!confirmRequest) {
      return;
    }

    try {
      setPhotoRequestLoading(
        true
      );

      setPhotoRequestMessage(
        ""
      );

      const requestData = {
        buyerEmail:
          loggedInUser.email
            .trim()
            .toLowerCase(),

        farmerEmail:
          farmerEmail
            .trim()
            .toLowerCase(),

        cropId:
          crop._id,

        cropName:
          crop.name,

        message:
          `Please upload a fresh photo of ${crop.name}.`,
      };

      console.log(
        "Sending crop photo request:",
        requestData
      );

      const response =
        await fetch(
          `${API_BASE_URL}/api/crop-photo-requests`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify(
                requestData
              ),
          }
        );

      const contentType =
        response.headers.get(
          "content-type"
        ) || "";

      let data;

      if (
        contentType.includes(
          "application/json"
        )
      ) {
        data =
          await response.json();
      } else {
        const text =
          await response.text();

        console.error(
          "Backend returned non-JSON response:",
          text
        );

        throw new Error(
          "Backend returned an invalid response."
        );
      }

      console.log(
        "Photo request response:",
        data
      );

      if (!response.ok) {
        setPhotoRequestMessage(
          data.message ||
            "Unable to send photo request."
        );

        alert(
          data.message ||
            "Unable to send photo request."
        );

        return;
      }

      setPhotoRequestSent(
        true
      );

      setPhotoRequestMessage(
        "Photo request sent successfully! 📸"
      );

      // Immediately check request
      await fetchBuyerPhotoRequest();

      alert(
        "Photo request sent successfully! 📸\n\nThe farmer can now upload a fresh crop photo."
      );
    } catch (error) {
      console.error(
        "Photo request error:",
        error
      );

      setPhotoRequestMessage(
        "Cannot connect to CropMarket backend."
      );

      alert(
        "Cannot connect to CropMarket backend.\n\nMake sure the backend is running on port 5000."
      );
    } finally {
      setPhotoRequestLoading(
        false
      );
    }
  };

  // =====================================================
  // PLACE ORDER
  // =====================================================

  const handleOrder = async () => {
    if (loading) {
      return;
    }

    if (quantity < 1) {
      alert(
        "Please select at least 1 Kg."
      );

      return;
    }

    if (
      quantity >
      availableQuantity
    ) {
      alert(
        `Only ${availableQuantity} Kg is available.`
      );

      return;
    }

    if (pricePerKg <= 0) {
      alert(
        "Invalid crop price."
      );

      return;
    }

    if (!paymentMethod) {
      alert(
        "Please select a payment mode."
      );

      return;
    }

    const savedUser =
      localStorage.getItem(
        "cropMarketLoggedInUser"
      );

    if (!savedUser) {
      alert(
        "Please login first to place an order."
      );

      navigate("/login");
      return;
    }

    let loggedInUser;

    try {
      loggedInUser =
        JSON.parse(
          savedUser
        );
    } catch (error) {
      console.error(
        "Invalid login data:",
        error
      );

      localStorage.removeItem(
        "cropMarketLoggedInUser"
      );

      alert(
        "Your login session is invalid. Please login again."
      );

      navigate("/login");
      return;
    }

    if (
      !loggedInUser ||
      !loggedInUser.email
    ) {
      alert(
        "User email not found. Please login again."
      );

      navigate("/login");
      return;
    }

    const paymentConfirmed =
      window.confirm(
        `Demo Payment\n\n` +
        `Payment Mode: ${paymentMethod}\n` +
        `Crop: ${crop.name}\n` +
        `Quantity: ${quantity} Kg\n` +
        `Total Amount: ₹${totalPrice}\n\n` +
        `This is a DEMO payment. No real money will be charged.\n\n` +
        `Click OK to simulate successful payment.`
      );

    if (!paymentConfirmed) {
      return;
    }

    const orderData = {
      buyerEmail:
        loggedInUser.email
          .trim()
          .toLowerCase(),

      cropName:
        crop.name,

      cropIcon:
        crop.icon ||
        "🌾",

      pricePerKg:
        pricePerKg,

      quantity:
        quantity,

      totalPrice:
        totalPrice,

      farmer:
        crop.farmer ||
        "Local Farmer",

      location:
        crop.location ||
        "Unknown",

      paymentMethod:
        paymentMethod,

      paymentStatus:
        paymentMethod ===
        "Cash on Delivery"
          ? "Pending"
          : "Paid",

      paymentType:
        "Demo Payment",
    };

    try {
      setLoading(true);

      const response =
        await fetch(
          `${API_BASE_URL}/api/orders`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify(
                orderData
              ),
          }
        );

      const contentType =
        response.headers.get(
          "content-type"
        ) || "";

      let data;

      if (
        contentType.includes(
          "application/json"
        )
      ) {
        data =
          await response.json();
      } else {
        const text =
          await response.text();

        console.error(
          "Backend returned non-JSON response:",
          text
        );

        throw new Error(
          "Backend returned an invalid response."
        );
      }

      if (!response.ok) {
        alert(
          data.message ||
            "Failed to place order. Please try again."
        );

        return;
      }

      console.log(
        "Order created successfully:",
        data.order
      );

      setOrderPlaced(
        true
      );
    } catch (error) {
      console.error(
        "ORDER CONNECTION ERROR:",
        error
      );

      alert(
        "Cannot connect to CropMarket backend.\n\n" +
        "Make sure the backend is running:\n\n" +
        "cd crop-marketplace-new\n" +
        "cd backend\n" +
        "node server.js"
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="buy-page">

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

          <Link to="/sell">
            Sell Crop
          </Link>

          <a href="/#about">
            About
          </a>

          <Link to="/orders">
            📦 My Orders
          </Link>

          <Link to="/login">
            🔐 Login
          </Link>

        </div>
      </nav>

      {/* =================================================
          BUY SECTION
      ================================================= */}

      <section className="buy-section">

        {/* =================================================
            BUY CARD
        ================================================= */}

        <div className="buy-card">

          <div className="buy-crop-icon">
            {crop.icon || "🌾"}
          </div>

          <div className="buy-status">
            ● Fresh Stock
          </div>

          <h1>
            Buy {crop.name}
          </h1>

          <div className="buy-price">
            {crop.price}
          </div>

          <div className="buy-info">

            <p>
              👨‍🌾{" "}
              <strong>
                Farmer:
              </strong>{" "}
              {crop.farmer ||
                "Local Farmer"}
            </p>

            <p>
              📍{" "}
              <strong>
                Location:
              </strong>{" "}
              {crop.location ||
                "Unknown"}
            </p>

            {crop.quantity && (
              <p>
                📦{" "}
                <strong>
                  Available:
                </strong>{" "}
                {crop.quantity}
              </p>
            )}

          </div>

          {/* =================================================
              PHOTO REQUEST + FARMER PHOTO
          ================================================= */}

          <div
            className="photo-request-box"
            style={{
              marginTop: "20px",
              padding: "18px",
              borderRadius: "15px",
              border:
                "1px solid #dcebdd",
              background:
                "#f5fbf6",
            }}
          >

            <h3
              style={{
                marginTop: "0",
                marginBottom: "8px",
              }}
            >
              📸 Want to see the crop?
            </h3>

            <p
              style={{
                marginTop: "0",
                marginBottom: "15px",
                fontSize: "14px",
                color: "#5b7165",
              }}
            >
              Request a fresh photo directly
              from the farmer before placing
              your order.
            </p>

            <button
              type="button"
              onClick={
                handlePhotoRequest
              }
              disabled={
                photoRequestLoading ||
                loading
              }
              style={{
                width: "100%",
                padding: "13px 16px",
                border: "none",
                borderRadius: "10px",
                background:
                  farmerPhoto
                    ? "#087a3c"
                    : "#1fa64a",
                color: "#ffffff",
                fontWeight: "700",
                fontSize: "15px",
                cursor:
                  photoRequestLoading ||
                  loading
                    ? "not-allowed"
                    : "pointer",
                opacity:
                  photoRequestLoading
                    ? 0.8
                    : 1,
              }}
            >

              {photoRequestLoading
                ? "⏳ Sending Request..."
                : farmerPhoto
                ? "📸 Farmer Photo Received"
                : photoRequestSent
                ? "🔄 Waiting for Farmer Photo..."
                : "📸 Request Fresh Crop Photo"}

            </button>

            {photoRequestMessage && (
              <p
                style={{
                  marginBottom: "0",
                  marginTop: "12px",
                  fontSize: "13px",
                  color: "#087a3c",
                  fontWeight: "600",
                  textAlign: "center",
                }}
              >
                {photoRequestMessage}
              </p>
            )}

            {/* =================================================
                FARMER PHOTO
            ================================================= */}

            {photoLoading &&
              !farmerPhoto && (
                <div
                  style={{
                    marginTop: "18px",
                    padding: "15px",
                    textAlign: "center",
                    borderRadius: "10px",
                    background: "#ffffff",
                  }}
                >
                  ⏳ Checking for farmer photo...
                </div>
              )}

            {farmerPhoto && (
              <div
                style={{
                  marginTop: "20px",
                  padding: "15px",
                  background: "#ffffff",
                  borderRadius: "12px",
                  border:
                    "1px solid #dcebdd",
                }}
              >

                <h3
                  style={{
                    marginTop: "0",
                    marginBottom: "12px",
                    color: "#087a3c",
                    textAlign: "center",
                  }}
                >
                  📸 Fresh Photo From Farmer
                </h3>

                <img
                  src={farmerPhoto}
                  alt={`Fresh ${crop.name} from farmer`}
                  style={{
                    width: "100%",
                    maxHeight: "450px",
                    objectFit: "contain",
                    borderRadius: "10px",
                    display: "block",
                    background: "#f5f5f5",
                  }}
                  onLoad={() => {
                    console.log(
                      "Farmer photo loaded successfully:",
                      farmerPhoto
                    );
                  }}
                  onError={(event) => {
                    console.error(
                      "Farmer photo failed to load:",
                      farmerPhoto
                    );

                    event.currentTarget.style.display =
                      "none";
                  }}
                />

                <p
                  style={{
                    marginBottom: "0",
                    marginTop: "12px",
                    textAlign: "center",
                    color: "#087a3c",
                    fontWeight: "600",
                    fontSize: "13px",
                  }}
                >
                  ✅ Fresh crop photo uploaded by
                  the farmer.
                </p>

              </div>
            )}

            {!farmerPhoto &&
              photoRequestSent &&
              !photoLoading && (
                <div
                  style={{
                    marginTop: "15px",
                    padding: "14px",
                    borderRadius: "10px",
                    background: "#fff8e6",
                    color: "#9a6700",
                    textAlign: "center",
                    fontSize: "14px",
                    fontWeight: "600",
                  }}
                >
                  ⏳ Waiting for the farmer
                  to upload the fresh photo...
                  <br />
                  <small>
                    This page checks automatically.
                  </small>
                </div>
              )}

          </div>

          {/* =================================================
              QUANTITY
          ================================================= */}

          <div className="quantity-box">

            <label>
              Select Quantity (Kg)
            </label>

            <div className="quantity-control">

              <button
                type="button"
                onClick={
                  decreaseQuantity
                }
                disabled={
                  loading ||
                  photoRequestLoading
                }
              >
                −
              </button>

              <span>
                {quantity} Kg
              </span>

              <button
                type="button"
                onClick={
                  increaseQuantity
                }
                disabled={
                  loading ||
                  photoRequestLoading
                }
              >
                +
              </button>

            </div>

          </div>

          {/* =================================================
              TOTAL
          ================================================= */}

          <div className="total-box">

            <span>
              Total Price
            </span>

            <strong>
              ₹{totalPrice}
            </strong>

          </div>

          {/* =================================================
              PAYMENT MODE
          ================================================= */}

          <div
            className="payment-box"
            style={{
              marginTop: "25px",
              padding: "20px",
              borderRadius: "15px",
              border:
                "1px solid #ddd",
              background:
                "#fafafa",
            }}
          >

            <h3
              style={{
                marginBottom: "15px",
              }}
            >
              💳 Select Payment Mode
            </h3>

            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "12px",
                marginBottom: "8px",
                border:
                  "1px solid #ddd",
                borderRadius: "10px",
                cursor: "pointer",
                background:
                  paymentMethod ===
                  "Cash on Delivery"
                    ? "#eef9ee"
                    : "#fff",
              }}
            >
              <input
                type="radio"
                name="paymentMethod"
                value="Cash on Delivery"
                checked={
                  paymentMethod ===
                  "Cash on Delivery"
                }
                onChange={(event) =>
                  setPaymentMethod(
                    event.target.value
                  )
                }
                disabled={loading}
              />

              <span>
                💵 Cash on Delivery
              </span>
            </label>

            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "12px",
                marginBottom: "8px",
                border:
                  "1px solid #ddd",
                borderRadius: "10px",
                cursor: "pointer",
                background:
                  paymentMethod === "UPI"
                    ? "#eef9ee"
                    : "#fff",
              }}
            >
              <input
                type="radio"
                name="paymentMethod"
                value="UPI"
                checked={
                  paymentMethod === "UPI"
                }
                onChange={(event) =>
                  setPaymentMethod(
                    event.target.value
                  )
                }
                disabled={loading}
              />

              <span>
                📱 UPI
              </span>
            </label>

            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "12px",
                marginBottom: "8px",
                border:
                  "1px solid #ddd",
                borderRadius: "10px",
                cursor: "pointer",
                background:
                  paymentMethod === "Card"
                    ? "#eef9ee"
                    : "#fff",
              }}
            >
              <input
                type="radio"
                name="paymentMethod"
                value="Card"
                checked={
                  paymentMethod === "Card"
                }
                onChange={(event) =>
                  setPaymentMethod(
                    event.target.value
                  )
                }
                disabled={loading}
              />

              <span>
                💳 Card
              </span>
            </label>

            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "12px",
                border:
                  "1px solid #ddd",
                borderRadius: "10px",
                cursor: "pointer",
                background:
                  paymentMethod ===
                  "Net Banking"
                    ? "#eef9ee"
                    : "#fff",
              }}
            >
              <input
                type="radio"
                name="paymentMethod"
                value="Net Banking"
                checked={
                  paymentMethod ===
                  "Net Banking"
                }
                onChange={(event) =>
                  setPaymentMethod(
                    event.target.value
                  )
                }
                disabled={loading}
              />

              <span>
                🏦 Net Banking
              </span>
            </label>

            <p
              style={{
                marginTop: "15px",
                fontSize: "13px",
                color: "#777",
              }}
            >
              ℹ️ This is a demo payment system.
              No real money will be charged.
            </p>

          </div>

          {/* =================================================
              PLACE ORDER
          ================================================= */}

          <button
            type="button"
            className="place-order-btn"
            onClick={
              handleOrder
            }
            disabled={loading}
          >
            {loading
              ? "⏳ Processing Demo Payment..."
              : "💳 Pay & Place Order"}
          </button>

          {/* =================================================
              BACK
          ================================================= */}

          <button
            type="button"
            className="back-crops-btn"
            onClick={() =>
              navigate("/crops")
            }
            disabled={loading}
          >
            ← Back to Crops
          </button>

        </div>

        {/* =================================================
            RIGHT INFORMATION
        ================================================= */}

        <div className="buy-side">

          <div className="buy-farmer">
            👨‍🌾
          </div>

          <h2>
            Direct From Farmer
          </h2>

          <p>
            Buy fresh crops directly from
            trusted local farmers through
            CropMarket.
          </p>

          <div className="buy-benefits">

            <div>
              🌱
              <span>
                Fresh Farm Produce
              </span>
            </div>

            <div>
              💰
              <span>
                Transparent Pricing
              </span>
            </div>

            <div>
              🤝
              <span>
                Direct Farmer Connection
              </span>
            </div>

            <div>
              📸
              <span>
                Request Fresh Crop Photo
              </span>
            </div>

            <div>
              💳
              <span>
                Multiple Demo Payment Modes
              </span>
            </div>

          </div>

        </div>

      </section>

      {/* =====================================================
          ORDER SUCCESS
      ===================================================== */}

      {orderPlaced && (
        <div className="order-overlay">

          <div className="order-success">

            <div className="success-icon">
              ✓
            </div>

            <h2>
              Payment Successful!
            </h2>

            <p>
              Your demo payment was
              processed successfully.
            </p>

            <p>
              Order for{" "}
              <strong>
                {quantity} Kg {crop.name}
              </strong>{" "}
              has been placed.
            </p>

            <p>
              Total Amount:{" "}
              <strong>
                ₹{totalPrice}
              </strong>
            </p>

            <p>
              💳 Payment Mode:{" "}
              <strong>
                {paymentMethod}
              </strong>
            </p>

            <p>
              📌 Payment Status:{" "}
              <strong>
                {paymentMethod ===
                "Cash on Delivery"
                  ? "Pending"
                  : "Paid"}
              </strong>
            </p>

            <p>
              👨‍🌾 Farmer:{" "}
              <strong>
                {crop.farmer ||
                  "Local Farmer"}
              </strong>
            </p>

            <button
              type="button"
              onClick={() =>
                navigate("/orders")
              }
            >
              📦 View My Orders
            </button>

            <button
              type="button"
              onClick={() =>
                navigate("/crops")
              }
            >
              Continue Shopping
            </button>

          </div>

        </div>
      )}

    </div>
  );
}

export default BuyCrop;