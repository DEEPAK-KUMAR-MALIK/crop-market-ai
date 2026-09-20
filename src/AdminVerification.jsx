import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./App.css";

const API_URL = "http://localhost:5000";

function AdminVerification() {
  const navigate = useNavigate();

  // =====================================================
  // IDENTITY VERIFICATION STATES
  // =====================================================

  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  // =====================================================
  // DELIVERY STATES
  // =====================================================

  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  const [deliveryForms, setDeliveryForms] =
    useState({});

  const [deliveryProcessingId, setDeliveryProcessingId] =
    useState(null);

  // =====================================================
  // COMMON MESSAGE
  // =====================================================

  const [message, setMessage] = useState("");

    // =====================================================
  // MANDI RATE STATES
  // =====================================================

  const [mandiForm, setMandiForm] = useState({
    district: "",
    mandiName: "",
    cropName: "",
    minPrice: "",
    modalPrice: "",
    maxPrice: "",
    arrival: "",
  });

  const [mandiProcessing, setMandiProcessing] =
    useState(false);
    const [mandiRates, setMandiRates] = useState([]);
const [loadingMandiRates, setLoadingMandiRates] = useState(true);
const [editingMandiId, setEditingMandiId] = useState(null);
  // =====================================================
  // GET ADMIN SESSION
  // =====================================================

  const getAdmin = () => {
    const savedAdmin =
      localStorage.getItem("cropMarketAdmin");

    if (!savedAdmin) {
      navigate("/admin-login", {
        replace: true,
      });

      return null;
    }

    try {
      const admin = JSON.parse(savedAdmin);

      if (
        !admin ||
        admin.role !== "admin" ||
        !admin.email
      ) {
        localStorage.removeItem(
          "cropMarketAdmin"
        );

        navigate("/admin-login", {
          replace: true,
        });

        return null;
      }

      return admin;
    } catch (error) {
      console.error(
        "Admin session error:",
        error
      );

      localStorage.removeItem(
        "cropMarketAdmin"
      );

      navigate("/admin-login", {
        replace: true,
      });

      return null;
    }
  };

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    const admin = getAdmin();

    if (!admin) {
      return;
    }

    fetchUsers();
    fetchOrders();
    fetchMandiRates();
  }, []);

  // =====================================================
  // FETCH USERS
  // =====================================================

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      setMessage("");

      const admin = getAdmin();

      if (!admin) {
        return;
      }

      const response = await fetch(
        `${API_URL}/api/users`,
        {
          method: "GET",

          headers: {
            "Content-Type":
              "application/json",

            "x-admin-email":
              admin.email,
          },
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to fetch users."
        );
      }

      setUsers(
        Array.isArray(data)
          ? data
          : []
      );
    } catch (error) {
      console.error(
        "Fetch Users Error:",
        error
      );

      setMessage(
        error.message ||
          "Unable to load users."
      );
    } finally {
      setLoadingUsers(false);
    }
  };

  // =====================================================
  // FETCH ALL ORDERS
  // =====================================================

  const fetchOrders = async () => {
    try {
      setLoadingOrders(true);

      const response = await fetch(
        `${API_URL}/api/orders`,
        {
          method: "GET",

          headers: {
            "Content-Type":
              "application/json",
          },
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to fetch orders."
        );
      }

      const fetchedOrders =
        Array.isArray(data.orders)
          ? data.orders
          : [];

      setOrders(fetchedOrders);

      // =================================================
      // CREATE FORM STATE FOR EACH ORDER
      // =================================================

      const initialForms = {};

      fetchedOrders.forEach((order) => {
        initialForms[order._id] = {
          deliveryBoyName:
            order.deliveryBoyName || "",

          deliveryBoyPhone:
            order.deliveryBoyPhone || "",

          deliveryBoyLocation:
            order.deliveryBoyLocation || "",

          vehicleType:
            order.vehicleType || "4 Wheeler",

          vehicleNumber:
            order.vehicleNumber || "",

          deliveryStatus:
            order.deliveryStatus ||
            "Not Assigned",
        };
      });

      setDeliveryForms(initialForms);
    } catch (error) {
      console.error(
        "Fetch Orders Error:",
        error
      );

      setMessage(
        error.message ||
          "Unable to load orders."
      );
    } finally {
      setLoadingOrders(false);
    }
  };

  // =====================================================
  // UPDATE DELIVERY FORM
  // =====================================================

  const handleDeliveryChange = (
    orderId,
    field,
    value
  ) => {
    setDeliveryForms((previous) => ({
      ...previous,

      [orderId]: {
        ...(previous[orderId] || {}),

        [field]: value,
      },
    }));
  };

  // =====================================================
  // ASSIGN DELIVERY BOY
  // =====================================================

  const handleAssignDelivery = async (
    orderId
  ) => {
    const form =
      deliveryForms[orderId];

    if (!form) {
      return;
    }

    if (
      !form.deliveryBoyName.trim() ||
      !form.deliveryBoyPhone.trim() ||
      !form.deliveryBoyLocation.trim() ||
      !form.vehicleType.trim() ||
      !form.vehicleNumber.trim()
    ) {
      setMessage(
        "Please fill all Delivery Boy and vehicle details."
      );

      return;
    }

    try {
      setDeliveryProcessingId(orderId);
      setMessage("");

      const response = await fetch(
        `${API_URL}/api/orders/${orderId}/delivery`,
        {
          method: "PUT",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            deliveryBoyName:
              form.deliveryBoyName.trim(),

            deliveryBoyPhone:
              form.deliveryBoyPhone.trim(),

            deliveryBoyLocation:
              form.deliveryBoyLocation.trim(),

            vehicleType:
              form.vehicleType.trim(),

            vehicleNumber:
              form.vehicleNumber.trim(),

            deliveryStatus:
              form.deliveryStatus ||
              "Assigned",
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to assign delivery boy."
        );
      }

      setMessage(
        "Delivery Boy assigned successfully! 🚚"
      );

      await fetchOrders();
    } catch (error) {
      console.error(
        "Assign Delivery Error:",
        error
      );

      setMessage(
        error.message ||
          "Unable to assign delivery boy."
      );
    } finally {
      setDeliveryProcessingId(null);
    }
  };

  // =====================================================
  // APPROVE USER
  // =====================================================

  const handleApprove = async (
    userId
  ) => {
    const confirmApprove =
      window.confirm(
        "Are you sure you want to approve this user's identity?"
      );

    if (!confirmApprove) {
      return;
    }

    try {
      setProcessingId(userId);
      setMessage("");

      const admin = getAdmin();

      if (!admin) {
        return;
      }

      const response = await fetch(
        `${API_URL}/api/verification/${userId}/approve`,
        {
          method: "PUT",

          headers: {
            "Content-Type":
              "application/json",

            "x-admin-email":
              admin.email,
          },
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to approve user."
        );
      }

      setMessage(
        "User identity approved successfully. ✅"
      );

      await fetchUsers();
    } catch (error) {
      console.error(
        "Approve Error:",
        error
      );

      setMessage(
        error.message ||
          "Unable to approve user."
      );
    } finally {
      setProcessingId(null);
    }
  };

  // =====================================================
  // REJECT USER
  // =====================================================

  const handleReject = async (
    userId
  ) => {
    const confirmReject =
      window.confirm(
        "Are you sure you want to reject this user's identity?"
      );

    if (!confirmReject) {
      return;
    }

    try {
      setProcessingId(userId);
      setMessage("");

      const admin = getAdmin();

      if (!admin) {
        return;
      }

      const response = await fetch(
        `${API_URL}/api/verification/${userId}/reject`,
        {
          method: "PUT",

          headers: {
            "Content-Type":
              "application/json",

            "x-admin-email":
              admin.email,
          },
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to reject user."
        );
      }

      setMessage(
        "User identity rejected. ❌"
      );

      await fetchUsers();
    } catch (error) {
      console.error(
        "Reject Error:",
        error
      );

      setMessage(
        error.message ||
          "Unable to reject user."
      );
    } finally {
      setProcessingId(null);
    }
  };

  // =====================================================
  // ADMIN LOGOUT
  // =====================================================

  const handleAdminLogout = () => {
    localStorage.removeItem(
      "cropMarketAdmin"
    );

    navigate("/admin-login");
  };

  // =====================================================
  // FILE URL
  // =====================================================

  const getFileUrl = (filePath) => {
    if (!filePath) {
      return "";
    }

    if (filePath.startsWith("http")) {
      return filePath;
    }

    return `${API_URL}${filePath}`;
  };

  // =====================================================
  // PENDING USERS
  // =====================================================

  const pendingUsers =
    users.filter(
      (user) =>
        user.verificationStatus ===
        "pending"
    );

  // =====================================================
  // DELIVERY STATUS STYLE
  // =====================================================

  const getDeliveryStatusStyle = (
    status
  ) => {
    if (status === "Delivered") {
      return {
        color: "#16803c",
        background: "#e9f9ee",
        border:
          "1px solid #b8e8c7",
      };
    }

    if (
      status === "Out for Delivery"
    ) {
      return {
        color: "#145da0",
        background: "#eef7ff",
        border:
          "1px solid #b9ddff",
      };
    }

    if (status === "Picked Up") {
      return {
        color: "#7a4d00",
        background: "#fff6df",
        border:
          "1px solid #f1d28a",
      };
    }

    if (status === "Assigned") {
      return {
        color: "#145da0",
        background: "#eef7ff",
        border:
          "1px solid #b9ddff",
      };
    }

    return {
      color: "#666",
      background: "#f3f3f3",
      border:
        "1px solid #ddd",
    };
  };

  // =====================================================
// FETCH MANDI RATES
// =====================================================

const fetchMandiRates = async () => {
  try {
    setLoadingMandiRates(true);

    const response = await fetch(
      `${API_URL}/api/mandi-rates`
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message ||
          "Failed to fetch mandi rates."
      );
    }

    setMandiRates(
      Array.isArray(data)
        ? data
        : Array.isArray(data.rates)
        ? data.rates
        : []
    );
  } catch (error) {
    console.error(
      "Fetch Mandi Rates Error:",
      error
    );

    setMessage(
      error.message ||
        "Unable to load mandi rates."
    );
  } finally {
    setLoadingMandiRates(false);
  }
};
    // =====================================================
  // ADD MANDI RATE
  // =====================================================

  const handleMandiChange = (field, value) => {
    setMandiForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const handleAddMandiRate = async () => {
    if (
      !mandiForm.district.trim() ||
      !mandiForm.mandiName.trim() ||
      !mandiForm.cropName.trim() ||
      mandiForm.minPrice === "" ||
      mandiForm.modalPrice === "" ||
      mandiForm.maxPrice === ""
    ) {
      setMessage(
        "Please fill all required mandi rate details."
      );
      return;
    }

    try {
      setMandiProcessing(true);
      setMessage("");

      const response = await fetch(
        `${API_URL}/api/mandi-rates`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            district:
              mandiForm.district.trim(),

            mandiName:
              mandiForm.mandiName.trim(),

            cropName:
              mandiForm.cropName.trim(),

            minPrice:
              Number(mandiForm.minPrice),

            modalPrice:
              Number(mandiForm.modalPrice),

            maxPrice:
              Number(mandiForm.maxPrice),

            arrival:
              Number(mandiForm.arrival) || 0,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to add mandi rate."
        );
      }

      setMessage(
        "Mandi rate added successfully! 🌾"
      );

      setMandiForm({
        district: "",
        mandiName: "",
        cropName: "",
        minPrice: "",
        modalPrice: "",
        maxPrice: "",
        arrival: "",
      });

    } catch (error) {
      console.error(
        "Add Mandi Rate Error:",
        error
      );

      setMessage(
        error.message ||
          "Unable to add mandi rate."
      );

    } finally {
      setMandiProcessing(false);
    }
  };

  // =====================================================
// EDIT MANDI RATE
// =====================================================

const handleEditMandiRate = async (rate) => {
  try {
    setMandiProcessing(true);
    setMessage("");

    const response = await fetch(
      `${API_URL}/api/mandi-rates/${rate._id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          district: rate.district,
          mandiName: rate.mandiName,
          cropName: rate.cropName,
          minPrice: Number(rate.minPrice),
          modalPrice: Number(rate.modalPrice),
          maxPrice: Number(rate.maxPrice),
          arrival: Number(rate.arrival) || 0,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Unable to update mandi rate."
      );
    }

    setMessage(
      "Mandi rate updated successfully! ✅"
    );

    setEditingMandiId(null);

    await fetchMandiRates();
  } catch (error) {
    console.error(
      "Edit Mandi Rate Error:",
      error
    );

    setMessage(
      error.message ||
        "Unable to update mandi rate."
    );
  } finally {
    setMandiProcessing(false);
  }
};

// =====================================================
// DELETE MANDI RATE
// =====================================================

const handleDeleteMandiRate = async (id) => {
  const confirmDelete = window.confirm(
    "Are you sure you want to delete this mandi rate?"
  );

  if (!confirmDelete) {
    return;
  }

  try {
    setMandiProcessing(true);
    setMessage("");

    const response = await fetch(
      `${API_URL}/api/mandi-rates/${id}`,
      {
        method: "DELETE",
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Unable to delete mandi rate."
      );
    }

    setMessage(
      "Mandi rate deleted successfully! 🗑️"
    );

    await fetchMandiRates();
  } catch (error) {
    console.error(
      "Delete Mandi Rate Error:",
      error
    );

    setMessage(
      error.message ||
        "Unable to delete mandi rate."
    );
  } finally {
    setMandiProcessing(false);
  }
};
  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f4faf5",
      }}
    >

      {/* =================================================
          NAVBAR
      ================================================= */}

      <nav
        className="navbar"
        style={{
          background: "#ffffff",
          borderBottom:
            "1px solid #dcebdd",
        }}
      >

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

          <Link to="/dashboard">
            👤 Dashboard
          </Link>

          <button
            type="button"
            onClick={
              handleAdminLogout
            }
            style={{
              border: "none",
              background:
                "transparent",
              color: "#b42318",
              fontWeight: "700",
              cursor: "pointer",
              fontSize: "16px",
            }}
          >
            🔒 Admin Logout
          </button>

        </div>

      </nav>

      {/* =================================================
          ADMIN HEADER
      ================================================= */}

      <section
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding:
            "50px 25px 25px",
        }}
      >

        <div
          style={{
            display:
              "inline-block",
            padding:
              "8px 16px",
            borderRadius:
              "30px",
            background:
              "#e8f8e9",
            color: "#138a3d",
            fontWeight:
              "700",
            fontSize: "14px",
            letterSpacing:
              "1px",
          }}
        >
          🔐 ADMIN PANEL
        </div>

        <h1
          style={{
            marginTop: "15px",
            marginBottom: "10px",
            fontSize: "42px",
            color: "#073b2a",
          }}
        >
          CropMarket
          Admin Management
        </h1>

        <p
          style={{
            color: "#60756b",
            fontSize: "18px",
          }}
        >
          Manage identity
          verification and
          crop delivery orders.
        </p>

      </section>

      {/* =================================================
          MAIN
      ================================================= */}

      <main
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding:
            "10px 25px 60px",
        }}
      >

        {/* =================================================
            MESSAGE
        ================================================= */}

        {message && (
          <div
            style={{
              marginBottom:
                "25px",
              padding:
                "15px 20px",
              borderRadius:
                "12px",
              background:
                "#ffffff",
              border:
                "1px solid #dcebdd",
              color:
                "#145c35",
              fontWeight:
                "600",
            }}
          >
            {message}
          </div>
        )}

        {/* =================================================
            DELIVERY MANAGEMENT
        ================================================= */}

        <section
          style={{
            marginBottom:
              "50px",
          }}
        >

          <div
            style={{
              marginBottom:
                "25px",
            }}
          >

            <div
              style={{
                display:
                  "inline-block",
                padding:
                  "8px 16px",
                borderRadius:
                  "30px",
                background:
                  "#e8f8e9",
                color:
                  "#138a3d",
                fontWeight:
                  "700",
              }}
            >
              🚚 DELIVERY MANAGEMENT
            </div>

            <h2
              style={{
                marginTop:
                  "15px",
                color:
                  "#073b2a",
                fontSize:
                  "32px",
              }}
            >
              Assign Delivery Boy
            </h2>

            <p
              style={{
                color:
                  "#60756b",
              }}
            >
              Assign a 4-wheeler
              driver to crop
              orders and update
              delivery status.
            </p>

          </div>

          {/* LOADING ORDERS */}

          {loadingOrders && (
            <div
              style={{
                padding:
                  "50px",
                textAlign:
                  "center",
                background:
                  "#ffffff",
                borderRadius:
                  "20px",
                border:
                  "1px solid #dcebdd",
              }}
            >
              ⏳ Loading orders...
            </div>
          )}

          {/* NO ORDERS */}

          {!loadingOrders &&
            orders.length === 0 && (
              <div
                style={{
                  padding:
                    "50px",
                  textAlign:
                    "center",
                  background:
                    "#ffffff",
                  borderRadius:
                    "20px",
                  border:
                    "1px solid #dcebdd",
                }}
              >

                <div
                  style={{
                    fontSize:
                      "55px",
                  }}
                >
                  📦
                </div>

                <h2
                  style={{
                    color:
                      "#073b2a",
                  }}
                >
                  No Orders Found
                </h2>

                <p
                  style={{
                    color:
                      "#687d73",
                  }}
                >
                  There are no
                  crop orders
                  available right
                  now.
                </p>

                <button
                  type="button"
                  onClick={
                    fetchOrders
                  }
                  style={{
                    marginTop:
                      "15px",
                    padding:
                      "12px 22px",
                    border:
                      "none",
                    borderRadius:
                      "10px",
                    background:
                      "#159447",
                    color:
                      "#ffffff",
                    fontWeight:
                      "700",
                    cursor:
                      "pointer",
                  }}
                >
                  🔄 Refresh Orders
                </button>

              </div>
            )}

          {/* ORDERS */}

          {!loadingOrders &&
            orders.map(
              (order) => {

                const form =
                  deliveryForms[
                    order._id
                  ] || {
                    deliveryBoyName:
                      "",
                    deliveryBoyPhone:
                      "",
                    deliveryBoyLocation:
                      "",
                    vehicleType:
                      "4 Wheeler",
                    vehicleNumber:
                      "",
                    deliveryStatus:
                      "Not Assigned",
                  };

                return (
                  <div
                    key={order._id}
                    style={{
                      background:
                        "#ffffff",
                      borderRadius:
                        "20px",
                      padding:
                        "25px",
                      marginBottom:
                        "25px",
                      border:
                        "1px solid #dcebdd",
                      boxShadow:
                        "0 8px 25px rgba(0,0,0,0.06)",
                    }}
                  >

                    {/* ORDER HEADER */}

                    <div
                      style={{
                        display:
                          "flex",
                        justifyContent:
                          "space-between",
                        alignItems:
                          "center",
                        gap:
                          "20px",
                        flexWrap:
                          "wrap",
                      }}
                    >

                      <div>

                        <h2
                          style={{
                            margin:
                              "0 0 10px",
                            color:
                              "#073b2a",
                          }}
                        >
                          {order.cropIcon ||
                            "🌾"}{" "}
                          {order.cropName ||
                            "Crop"}
                        </h2>

                        <p
                          style={{
                            margin:
                              "5px 0",
                            color:
                              "#61766c",
                          }}
                        >
                          👤 Buyer:{" "}
                          <strong>
                            {order.buyerEmail ||
                              "N/A"}
                          </strong>
                        </p>

                        <p
                          style={{
                            margin:
                              "5px 0",
                            color:
                              "#61766c",
                          }}
                        >
                          👨‍🌾 Farmer:{" "}
                          <strong>
                            {order.farmer ||
                              "N/A"}
                          </strong>
                        </p>

                      </div>

                      <div
                        style={{
                          padding:
                            "8px 15px",
                          borderRadius:
                            "20px",
                          background:
                            "#fff4d6",
                          color:
                            "#9a6900",
                          fontWeight:
                            "700",
                        }}
                      >
                        📦{" "}
                        {order.status ||
                          "Placed"}
                      </div>

                    </div>

                    {/* ORDER INFORMATION */}

                    <div
                      style={{
                        display:
                          "grid",
                        gridTemplateColumns:
                          "repeat(auto-fit, minmax(220px, 1fr))",
                        gap:
                          "15px",
                        marginTop:
                          "20px",
                        padding:
                          "18px",
                        borderRadius:
                          "14px",
                        background:
                          "#f7fbf7",
                      }}
                    >

                      <div>
                        <strong>
                          📍 Pickup Location
                        </strong>

                        <p
                          style={{
                            margin:
                              "6px 0 0",
                            color:
                              "#61766c",
                          }}
                        >
                          {order.location ||
                            "N/A"}
                        </p>
                      </div>

                      <div>
                        <strong>
                          ⚖️ Quantity
                        </strong>

                        <p
                          style={{
                            margin:
                              "6px 0 0",
                            color:
                              "#61766c",
                          }}
                        >
                          {order.quantity ||
                            0}{" "}
                          Kg
                        </p>
                      </div>

                      <div>
                        <strong>
                          💰 Total Amount
                        </strong>

                        <p
                          style={{
                            margin:
                              "6px 0 0",
                            color:
                              "#61766c",
                          }}
                        >
                          ₹
                          {order.totalPrice ||
                            0}
                        </p>
                      </div>

                      <div>
                        <strong>
                          🆔 Order ID
                        </strong>

                        <p
                          style={{
                            margin:
                              "6px 0 0",
                            color:
                              "#61766c",
                            wordBreak:
                              "break-word",
                          }}
                        >
                          {order._id ||
                            "N/A"}
                        </p>
                      </div>

                    </div>

                    {/* =================================================
                        EXISTING DELIVERY DETAILS
                    ================================================= */}

                    {order.deliveryBoyName && (
                      <div
                        style={{
                          marginTop:
                            "20px",
                          padding:
                            "15px",
                          borderRadius:
                            "12px",
                          background:
                            "#eefaf1",
                          border:
                            "1px solid #c8e8cf",
                        }}
                      >

                        <strong>
                          🚚 Currently Assigned:
                        </strong>{" "}

                        {order.deliveryBoyName}

                        <span
                          style={{
                            marginLeft:
                              "10px",
                            padding:
                              "4px 10px",
                            borderRadius:
                              "20px",
                            fontSize:
                              "12px",
                            fontWeight:
                              "700",
                            ...getDeliveryStatusStyle(
                              order.deliveryStatus ||
                                "Not Assigned"
                            ),
                          }}
                        >
                          {order.deliveryStatus ||
                            "Not Assigned"}
                        </span>

                      </div>
                    )}

                    {/* =================================================
                        DELIVERY FORM
                    ================================================= */}

                    <div
                      style={{
                        marginTop:
                          "25px",
                        padding:
                          "22px",
                        borderRadius:
                          "16px",
                        background:
                          "#f3fff5",
                        border:
                          "1px solid #d8eadc",
                      }}
                    >

                      <h3
                        style={{
                          margin:
                            "0 0 20px",
                          color:
                            "#073b2a",
                        }}
                      >
                        🚚 Delivery Boy Details
                      </h3>

                      <div
                        style={{
                          display:
                            "grid",
                          gridTemplateColumns:
                            "repeat(auto-fit, minmax(240px, 1fr))",
                          gap:
                            "18px",
                        }}
                      >

                        {/* DRIVER NAME */}

                        <div>

                          <label
                            style={{
                              display:
                                "block",
                              marginBottom:
                                "7px",
                              fontWeight:
                                "700",
                              color:
                                "#315346",
                            }}
                          >
                            👤 Driver Name
                          </label>

                          <input
                            type="text"
                            value={
                              form.deliveryBoyName
                            }
                            placeholder="Enter driver name"
                            onChange={(e) =>
                              handleDeliveryChange(
                                order._id,
                                "deliveryBoyName",
                                e.target.value
                              )
                            }
                            style={{
                              width:
                                "100%",
                              boxSizing:
                                "border-box",
                              padding:
                                "12px 14px",
                              border:
                                "1px solid #cbded0",
                              borderRadius:
                                "10px",
                              fontSize:
                                "15px",
                            }}
                          />

                        </div>

                        {/* PHONE */}

                        <div>

                          <label
                            style={{
                              display:
                                "block",
                              marginBottom:
                                "7px",
                              fontWeight:
                                "700",
                              color:
                                "#315346",
                            }}
                          >
                            📞 Contact Number
                          </label>

                          <input
                            type="tel"
                            value={
                              form.deliveryBoyPhone
                            }
                            placeholder="Enter 10 digit number"
                            maxLength="10"
                            onChange={(e) =>
                              handleDeliveryChange(
                                order._id,
                                "deliveryBoyPhone",
                                e.target.value.replace(
                                  /\D/g,
                                  ""
                                )
                              )
                            }
                            style={{
                              width:
                                "100%",
                              boxSizing:
                                "border-box",
                              padding:
                                "12px 14px",
                              border:
                                "1px solid #cbded0",
                              borderRadius:
                                "10px",
                              fontSize:
                                "15px",
                            }}
                          />

                        </div>

                        {/* LOCATION */}

                        <div>

                          <label
                            style={{
                              display:
                                "block",
                              marginBottom:
                                "7px",
                              fontWeight:
                                "700",
                              color:
                                "#315346",
                            }}
                          >
                            📍 Current Location
                          </label>

                          <input
                            type="text"
                            value={
                              form.deliveryBoyLocation
                            }
                            placeholder="e.g. Kokalunda"
                            onChange={(e) =>
                              handleDeliveryChange(
                                order._id,
                                "deliveryBoyLocation",
                                e.target.value
                              )
                            }
                            style={{
                              width:
                                "100%",
                              boxSizing:
                                "border-box",
                              padding:
                                "12px 14px",
                              border:
                                "1px solid #cbded0",
                              borderRadius:
                                "10px",
                              fontSize:
                                "15px",
                            }}
                          />

                        </div>

                        {/* VEHICLE TYPE */}

                        <div>

                          <label
                            style={{
                              display:
                                "block",
                              marginBottom:
                                "7px",
                              fontWeight:
                                "700",
                              color:
                                "#315346",
                            }}
                          >
                            🚛 Vehicle Type
                          </label>

                          <select
                            value={
                              form.vehicleType
                            }
                            onChange={(e) =>
                              handleDeliveryChange(
                                order._id,
                                "vehicleType",
                                e.target.value
                              )
                            }
                            style={{
                              width:
                                "100%",
                              boxSizing:
                                "border-box",
                              padding:
                                "12px 14px",
                              border:
                                "1px solid #cbded0",
                              borderRadius:
                                "10px",
                              fontSize:
                                "15px",
                              background:
                                "#ffffff",
                            }}
                          >

                            <option value="4 Wheeler">
                              4 Wheeler
                            </option>

                            <option value="Pickup Truck">
                              Pickup Truck
                            </option>

                            <option value="Tata Ace">
                              Tata Ace
                            </option>

                            <option value="Bolero Pickup">
                              Bolero Pickup
                            </option>

                            <option value="Other">
                              Other
                            </option>

                          </select>

                        </div>

                        {/* VEHICLE NUMBER */}

                        <div>

                          <label
                            style={{
                              display:
                                "block",
                              marginBottom:
                                "7px",
                              fontWeight:
                                "700",
                              color:
                                "#315346",
                            }}
                          >
                            🔢 Vehicle Number
                          </label>

                          <input
                            type="text"
                            value={
                              form.vehicleNumber
                            }
                            placeholder="e.g. OD 07 AB 1234"
                            onChange={(e) =>
                              handleDeliveryChange(
                                order._id,
                                "vehicleNumber",
                                e.target.value.toUpperCase()
                              )
                            }
                            style={{
                              width:
                                "100%",
                              boxSizing:
                                "border-box",
                              padding:
                                "12px 14px",
                              border:
                                "1px solid #cbded0",
                              borderRadius:
                                "10px",
                              fontSize:
                                "15px",
                            }}
                          />

                        </div>

                        {/* DELIVERY STATUS */}

                        <div>

                          <label
                            style={{
                              display:
                                "block",
                              marginBottom:
                                "7px",
                              fontWeight:
                                "700",
                              color:
                                "#315346",
                            }}
                          >
                            📦 Delivery Status
                          </label>

                          <select
                            value={
                              form.deliveryStatus
                            }
                            onChange={(e) =>
                              handleDeliveryChange(
                                order._id,
                                "deliveryStatus",
                                e.target.value
                              )
                            }
                            style={{
                              width:
                                "100%",
                              boxSizing:
                                "border-box",
                              padding:
                                "12px 14px",
                              border:
                                "1px solid #cbded0",
                              borderRadius:
                                "10px",
                              fontSize:
                                "15px",
                              background:
                                "#ffffff",
                            }}
                          >

                            <option value="Not Assigned">
                              Not Assigned
                            </option>

                            <option value="Assigned">
                              Assigned
                            </option>

                            <option value="Picked Up">
                              Picked Up
                            </option>

                            <option value="Out for Delivery">
                              Out for Delivery
                            </option>

                            <option value="Delivered">
                              Delivered
                            </option>

                          </select>

                        </div>

                      </div>

                      {/* ASSIGN BUTTON */}

                      <div
                        style={{
                          marginTop:
                            "22px",
                          display:
                            "flex",
                          justifyContent:
                            "flex-end",
                        }}
                      >

                        <button
                          type="button"
                          disabled={
                            deliveryProcessingId ===
                            order._id
                          }
                          onClick={() =>
                            handleAssignDelivery(
                              order._id
                            )
                          }
                          style={{
                            border:
                              "none",
                            borderRadius:
                              "10px",
                            background:
                              "#159447",
                            color:
                              "#ffffff",
                            padding:
                              "13px 25px",
                            fontWeight:
                              "700",
                            fontSize:
                              "15px",
                            cursor:
                              deliveryProcessingId ===
                              order._id
                                ? "not-allowed"
                                : "pointer",
                            opacity:
                              deliveryProcessingId ===
                              order._id
                                ? 0.6
                                : 1,
                          }}
                        >
                          {deliveryProcessingId ===
                          order._id
                            ? "⏳ Saving..."
                            : "🚚 Assign Delivery Boy"}
                        </button>

                      </div>

                    </div>

                  </div>
                );
              }
            )}

          {/* REFRESH ORDERS */}

          {!loadingOrders &&
            orders.length > 0 && (
              <div
                style={{
                  textAlign:
                    "center",
                  marginTop:
                    "20px",
                }}
              >

                <button
                  type="button"
                  onClick={
                    fetchOrders
                  }
                  style={{
                    padding:
                      "12px 25px",
                    borderRadius:
                      "10px",
                    border:
                      "1px solid #159447",
                    background:
                      "#ffffff",
                    color:
                      "#159447",
                    fontWeight:
                      "700",
                    cursor:
                      "pointer",
                  }}
                >
                  🔄 Refresh Orders
                </button>

              </div>
            )}

        </section>

        
        {/* =================================================
            MANDI RATE MANAGEMENT
        ================================================= */}

        <section
          style={{
            marginBottom: "50px",
          }}
        >
          <div
            style={{
              marginBottom: "25px",
            }}
          >
            <div
              style={{
                display: "inline-block",
                padding: "8px 16px",
                borderRadius: "30px",
                background: "#e8f8e9",
                color: "#138a3d",
                fontWeight: "700",
              }}
            >
              🌾 MANDI RATE MANAGEMENT
            </div>

            <h2
              style={{
                marginTop: "15px",
                color: "#073b2a",
                fontSize: "32px",
              }}
            >
              Add Mandi Crop Rate
            </h2>

            <p
              style={{
                color: "#60756b",
              }}
            >
              Add current mandi prices for
              farmers and buyers.
            </p>
          </div>

          <div
            style={{
              background: "#ffffff",
              borderRadius: "20px",
              padding: "25px",
              border: "1px solid #dcebdd",
              boxShadow:
                "0 8px 25px rgba(0,0,0,0.06)",
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(240px, 1fr))",
                gap: "18px",
              }}
            >

              {/* DISTRICT */}

              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "7px",
                    fontWeight: "700",
                    color: "#315346",
                  }}
                >
                  📍 District
                </label>

                <input
                  type="text"
                  value={mandiForm.district}
                  placeholder="e.g. Gajapati"
                  onChange={(e) =>
                    handleMandiChange(
                      "district",
                      e.target.value
                    )
                  }
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    padding: "12px 14px",
                    border:
                      "1px solid #cbded0",
                    borderRadius: "10px",
                    fontSize: "15px",
                  }}
                />
              </div>

              {/* MANDI */}

              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "7px",
                    fontWeight: "700",
                    color: "#315346",
                  }}
                >
                  🏪 Mandi Name
                </label>

                <input
                  type="text"
                  value={mandiForm.mandiName}
                  placeholder="e.g. Paralakhemundi Mandi"
                  onChange={(e) =>
                    handleMandiChange(
                      "mandiName",
                      e.target.value
                    )
                  }
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    padding: "12px 14px",
                    border:
                      "1px solid #cbded0",
                    borderRadius: "10px",
                    fontSize: "15px",
                  }}
                />
              </div>

              {/* CROP */}

              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "7px",
                    fontWeight: "700",
                    color: "#315346",
                  }}
                >
                  🌾 Crop Name
                </label>

                <select
                  value={mandiForm.cropName}
                  onChange={(e) =>
                    handleMandiChange(
                      "cropName",
                      e.target.value
                    )
                  }
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    padding: "12px 14px",
                    border:
                      "1px solid #cbded0",
                    borderRadius: "10px",
                    fontSize: "15px",
                    background: "#ffffff",
                  }}
                >
                  <option value="">
                    Select Crop
                  </option>

                  <option value="Rice/Paddy">
                    🌾 Rice/Paddy
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
                </select>
              </div>

              {/* MIN PRICE */}

              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "7px",
                    fontWeight: "700",
                    color: "#315346",
                  }}
                >
                  💰 Minimum Price
                </label>

                <input
                  type="number"
                  value={mandiForm.minPrice}
                  placeholder="₹ / Quintal"
                  onChange={(e) =>
                    handleMandiChange(
                      "minPrice",
                      e.target.value
                    )
                  }
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    padding: "12px 14px",
                    border:
                      "1px solid #cbded0",
                    borderRadius: "10px",
                    fontSize: "15px",
                  }}
                />
              </div>

              {/* MODAL PRICE */}

              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "7px",
                    fontWeight: "700",
                    color: "#315346",
                  }}
                >
                  💵 Modal Price
                </label>

                <input
                  type="number"
                  value={mandiForm.modalPrice}
                  placeholder="₹ / Quintal"
                  onChange={(e) =>
                    handleMandiChange(
                      "modalPrice",
                      e.target.value
                    )
                  }
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    padding: "12px 14px",
                    border:
                      "1px solid #cbded0",
                    borderRadius: "10px",
                    fontSize: "15px",
                  }}
                />
              </div>

              {/* MAX PRICE */}

              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "7px",
                    fontWeight: "700",
                    color: "#315346",
                  }}
                >
                  💰 Maximum Price
                </label>

                <input
                  type="number"
                  value={mandiForm.maxPrice}
                  placeholder="₹ / Quintal"
                  onChange={(e) =>
                    handleMandiChange(
                      "maxPrice",
                      e.target.value
                    )
                  }
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    padding: "12px 14px",
                    border:
                      "1px solid #cbded0",
                    borderRadius: "10px",
                    fontSize: "15px",
                  }}
                />
              </div>

              {/* ARRIVAL */}

              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "7px",
                    fontWeight: "700",
                    color: "#315346",
                  }}
                >
                  📦 Arrival
                </label>

                <input
                  type="number"
                  value={mandiForm.arrival}
                  placeholder="Arrival quantity"
                  onChange={(e) =>
                    handleMandiChange(
                      "arrival",
                      e.target.value
                    )
                  }
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    padding: "12px 14px",
                    border:
                      "1px solid #cbded0",
                    borderRadius: "10px",
                    fontSize: "15px",
                  }}
                />
              </div>

            </div>

            <div
              style={{
                marginTop: "22px",
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
             <button
  type="button"
  disabled={mandiProcessing}
  onClick={() => {
    if (editingMandiId) {
      handleEditMandiRate({
        _id: editingMandiId,
        ...mandiForm,
      });
    } else {
      handleAddMandiRate();
    }
  }}
  style={{
    border: "none",
    borderRadius: "10px",
    background: editingMandiId
      ? "#2563eb"
      : "#159447",
    color: "#ffffff",
    padding: "13px 25px",
    fontWeight: "700",
    fontSize: "15px",
    cursor: mandiProcessing
      ? "not-allowed"
      : "pointer",
    opacity: mandiProcessing ? 0.6 : 1,
  }}
>
  {mandiProcessing
    ? "⏳ Saving..."
    : editingMandiId
    ? "✏️ Update Mandi Rate"
    : "🌾 Add Mandi Rate"}
</button>
            </div>
          </div>
          {/* =================================================
    SAVED MANDI RATES
================================================= */}

<div
  style={{
    marginTop: "30px",
    background: "#ffffff",
    borderRadius: "20px",
    padding: "25px",
    border: "1px solid #dcebdd",
  }}
>
  <h3 style={{ color: "#073b2a" }}>
    📋 Saved Mandi Rates
  </h3>

  {loadingMandiRates ? (
    <p>⏳ Loading mandi rates...</p>
  ) : mandiRates.length === 0 ? (
    <p>No mandi rates found.</p>
  ) : (
    mandiRates.map((rate) => (
      <div
        key={rate._id}
        style={{
          padding: "18px",
          marginTop: "15px",
          borderRadius: "14px",
          background: "#f7fbf7",
          border: "1px solid #dcebdd",
        }}
      >
        <strong>
          🏪 {rate.mandiName}
        </strong>

        <p>
          📍 {rate.district} | 🌾 {rate.cropName}
        </p>

        <p>
          Min: ₹{rate.minPrice} | Modal: ₹
          {rate.modalPrice} | Max: ₹
          {rate.maxPrice}
        </p>

        <p>
          📦 Arrival: {rate.arrival}
        </p>

        <div
          style={{
            display: "flex",
            gap: "10px",
            marginTop: "12px",
          }}
        >
          <button
            type="button"
            onClick={() => {
              setEditingMandiId(rate._id);
              setMandiForm({
                district: rate.district || "",
                mandiName: rate.mandiName || "",
                cropName: rate.cropName || "",
                minPrice: rate.minPrice ?? "",
                modalPrice: rate.modalPrice ?? "",
                maxPrice: rate.maxPrice ?? "",
                arrival: rate.arrival ?? "",
              });
            }}
          >
            ✏️ Edit
          </button>

          
          <button
  type="button"
  onClick={() =>
    handleDeleteMandiRate(rate._id)
  }
  disabled={mandiProcessing}
  style={{
    border: "none",
    borderRadius: "10px",
    background: "#dc2626",
    color: "#ffffff",
    padding: "10px 18px",
    fontWeight: "700",
    cursor: mandiProcessing
      ? "not-allowed"
      : "pointer",
    opacity: mandiProcessing ? 0.6 : 1,
  }}
>
  🗑️ Delete
</button>
        </div>
      </div>
    ))
  )}
</div>
        </section>

        {/* =================================================
            IDENTITY VERIFICATION
        ================================================= */}

        <section>

          <div
            style={{
              marginBottom:
                "25px",
            }}
          >

            <div
              style={{
                display:
                  "inline-block",
                padding:
                  "8px 16px",
                borderRadius:
                  "30px",
                background:
                  "#e8f8e9",
                color:
                  "#138a3d",
                fontWeight:
                  "700",
              }}
            >
              🔐 IDENTITY VERIFICATION
            </div>

            <h2
              style={{
                marginTop:
                  "15px",
                color:
                  "#073b2a",
                fontSize:
                  "32px",
              }}
            >
              Pending Verification
            </h2>

            <p
              style={{
                color:
                  "#60756b",
              }}
            >
              Review farmer and
              buyer identity
              documents before
              approving their
              accounts.
            </p>

          </div>

          {/* LOADING USERS */}

          {loadingUsers && (
            <div
              style={{
                padding:
                  "50px",
                textAlign:
                  "center",
                background:
                  "#ffffff",
                borderRadius:
                  "20px",
              }}
            >
              ⏳ Loading verification
              requests...
            </div>
          )}

          {/* NO PENDING USERS */}

          {!loadingUsers &&
            pendingUsers.length ===
              0 && (
              <div
                style={{
                  padding:
                    "60px 30px",
                  textAlign:
                    "center",
                  background:
                    "#ffffff",
                  borderRadius:
                    "20px",
                  border:
                    "1px solid #dcebdd",
                }}
              >

                <div
                  style={{
                    fontSize:
                      "60px",
                  }}
                >
                  🎉
                </div>

                <h2
                  style={{
                    color:
                      "#073b2a",
                  }}
                >
                  No Pending
                  Verifications
                </h2>

                <p
                  style={{
                    color:
                      "#687d73",
                  }}
                >
                  All farmer and
                  buyer identity
                  requests have
                  been reviewed.
                </p>

                <button
                  type="button"
                  onClick={
                    fetchUsers
                  }
                  style={{
                    marginTop:
                      "15px",
                    padding:
                      "12px 22px",
                    border:
                      "none",
                    borderRadius:
                      "10px",
                    background:
                      "#159447",
                    color:
                      "#ffffff",
                    fontWeight:
                      "700",
                    cursor:
                      "pointer",
                  }}
                >
                  🔄 Refresh
                </button>

              </div>
            )}

          {/* PENDING USER CARDS */}

          {!loadingUsers &&
            pendingUsers.map(
              (user) => (

                <div
                  key={user._id}
                  style={{
                    background:
                      "#ffffff",
                    borderRadius:
                      "20px",
                    padding:
                      "25px",
                    marginBottom:
                      "25px",
                    border:
                      "1px solid #dcebdd",
                    boxShadow:
                      "0 8px 25px rgba(0,0,0,0.06)",
                  }}
                >

                  {/* USER HEADER */}

                  <div
                    style={{
                      display:
                        "flex",
                      justifyContent:
                        "space-between",
                      alignItems:
                        "center",
                      gap:
                        "20px",
                      flexWrap:
                        "wrap",
                    }}
                  >

                    <div>

                      <h2
                        style={{
                          margin:
                            "0 0 8px",
                          color:
                            "#073b2a",
                        }}
                      >
                        {user.name}
                      </h2>

                      <p
                        style={{
                          margin:
                            "4px 0",
                          color:
                            "#61766c",
                        }}
                      >
                        📧{" "}
                        {user.email}
                      </p>

                      <p
                        style={{
                          margin:
                            "4px 0",
                          color:
                            "#61766c",
                        }}
                      >
                        📱{" "}
                        {user.phone}
                      </p>

                    </div>

                    <div
                      style={{
                        padding:
                          "8px 15px",
                        borderRadius:
                          "20px",
                        background:
                          "#fff4d6",
                        color:
                          "#9a6900",
                        fontWeight:
                          "700",
                      }}
                    >

                      {user.role ===
                      "farmer"
                        ? "👨‍🌾 Farmer"
                        : "🛒 Buyer"}

                      {" • "}

                      Pending

                    </div>

                  </div>

                  {/* DOCUMENTS */}

                  <div
                    style={{
                      display:
                        "grid",
                      gridTemplateColumns:
                        "repeat(auto-fit, minmax(280px, 1fr))",
                      gap:
                        "25px",
                      marginTop:
                        "25px",
                    }}
                  >

                    {/* PROFILE PHOTO */}

                    <div
                      style={{
                        border:
                          "1px solid #e1ece3",
                        borderRadius:
                          "15px",
                        padding:
                          "15px",
                      }}
                    >

                      <h3
                        style={{
                          marginTop:
                            "0",
                          color:
                            "#073b2a",
                        }}
                      >
                        🖼️ Profile Photo
                      </h3>

                      {user.profilePhoto ? (
                        <img
                          src={getFileUrl(
                            user.profilePhoto
                          )}
                          alt="Profile"
                          style={{
                            width:
                              "100%",
                            height:
                              "280px",
                            objectFit:
                              "contain",
                            borderRadius:
                              "12px",
                            background:
                              "#f4faf5",
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            padding:
                              "80px 20px",
                            textAlign:
                              "center",
                            color:
                              "#777",
                          }}
                        >
                          No profile photo
                        </div>
                      )}

                    </div>

                    {/* IDENTITY DOCUMENT */}

                    <div
                      style={{
                        border:
                          "1px solid #e1ece3",
                        borderRadius:
                          "15px",
                        padding:
                          "15px",
                      }}
                    >

                      <h3
                        style={{
                          marginTop:
                            "0",
                          color:
                            "#073b2a",
                        }}
                      >
                        📄 Identity Document
                      </h3>

                      {user.identityDocument ? (
                        <img
                          src={getFileUrl(
                            user.identityDocument
                          )}
                          alt="Identity Document"
                          style={{
                            width:
                              "100%",
                            height:
                              "280px",
                            objectFit:
                              "contain",
                            borderRadius:
                              "12px",
                            background:
                              "#f4faf5",
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            padding:
                              "80px 20px",
                            textAlign:
                              "center",
                            color:
                              "#777",
                          }}
                        >
                          No identity document
                        </div>
                      )}

                    </div>

                  </div>

                  {/* APPROVE / REJECT */}

                  <div
                    style={{
                      display:
                        "flex",
                      justifyContent:
                        "flex-end",
                      gap:
                        "15px",
                      marginTop:
                        "25px",
                      flexWrap:
                        "wrap",
                    }}
                  >

                    <button
                      type="button"
                      disabled={
                        processingId ===
                        user._id
                      }
                      onClick={() =>
                        handleReject(
                          user._id
                        )
                      }
                      style={{
                        padding:
                          "13px 25px",
                        borderRadius:
                          "10px",
                        border:
                          "1px solid #dc3545",
                        background:
                          "#fff",
                        color:
                          "#dc3545",
                        fontWeight:
                          "700",
                        cursor:
                          "pointer",
                      }}
                    >
                      ❌ Reject
                    </button>

                    <button
                      type="button"
                      disabled={
                        processingId ===
                        user._id
                      }
                      onClick={() =>
                        handleApprove(
                          user._id
                        )
                      }
                      style={{
                        padding:
                          "13px 28px",
                        border:
                          "none",
                        borderRadius:
                          "10px",
                        background:
                          "#159447",
                        color:
                          "#ffffff",
                        fontWeight:
                          "700",
                        cursor:
                          "pointer",
                      }}
                    >
                      {processingId ===
                      user._id
                        ? "⏳ Processing..."
                        : "✅ Approve Identity"}
                    </button>

                  </div>

                </div>

              )
            )}

          {/* REFRESH USERS */}

          {!loadingUsers &&
            pendingUsers.length >
              0 && (
              <div
                style={{
                  textAlign:
                    "center",
                  marginTop:
                    "30px",
                }}
              >

                <button
                  type="button"
                  onClick={
                    fetchUsers
                  }
                  style={{
                    padding:
                      "12px 25px",
                    borderRadius:
                      "10px",
                    border:
                      "1px solid #159447",
                    background:
                      "#ffffff",
                    color:
                      "#159447",
                    fontWeight:
                      "700",
                    cursor:
                      "pointer",
                  }}
                >
                  🔄 Refresh Requests
                </button>

              </div>
            )}

        </section>

      </main>

      {/* =================================================
          FOOTER
      ================================================= */}

      <footer
        style={{
          marginTop:
            "30px",
        }}
      >

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

export default AdminVerification;