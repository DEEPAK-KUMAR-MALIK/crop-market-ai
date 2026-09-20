import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./App.css";

function Dashboard() {
  const navigate = useNavigate();

  // ==========================================
  // USER
  // ==========================================

  const [user, setUser] = useState(null);

  // ==========================================
  // MONGODB DATA
  // ==========================================

  const [orders, setOrders] = useState([]);
  const [listings, setListings] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [notifications, setNotifications] = useState([]);
const [unreadCount, setUnreadCount] = useState(0);
const [showNotifications, setShowNotifications] = useState(false);


  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==========================================
  // GET LOGGED-IN USER
  // ==========================================

  const getLoggedInUser = () => {
    try {
      const loggedInUser =
        JSON.parse(
          localStorage.getItem("cropMarketLoggedInUser")
        ) || null;

      const oldUser =
        JSON.parse(
          localStorage.getItem("cropMarketUser")
        ) || null;

      const normalUser =
        JSON.parse(
          localStorage.getItem("user")
        ) || null;

      return (
  oldUser ||
  loggedInUser ||
  normalUser ||
  null
);
    } catch (error) {
      console.error(
        "User data error:",
        error
      );

      return null;
    }
  };

  // ==========================================
  // FETCH FARMER RATINGS & REVIEWS
  // ==========================================

  const fetchFarmerReviews = async (
    farmerEmail
  ) => {
    try {
      const cleanEmail = String(
        farmerEmail || ""
      )
        .trim()
        .toLowerCase();

      if (!cleanEmail) {
        setReviews([]);
        return;
      }

      console.log(
        "Fetching farmer reviews:",
        cleanEmail
      );

      const response = await fetch(
        `http://localhost:5000/api/reviews/farmer/${encodeURIComponent(
          cleanEmail
        )}`,
        {
          method: "GET",
          headers: {
            "Content-Type":
              "application/json",
          },
        }
      );

      const data = await response.json();

      console.log(
        "Farmer Reviews API:",
        data
      );

      if (!response.ok) {
        console.warn(
          "Farmer Reviews API error:",
          response.status
        );

        setReviews([]);
        return;
      }

      setReviews(
        Array.isArray(data.reviews)
          ? data.reviews
          : []
      );
    } catch (error) {
      console.error(
        "Fetch Farmer Reviews Error:",
        error
      );

      setReviews([]);
    }
  };

  // ==========================================
  // FETCH DASHBOARD DATA FROM MONGODB
  // ==========================================

  useEffect(() => {
    const fetchDashboardData =
      async () => {
        try {
          setLoading(true);
          setError("");

          const currentUser =
            getLoggedInUser();

          if (
            !currentUser ||
            !currentUser.email
          ) {
            setUser(currentUser);
            setLoading(false);
            return;
          }

          setUser(currentUser);

          console.log(
            "Dashboard user:",
            currentUser.email
          );

          // ======================================
// FETCH NOTIFICATIONS
// ======================================

try {
  const notificationResponse = await fetch(
    `http://localhost:5000/api/notifications/${encodeURIComponent(
      currentUser.email
    )}`
  );

  if (notificationResponse.ok) {
    const notificationData =
      await notificationResponse.json();

    setNotifications(
      Array.isArray(notificationData.notifications)
        ? notificationData.notifications
        : []
    );

    setUnreadCount(
      Number(notificationData.unreadCount || 0)
    );

    console.log(
      "Notifications:",
      notificationData
    );
  }
} catch (notificationError) {
  console.error(
    "Notification Fetch Error:",
    notificationError
  );
}

          // ======================================
          // FETCH ORDERS + CROPS
          // ======================================

          const [
            ordersResponse,
            cropsResponse,
          ] = await Promise.all([
            fetch(
              `http://localhost:5000/api/orders/${encodeURIComponent(
                currentUser.email
              )}`,
              {
                method: "GET",
                headers: {
                  "Content-Type":
                    "application/json",
                },
              }
            ),

            fetch(
              "http://localhost:5000/api/crops",
              {
                method: "GET",
                headers: {
                  "Content-Type":
                    "application/json",
                },
              }
            ),
          ]);

          // ======================================
          // CHECK ORDERS RESPONSE
          // ======================================

          if (!ordersResponse.ok) {
            throw new Error(
              `Orders API error: ${ordersResponse.status}`
            );
          }

          // ======================================
          // CHECK CROPS RESPONSE
          // ======================================

          if (!cropsResponse.ok) {
            throw new Error(
              `Crops API error: ${cropsResponse.status}`
            );
          }

          // ======================================
          // CONVERT TO JSON
          // ======================================

          const ordersData =
            await ordersResponse.json();

          const cropsData =
            await cropsResponse.json();

          console.log(
            "MongoDB Orders:",
            ordersData
          );

          console.log(
            "MongoDB Crops:",
            cropsData
          );

          // ======================================
          // SET ORDERS
          // ======================================

          setOrders(
            Array.isArray(
              ordersData.orders
            )
              ? ordersData.orders
              : []
          );

          // ======================================
          // ALL CROPS
          // ======================================

          const allCrops =
            Array.isArray(
              cropsData.crops
            )
              ? cropsData.crops
              : [];

          // ======================================
          // MY LISTINGS
          // ======================================

          if (
            currentUser.role ===
              "farmer" ||
            currentUser.role ===
              "Farmer"
          ) {
            const farmerEmail =
              String(
                currentUser.email || ""
              )
                .trim()
                .toLowerCase();

            const farmerName =
              String(
                currentUser.name || ""
              )
                .trim()
                .toLowerCase();

            // ====================================
            // EMAIL OR NAME MATCH
            // ====================================

            const myCrops =
              allCrops.filter(
                (crop) => {
                  const cropEmail =
                    String(
                      crop.farmerEmail ||
                        ""
                    )
                      .trim()
                      .toLowerCase();

                  const cropFarmer =
                    String(
                      crop.farmer || ""
                    )
                      .trim()
                      .toLowerCase();

                  const emailMatch =
                    farmerEmail &&
                    cropEmail &&
                    cropEmail ===
                      farmerEmail;

                  const nameMatch =
                    farmerName &&
                    cropFarmer &&
                    cropFarmer ===
                      farmerName;

                  return (
                    emailMatch ||
                    nameMatch
                  );
                }
              );

            console.log(
              "Logged-in Farmer Email:",
              farmerEmail
            );

            console.log(
              "Logged-in Farmer Name:",
              farmerName
            );

            console.log(
              "MY MATCHED LISTINGS:",
              myCrops
            );

            setListings(myCrops);

            // ====================================
            // FETCH FARMER REVIEWS
            // ====================================

            fetchFarmerReviews(
              farmerEmail
            );
          } else {
            setListings([]);
            setReviews([]);
          }
        } catch (error) {
          console.error(
            "Dashboard API Error:",
            error
          );

          setError(
            "Cannot connect to CropMarket backend. Make sure backend is running on port 5000."
          );
        } finally {
          setLoading(false);
        }
      };

    fetchDashboardData();
  }, []);

  // ==========================================
  // LOGOUT
  // ==========================================

  const handleLogout = () => {
    localStorage.removeItem(
      "cropMarketLoggedIn"
    );

    localStorage.removeItem(
      "cropMarketLoggedInUser"
    );

    localStorage.removeItem(
      "cropMarketUser"
    );

    localStorage.removeItem("user");

    navigate("/login");
  };

  // ==========================================
  // USER INFORMATION
  // ==========================================

  const userName =
    user?.name || "CropMarket User";

  const userEmail =
    user?.email || "Not available";

  const userPhone =
    user?.phone || "Not available";

  const userRole =
    user?.role || "buyer";

  const isFarmer =
    userRole === "farmer" ||
    userRole === "Farmer";

  // ==========================================
  // RATING CALCULATIONS
  // ==========================================

  const totalReviews =
    reviews.length;

  const averageRating =
    totalReviews > 0
      ? reviews.reduce(
          (sum, item) =>
            sum +
            Number(item.rating || 0),
          0
        ) / totalReviews
      : 0;

  const roundedAverageRating =
    Math.round(
      averageRating * 10
    ) / 10;

  // ==========================================
  // RATING DISTRIBUTION
  // ==========================================

  const ratingDistribution =
    [5, 4, 3, 2, 1].map(
      (star) => {
        const count =
          reviews.filter(
            (item) =>
              Number(item.rating) ===
              star
          ).length;

        const percentage =
          totalReviews > 0
            ? (count /
                totalReviews) *
              100
            : 0;

        return {
          star,
          count,
          percentage,
        };
      }
    );

  // ==========================================
  // RENDER STARS
  // ==========================================

  const renderStars = (
    rating,
    size = "18px"
  ) => {
    const numericRating =
      Number(rating) || 0;

    return (
      <span
        style={{
          fontSize: size,
          letterSpacing: "2px",
          whiteSpace: "nowrap",
        }}
      >
        {[1, 2, 3, 4, 5].map(
          (star) => (
            <span key={star}>
              {star <=
              Math.round(
                numericRating
              )
                ? "⭐"
                : "☆"}
            </span>
          )
        )}
      </span>
    );
  };

  // ==========================================
  // LOADING SCREEN
  // ==========================================

  if (loading) {
    return (
      <div className="dashboard-page">
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
        </nav>

        <section className="dashboard-header">
          <div
            style={{
              textAlign: "center",
              width: "100%",
              padding:
                "80px 20px",
            }}
          >
            <div
              style={{
                fontSize: "50px",
                marginBottom:
                  "20px",
              }}
            >
              ⏳
            </div>

            <h2>
              Loading Dashboard...
            </h2>

            <p>
              Fetching your data
              from MongoDB.
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
      <div className="dashboard-page">
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

            <Link to="/orders">
              📦 My Orders
            </Link>

            <Link to="/listings">
              🌾 My Listings
            </Link>

            <Link to="/dashboard">
              👤 Dashboard
            </Link>
          </div>
        </nav>

        <section className="dashboard-content">
          <div
            className="dashboard-card"
            style={{
              textAlign: "center",
              padding:
                "60px 30px",
              gridColumn:
                "1 / -1",
            }}
          >
            <div
              style={{
                fontSize: "55px",
                marginBottom:
                  "20px",
              }}
            >
              ⚠️
            </div>

            <h2>
              Backend Connection
              Error
            </h2>

            <p>
              {error}
            </p>

            <button
              className="edit-profile-btn"
              onClick={() =>
                window.location.reload()
              }
              style={{
                marginTop:
                  "20px",
                border: "none",
                cursor:
                  "pointer",
              }}
            >
              🔄 Retry
            </button>
          </div>
        </section>
      </div>
    );
  }

  // ==========================================
  // MAIN DASHBOARD
  // ==========================================

  return (
    <div className="dashboard-page">

      {/* ==========================================
          NAVBAR
          ========================================== */}

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

          <Link to="/orders">
            📦 My Orders
          </Link>

          <Link to="/listings">
            🌾 My Listings
          </Link>

         
         <Link to="/dashboard">
  👤 Dashboard
</Link>

{/* ==========================================
    NOTIFICATION BELL
    ========================================== */}

<div
  style={{
    position: "relative",
    display: "inline-block",
  }}
>
  <button
    onClick={() => {
      setShowNotifications(!showNotifications);
      setUnreadCount(0);
    }}
    style={{
      position: "relative",
      border: "none",
      background: "transparent",
      fontSize: "23px",
      cursor: "pointer",
      padding: "8px 12px",
    }}
    title="Notifications"
  >
    🔔

    {unreadCount > 0 && (
      <span
        style={{
          position: "absolute",
          top: "0px",
          right: "2px",
          background: "red",
          color: "white",
          borderRadius: "50%",
          minWidth: "18px",
          height: "18px",
          fontSize: "11px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: "bold",
        }}
      >
        {unreadCount}
      </span>
    )}
  </button>

  {showNotifications && (
    <div
      style={{
        position: "absolute",
        top: "48px",
        right: "0",
        width: "350px",
        maxHeight: "420px",
        overflowY: "auto",
        background: "white",
        borderRadius: "14px",
        boxShadow: "0 8px 25px rgba(0,0,0,0.18)",
        border: "1px solid #e5e5e5",
        zIndex: 9999,
        padding: "15px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "12px",
        }}
      >
        <strong style={{ fontSize: "18px" }}>
          🔔 Notifications
        </strong>

        <span
          style={{
            fontSize: "13px",
            color: "#777",
          }}
        >
          {notifications.length} total
        </span>
      </div>

      {notifications.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "35px 10px",
            color: "#777",
          }}
        >
          <div style={{ fontSize: "40px" }}>🔕</div>
          <p>No notifications yet.</p>
        </div>
      ) : (
        notifications
          .slice()
          .sort(
            (a, b) =>
              new Date(b.createdAt || 0) -
              new Date(a.createdAt || 0)
          )
          .map((notification, index) => (
            <div
              key={notification._id || index}
              style={{
                padding: "13px",
                marginBottom: "10px",
                borderRadius: "10px",
                background: notification.read
                  ? "#f8f8f8"
                  : "#effaf1",
                border: "1px solid #e1e1e1",
              }}
            >
              <strong
                style={{
                  display: "block",
                  marginBottom: "5px",
                }}
              >
                {notification.title || "Notification"}
              </strong>

              <p
                style={{
                  margin: "0",
                  fontSize: "14px",
                  color: "#555",
                  lineHeight: "1.5",
                }}
              >
                {notification.message}
              </p>

              {notification.createdAt && (
                <small
                  style={{
                    display: "block",
                    marginTop: "7px",
                    color: "#888",
                  }}
                >
                  {new Date(
                    notification.createdAt
                  ).toLocaleString()}
                </small>
              )}
            </div>
          ))
      )}
    </div>
  )}
</div>



          <button
            className="dashboard-logout"
            onClick={handleLogout}
          >
            🚪 Logout
          </button>
        </div>
      </nav>

      {/* ==========================================
          DASHBOARD HEADER
          ========================================== */}

      <section className="dashboard-header">
        <div className="dashboard-welcome">

          <div className="dashboard-avatar">
  {user?.profilePhoto ? (
    <img
      src={
        user.profilePhoto.startsWith("http")
          ? user.profilePhoto
          : `http://localhost:5000${user.profilePhoto}`
      }
      alt="Profile"
      onError={(e) => {
        e.currentTarget.style.display = "none";
      }}
      style={{
        width: "100%",
        height: "100%",
        objectFit: "cover",
        borderRadius: "50%",
        display: "block",
      }}
    />
  ) : (
    <span>
      👤
    </span>
  )}
</div>

          <div>
            <div className="dashboard-label">
              🌱 CROP MARKET ACCOUNT
            </div>

            <h1>
              Welcome,{" "}
              <span>
                {userName}
              </span>
            </h1>

            <p>
              Manage your profile,
              orders and crop
              activities from one
              place.
            </p>
          </div>

        </div>
      </section>

      {/* ==========================================
          STATISTICS
          ========================================== */}

      <section className="dashboard-stats">

        {/* TOTAL ORDERS */}

        <div className="dashboard-stat-card">
          <div className="stat-icon">
            📦
          </div>

          <div>
            <span>
              Total Orders
            </span>

            <strong>
              {orders.length}
            </strong>
          </div>
        </div>

        {/* MY LISTINGS */}

        <div className="dashboard-stat-card">
          <div className="stat-icon">
            🌾
          </div>

          <div>
            <span>
              My Listings
            </span>

            <strong>
              {listings.length}
            </strong>
          </div>
        </div>

        {/* ACCOUNT TYPE */}

        <div className="dashboard-stat-card">
          <div className="stat-icon">
            👨‍🌾
          </div>

          <div>
            <span>
              Account Type
            </span>

            <strong>
              {isFarmer
                ? "Farmer"
                : "Buyer"}
            </strong>
          </div>
        </div>

        {/* FARMER RATING */}

        {isFarmer && (
          <div className="dashboard-stat-card">
            <div className="stat-icon">
              ⭐
            </div>

            <div>
              <span>
                Average Rating
              </span>

              <strong>
                {totalReviews > 0
                  ? `${roundedAverageRating} / 5`
                  : "No Rating"}
              </strong>
            </div>
          </div>
        )}

      </section>

      {/* ==========================================
          MAIN CONTENT
          ========================================== */}

      <section className="dashboard-content">

        {/* ========================================
            PROFILE
            ======================================== */}

        <div className="dashboard-card profile-card">

          <div className="dashboard-card-title">

            <div>
              👤
            </div>

            <div>
              <h2>
                My Profile
              </h2>

              <p>
                Your account
                information
              </p>
            </div>

          </div>

          <div className="profile-details">

            {/* NAME */}

            <div>
              <span>
                Full Name
              </span>

              <strong>
                {userName}
              </strong>
            </div>

            {/* EMAIL */}

            <div>
              <span>
                Email Address
              </span>

              <strong>
                {userEmail}
              </strong>
            </div>

            {/* PHONE */}

            <div>
              <span>
                Phone Number
              </span>

              <strong>
                {userPhone}
              </strong>
            </div>

            {/* ROLE */}

            <div>
              <span>
                Account Type
              </span>

              <strong className="role-badge">
                {isFarmer
                  ? "👨‍🌾 Farmer"
                  : "🛒 Buyer"}
              </strong>
            </div>

          </div>

          <Link
            to="/edit-profile"
            className="edit-profile-btn"
          >
            ✏️ Edit Profile
          </Link>

        </div>

        {/* ========================================
            QUICK ACTIONS
            ======================================== */}

        <div className="dashboard-card">

          <div className="dashboard-card-title">

            <div>
              ⚡
            </div>

            <div>
              <h2>
                Quick Actions
              </h2>

              <p>
                Quickly access
                CropMarket features
              </p>
            </div>

          </div>

          <div className="dashboard-actions">

            {/* BROWSE CROPS */}

            <Link
              to="/crops"
              className="dashboard-action"
            >
              <span>
                🌾
              </span>

              <div>
                <strong>
                  Browse Crops
                </strong>

                <small>
                  Find fresh farm
                  produce
                </small>
              </div>
            </Link>

            {/* MY ORDERS */}

            <Link
              to="/orders"
              className="dashboard-action"
            >
              <span>
                📦
              </span>

              <div>
                <strong>
                  My Orders
                </strong>

                <small>
                  View purchased
                  crops
                </small>
              </div>
            </Link>

            {/* SELL CROP */}

            <Link
              to="/sell"
              className="dashboard-action"
            >
              <span>
                🚜
              </span>

              <div>
                <strong>
                  Sell Crop
                </strong>

                <small>
                  List your fresh
                  crops
                </small>
              </div>
            </Link>

            {/* MY LISTINGS */}

            <Link
              to="/listings"
              className="dashboard-action"
            >
              <span>
                🌱
              </span>

              <div>
                <strong>
                  My Listings
                </strong>

                <small>
                  Manage your
                  listed crops
                </small>
              </div>
            </Link>

            {/* EDIT PROFILE */}

            <Link
              to="/edit-profile"
              className="dashboard-action"
            >
              <span>
                ✏️
              </span>

              <div>
                <strong>
                  Edit Profile
                </strong>

                <small>
                  Update your
                  account details
                </small>
              </div>
            </Link>

          </div>
        </div>

        {/* ========================================
            RECENT ORDERS
            ======================================== */}

        <div className="dashboard-card recent-orders">

          <div className="dashboard-card-title">

            <div>
              📦
            </div>

            <div>
              <h2>
                Recent Orders
              </h2>

              <p>
                Your latest
                purchases
              </p>
            </div>

          </div>

          {orders.length === 0 ? (

            <div className="dashboard-empty">

              <div>
                📦
              </div>

              <p>
                No orders yet.
              </p>

              <Link to="/crops">
                Browse Crops →
              </Link>

            </div>

          ) : (

            <div className="recent-order-list">

              {orders
                .slice()
                .reverse()
                .slice(0, 3)
                .map((order) => (

                  <div
                    className="recent-order"
                    key={
                      order._id ||
                      order.id
                    }
                  >

                    <div className="recent-order-icon">
                      {order.cropIcon ||
                        "🌾"}
                    </div>

                    <div className="recent-order-info">

                      <strong>
                        {order.cropName}
                      </strong>

                      <span>
                        {order.quantity} Kg
                        {" • "}
                        ₹
                        {
                          order.totalPrice
                        }
                      </span>

                    </div>

                    <span className="order-placed-badge">
                      {order.status ||
                        "Placed"}
                    </span>

                  </div>

                ))}

            </div>

          )}

          {orders.length > 0 && (
            <Link
              to="/orders"
              className="view-all-orders"
            >
              View All Orders →
            </Link>
          )}

        </div>

        {/* ========================================
            MY LISTINGS PREVIEW
            ======================================== */}

        <div className="dashboard-card">

          <div className="dashboard-card-title">

            <div>
              🌾
            </div>

            <div>
              <h2>
                My Crop Listings
              </h2>

              <p>
                Manage crops
                currently listed
                for sale
              </p>
            </div>

          </div>

          {listings.length === 0 ? (

            <div className="dashboard-empty">

              <div>
                🌱
              </div>

              <p>
                You have not
                listed any crops
                yet.
              </p>

              <Link to="/sell">
                List Your Crop →
              </Link>

            </div>

          ) : (

            <div className="recent-order-list">

              {listings
                .slice()
                .reverse()
                .slice(0, 3)
                .map(
                  (
                    crop,
                    index
                  ) => (

                    <div
                      className="recent-order"
                      key={
                        crop._id ||
                        crop.id ||
                        `${crop.name}-${index}`
                      }
                    >

                      <div className="recent-order-icon">
                        {crop.icon ||
                          "🌾"}
                      </div>

                      <div className="recent-order-info">

                        <strong>
                          {crop.name}
                        </strong>

                        <span>
                          {crop.price}
                          {" • "}
                          {crop.quantity ||
                            `${
                              crop.quantityValue ||
                              0
                            } kg`}
                        </span>

                      </div>

                      <span className="order-placed-badge">
                        Active
                      </span>

                    </div>

                  )
                )}

            </div>

          )}

          {listings.length > 0 && (
            <Link
              to="/listings"
              className="view-all-orders"
            >
              View All Listings →
            </Link>
          )}

        </div>

      </section>

      {/* ==========================================
          FARMER RATINGS & REVIEWS
          ========================================== */}

      {isFarmer && (
        <section
          style={{
            maxWidth:
              "1200px",
            margin:
              "0 auto 40px",
            padding:
              "0 20px",
          }}
        >

          <div
            className="dashboard-card"
            style={{
              width: "100%",
            }}
          >

            {/* TITLE */}

            <div className="dashboard-card-title">

              <div
                style={{
                  fontSize:
                    "30px",
                }}
              >
                ⭐
              </div>

              <div>
                <h2>
                  Customer Ratings
                  & Reviews
                </h2>

                <p>
                  See what buyers
                  think about your
                  crops and service
                </p>
              </div>

            </div>

            {/* NO REVIEWS */}

            {totalReviews === 0 ? (

              <div
                className="dashboard-empty"
                style={{
                  padding:
                    "40px 20px",
                }}
              >

                <div
                  style={{
                    fontSize:
                      "50px",
                  }}
                >
                  ⭐
                </div>

                <p>
                  No customer
                  reviews yet.
                </p>

                <small
                  style={{
                    display:
                      "block",
                    marginTop:
                      "8px",
                    color:
                      "#777",
                  }}
                >
                  Ratings submitted
                  by buyers after
                  successful delivery
                  will appear here.
                </small>

              </div>

            ) : (

              <>
                {/* =================================
                    RATING SUMMARY
                    ================================= */}

                <div
                  style={{
                    display:
                      "grid",
                    gridTemplateColumns:
                      "minmax(180px, 0.8fr) minmax(260px, 1.2fr)",
                    gap:
                      "30px",
                    marginBottom:
                      "30px",
                  }}
                >

                  {/* AVERAGE */}

                  <div
                    style={{
                      textAlign:
                        "center",
                      padding:
                        "28px 20px",
                      borderRadius:
                        "16px",
                      background:
                        "#f8fff9",
                      border:
                        "1px solid #dcefe0",
                    }}
                  >

                    <div
                      style={{
                        fontSize:
                          "50px",
                        fontWeight:
                          "800",
                        lineHeight:
                          "1",
                      }}
                    >
                      {
                        roundedAverageRating
                      }
                    </div>

                    <div
                      style={{
                        marginTop:
                          "12px",
                      }}
                    >
                      {renderStars(
                        roundedAverageRating,
                        "22px"
                      )}
                    </div>

                    <div
                      style={{
                        marginTop:
                          "10px",
                        color:
                          "#666",
                        fontSize:
                          "14px",
                      }}
                    >
                      Based on{" "}
                      {
                        totalReviews
                      }{" "}
                      {totalReviews ===
                      1
                        ? "review"
                        : "reviews"}
                    </div>

                  </div>

                  {/* BREAKDOWN */}

                  <div
                    style={{
                      padding:
                        "10px 5px",
                    }}
                  >

                    {ratingDistribution.map(
                      (item) => (

                        <div
                          key={
                            item.star
                          }
                          style={{
                            display:
                              "flex",
                            alignItems:
                              "center",
                            gap:
                              "10px",
                            marginBottom:
                              "12px",
                          }}
                        >

                          <span
                            style={{
                              width:
                                "45px",
                              fontWeight:
                                "600",
                            }}
                          >
                            {
                              item.star
                            }{" "}
                            ⭐
                          </span>

                          <div
                            style={{
                              flex: 1,
                              height:
                                "9px",
                              background:
                                "#eeeeee",
                              borderRadius:
                                "20px",
                              overflow:
                                "hidden",
                            }}
                          >

                            <div
                              style={{
                                width: `${item.percentage}%`,
                                height:
                                  "100%",
                                background:
                                  "#f5b301",
                                borderRadius:
                                  "20px",
                              }}
                            />

                          </div>

                          <span
                            style={{
                              width:
                                "35px",
                              textAlign:
                                "right",
                              color:
                                "#666",
                            }}
                          >
                            {
                              item.count
                            }
                          </span>

                        </div>

                      )
                    )}

                  </div>

                </div>

                {/* =================================
                    RECENT REVIEWS
                    ================================= */}

                <div>

                  <h3
                    style={{
                      marginBottom:
                        "18px",
                      fontSize:
                        "20px",
                    }}
                  >
                    Recent Customer
                    Reviews
                  </h3>

                  {reviews
                    .slice()
                    .sort(
                      (
                        a,
                        b
                      ) =>
                        new Date(
                          b.createdAt ||
                            b.updatedAt ||
                            0
                        ) -
                        new Date(
                          a.createdAt ||
                            a.updatedAt ||
                            0
                        )
                    )
                    .slice(
                      0,
                      10
                    )
                    .map(
                      (
                        item,
                        index
                      ) => (

                        <div
                          key={
                            item._id ||
                            `${item.orderId}-${index}`
                          }
                          style={{
                            padding:
                              "18px 0",
                            borderTop:
                              "1px solid #eeeeee",
                          }}
                        >

                          <div
                            style={{
                              display:
                                "flex",
                              justifyContent:
                                "space-between",
                              alignItems:
                                "flex-start",
                              gap:
                                "15px",
                              flexWrap:
                                "wrap",
                            }}
                          >

                            <div>

                              <div>
                                {renderStars(
                                  item.rating
                                )}
                              </div>

                              <strong
                                style={{
                                  display:
                                    "block",
                                  marginTop:
                                    "6px",
                                }}
                              >
                                {
                                  item.cropName
                                }
                              </strong>

                            </div>

                            <span
                              style={{
                                fontSize:
                                  "13px",
                                color:
                                  "#777",
                              }}
                            >
                              {item.createdAt
                                ? new Date(
                                    item.createdAt
                                  ).toLocaleDateString()
                                : ""}
                            </span>

                          </div>

                          <p
                            style={{
                              margin:
                                "10px 0 0",
                              color:
                                "#555",
                              lineHeight:
                                "1.6",
                            }}
                          >
                            {item.review ||
                              "Buyer gave a rating without a written review."}
                          </p>

                          <small
                            style={{
                              display:
                                "block",
                              marginTop:
                                "8px",
                              color:
                                "#888",
                            }}
                          >
                            Buyer:{" "}
                            {item.buyerName ||
                              item.buyerEmail ||
                              "Customer"}
                          </small>

                        </div>

                      )
                    )}

                </div>

              </>
            )}

          </div>

        </section>
      )}

      {/* ==========================================
          FOOTER
          ========================================== */}

      <footer>

        <div className="footer-logo">
          🌱 CropMarket
        </div>

        <p>
          Smart Agriculture
          Marketplace
        </p>

        <p>
          © 2026 CropMarket |
          All Rights Reserved
        </p>

      </footer>

    </div>
  );
}

export default Dashboard;