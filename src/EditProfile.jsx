import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./App.css";

const API_URL = "http://localhost:5000";

function EditProfile() {
  const navigate = useNavigate();

  const savedUser =
    JSON.parse(localStorage.getItem("cropMarketUser")) || {};

  const [name, setName] = useState(savedUser.name || "");
  const [email] = useState(savedUser.email || "");
  const [phone, setPhone] = useState(savedUser.phone || "");
  const [role, setRole] = useState(savedUser.role || "buyer");

  // =====================================================
  // PROFILE PHOTO
  // =====================================================

  const [profilePhoto, setProfilePhoto] = useState(
    savedUser.profilePhoto || ""
  );

  const [selectedPhoto, setSelectedPhoto] = useState(null);

  const [photoPreview, setPhotoPreview] = useState(
    savedUser.profilePhoto
      ? `${API_URL}${savedUser.profilePhoto}`
      : ""
  );

  const [saving, setSaving] = useState(false);

  // =====================================================
  // PHOTO URL HELPER
  // =====================================================

  const getPhotoUrl = (photo) => {
    if (!photo) {
      return "";
    }

    if (photo.startsWith("http://")) {
      return photo;
    }

    if (photo.startsWith("https://")) {
      return photo;
    }

    if (photo.startsWith("/")) {
      return `${API_URL}${photo}`;
    }

    return `${API_URL}/${photo}`;
  };

  // =====================================================
  // SELECT PROFILE PHOTO
  // =====================================================

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      alert(
        "Only JPG, JPEG, PNG and WEBP images are allowed."
      );

      e.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert(
        "Profile photo must be smaller than 5 MB."
      );

      e.target.value = "";
      return;
    }

    setSelectedPhoto(file);

    const previewUrl = URL.createObjectURL(file);

    setPhotoPreview(previewUrl);
  };

  // =====================================================
  // CANCEL SELECTED PHOTO
  // =====================================================

  const handleRemovePhoto = () => {
    setSelectedPhoto(null);

    setPhotoPreview(
      profilePhoto
        ? getPhotoUrl(profilePhoto)
        : ""
    );

    const input =
      document.getElementById("profilePhoto");

    if (input) {
      input.value = "";
    }
  };

  // =====================================================
  // SAVE PROFILE
  // =====================================================

  const handleSave = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      alert("Please enter your full name.");
      return;
    }

    if (!phone.trim()) {
      alert("Please enter your phone number.");
      return;
    }

    if (phone.trim().length < 10) {
      alert("Please enter a valid phone number.");
      return;
    }

    if (role !== "farmer" && role !== "buyer") {
      alert("Please select Farmer or Buyer.");
      return;
    }

    if (!email.trim()) {
      alert(
        "User email not found. Please login again."
      );
      return;
    }

    try {
      setSaving(true);

      let uploadedProfilePhoto =
        profilePhoto;

      // ===================================================
      // UPLOAD PROFILE PHOTO
      // ===================================================

      if (selectedPhoto) {
        const photoFormData = new FormData();

        photoFormData.append(
          "email",
          email.trim().toLowerCase()
        );

        photoFormData.append(
          "profilePhoto",
          selectedPhoto
        );

        const photoResponse =
          await fetch(
            `${API_URL}/api/verification/upload`,
            {
              method: "POST",
              body: photoFormData,
            }
          );

        const photoText =
          await photoResponse.text();

        let photoData = {};

        try {
          photoData =
            JSON.parse(photoText);
        } catch {
          photoData = {};
        }

        if (!photoResponse.ok) {
          alert(
            photoData.message ||
              "Profile photo upload failed."
          );

          return;
        }

        uploadedProfilePhoto =
          photoData.user?.profilePhoto ||
          "";

        if (!uploadedProfilePhoto) {
          alert(
            "Photo uploaded but server did not return the photo URL."
          );

          return;
        }

        setProfilePhoto(
          uploadedProfilePhoto
        );

        setPhotoPreview(
          getPhotoUrl(
            uploadedProfilePhoto
          )
        );

        console.log(
          "PROFILE PHOTO SAVED:",
          uploadedProfilePhoto
        );
      }

      // ===================================================
      // UPDATE PROFILE INFORMATION
      // ===================================================

      const response = await fetch(
        `${API_URL}/api/profile/${encodeURIComponent(
          email.trim()
        )}`,
        {
          method: "PUT",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            name: name.trim(),
            phone: phone.trim(),
            role: role,
          }),
        }
      );

      const responseText =
        await response.text();

      let data = {};

      try {
        data = JSON.parse(responseText);
      } catch {
        data = {};
      }

      if (!response.ok) {
        alert(
          data.message ||
            "Failed to update profile."
        );

        return;
      }

      // ===================================================
      // FINAL PROFILE PHOTO
      // ===================================================

      const finalProfilePhoto =
        uploadedProfilePhoto ||
        data.user?.profilePhoto ||
        savedUser.profilePhoto ||
        "";

      // ===================================================
      // UPDATE LOCAL STORAGE
      // ===================================================

      const updatedUser = {
        ...savedUser,

        id:
          data.user?.id ||
          savedUser.id,

        name:
          data.user?.name ||
          name.trim(),

        email:
          data.user?.email ||
          email,

        phone:
          data.user?.phone ||
          phone.trim(),

        role:
          data.user?.role ||
          role,

        verificationStatus:
          data.user?.verificationStatus ||
          savedUser.verificationStatus ||
          "pending",

        identityDocument:
          data.user?.identityDocument ||
          savedUser.identityDocument ||
          "",

        profilePhoto:
          finalProfilePhoto,
      };

      localStorage.setItem(
        "cropMarketUser",
        JSON.stringify(updatedUser)
      );

      // ===================================================
      // SUCCESS
      // ===================================================

      alert(
        "Profile updated successfully! 🌱"
      );

      navigate("/dashboard");

    } catch (error) {
      console.error(
        "PROFILE UPDATE ERROR:",
        error
      );

      alert(
        "Server connection error. Please make sure backend is running on port 5000."
      );

    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // CURRENT PHOTO
  // =====================================================

  const currentPhoto =
    photoPreview ||
    getPhotoUrl(profilePhoto);

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="edit-profile-page">

      {/* ================= NAVBAR ================= */}

      <nav className="navbar">

        <Link
          to="/"
          className="logo"
        >
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

          <Link to="/orders">
            📦 My Orders
          </Link>

          <Link to="/dashboard">
            👤 Dashboard
          </Link>

        </div>

      </nav>

      {/* ================= HEADER ================= */}

      <section className="edit-profile-header">

        <div className="edit-header-icon">
          ✏️
        </div>

        <div>

          <div className="edit-label">
            👤 ACCOUNT SETTINGS
          </div>

          <h1>
            Edit Profile
          </h1>

          <p>
            Update your CropMarket account information.
          </p>

        </div>

      </section>

      {/* ================= MAIN ================= */}

      <section className="edit-profile-section">

        <div className="edit-profile-card">

          {/* CARD HEADER */}

          <div className="edit-card-heading">

            <div className="edit-card-icon">
              👤
            </div>

            <div>

              <h2>
                Personal Information
              </h2>

              <p>
                Keep your account details up to date.
              </p>

            </div>

          </div>

          {/* ================= FORM ================= */}

          <form
            className="edit-profile-form"
            onSubmit={handleSave}
          >

            {/* =================================================
                PROFILE PHOTO
            ================================================= */}

            <div className="edit-form-group">

              <label>
                Profile Photo
              </label>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "20px",
                  flexWrap: "wrap",
                  marginTop: "10px",
                }}
              >

                {/* PHOTO PREVIEW */}

                <div
                  style={{
                    width: "120px",
                    height: "120px",
                    borderRadius: "50%",
                    overflow: "hidden",
                    border: "3px solid #ddd",
                    background: "#f2f2f2",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >

                  {currentPhoto ? (

                    <img
                      src={currentPhoto}
                      alt="Profile"
                      onError={(e) => {
                        e.currentTarget.style.display =
                          "none";
                      }}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        display: "block",
                      }}
                    />

                  ) : (

                    <span
                      style={{
                        fontSize: "55px",
                      }}
                    >
                      {role === "farmer"
                        ? "👨‍🌾"
                        : "🛒"}
                    </span>

                  )}

                </div>

                {/* PHOTO BUTTONS */}

                <div>

                  <input
                    id="profilePhoto"
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handlePhotoChange}
                    disabled={saving}
                    style={{
                      display: "none",
                    }}
                  />

                  <label
                    htmlFor="profilePhoto"
                    style={{
                      display: "inline-block",
                      padding: "11px 18px",
                      background: "#222",
                      color: "#fff",
                      borderRadius: "5px",
                      cursor: saving
                        ? "not-allowed"
                        : "pointer",
                      fontWeight: "600",
                    }}
                  >
                    📷 Choose Photo
                  </label>

                  {selectedPhoto && (

                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      disabled={saving}
                      style={{
                        marginLeft: "10px",
                        padding: "10px 15px",
                        background: "#ddd",
                        color: "#222",
                        border: "none",
                        borderRadius: "5px",
                        cursor: "pointer",
                      }}
                    >
                      ✕ Cancel
                    </button>

                  )}

                  <small
                    style={{
                      display: "block",
                      marginTop: "10px",
                      color: "#666",
                    }}
                  >
                    JPG, PNG or WEBP • Maximum 5 MB
                  </small>

                </div>

              </div>

            </div>

            {/* ================= NAME ================= */}

            <div className="edit-form-group">

              <label>
                Full Name
              </label>

              <div className="edit-input-wrapper">

                <span>
                  👤
                </span>

                <input
                  type="text"
                  value={name}
                  placeholder="Enter your full name"
                  onChange={(e) =>
                    setName(e.target.value)
                  }
                  disabled={saving}
                />

              </div>

            </div>

            {/* ================= EMAIL ================= */}

            <div className="edit-form-group">

              <label>
                Email Address
              </label>

              <div className="edit-input-wrapper disabled-input">

                <span>
                  📧
                </span>

                <input
                  type="email"
                  value={email}
                  disabled
                />

              </div>

              <small>
                Email address cannot be changed.
              </small>

            </div>

            {/* ================= PHONE ================= */}

            <div className="edit-form-group">

              <label>
                Phone Number
              </label>

              <div className="edit-input-wrapper">

                <span>
                  📱
                </span>

                <input
                  type="tel"
                  value={phone}
                  placeholder="Enter your phone number"
                  onChange={(e) =>
                    setPhone(e.target.value)
                  }
                  disabled={saving}
                />

              </div>

            </div>

            {/* ================= ROLE ================= */}

            <div className="edit-form-group">

              <label>
                Account Type
              </label>

              <div className="edit-role-selection">

                <button
                  type="button"
                  className={
                    role === "farmer"
                      ? "edit-role-btn active"
                      : "edit-role-btn"
                  }
                  onClick={() =>
                    setRole("farmer")
                  }
                  disabled={saving}
                >

                  <span>
                    👨‍🌾
                  </span>

                  <strong>
                    Farmer
                  </strong>

                  <small>
                    Sell crops
                  </small>

                </button>

                <button
                  type="button"
                  className={
                    role === "buyer"
                      ? "edit-role-btn active"
                      : "edit-role-btn"
                  }
                  onClick={() =>
                    setRole("buyer")
                  }
                  disabled={saving}
                >

                  <span>
                    🛒
                  </span>

                  <strong>
                    Buyer
                  </strong>

                  <small>
                    Buy crops
                  </small>

                </button>

              </div>

            </div>

            {/* ================= ACTIONS ================= */}

            <div className="edit-profile-actions">

              <button
                type="button"
                className="edit-cancel-btn"
                onClick={() =>
                  navigate("/dashboard")
                }
                disabled={saving}
              >
                ← Cancel
              </button>

              <button
                type="submit"
                className="edit-save-btn"
                disabled={saving}
              >

                {saving
                  ? "⏳ Saving..."
                  : "💾 Save Changes"}

              </button>

            </div>

          </form>

        </div>

        {/* ================= SIDE INFO ================= */}

        <div className="edit-profile-side">

          <div className="edit-side-icon">
            🌱
          </div>

          <h2>
            Keep Your Profile Updated
          </h2>

          <p>
            Your profile information helps CropMarket
            provide a better marketplace experience.
          </p>

          <div className="edit-benefit">

            <div>
              📷
            </div>

            <span>
              Add your Farmer or Buyer profile photo
            </span>

          </div>

          <div className="edit-benefit">

            <div>
              🔐
            </div>

            <span>
              Your email remains secure
            </span>

          </div>

          <div className="edit-benefit">

            <div>
              🤝
            </div>

            <span>
              Connect with farmers and buyers
            </span>

          </div>

          <div className="edit-profile-tip">

            💡

            <span>
              Use a clear photo so other users can
              easily recognize your profile.
            </span>

          </div>

        </div>

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
          © 2026 CropMarket | All Rights Reserved
        </p>

      </footer>

    </div>
  );
}

export default EditProfile;