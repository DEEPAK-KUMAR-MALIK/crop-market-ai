import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./App.css";

const API_URL = "http://localhost:5000";

function Crops() {
  const navigate = useNavigate();

  /* =========================
     DEFAULT CROPS
  ========================= */

  const defaultCrops = [
    {
      id: "default-1",
      icon: "🌾",
      name: "Wheat",
      category: "Grains",
      price: "₹28/kg",
      priceValue: 28,
      farmer: "Ramesh Kumar",
      location: "Bhubaneswar",
      quantity: "500 kg",
    },
    {
      id: "default-2",
      icon: "🌽",
      name: "Maize",
      category: "Grains",
      price: "₹24/kg",
      priceValue: 24,
      farmer: "Suresh Pradhan",
      location: "Cuttack",
      quantity: "350 kg",
    },
    {
      id: "default-3",
      icon: "🥔",
      name: "Potato",
      category: "Vegetables",
      price: "₹22/kg",
      priceValue: 22,
      farmer: "Rajesh Das",
      location: "Puri",
      quantity: "700 kg",
    },
    {
      id: "default-4",
      icon: "🍅",
      name: "Tomato",
      category: "Vegetables",
      price: "₹30/kg",
      priceValue: 30,
      farmer: "Manoj Sahu",
      location: "Khordha",
      quantity: "250 kg",
    },
    {
      id: "default-5",
      icon: "🧅",
      name: "Onion",
      category: "Vegetables",
      price: "₹26/kg",
      priceValue: 26,
      farmer: "Bikash Behera",
      location: "Nayagarh",
      quantity: "450 kg",
    },
    {
      id: "default-6",
      icon: "🥕",
      name: "Carrot",
      category: "Vegetables",
      price: "₹35/kg",
      priceValue: 35,
      farmer: "Amit Rout",
      location: "Bhubaneswar",
      quantity: "200 kg",
    },
    {
  id: "default-7",
  icon: "🌾",
  name: "Rice",
  category: "Grains",
  price: "₹25/kg",
  priceValue: 25,
  farmer: "Local Farmer",
  location: "Bargarh",
  quantity: "Available",
},
  ];
  

  /* =========================
     STATES
  ========================= */

  const [mongoCrops, setMongoCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mandiRates, setMandiRates] = useState([]);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("default");
  const [selectedCrop, setSelectedCrop] = useState(null);

  /* =========================
     FETCH CROPS FROM MONGODB
  ========================= */

  useEffect(() => {
    fetchCrops();
    fetchMandiRates();
  }, []);
  const fetchMandiRates = async () => {
  try {
    const response = await fetch(
      `${API_URL}/api/mandi-rates`
    );

    if (!response.ok) {
      throw new Error(
        `Server returned ${response.status}`
      );
    }

    const data = await response.json();

    setMandiRates(
      Array.isArray(data.rates)
        ? data.rates
        : []
    );

    console.log(
      "Mandi Rates:",
      data.rates
    );
  } catch (err) {
    console.error(
      "Error fetching mandi rates:",
      err
    );

    setMandiRates([]);
  }
};

  const fetchCrops = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/api/crops`
      );

      if (!response.ok) {
        throw new Error(
          `Server returned ${response.status}`
        );
      }

      const data = await response.json();

      console.log(
        "MongoDB Crops:",
        data
      );

      const cropsFromMongo =
        Array.isArray(data.crops)
          ? data.crops
          : [];

      const formattedCrops =
        cropsFromMongo.map(
          (crop, index) => {
            const mongoId =
              crop?._id ||
              crop?.id ||
              crop?.mongoId ||
              crop?.cropId ||
              `mongo-${index}`;

            const priceValue =
              Number(
                crop?.priceValue
              ) ||
              Number(
                String(
                  crop?.price || ""
                ).replace(
                  /[^0-9.]/g,
                  ""
                )
              ) ||
              0;

            return {
              ...crop,

              _id: mongoId,

              id: String(mongoId),

              cropId: String(mongoId),

              mongoId: String(mongoId),

              icon:
                crop?.icon ||
                "🌱",

              name:
                crop?.name ||
                "Unknown Crop",

              category:
                crop?.category ||
                "Other",

              price:
                crop?.price ||
                `₹${priceValue}/kg`,

              priceValue,

              farmer:
                crop?.farmer ||
                "Unknown Farmer",

              location:
                crop?.location ||
                "Not specified",

              quantity:
                crop?.quantity ||
                "Available",

              description:
                crop?.description ||
                "",
            };
          }
        );

      console.log(
        "Formatted MongoDB Crops:",
        formattedCrops
      );

      setMongoCrops(
        formattedCrops
      );
    } catch (err) {
      console.error(
        "Error fetching crops:",
        err
      );

      setError(
        "Unable to load crops from server."
      );

      setMongoCrops([]);
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     LOCAL STORAGE FALLBACK
  ========================= */

  let savedCrops = [];

  try {
    savedCrops =
      JSON.parse(
        localStorage.getItem(
          "cropMarketCrops"
        )
      ) || [];
  } catch (err) {
    console.error(
      "Error reading saved crops:",
      err
    );

    savedCrops = [];
  }

  const formattedSavedCrops =
    savedCrops.map(
      (crop, index) => {
        const mongoId =
          crop?._id ||
          crop?.mongoId ||
          crop?.cropId ||
          null;

        const priceValue =
          Number(
            crop?.priceValue
          ) ||
          Number(
            String(
              crop?.price || ""
            ).replace(
              /[^0-9.]/g,
              ""
            )
          ) ||
          0;

        return {
          ...crop,

          _id: mongoId,

          id:
            mongoId ||
            crop?.id ||
            `saved-${index}`,

          cropId:
            mongoId ||
            crop?.id ||
            `saved-${index}`,

          mongoId,

          icon:
            crop?.icon ||
            "🌱",

          name:
            crop?.name ||
            "Unknown Crop",

          category:
            crop?.category ||
            "Other",

          price:
            crop?.price ||
            `₹${priceValue}/kg`,

          priceValue,

          farmer:
            crop?.farmer ||
            "Unknown Farmer",

          location:
            crop?.location ||
            "Not specified",

          quantity:
            crop?.quantity ||
            "Available",

          description:
            crop?.description ||
            "",
        };
      }
    );

  /* =========================
     COMBINE CROPS
  ========================= */

  const allCrops = [
    ...defaultCrops,
    ...mongoCrops,
    ...formattedSavedCrops.filter(
      (savedCrop) => {
        const savedId =
          String(
            savedCrop?._id ||
            savedCrop?.id ||
            ""
          );

        return !mongoCrops.some(
          (mongoCrop) =>
            String(
              mongoCrop?._id ||
              mongoCrop?.id ||
              ""
            ) === savedId
        );
      }
    ),
  ];

  /* =========================
     SEARCH / FILTER / SORT
  ========================= */

  const filteredCrops =
    allCrops
      .filter((crop) => {
        const searchText =
          search.toLowerCase();

        const matchesSearch =
          String(
            crop.name || ""
          )
            .toLowerCase()
            .includes(searchText) ||

          String(
            crop.farmer || ""
          )
            .toLowerCase()
            .includes(searchText) ||

          String(
            crop.location || ""
          )
            .toLowerCase()
            .includes(searchText);

        const matchesCategory =
          category === "All" ||
          crop.category === category;

        return (
          matchesSearch &&
          matchesCategory
        );
      })
      .sort((a, b) => {
        if (sort === "low") {
          return (
            a.priceValue -
            b.priceValue
          );
        }

        if (sort === "high") {
          return (
            b.priceValue -
            a.priceValue
          );
        }

        if (sort === "name") {
          return String(
            a.name || ""
          ).localeCompare(
            String(
              b.name || ""
            )
          );
        }

        return 0;
      });

  /* =========================
     BUY CROP
  ========================= */

  const handleBuyCrop = (crop) => {
    const mongoId =
      crop?._id ||
      crop?.mongoId ||
      crop?.cropId ||
      crop?.id ||
      null;

    const cropForBuy = {
      ...crop,

      _id: mongoId,

      id: mongoId,

      cropId: mongoId,

      mongoId: mongoId,
    };

    console.log(
      "Crop selected for buying:",
      cropForBuy
    );

    console.log(
      "MongoDB Crop ID:",
      mongoId
    );

    if (!mongoId) {
      alert(
        "Crop ID is missing. Please refresh the crops page and try again."
      );

      return;
    }

    navigate("/buy", {
      state: {
        crop: cropForBuy,
        cropId: mongoId,
      },
    });
  };

  /* =========================
     VIEW DETAILS
  ========================= */

  const handleViewDetails = (crop) => {
  setSelectedCrop(crop);
};

const closeDetails = () => {
  setSelectedCrop(null);
};

const getCropImage = (crop) => {
  const image =
    crop?.image ||
    crop?.imageUrl ||
    crop?.photo ||
    crop?.cropImage ||
    "";

  if (!image) return "";

  if (String(image).startsWith("http")) {
    return image;
  }

  return `${API_URL}${image}`;
};

  /* =========================
     LOADING
  ========================= */

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f7fbf6",
          fontSize: "22px",
          fontWeight: "600",
          color: "#0b5d3b",
        }}
      >
        🌱 Loading fresh crops...
      </div>
    );
  }

  /* =========================
     MAIN UI
  ========================= */

  return (
    <div className="crops-page">

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

          <Link to="/listings">
            🌾 My Listings
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

      {/* ================= HERO ================= */}

      <section className="crops-hero">

        <div>

          <div className="badge">
            🌾 FRESH FROM LOCAL FARMS
          </div>

          <h1>
            Explore Fresh
            <span>
              Crops
            </span>
          </h1>

          <p>
            Buy fresh crops directly
            from trusted local farmers.
            Quality produce at
            transparent prices.
          </p>

        </div>

        <div className="crop-hero-art">

          <div className="big-farmer">
            👨‍🌾
          </div>

          <div className="art1">
            🌾
          </div>

          <div className="art2">
            🌽
          </div>

          <div className="art3">
            🍅
          </div>

          <div className="art4">
            🥕
          </div>

        </div>

      </section>

      {/* ================= CROPS SECTION ================= */}

      <section className="all-crops-section">

        <div className="section-heading">

          <div className="section-label">
            🌱 FARM TO MARKET
          </div>

          <h2>
            Available Crops
          </h2>

          <p>
            Choose fresh crops from
            our trusted farmers.
          </p>

        </div>

        {/* ================= ERROR ================= */}

        {error && (
          <div
            style={{
              maxWidth: "1100px",
              margin:
                "0 auto 25px",
              padding: "14px 18px",
              background: "#fff3f3",
              color: "#c62828",
              borderRadius: "12px",
              textAlign: "center",
            }}
          >
            ⚠️ {error}
          </div>
        )}

        {/* ================= SEARCH & FILTER ================= */}

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "2fr 1fr 1fr",
            gap: "15px",
            maxWidth: "1100px",
            margin:
              "0 auto 45px",
          }}
        >

          {/* SEARCH */}

          <input
            type="text"
            placeholder="🔍 Search crop, farmer or location..."
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
            style={{
              padding:
                "15px 18px",
              border:
                "1px solid #dcebdc",
              borderRadius:
                "14px",
              outline: "none",
              fontSize: "15px",
              background:
                "#f9fcf8",
            }}
          />

          {/* CATEGORY */}

          <select
            value={category}
            onChange={(e) =>
              setCategory(
                e.target.value
              )
            }
            style={{
              padding: "15px",
              border:
                "1px solid #dcebdc",
              borderRadius:
                "14px",
              outline: "none",
              fontSize: "15px",
              background:
                "#f9fcf8",
            }}
          >

            <option value="All">
              🌱 All Categories
            </option>

            <option value="Grains">
              🌾 Grains
            </option>

            <option value="Vegetables">
              🥕 Vegetables
            </option>

            <option value="Fruits">
              🍎 Fruits
            </option>

            <option value="Other">
              🌱 Other
            </option>

          </select>

          {/* SORT */}

          <select
            value={sort}
            onChange={(e) =>
              setSort(
                e.target.value
              )
            }
            style={{
              padding: "15px",
              border:
                "1px solid #dcebdc",
              borderRadius:
                "14px",
              outline: "none",
              fontSize: "15px",
              background:
                "#f9fcf8",
            }}
          >

            <option value="default">
              ↕ Sort By
            </option>

            <option value="low">
              💰 Price: Low → High
            </option>

            <option value="high">
              💰 Price: High → Low
            </option>

            <option value="name">
              🔤 Name: A → Z
            </option>

          </select>

        </div>

        {/* ================= RESULT COUNT ================= */}

        <div
          style={{
            maxWidth: "1100px",
            margin:
              "0 auto 25px",
            color: "#64776a",
            fontWeight: "600",
          }}
        >
          Showing{" "}
          {filteredCrops.length}{" "}
          crop
          {filteredCrops.length !==
          1
            ? "s"
            : ""}
        </div>


        {/* ================= CROP GRID ================= */}

        {filteredCrops.length >
        0 ? (

          <div className="crop-grid">

            {filteredCrops.map(
              (crop) => (

                <div
                  className="modern-crop-card"
                  key={
                    String(
                      crop.id
                    )
                  }
                >{getCropImage(crop) ? (
  <img
    src={getCropImage(crop)}
    alt={crop.name}
    style={{
      width: "100%",
      height: "190px",
      objectFit: "cover",
      borderRadius: "16px",
      marginBottom: "15px",
      background: "#eef7ec",
    }}
    onError={(e) => {
      e.currentTarget.style.display = "none";
    }}
  />
) : null}

                  <div className="crop-icon-large">
                    {crop.icon}
                  </div>

                  <div className="available">
                    ● Fresh Stock
                  </div>

                  <h3>
                    {crop.name}
                  </h3>

                  <div className="modern-price">
                    {crop.price}
                  </div>
                  {/* ================= MANDI RATE ================= */}
                  {mandiRates
  .filter((rate) => {
    const mandiCrop = String(rate.cropName || "")
      .toLowerCase()
      .trim();

    const currentCrop = String(crop.name || "")
      .toLowerCase()
      .trim();

    return (
      mandiCrop === currentCrop ||
      (mandiCrop === "rice/paddy" &&
        currentCrop === "rice") ||
      (mandiCrop === "rice" &&
        currentCrop === "rice/paddy")
    );
  })
  .map((rate) => (
    <div
      key={rate._id}
      style={{
        margin: "12px 0",
        padding: "12px",
        borderRadius: "12px",
        background: "#eef9ef",
        border: "1px solid #cce8d0",
      }}
    >
      <strong>🏪 {rate.mandiName}</strong>

      <div style={{ marginTop: "6px" }}>
        Min: ₹{rate.minPrice} | Modal: ₹{rate.modalPrice} | Max: ₹{rate.maxPrice}
      </div>

      <div style={{ marginTop: "4px" }}>
        📍 {rate.district} | 📦 Arrival: {rate.arrival}
      </div>
    </div>
  ))}



                  <p>
                    👨‍🌾 Farmer:{" "}
                    {crop.farmer}
                  </p>

                  <p>
                    📍{" "}
                    {crop.location}
                  </p>

                  <p>
                    📦 Quantity:{" "}
                    {crop.quantity ||
                      "Available"}
                  </p>

                  {/* DATABASE ID
                      ONLY FOR DEBUGGING */}
                  {crop._id &&
                    !String(
                      crop._id
                    ).startsWith(
                      "default-"
                    ) && (
                      <p
                        style={{
                          fontSize:
                            "11px",
                          color:
                            "#8a998e",
                          wordBreak:
                            "break-all",
                        }}
                      >
                        ID:{" "}
                        {String(
                          crop._id
                        )}
                      </p>
                    )}

                  {/* ================= BUTTONS ================= */}

                  <div className="crop-actions">

                    <button
                      onClick={() =>
                        handleViewDetails(
                          crop
                        )
                      }
                    >
                      View Details
                    </button>

                    <button
                      className="buy-button"
                      onClick={() =>
                        handleBuyCrop(
                          crop
                        )
                      }
                    >
                      🛒 Buy Crop
                    </button>

                  </div>

                </div>

              )
            )}

          </div>

        ) : (

          /* ================= NO RESULT ================= */

          <div
            style={{
              textAlign:
                "center",
              padding:
                "60px 20px",
              background:
                "#f7fbf6",
              borderRadius:
                "20px",
              color:
                "#64776a",
            }}
          >

            <div
              style={{
                fontSize: "60px",
              }}
            >
              🔍
            </div>

            <h3>
              No crops found
            </h3>

            <p>
              Try another crop
              name, farmer or
              category.
            </p>

            <button
              onClick={() => {
                setSearch("");
                setCategory(
                  "All"
                );
                setSort(
                  "default"
                );
              }}
              style={{
                marginTop:
                  "15px",
                padding:
                  "12px 22px",
                border: "none",
                borderRadius:
                  "12px",
                background:
                  "#24a346",
                color: "white",
                fontWeight:
                  "bold",
                cursor:
                  "pointer",
              }}
            >
              Reset Filters
            </button>

          </div>

        )}

      </section>

      {/* ================= FARMER CTA ================= */}

      <section className="farmer-cta">

        <div>

          <span>
            👨‍🌾
          </span>

          <div>

            <h2>
              Are you a Farmer?
            </h2>

            <p>
              Sell your fresh
              crops directly
              to buyers.
            </p>

          </div>

        </div>

        <Link to="/sell">

          <button>
            🚜 Sell Your Crop
          </button>

        </Link>

      </section>

      {/* ================= FOOTER ================= */}

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
      {selectedCrop && (
  <div
    onClick={closeDetails}
    style={{
      position: "fixed",
      inset: 0,
      zIndex: 9999,
      background: "rgba(0,0,0,0.55)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px",
    }}
  >
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        width: "min(700px, 100%)",
        maxHeight: "90vh",
        overflowY: "auto",
        background: "#fff",
        borderRadius: "24px",
        padding: "25px",
        position: "relative",
        boxShadow: "0 25px 70px rgba(0,0,0,0.25)",
      }}
    >

      <button
        onClick={closeDetails}
        style={{
          position: "absolute",
          top: "15px",
          right: "15px",
          width: "38px",
          height: "38px",
          border: "none",
          borderRadius: "50%",
          background: "#f1f6f1",
          cursor: "pointer",
          fontSize: "18px",
        }}
      >
        ✕
      </button>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "minmax(250px, 1fr) minmax(250px, 1fr)",
          gap: "25px",
        }}
      >

        <div>
          {getCropImage(selectedCrop) ? (
            <img
              src={getCropImage(selectedCrop)}
              alt={selectedCrop.name}
              style={{
                width: "100%",
                height: "300px",
                objectFit: "cover",
                borderRadius: "18px",
              }}
            />
          ) : (
            <div
              style={{
                width: "100%",
                height: "300px",
                borderRadius: "18px",
                background: "#eef7ec",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "100px",
              }}
            >
              {selectedCrop.icon}
            </div>
          )}
        </div>

        <div>

          <span
            style={{
              display: "inline-block",
              padding: "6px 12px",
              borderRadius: "20px",
              background: "#eef9ec",
              color: "#287a45",
              fontSize: "12px",
              fontWeight: "700",
            }}
          >
            {selectedCrop.category || "Other"}
          </span>

          <h2
            style={{
              margin: "15px 0 8px",
              color: "#14532d",
              fontSize: "30px",
            }}
          >
            {selectedCrop.name}
          </h2>

          <div
            style={{
              fontSize: "30px",
              fontWeight: "800",
              color: "#159447",
              marginBottom: "20px",
            }}
          >
            {selectedCrop.price}
          </div>

          <p>
            👨‍🌾 <strong>Farmer:</strong>{" "}
            {selectedCrop.farmer}
          </p>

          <p>
            📍 <strong>Location:</strong>{" "}
            {selectedCrop.location}
          </p>

          <p>
            📦 <strong>Quantity:</strong>{" "}
            {selectedCrop.quantity || "Available"}
          </p>

          {selectedCrop.description && (
            <p
              style={{
                color: "#64776a",
                lineHeight: "1.6",
              }}
            >
              {selectedCrop.description}
            </p>
          )}

          <div
            style={{
              display: "flex",
              gap: "12px",
              marginTop: "25px",
            }}
          >

            <button
              onClick={closeDetails}
              style={{
                flex: 1,
                padding: "13px",
                borderRadius: "12px",
                border: "1px solid #cfe1d2",
                background: "#fff",
                fontWeight: "700",
                cursor: "pointer",
              }}
            >
              Close
            </button>

            <button
              onClick={() => {
                closeDetails();
                handleBuyCrop(selectedCrop);
              }}
              style={{
                flex: 1,
                padding: "13px",
                border: "none",
                borderRadius: "12px",
                background: "#159447",
                color: "#fff",
                fontWeight: "800",
                cursor: "pointer",
              }}
            >
              🛒 Buy Crop
            </button>

          </div>

        </div>
      </div>
    </div>
  </div>
)}

    </div>
  );
}

export default Crops;