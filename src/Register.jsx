import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./App.css";

function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("farmer");

  const [identityDocument, setIdentityDocument] = useState(null);
  const [profilePhoto, setProfilePhoto] = useState(null);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();

    if (
      !name.trim() ||
      !email.trim() ||
      !phone.trim() ||
      !password ||
      !confirmPassword
    ) {
      alert("Please fill all the fields.");
      return;
    }

    if (!identityDocument) {
      alert("Please upload your identity document.");
      return;
    }

    if (!profilePhoto) {
      alert("Please upload your profile photo.");
      return;
    }

    if (!email.includes("@")) {
      alert("Please enter a valid email address.");
      return;
    }

    const cleanPhone = phone.replace(/\D/g, "");

    if (cleanPhone.length !== 10) {
      alert("Please enter a valid 10 digit phone number.");
      return;
    }

    if (password.length < 6) {
      alert("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();

      formData.append("name", name.trim());
      formData.append("email", email.trim());
      formData.append("phone", cleanPhone);
      formData.append("password", password);
      formData.append("role", role);
      formData.append("identityDocument", identityDocument);
      formData.append("profilePhoto", profilePhoto);

      const response = await fetch(
        "http://localhost:5000/api/register",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Registration failed.");
        return;
      }

      alert(
        "Registration successful! ✅\n\n" +
        "Your CropMarket account has been created successfully.\n\n" +
        "A confirmation email has been sent to:\n" +
        email.trim()
      );

      navigate("/login");

    } catch (error) {
      console.error("Register Error:", error);

      alert(
        "Cannot connect to server.\n\n" +
        "Please make sure the backend is running on port 5000."
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">

      {/* ================= LEFT SIDE ================= */}

      <div className="register-left">

        <Link
          to="/"
          className="register-brand"
        >
          <span>🌱</span>
          <strong>CropMarket</strong>
        </Link>

        <div className="register-showcase">

          <div className="register-badge">
            🌾 SMART AGRICULTURE PLATFORM
          </div>

          <h1>
            Join the
            <br />
            <span>CropMarket Family</span>
          </h1>

          <p>
            Create your account and connect directly
            with farmers and buyers across your local
            market.
          </p>

          <div className="register-farmer">

            <div className="register-farmer-icon">
              👨‍🌾
            </div>

            <div>
              <strong>
                Fresh • Local • Trusted
              </strong>

              <span>
                Growing a smarter farming community
              </span>
            </div>

          </div>

          <div className="register-crops">
            <span>🌾</span>
            <span>🌽</span>
            <span>🥔</span>
            <span>🍅</span>
            <span>🥕</span>
          </div>

        </div>
      </div>

      {/* ================= RIGHT SIDE ================= */}

      <div className="register-right">

        <div className="register-card">

          <div className="register-icon">
            🌱
          </div>

          <div className="register-heading">

            <span>
              CREATE ACCOUNT
            </span>

            <h2>
              Start with
              <br />
              <strong>CropMarket</strong>
            </h2>

            <p>
              Create your farmer or buyer account
            </p>

          </div>

          {/* ================= REGISTER FORM ================= */}

          <form
            className="register-form"
            onSubmit={handleRegister}
          >

            {/* NAME */}

            <div className="register-input">

              <label>
                Full Name
              </label>

              <div className="register-input-wrapper">

                <span>👤</span>

                <input
                  type="text"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) =>
                    setName(e.target.value)
                  }
                  disabled={loading}
                />

              </div>

            </div>

            {/* EMAIL */}

            <div className="register-input">

              <label>
                Email Address
              </label>

              <div className="register-input-wrapper">

                <span>📧</span>

                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  disabled={loading}
                />

              </div>

              <small
                style={{
                  display: "block",
                  marginTop: "5px",
                  color: "#666",
                }}
              >
                📧 A confirmation email will be sent
                after registration.
              </small>

            </div>

            {/* PHONE */}

            <div className="register-input">

              <label>
                Phone Number
              </label>

              <div className="register-input-wrapper">

                <span>📱</span>

                <input
                  type="tel"
                  placeholder="Enter your phone number"
                  value={phone}
                  maxLength="10"
                  onChange={(e) =>
                    setPhone(
                      e.target.value.replace(/\D/g, "")
                    )
                  }
                  disabled={loading}
                />

              </div>

            </div>

            {/* ROLE */}

            <div className="register-input">

              <label>
                Account Type
              </label>

              <div className="role-selection">

                <button
                  type="button"
                  className={
                    role === "farmer"
                      ? "role-btn active"
                      : "role-btn"
                  }
                  onClick={() =>
                    setRole("farmer")
                  }
                  disabled={loading}
                >
                  👨‍🌾
                  <span>Farmer</span>
                </button>

                <button
                  type="button"
                  className={
                    role === "buyer"
                      ? "role-btn active"
                      : "role-btn"
                  }
                  onClick={() =>
                    setRole("buyer")
                  }
                  disabled={loading}
                >
                  🛒
                  <span>Buyer</span>
                </button>

              </div>

            </div>

            {/* IDENTITY DOCUMENT */}

            <div className="register-input">

              <label>
                Identity Document
              </label>

              <div className="register-input-wrapper">

                <span>🪪</span>

                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp"
                  onChange={(e) =>
                    setIdentityDocument(
                      e.target.files?.[0] || null
                    )
                  }
                  disabled={loading}
                />

              </div>

              <small>
                Upload a clear JPG, PNG or WEBP photo of your ID.
              </small>

            </div>

            {/* PROFILE PHOTO */}

            <div className="register-input">

              <label>
                Profile Photo
              </label>

              <div className="register-input-wrapper">

                <span>📸</span>

                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp"
                  onChange={(e) =>
                    setProfilePhoto(
                      e.target.files?.[0] || null
                    )
                  }
                  disabled={loading}
                />

              </div>

              <small>
                Upload your clear recent photo.
              </small>

            </div>

            {/* PASSWORD */}

            <div className="register-input">

              <label>
                Password
              </label>

              <div className="register-input-wrapper">

                <span>🔒</span>

                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  disabled={loading}
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                  disabled={loading}
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>

              </div>

            </div>

            {/* CONFIRM PASSWORD */}

            <div className="register-input">

              <label>
                Confirm Password
              </label>

              <div className="register-input-wrapper">

                <span>🔐</span>

                <input
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) =>
                    setConfirmPassword(
                      e.target.value
                    )
                  }
                  disabled={loading}
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowConfirmPassword(
                      !showConfirmPassword
                    )
                  }
                  disabled={loading}
                >
                  {showConfirmPassword
                    ? "🙈"
                    : "👁️"}
                </button>

              </div>

            </div>

            {/* ACCOUNT INFORMATION */}

            <div
              style={{
                padding: "12px",
                marginBottom: "15px",
                borderRadius: "10px",
                background: "#f0fdf4",
                border: "1px solid #bbf7d0",
                fontSize: "13px",
                lineHeight: "1.5",
              }}
            >

              📧{" "}
              <strong>
                Email Confirmation
              </strong>

              <br />

              <span>
                A confirmation email will be sent
                after registration.
              </span>

              <br />
              <br />

              🔐{" "}
              <strong>
                Identity Verification
              </strong>

              <br />

              <span>
                Your account will remain
                <strong> pending </strong>
                until your identity documents are
                reviewed and approved.
              </span>

            </div>

            {/* CREATE ACCOUNT */}

            <button
              type="submit"
              className="register-btn"
              disabled={loading}
            >

              {loading
                ? "⏳ Creating Account..."
                : "🌱 Create My Account"}

              {!loading && (
                <span>→</span>
              )}

            </button>

          </form>

          {/* LOGIN LINK */}

          <div className="already-account">

            <span>
              Already have an account?
            </span>

            <Link to="/login">
              Login
            </Link>

          </div>

          {/* BACK HOME */}

          <Link
            to="/"
            className="register-back-home"
          >
            ← Back to Home
          </Link>

        </div>

      </div>

    </div>
  );
}

export default Register;