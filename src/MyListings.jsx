import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./App.css";

function MyListings() {
  const navigate = useNavigate();

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =====================================================
  // GET LOGGED-IN FARMER
  // =====================================================

  const getLoggedInUser = () => {
    try {
      const savedUser =
        localStorage.getItem("cropMarketLoggedInUser") ||
        localStorage.getItem("cropMarketUser");

      if (!savedUser) {
        return null;
      }

      return JSON.parse(savedUser);
    } catch (error) {
      console.error(
        "Logged-in user error:",
        error
      );

      return null;
    }
  };

  // =====================================================
  // GET FARMER CROPS FROM MONGODB
  // =====================================================

  const fetchListings = async () => {
    try {
      setLoading(true);
      setError("");

      const user = getLoggedInUser();

      console.log(
        "Logged-in user:",
        user
      );

      if (!user) {
        setError(
          "No logged-in user found. Please login again."
        );

        setListings([]);
        return;
      }

      const farmerEmail =
        String(user.email || "")
          .trim()
          .toLowerCase();

      if (!farmerEmail) {
        setError(
          "Farmer email not found. Please login again."
        );

        setListings([]);
        return;
      }

      console.log(
        "Fetching listings for farmer:",
        farmerEmail
      );

      // =================================================
      // FETCH ONLY THIS FARMER'S CROPS
      // =================================================

      const response = await fetch(
        `http://localhost:5000/api/crops/farmer/${encodeURIComponent(
          farmerEmail
        )}`
      );

      const data =
        await response.json();

      console.log(
        "Farmer crops received from MongoDB:",
        data
      );

      if (!response.ok) {
        throw new Error(
          data.message ||
            `Server returned ${response.status}`
        );
      }

      setListings(
        Array.isArray(data.crops)
          ? data.crops
          : []
      );

    } catch (error) {

      console.error(
        "Fetch Listings Error:",
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

  // =====================================================
  // LOAD LISTINGS
  // =====================================================

  useEffect(() => {
    fetchListings();
  }, []);

  // =====================================================
  // DELETE LISTING
  // =====================================================

  const handleDelete = async (
    crop
  ) => {
    try {

      if (!crop || !crop._id) {
        alert(
          "Crop ID not found."
        );

        return;
      }

      const user =
        getLoggedInUser();

      if (!user?.email) {
        alert(
          "Please login again."
        );

        return;
      }

      const farmerEmail =
        String(user.email)
          .trim()
          .toLowerCase();

      // =================================================
      // CONFIRM DELETE
      // =================================================

      const confirmed =
        window.confirm(
          `Are you sure you want to delete "${crop.name}"?\n\nThis crop will be permanently removed from MongoDB.`
        );

      if (!confirmed) {
        return;
      }

      console.log(
        "Deleting crop:",
        crop._id
      );

      // =================================================
      // DELETE API
      // =================================================

      const response =
        await fetch(
          `http://localhost:5000/api/crops/${crop._id}?farmerEmail=${encodeURIComponent(
            farmerEmail
          )}`,
          {
            method: "DELETE",
          }
        );

      const data =
        await response.json();

      console.log(
        "Delete response:",
        data
      );

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to delete crop."
        );
      }

      // =================================================
      // REMOVE FROM SCREEN
      // =================================================

      setListings(
        (previousListings) =>
          previousListings.filter(
            (item) =>
              item._id !==
              crop._id
          )
      );

      alert(
        "Crop deleted successfully! 🌱"
      );

    } catch (error) {

      console.error(
        "Delete Crop Error:",
        error
      );

      alert(
        error.message ||
          "Failed to delete crop."
      );
    }
  };

  // =====================================================
  // EDIT LISTING
  // =====================================================

  const handleEdit = async (
    crop
  ) => {
    try {

      if (!crop || !crop._id) {
        alert(
          "Crop ID not found."
        );

        return;
      }

      const user =
        getLoggedInUser();

      if (!user?.email) {
        alert(
          "Please login again."
        );

        return;
      }

      const farmerEmail =
        String(user.email)
          .trim()
          .toLowerCase();

      // =================================================
      // CROP NAME
      // =================================================

      const newName =
        window.prompt(
          "Enter crop name:",
          crop.name || ""
        );

      if (newName === null) {
        return;
      }

      if (!newName.trim()) {
        alert(
          "Crop name cannot be empty."
        );

        return;
      }

      // =================================================
      // PRICE
      // =================================================

      const oldPrice =
        crop.priceValue !== undefined
          ? crop.priceValue
          : String(
              crop.price || ""
            ).replace(
              /[^\d.]/g,
              ""
            );

      const newPrice =
        window.prompt(
          "Enter price per Kg:",
          oldPrice
        );

      if (newPrice === null) {
        return;
      }

      const priceValue =
        Number(newPrice);

      if (
        !Number.isFinite(
          priceValue
        ) ||
        priceValue <= 0
      ) {
        alert(
          "Please enter a valid price greater than 0."
        );

        return;
      }

      // =================================================
      // QUANTITY
      // =================================================

      const oldQuantity =
        crop.quantityValue !== undefined
          ? crop.quantityValue
          : String(
              crop.quantity || ""
            ).replace(
              /[^\d.]/g,
              ""
            );

      const newQuantity =
        window.prompt(
          "Enter quantity in Kg:",
          oldQuantity
        );

      if (newQuantity === null) {
        return;
      }

      const quantityValue =
        Number(newQuantity);

      if (
        !Number.isFinite(
          quantityValue
        ) ||
        quantityValue <= 0
      ) {
        alert(
          "Please enter a valid quantity greater than 0."
        );

        return;
      }

      // =================================================
      // LOCATION
      // =================================================

      const newLocation =
        window.prompt(
          "Enter location:",
          crop.location || ""
        );

      if (newLocation === null) {
        return;
      }

      if (!newLocation.trim()) {
        alert(
          "Location cannot be empty."
        );

        return;
      }

      // =================================================
      // CATEGORY
      // =================================================

      const newCategory =
        window.prompt(
          "Enter category:",
          crop.category ||
            "Vegetables"
        );

      if (newCategory === null) {
        return;
      }

      // =================================================
      // DESCRIPTION
      // =================================================

      const newDescription =
        window.prompt(
          "Enter description:",
          crop.description || ""
        );

      if (newDescription === null) {
        return;
      }

      // =================================================
      // UPDATED CROP DATA
      // =================================================

      const updatedCrop = {
        icon:
          crop.icon || "🌱",

        name:
          newName.trim(),

        category:
          newCategory.trim() ||
          "Vegetables",

        price:
          `₹${priceValue}/kg`,

        priceValue:
          priceValue,

        farmer:
          crop.farmer ||
          user.name ||
          "Farmer",

        farmerEmail:
          farmerEmail,

        location:
          newLocation.trim(),

        quantity:
          `${quantityValue} kg`,

        quantityValue:
          quantityValue,

        description:
          newDescription.trim(),
      };

      console.log(
        "Updating crop:",
        updatedCrop
      );

      // =================================================
      // UPDATE API
      // =================================================

      const response =
        await fetch(
          `http://localhost:5000/api/crops/${crop._id}`,
          {
            method: "PUT",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify(
                updatedCrop
              ),
          }
        );

      const data =
        await response.json();

      console.log(
        "Update response:",
        data
      );

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to update crop."
        );
      }

      // =================================================
      // UPDATE SCREEN
      // =================================================

      const savedCrop =
        data.crop ||
        {
          ...crop,
          ...updatedCrop,
        };

      setListings(
        (previousListings) =>
          previousListings.map(
            (item) =>
              item._id ===
              crop._id
                ? savedCrop
                : item
          )
      );

      alert(
        "Crop updated successfully! 🌱"
      );

    } catch (error) {

      console.error(
        "Update Crop Error:",
        error
      );

      alert(
        error.message ||
          "Failed to update crop."
      );
    }
  };

  // =====================================================
  // TOTAL QUANTITY
  // =====================================================

  const totalQuantity =
    listings.reduce(
      (total, crop) => {

        const quantity =
          Number(
            crop.quantityValue ||
              String(
                crop.quantity || ""
              ).replace(
                /[^\d.]/g,
                ""
              )
          );

        return (
          total +
          (quantity || 0)
        );
      },
      0
    );

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="my-listings-page">

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

        <section className="my-listings-section">

          <div className="listings-empty">

            <div className="listings-empty-icon">
              ⏳
            </div>

            <h2>
              Loading Your Listings...
            </h2>

            <p>
              Fetching your crop listings
              from MongoDB.
            </p>

          </div>

        </section>

      </div>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (error) {
    return (
      <div className="my-listings-page">

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

            <Link to="/dashboard">
              👤 Dashboard
            </Link>

          </div>

        </nav>

        <section className="my-listings-section">

          <div className="listings-empty">

            <div className="listings-empty-icon">
              ⚠️
            </div>

            <h2>
              Backend Connection Error
            </h2>

            <p>
              {error}
            </p>

            <button
              className="primary-btn"
              onClick={() =>
                window.location.reload()
              }
            >
              🔄 Try Again
            </button>

          </div>

        </section>

      </div>
    );
  }

  // =====================================================
  // MAIN PAGE
  // =====================================================

  return (
    <div className="my-listings-page">

      {/* ================= NAVBAR ================= */}

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

          <Link to="/dashboard">
            👤 Dashboard
          </Link>

        </div>

      </nav>

      {/* ================= HEADER ================= */}

      <section className="listings-header">

        <div className="listings-badge">
          🌾 FARMER MANAGEMENT
        </div>

        <h1>
          My <span>Crop Listings</span>
        </h1>

        <p>
          Manage the crops you have listed
          on CropMarket.
        </p>

      </section>

      {/* ================= STATISTICS ================= */}

      <section className="listing-stats">

        <div className="listing-stat-card">

          <div className="listing-stat-icon">
            🌾
          </div>

          <div>

            <span>
              Total Listings
            </span>

            <strong>
              {listings.length}
            </strong>

          </div>

        </div>

        <div className="listing-stat-card">

          <div className="listing-stat-icon">
            📦
          </div>

          <div>

            <span>
              Total Quantity
            </span>

            <strong>
              {totalQuantity} Kg
            </strong>

          </div>

        </div>

        <div className="listing-stat-card">

          <div className="listing-stat-icon">
            🚜
          </div>

          <div>

            <span>
              Marketplace
            </span>

            <strong>
              Active
            </strong>

          </div>

        </div>

      </section>

      {/* ================= LISTINGS ================= */}

      <section className="my-listings-section">

        <div className="listings-section-heading">

          <div>

            <div className="section-label">
              🌱 FARM TO MARKET
            </div>

            <h2>
              Your Listed Crops
            </h2>

            <p>
              View and manage all your active
              crop listings.
            </p>

          </div>

          <button
            className="listing-add-btn"
            onClick={() =>
              navigate("/sell")
            }
          >
            🚜 Add New Crop
          </button>

        </div>

        {/* ================= EMPTY ================= */}

        {listings.length === 0 ? (

          <div className="listings-empty">

            <div className="listings-empty-icon">
              🌱
            </div>

            <h2>
              No Crop Listings Yet
            </h2>

            <p>
              You haven't listed any crops yet.
              Start selling directly to buyers.
            </p>

            <Link
              to="/sell"
              className="primary-btn"
            >
              🚜 List Your First Crop
            </Link>

          </div>

        ) : (

          /* ================= GRID ================= */

          <div className="my-listings-grid">

            {listings.map(
              (crop, index) => (

                <div
                  className="my-listing-card"
                  key={
                    crop._id ||
                    `${crop.name}-${index}`
                  }
                >

                  {/* CROP ICON */}

                  <div className="my-listing-top">

                    <div className="my-listing-icon">
                      {crop.icon ||
                        "🌾"}
                    </div>

                    <span className="listing-active">
                      ● Active
                    </span>

                  </div>

                  {/* NAME */}

                  <h3>
                    {crop.name}
                  </h3>

                  {/* PRICE */}

                  <div className="listing-price">
                    {crop.price ||
                      `₹${crop.priceValue}/kg`}
                  </div>

                  {/* DETAILS */}

                  <div className="listing-details">

                    <p>
                      👨‍🌾{" "}
                      <strong>
                        Farmer:
                      </strong>{" "}
                      {crop.farmer ||
                        "You"}
                    </p>

                    <p>
                      📍{" "}
                      <strong>
                        Location:
                      </strong>{" "}
                      {crop.location ||
                        "Not specified"}
                    </p>

                    <p>
                      📦{" "}
                      <strong>
                        Quantity:
                      </strong>{" "}
                      {crop.quantity ||
                        `${crop.quantityValue} kg`}
                    </p>

                    <p>
                      🌱{" "}
                      <strong>
                        Category:
                      </strong>{" "}
                      {crop.category ||
                        "Vegetables"}
                    </p>

                  </div>

                  {/* DESCRIPTION */}

                  {crop.description && (

                    <div className="listing-description">

                      <strong>
                        Description
                      </strong>

                      <p>
                        {crop.description}
                      </p>

                    </div>

                  )}

                  {/* ACTION BUTTONS */}

                  <div className="listing-actions">

                    <button
                      className="edit-listing-btn"
                      onClick={() =>
                        handleEdit(
                          crop
                        )
                      }
                    >
                      ✏️ Edit
                    </button>

                    <button
                      className="delete-listing-btn"
                      onClick={() =>
                        handleDelete(
                          crop
                        )
                      }
                    >
                      🗑️ Delete
                    </button>

                  </div>

                </div>

              )
            )}

          </div>

        )}

      </section>

      {/* ================= CTA ================= */}

      <section className="listings-cta">

        <div className="listings-cta-icon">
          👨‍🌾
        </div>

        <div>

          <h2>
            Want to sell another crop?
          </h2>

          <p>
            Add a new crop listing and
            connect with more buyers.
          </p>

        </div>

        <Link
          to="/sell"
          className="secondary-btn"
        >
          🚜 Sell New Crop
        </Link>

      </section>

      {/* ================= FOOTER ================= */}

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

export default MyListings;