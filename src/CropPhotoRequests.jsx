import React, { useEffect, useState } from "react";

const API_URL = "http://localhost:5000";

export default function CropPhotoRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadingId, setUploadingId] = useState(null);
  const [rejectingId, setRejectingId] = useState(null);
  const [message, setMessage] = useState("");

  // =====================================================
  // GET LOGGED-IN FARMER
  // =====================================================

  let user = null;

  try {
    user =
      JSON.parse(
        localStorage.getItem("cropMarketLoggedInUser")
      ) ||
      JSON.parse(
        localStorage.getItem("user")
      );
  } catch (error) {
    console.error(
      "Invalid user data:",
      error
    );
  }

  const farmerEmail =
    user?.email || "";

  // =====================================================
  // FETCH FARMER PHOTO REQUESTS
  // =====================================================

  useEffect(() => {
    if (farmerEmail) {
      fetchRequests();
    } else {
      setLoading(false);
      setMessage(
        "Farmer login information not found."
      );
    }
  }, [farmerEmail]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setMessage("");

      const response =
        await fetch(
          `${API_URL}/api/crop-photo-requests/farmer/${encodeURIComponent(
            farmerEmail
          )}`
        );

      const data =
        await response.json();

      if (!response.ok) {
        setMessage(
          data.message ||
            "Unable to load photo requests."
        );

        return;
      }

      setRequests(
        data.requests || []
      );

    } catch (error) {
      console.error(
        "Fetch photo requests error:",
        error
      );

      setMessage(
        "Server connection error. Make sure backend is running."
      );

    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // UPLOAD PHOTO
  // =====================================================

  const handleUpload = async (
    requestId,
    file
  ) => {
    if (!file) {
      return;
    }

    // Check image
    if (
      !file.type.startsWith(
        "image/"
      )
    ) {
      alert(
        "Please select an image file."
      );

      return;
    }

    // Maximum 5 MB
    if (
      file.size >
      5 * 1024 * 1024
    ) {
      alert(
        "Photo size must be less than 5 MB."
      );

      return;
    }

    try {
      setUploadingId(requestId);
      setMessage("");

      const formData =
        new FormData();

      formData.append(
        "photo",
        file
      );

      // IMPORTANT:
      // Backend requires farmerEmail
      formData.append(
        "farmerEmail",
        farmerEmail
      );

      const response =
        await fetch(
          `${API_URL}/api/crop-photo-requests/${requestId}/upload`,
          {
            method: "POST",
            body: formData,
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        setMessage(
          data.message ||
            "Photo upload failed."
        );

        return;
      }

      setMessage(
        "Crop photo uploaded successfully! 📸"
      );

      await fetchRequests();

    } catch (error) {
      console.error(
        "Upload error:",
        error
      );

      setMessage(
        "Server connection error."
      );

    } finally {
      setUploadingId(null);
    }
  };

  // =====================================================
  // REJECT REQUEST
  // =====================================================

  const handleReject = async (
    requestId
  ) => {
    const confirmReject =
      window.confirm(
        "Are you sure you want to reject this photo request?"
      );

    if (!confirmReject) {
      return;
    }

    try {
      setRejectingId(requestId);
      setMessage("");

      const response =
        await fetch(
          `${API_URL}/api/crop-photo-requests/${requestId}/reject`,
          {
            method: "PUT",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              farmerEmail:
                farmerEmail,
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        setMessage(
          data.message ||
            "Unable to reject request."
        );

        return;
      }

      setMessage(
        "Photo request rejected."
      );

      await fetchRequests();

    } catch (error) {
      console.error(
        "Reject error:",
        error
      );

      setMessage(
        "Server connection error."
      );

    } finally {
      setRejectingId(null);
    }
  };

  // =====================================================
  // PHOTO URL
  // =====================================================

  const getPhotoUrl = (
    photoUrl
  ) => {
    if (!photoUrl) {
      return "";
    }

    if (
      photoUrl.startsWith(
        "http://"
      ) ||
      photoUrl.startsWith(
        "https://"
      )
    ) {
      return photoUrl;
    }

    return `${API_URL}${photoUrl}`;
  };

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div style={styles.page}>

      <div style={styles.container}>

        {/* =================================================
            HEADER
        ================================================= */}

        <div style={styles.header}>

          <div style={styles.badge}>
            🌱 FARMER
          </div>

          <h1 style={styles.title}>
            Crop Photo{" "}
            <span style={styles.titleGreen}>
              Requests
            </span>
          </h1>

          <p style={styles.subtitle}>
            Buyers can request fresh photos
            of your crops before placing an
            order.
          </p>

          <p style={styles.email}>
            👨‍🌾 Farmer:{" "}
            <strong>
              {farmerEmail ||
                "Not logged in"}
            </strong>
          </p>

        </div>

        {/* =================================================
            MESSAGE
        ================================================= */}

        {message && (
          <div style={styles.message}>
            {message}
          </div>
        )}

        {/* =================================================
            LOADING
        ================================================= */}

        {loading ? (

          <div style={styles.emptyBox}>

            <div style={styles.loadingIcon}>
              ⏳
            </div>

            <h2>
              Loading requests...
            </h2>

          </div>

        ) : requests.length === 0 ? (

          /* =================================================
              NO REQUESTS
          ================================================= */

          <div style={styles.emptyBox}>

            <div style={styles.emptyIcon}>
              📸
            </div>

            <h2>
              No Photo Requests
            </h2>

            <p>
              When a buyer requests a
              fresh crop photo, the request
              will appear here.
            </p>

            <button
              onClick={fetchRequests}
              style={styles.refreshButton}
            >
              🔄 Refresh
            </button>

          </div>

        ) : (

          /* =================================================
              REQUEST LIST
          ================================================= */

          <div style={styles.grid}>

            {requests.map(
              (request) => {

                const status =
                  request.status ||
                  "Pending";

                const isUploading =
                  uploadingId ===
                  request._id;

                const isRejecting =
                  rejectingId ===
                  request._id;

                return (

                  <div
                    key={request._id}
                    style={styles.card}
                  >

                    {/* CARD TOP */}

                    <div
                      style={styles.cardTop}
                    >

                      <div
                        style={
                          styles.cropIcon
                        }
                      >
                        🌱
                      </div>

                      <span
                        style={{
                          ...styles.status,
                          background:
                            status ===
                            "Pending"
                              ? "#fff4d6"
                              : status ===
                                "Photo Uploaded"
                              ? "#e6f8ed"
                              : "#ffe8e8",

                          color:
                            status ===
                            "Pending"
                              ? "#9a6800"
                              : status ===
                                "Photo Uploaded"
                              ? "#087a3c"
                              : "#c62828",
                        }}
                      >
                        {status}
                      </span>

                    </div>

                    {/* CROP NAME */}

                    <h2
                      style={
                        styles.cropName
                      }
                    >
                      {request.cropName ||
                        "Crop"}
                    </h2>

                    {/* INFO */}

                    <div
                      style={styles.info}
                    >

                      <p>
                        <strong>
                          🛒 Buyer:
                        </strong>{" "}
                        {request.buyerEmail ||
                          "Buyer"}
                      </p>

                      <p>
                        <strong>
                          📅 Request:
                        </strong>{" "}
                        {request.createdAt
                          ? new Date(
                              request.createdAt
                            ).toLocaleString()
                          : "Recently"}
                      </p>

                      {request.message && (
                        <p>
                          <strong>
                            💬 Message:
                          </strong>{" "}
                          {request.message}
                        </p>
                      )}

                    </div>

                    {/* =================================================
                        EXISTING PHOTO
                    ================================================= */}

                    {request.photoUrl && (

                      <div
                        style={
                          styles.photoSection
                        }
                      >

                        <p
                          style={
                            styles.photoTitle
                          }
                        >
                          📸 Uploaded Crop Photo
                        </p>

                        <img
                          src={getPhotoUrl(
                            request.photoUrl
                          )}
                          alt={
                            request.cropName ||
                            "Crop"
                          }
                          style={
                            styles.photo
                          }
                        />

                      </div>

                    )}

                    {/* =================================================
                        ACTIONS
                    ================================================= */}

                    {status !==
                      "Photo Uploaded" &&
                      status !==
                        "Rejected" && (

                      <div
                        style={
                          styles.actions
                        }
                      >

                        {/* UPLOAD */}

                        <label
                          style={{
                            ...styles.uploadButton,

                            opacity:
                              isUploading ||
                              isRejecting
                                ? 0.6
                                : 1,

                            cursor:
                              isUploading ||
                              isRejecting
                                ? "not-allowed"
                                : "pointer",
                          }}
                        >

                          {isUploading
                            ? "⏳ Uploading..."
                            : "📸 Upload Fresh Photo"}

                          <input
                            type="file"
                            accept="image/*"
                            style={{
                              display:
                                "none",
                            }}
                            disabled={
                              isUploading ||
                              isRejecting
                            }
                            onChange={(
                              event
                            ) => {

                              const file =
                                event
                                  .target
                                  .files?.[0];

                              handleUpload(
                                request._id,
                                file
                              );

                              event.target.value =
                                "";
                            }}
                          />

                        </label>

                        {/* REJECT */}

                        <button
                          type="button"
                          onClick={() =>
                            handleReject(
                              request._id
                            )
                          }
                          disabled={
                            isUploading ||
                            isRejecting
                          }
                          style={{
                            ...styles.rejectButton,

                            opacity:
                              isRejecting
                                ? 0.6
                                : 1,
                          }}
                        >
                          {isRejecting
                            ? "⏳ Rejecting..."
                            : "❌ Reject"}
                        </button>

                      </div>

                    )}

                    {/* =================================================
                        UPLOADED MESSAGE
                    ================================================= */}

                    {status ===
                      "Photo Uploaded" && (

                      <div
                        style={
                          styles.uploadedBox
                        }
                      >
                        ✅ Fresh photo sent
                        to the buyer.
                      </div>

                    )}

                    {status ===
                      "Rejected" && (

                      <div
                        style={
                          styles.rejectedBox
                        }
                      >
                        ❌ This request was
                        rejected.
                      </div>

                    )}

                  </div>
                );
              }
            )}

          </div>

        )}

        {/* =================================================
            REFRESH
        ================================================= */}

        {requests.length > 0 && (

          <div
            style={
              styles.bottomActions
            }
          >

            <button
              onClick={fetchRequests}
              disabled={loading}
              style={
                styles.refreshButton
              }
            >
              🔄 Refresh Requests
            </button>

          </div>

        )}

      </div>

    </div>
  );
}

// =====================================================
// STYLES
// =====================================================

const styles = {

  page: {
    minHeight:
      "100vh",
    background:
      "#f4faf5",
    padding:
      "40px 20px",
    fontFamily:
      "Arial, sans-serif",
  },

  container: {
    maxWidth:
      "1150px",
    margin:
      "0 auto",
  },

  header: {
    textAlign:
      "center",
    marginBottom:
      "35px",
  },

  badge: {
    display:
      "inline-block",
    padding:
      "10px 22px",
    borderRadius:
      "25px",
    background:
      "#e8f8e9",
    color:
      "#087a3c",
    fontWeight:
      "700",
    letterSpacing:
      "1px",
    marginBottom:
      "15px",
  },

  title: {
    fontSize:
      "42px",
    margin:
      "10px 0",
    color:
      "#073b2a",
  },

  titleGreen: {
    color:
      "#1fa64a",
  },

  subtitle: {
    fontSize:
      "17px",
    color:
      "#61766b",
    maxWidth:
      "700px",
    margin:
      "0 auto 10px",
    lineHeight:
      "1.6",
  },

  email: {
    color:
      "#355d4c",
    fontSize:
      "14px",
  },

  message: {
    background:
      "#e9f8ed",
    color:
      "#087a3c",
    padding:
      "14px 18px",
    borderRadius:
      "12px",
    marginBottom:
      "25px",
    textAlign:
      "center",
    fontWeight:
      "600",
  },

  emptyBox: {
    background:
      "#ffffff",
    borderRadius:
      "20px",
    padding:
      "60px 30px",
    textAlign:
      "center",
    boxShadow:
      "0 10px 30px rgba(0,0,0,0.06)",
  },

  emptyIcon: {
    fontSize:
      "60px",
    marginBottom:
      "15px",
  },

  loadingIcon: {
    fontSize:
      "45px",
  },

  grid: {
    display:
      "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(330px, 1fr))",
    gap:
      "25px",
  },

  card: {
    background:
      "#ffffff",
    borderRadius:
      "20px",
    padding:
      "25px",
    boxShadow:
      "0 10px 30px rgba(0,0,0,0.07)",
    border:
      "1px solid #e1eee3",
  },

  cardTop: {
    display:
      "flex",
    justifyContent:
      "space-between",
    alignItems:
      "center",
    marginBottom:
      "15px",
  },

  cropIcon: {
    width:
      "60px",
    height:
      "60px",
    borderRadius:
      "16px",
    background:
      "#ecfaed",
    display:
      "flex",
    alignItems:
      "center",
    justifyContent:
      "center",
    fontSize:
      "30px",
  },

  status: {
    padding:
      "8px 13px",
    borderRadius:
      "20px",
    fontSize:
      "13px",
    fontWeight:
      "700",
  },

  cropName: {
    color:
      "#073b2a",
    margin:
      "10px 0 18px",
    fontSize:
      "26px",
  },

  info: {
    background:
      "#f7faf8",
    padding:
      "15px",
    borderRadius:
      "12px",
    marginBottom:
      "18px",
  },

  infoText: {
    color:
      "#52675c",
  },

  photoSection: {
    marginTop:
      "18px",
    marginBottom:
      "18px",
  },

  photoTitle: {
    fontWeight:
      "700",
    color:
      "#073b2a",
    marginBottom:
      "10px",
  },

  photo: {
    width:
      "100%",
    maxHeight:
      "300px",
    objectFit:
      "cover",
    borderRadius:
      "14px",
    border:
      "1px solid #dbe9dd",
  },

  actions: {
    display:
      "flex",
    gap:
      "10px",
    marginTop:
      "20px",
  },

  uploadButton: {
    flex:
      1,
    background:
      "#1fa64a",
    color:
      "#ffffff",
    padding:
      "13px 12px",
    borderRadius:
      "10px",
    textAlign:
      "center",
    fontWeight:
      "700",
    cursor:
      "pointer",
  },

  rejectButton: {
    background:
      "#fff0f0",
    color:
      "#c62828",
    border:
      "1px solid #ffd0d0",
    padding:
      "13px 18px",
    borderRadius:
      "10px",
    fontWeight:
      "700",
    cursor:
      "pointer",
  },

  uploadedBox: {
    marginTop:
      "15px",
    background:
      "#e8f8ed",
    color:
      "#087a3c",
    padding:
      "13px",
    borderRadius:
      "10px",
    textAlign:
      "center",
    fontWeight:
      "700",
  },

  rejectedBox: {
    marginTop:
      "15px",
    background:
      "#fff0f0",
    color:
      "#c62828",
    padding:
      "13px",
    borderRadius:
      "10px",
    textAlign:
      "center",
    fontWeight:
      "700",
  },

  bottomActions: {
    textAlign:
      "center",
    marginTop:
      "30px",
  },

  refreshButton: {
    border:
      "none",
    background:
      "#087a3c",
    color:
      "#ffffff",
    padding:
      "13px 25px",
    borderRadius:
      "10px",
    fontWeight:
      "700",
    cursor:
      "pointer",
  },
};