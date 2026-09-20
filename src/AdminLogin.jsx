import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./App.css";

function AdminLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email.trim() || !password) {
      alert("Please enter admin email and password.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "http://localhost:5000/api/admin/login",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            email: email.trim().toLowerCase(),
            password,
          }),
        }
      );

      const data = await response.json();

      // =================================================
      // LOGIN FAILED
      // =================================================

      if (!response.ok) {
        alert(
          data.message || "Admin login failed."
        );

        return;
      }

      // =================================================
      // SAVE ADMIN LOGIN
      // =================================================

      localStorage.setItem(
        "cropMarketAdmin",
        JSON.stringify(data.admin)
      );

      // =================================================
      // ADMIN LOGIN SUCCESS
      // =================================================

      alert(
        "Admin login successful! 🔐"
      );

      // Automatically open Admin Verification
      navigate(
        "/admin-verification",
        {
          replace: true,
        }
      );

    } catch (error) {

      console.error(
        "Admin Login Error:",
        error
      );

      alert(
        "Unable to connect to server. Please make sure backend is running."
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="edit-profile-page">

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

          <Link to="/login">
            User Login
          </Link>

        </div>

      </nav>


      {/* ================= ADMIN LOGIN ================= */}

      <section
        style={{
          minHeight: "75vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "50px 20px",
        }}
      >

        <div
          className="edit-profile-card"
          style={{
            maxWidth: "520px",
            width: "100%",
          }}
        >

          {/* ================= HEADER ================= */}

          <div className="edit-card-heading">

            <div className="edit-card-icon">
              🔐
            </div>

            <div>

              <h2>
                Admin Login
              </h2>

              <p>
                Sign in to manage identity verification.
              </p>

            </div>

          </div>


          {/* ================= FORM ================= */}

          <form
            className="edit-profile-form"
            onSubmit={handleLogin}
          >

            {/* ================= EMAIL ================= */}

            <div className="edit-form-group">

              <label>
                Admin Email Address
              </label>

              <div className="edit-input-wrapper">

                <span>
                  📧
                </span>

                <input
                  type="email"
                  value={email}
                  placeholder="Enter admin email"
                  onChange={(e) =>
                    setEmail(
                      e.target.value
                    )
                  }
                  autoComplete="username"
                />

              </div>

            </div>


            {/* ================= PASSWORD ================= */}

            <div className="edit-form-group">

              <label>
                Admin Password
              </label>

              <div className="edit-input-wrapper">

                <span>
                  🔒
                </span>

                <input
                  type="password"
                  value={password}
                  placeholder="Enter admin password"
                  onChange={(e) =>
                    setPassword(
                      e.target.value
                    )
                  }
                  autoComplete="current-password"
                />

              </div>

            </div>


            {/* ================= BUTTONS ================= */}

            <div className="edit-profile-actions">

              <button
                type="button"
                className="edit-cancel-btn"
                onClick={() =>
                  navigate("/")
                }
                disabled={loading}
              >
                ← Back
              </button>

              <button
                type="submit"
                className="edit-save-btn"
                disabled={loading}
              >

                {loading
                  ? "🔐 Logging in..."
                  : "🔐 Admin Login"}

              </button>

            </div>

          </form>


          {/* ================= INFORMATION ================= */}

          <div
            style={{
              marginTop: "25px",
              padding: "15px",
              borderRadius: "12px",
              background: "#f1f9ef",
              color: "#14532d",
            }}
          >
            🔒 Only authorized administrators can access
            identity verification.
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

export default AdminLogin;