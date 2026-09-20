import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./App.css";

function MyOrders() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [reviewRatings, setReviewRatings] = useState({});
const [reviewTexts, setReviewTexts] = useState({});
const [reviewSubmitting, setReviewSubmitting] = useState({});
  

  // ==========================================
  // GET LOGGED-IN USER
  // ==========================================

  const getLoggedInUser = () => {
    try {
      const userData =
        localStorage.getItem("cropMarketUser") ||
        localStorage.getItem("user");

      if (!userData) {
        return null;
      }

      const user = JSON.parse(userData);

      if (!user || !user.email) {
        return null;
      }

      return user;
    } catch (err) {
      console.error("User data error:", err);
      return null;
    }
  };

  // ==========================================
  // FETCH ORDERS FROM MONGODB
  // ==========================================

  const fetchOrders = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const user = getLoggedInUser();

      if (!user) {
        setError("Please login first to view your orders.");
        return;
      }

      console.log("Fetching orders for:", user.email);

      const response = await fetch(
        `http://localhost:5000/api/orders/${encodeURIComponent(
          user.email
        )}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      console.log("Orders API response:", data);

      if (!response.ok) {
        throw new Error(
          data.message || `Server returned ${response.status}`
        );
      }

      setOrders(Array.isArray(data.orders) ? data.orders : []);
    } catch (err) {
      console.error("Fetch Orders Error:", err);

      setError(
        "Cannot connect to CropMarket backend. Please make sure the backend is running on port 5000."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
const submitReview = async (order) => {
  const orderId = order._id;

  const rating = reviewRatings[orderId] || 0;
  const review = reviewTexts[orderId] || "";

  if (!rating) {
    alert("Please select a star rating.");
    return;
  }

  setReviewSubmitting((prev) => ({
    ...prev,
    [orderId]: true,
  }));

  try {
    const user = getLoggedInUser();

    if (!user?.email) {
      alert("Please login first.");
      return;
    }

    const response = await fetch(
      "http://localhost:5000/api/reviews",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          buyerEmail: user.email,
          farmerEmail:
            order.farmerEmail ||
            order.farmerEmailAddress ||
            "",
          cropName:
            order.cropName || "Crop",
          orderId,
          rating,
          review,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Review submission failed."
      );
    }

    alert("Review submitted successfully! ⭐");

    setReviewRatings((prev) => ({
      ...prev,
      [orderId]: rating,
    }));

    setReviewTexts((prev) => ({
      ...prev,
      [orderId]: review,
    }));

  } catch (err) {
    console.error("Submit Review Error:", err);

    alert(
      err.message ||
        "Unable to submit review."
    );
  } finally {
    setReviewSubmitting((prev) => ({
      ...prev,
      [orderId]: false,
    }));
  }
};
  // ==========================================
  // LOAD ORDERS
  // ==========================================

  useEffect(() => {
    fetchOrders();
  }, []);

  // ==========================================
  // LOGOUT
  // ==========================================

  const handleLogout = () => {
    localStorage.removeItem("cropMarketUser");
    localStorage.removeItem("user");

    navigate("/login");
  };

  // ==========================================
  // PAYMENT MODE
  // ==========================================

  const getPaymentMode = (order) => {
    if (order.paymentMode) {
      return order.paymentMode;
    }

    if (order.paymentMethod) {
      return order.paymentMethod;
    }

    return "Not Available";
  };

  // ==========================================
  // PAYMENT STATUS
  // ==========================================

  const getPaymentStatus = (order) => {
    if (order.paymentStatus) {
      return order.paymentStatus;
    }

    return "Not Available";
  };

  // ==========================================
  // PAYMENT STATUS STYLE
  // ==========================================

  const getPaymentStatusStyle = (order) => {
    const status = getPaymentStatus(order);

    if (
      status === "Paid" ||
      status === "Demo Paid" ||
      status === "Completed"
    ) {
      return {
        color: "#16803c",
        background: "#e9f9ee",
        border: "1px solid #b8e8c7",
      };
    }

    if (
      status === "Pending" ||
      status === "Cash on Delivery"
    ) {
      return {
        color: "#a15c00",
        background: "#fff6df",
        border: "1px solid #f1d28a",
      };
    }

    return {
      color: "#666",
      background: "#f3f3f3",
      border: "1px solid #ddd",
    };
  };

  // ==========================================
  // DELIVERY STATUS STYLE
  // ==========================================

  const getDeliveryStatusStyle = (status) => {
    if (
      status === "Delivered" ||
      status === "Out for Delivery"
    ) {
      return {
        color: "#16803c",
        background: "#e9f9ee",
        border: "1px solid #b8e8c7",
      };
    }

    if (
      status === "Assigned" ||
      status === "Picked Up"
    ) {
      return {
        color: "#145da0",
        background: "#eef7ff",
        border: "1px solid #b9ddff",
      };
    }

    if (
      status === "Pending" ||
      status === "Not Assigned"
    ) {
      return {
        color: "#a15c00",
        background: "#fff6df",
        border: "1px solid #f1d28a",
      };
    }

    return {
      color: "#666",
      background: "#f3f3f3",
      border: "1px solid #ddd",
    };
  };

  // ==========================================
  // LOADING SCREEN
  // ==========================================

  if (loading) {
    return (
      <div className="orders-page">
        <nav className="navbar">
          <Link to="/" className="logo">
            <span>🌱</span>
            <strong>CropMarket</strong>
          </Link>
        </nav>

        <section className="orders-section">
          <div className="empty-orders">
            <div className="empty-orders-icon">
              ⏳
            </div>

            <h2>Loading Orders...</h2>

            <p>
              Fetching your orders from MongoDB.
            </p>
          </div>
        </section>
      </div>
    );
  }

  // ==========================================
  // ERROR SCREEN
  // ==========================================

  if (error) {
    return (
      <div className="orders-page">
        <nav className="navbar">
          <Link to="/" className="logo">
            <span>🌱</span>
            <strong>CropMarket</strong>
          </Link>

          <div className="nav-links">
            <Link to="/">Home</Link>

            <Link to="/crops">Crops</Link>

            <Link to="/sell">Sell Crop</Link>

            <Link to="/orders">
              📦 My Orders
            </Link>

            <Link to="/login">
              🔐 Login
            </Link>
          </div>
        </nav>

        <section className="orders-section">
          <div className="empty-orders">
            <div className="empty-orders-icon">
              ⚠️
            </div>

            <h2>Unable to Load Orders</h2>

            <p>{error}</p>

            <div
              style={{
                display: "flex",
                gap: "12px",
                justifyContent: "center",
                flexWrap: "wrap",
                marginTop: "20px",
              }}
            >
              <button
                className="primary-btn"
                onClick={() => fetchOrders(true)}
              >
                🔄 Try Again
              </button>

              <Link
                to="/login"
                className="primary-btn"
              >
                🔐 Go to Login
              </Link>
            </div>
          </div>
        </section>
      </div>
    );
  }

  // ==========================================
  // MAIN PAGE
  // ==========================================

  return (
    <div className="orders-page">

      {/* ======================================
          NAVBAR
      ====================================== */}

      <nav className="navbar">

        <Link to="/" className="logo">
          <span>🌱</span>
          <strong>CropMarket</strong>
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

          <Link to="/orders">
            📦 My Orders
          </Link>

          {/* LOGOUT BUTTON */}
          <button
            type="button"
            onClick={handleLogout}
            style={{
              border: "none",
              background: "#20a84f",
              color: "#ffffff",
              cursor: "pointer",
              fontSize: "16px",
              fontWeight: "700",
              padding: "14px 28px",
              borderRadius: "30px",
              minWidth: "130px",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              boxShadow:
                "0 8px 20px rgba(32, 168, 79, 0.20)",
            }}
          >
            🚪 Logout
          </button>

        </div>
      </nav>

      {/* ======================================
          HEADER
      ====================================== */}

      <section className="orders-header">

        <div className="badge">
          📦 ORDER MANAGEMENT
        </div>

        <h1>
          My <span>Orders</span>
        </h1>

        <p>
          View your recently purchased crops and
          order details.
        </p>

      </section>

      {/* ======================================
          ORDERS SECTION
      ====================================== */}

      <section className="orders-section">

        {/* REFRESH BUTTON */}

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginBottom: "25px",
          }}
        >
          <button
            type="button"
            onClick={() => fetchOrders(true)}
            disabled={refreshing}
            style={{
              border: "1px solid #20a84f",
              background: "#ffffff",
              color: "#16803c",
              padding: "10px 18px",
              borderRadius: "25px",
              cursor: refreshing
                ? "not-allowed"
                : "pointer",
              fontWeight: "700",
              opacity: refreshing ? 0.6 : 1,
            }}
          >
            {refreshing
              ? "⏳ Refreshing..."
              : "🔄 Refresh Orders"}
          </button>
        </div>

        {orders.length === 0 ? (

          /* ==================================
             NO ORDERS
          ================================== */

          <div className="empty-orders">

            <div className="empty-orders-icon">
              📦
            </div>

            <h2>
              No Orders Yet
            </h2>

            <p>
              You haven't placed any orders yet.
              Explore fresh crops from local
              farmers.
            </p>

            <Link
              to="/crops"
              className="primary-btn"
            >
              🌱 Browse Crops
            </Link>

          </div>

        ) : (

          /* ==================================
             ORDER GRID
          ================================== */

          <div className="orders-grid">

            {orders.map((order) => (

              <div
                className="order-card"
                key={
                  order._id ||
                  `${order.cropName}-${order.orderDate}`
                }
              >

                {/* CROP ICON */}

                <div className="order-crop-icon">
                  {order.cropIcon || "🌾"}
                </div>

                {/* ORDER STATUS */}

                <div className="order-status">
                  ● {order.status || "Placed"}
                </div>

                {/* CROP NAME */}

                <h2>
                  {order.cropName || "Crop"}
                </h2>

                {/* ==================================
                    ORDER DETAILS
                ================================== */}

                <div className="order-details">

                  <p>
                    👨‍🌾{" "}
                    <strong>
                      Farmer:
                    </strong>{" "}
                    {order.farmer || "N/A"}
                  </p>

                  <p>
                    📍{" "}
                    <strong>
                      Location:
                    </strong>{" "}
                    {order.location || "N/A"}
                  </p>

                  <p>
                    ⚖️{" "}
                    <strong>
                      Quantity:
                    </strong>{" "}
                    {order.quantity || 0} Kg
                  </p>

                  <p>
                    💰{" "}
                    <strong>
                      Price:
                    </strong>{" "}
                    ₹{order.pricePerKg || 0}/kg
                  </p>

                  <p>
                    📅{" "}
                    <strong>
                      Order Date:
                    </strong>{" "}

                    {order.orderDate
                      ? new Date(
                          order.orderDate
                        ).toLocaleDateString()
                      : "N/A"}
                  </p>

                </div>

                {/* ==================================
                    DELIVERY PARTNER DETAILS
                ================================== */}

                <div
                  className="delivery-details"
                  style={{
                    marginTop: "18px",
                    padding: "16px",
                    borderRadius: "12px",
                    border:
                      "1px solid #d8eadc",
                    background: "#f3fff5",
                  }}
                >

                  <h3
                    style={{
                      margin: "0 0 12px 0",
                      fontSize: "17px",
                    }}
                  >
                    🚚 Delivery Partner
                  </h3>

                  {/* DRIVER NAME */}

                  <p
                    style={{
                      margin: "7px 0",
                    }}
                  >
                    👤{" "}
                    <strong>
                      Driver Name:
                    </strong>{" "}

                    {order.deliveryBoyName ||
                      "Not Assigned"}
                  </p>

                  {/* DRIVER PHONE */}

                  <p
                    style={{
                      margin: "7px 0",
                    }}
                  >
                    📞{" "}
                    <strong>
                      Contact:
                    </strong>{" "}

                    {order.deliveryBoyPhone ? (
                      <a
                        href={`tel:${order.deliveryBoyPhone}`}
                        style={{
                          color: "#16803c",
                          fontWeight: "700",
                          textDecoration:
                            "none",
                        }}
                      >
                        {order.deliveryBoyPhone}
                      </a>
                    ) : (
                      "Not Assigned"
                    )}
                  </p>

                  {/* DRIVER LOCATION */}

                  <p
                    style={{
                      margin: "7px 0",
                    }}
                  >
                    📍{" "}
                    <strong>
                      Current Location:
                    </strong>{" "}

                    {order.deliveryBoyLocation ||
                      "Not Available"}
                  </p>

                  {/* VEHICLE TYPE */}

                  <p
                    style={{
                      margin: "7px 0",
                    }}
                  >
                    🚛{" "}
                    <strong>
                      Vehicle:
                    </strong>{" "}

                    {order.vehicleType ||
                      "Not Assigned"}
                  </p>

                  {/* VEHICLE NUMBER */}

                  <p
                    style={{
                      margin: "7px 0",
                    }}
                  >
                    🔢{" "}
                    <strong>
                      Vehicle Number:
                    </strong>{" "}

                    {order.vehicleNumber ||
                      "Not Assigned"}
                  </p>

                  {/* DELIVERY STATUS */}

                  <p
                    style={{
                      margin: "7px 0",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      flexWrap: "wrap",
                    }}
                  >
                    📦{" "}
                    <strong>
                      Delivery Status:
                    </strong>

                    <span
                      style={{
                        padding: "4px 10px",
                        borderRadius: "20px",
                        fontSize: "13px",
                        fontWeight: "600",
                        ...getDeliveryStatusStyle(
                          order.deliveryStatus ||
                            "Not Assigned"
                        ),
                      }}
                    >
                      {order.deliveryStatus ||
                        "Not Assigned"}
                    </span>
                  </p>

                </div>

                {/* ==================================
                    PAYMENT DETAILS
                ================================== */}

                <div
                  className="payment-details"
                  style={{
                    marginTop: "18px",
                    padding: "16px",
                    borderRadius: "12px",
                    border:
                      "1px solid #e2e2e2",
                    background: "#fafafa",
                  }}
                >

                  <h3
                    style={{
                      margin: "0 0 12px 0",
                      fontSize: "17px",
                    }}
                  >
                    💳 Payment Details
                  </h3>

                  {/* PAYMENT MODE */}

                  <p
                    style={{
                      margin: "7px 0",
                    }}
                  >
                    💳{" "}
                    <strong>
                      Payment Mode:
                    </strong>{" "}

                    {getPaymentMode(order)}
                  </p>

                  {/* PAYMENT STATUS */}

                  <p
                    style={{
                      margin: "7px 0",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      flexWrap: "wrap",
                    }}
                  >
                    💰{" "}
                    <strong>
                      Payment Status:
                    </strong>

                    <span
                      style={{
                        padding: "4px 10px",
                        borderRadius: "20px",
                        fontSize: "13px",
                        fontWeight: "600",
                        ...getPaymentStatusStyle(
                          order
                        ),
                      }}
                    >
                      {getPaymentStatus(order)}
                    </span>
                  </p>

                  {/* PAYMENT TYPE */}

                  <p
                    style={{
                      margin: "7px 0",
                    }}
                  >
                    🧪{" "}
                    <strong>
                      Payment Type:
                    </strong>{" "}

                    {order.paymentType ||
                      "Demo Payment"}
                  </p>

                  {/* PAYMENT ID IF AVAILABLE */}

                  {order.paymentId && (
                    <p
                      style={{
                        margin: "7px 0",
                        wordBreak:
                          "break-word",
                      }}
                    >
                      🆔{" "}
                      <strong>
                        Payment ID:
                      </strong>{" "}

                      {order.paymentId}
                    </p>
                  )}

                  {/* PAYMENT DATE IF AVAILABLE */}

                  {order.paymentDate && (
                    <p
                      style={{
                        margin: "7px 0",
                      }}
                    >
                      📅{" "}
                      <strong>
                        Payment Date:
                      </strong>{" "}

                      {new Date(
                        order.paymentDate
                      ).toLocaleString()}
                    </p>
                  )}

                  {/* DEMO MESSAGE */}

                  <p
                    style={{
                      margin:
                        "12px 0 0 0",
                      fontSize: "12px",
                      color: "#777",
                    }}
                  >
                    ℹ️ This order uses the
                    CropMarket demo payment
                    system. No real money is
                    charged.
                  </p>

                </div>
                                {/* ==================================
                    REVIEW & RATING
                ================================== */}

                {(
                  order.status === "Delivered" ||
                  order.deliveryStatus === "Delivered"
                ) && (
                  <div
                    style={{
                      marginTop: "18px",
                      padding: "18px",
                      borderRadius: "16px",
                      border: "1px solid #d8eadc",
                      background: "#f8fff9",
                    }}
                  >
                    <h3
                      style={{
                        margin: "0 0 12px 0",
                        fontSize: "18px",
                        color: "#14532d",
                      }}
                    >
                      ⭐ Rate Your Purchase
                    </h3>

                    <div
                      style={{
                        display: "flex",
                        gap: "6px",
                        marginBottom: "14px",
                      }}
                    >
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                           onClick={() =>
      setReviewRatings((prev) => ({
        ...prev,
        [order._id]: star,
      }))
    }
    style={{
      border: "none",
      background: "transparent",
      fontSize: "30px",
      cursor: "pointer",
      padding: "2px",
    }}
  >
    {star <= (reviewRatings[order._id] || 0)
      ? "⭐"
      : "☆"}
                        </button>
                      ))}
                    </div>

                    <textarea
                      placeholder="Write your review..."
                      rows="4"
                      value={reviewTexts[order._id] || ""}
onChange={(e) =>
  setReviewTexts((prev) => ({
    ...prev,
    [order._id]: e.target.value,
  }))
}
                      style={{
                        width: "100%",
                        boxSizing: "border-box",
                        padding: "12px",
                        borderRadius: "12px",
                        border: "1px solid #cfe1d2",
                        resize: "vertical",
                        fontFamily: "inherit",
                        outline: "none",
                      }}
                    />

                    <button
                      type="button"
                      onClick={() => submitReview(order)}
disabled={reviewSubmitting[order._id]}
                      style={{
                        marginTop: "12px",
                        width: "100%",
                        padding: "12px",
                        border: "none",
                        borderRadius: "12px",
                        background: "#159447",
                        color: "#fff",
                        fontWeight: "800",
                        cursor: "pointer",
                      }}
                    >
                    {reviewSubmitting[order._id]
  ? "⏳ Submitting..."
  : "⭐ Submit Review"}
                    </button>
                  </div>
                )}


                {/* ==================================
                    TOTAL
                ================================== */}

                <div className="order-total">

                  <span>
                    Total Amount
                  </span>

                  <strong>
                    ₹{order.totalPrice || 0}
                  </strong>

                </div>

                {/* ==================================
                    ORDER ID
                ================================== */}

                <div className="order-id">

                  Order ID: #

                  {order._id || "N/A"}

                </div>

              </div>

            ))}

          </div>

        )}

      </section>

      {/* ======================================
          FOOTER
      ====================================== */}

      <footer>

        <div className="footer-logo">
          🌱 CropMarket
        </div>

        <p>
          Smart Agriculture Marketplace
        </p>

        <p>
          © 2026 CropMarket | All Rights Reserved
        </p>

      </footer>

    </div>
  );
}

export default MyOrders;