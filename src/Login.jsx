import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./App.css";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // =====================================================
  // LOGIN
  // =====================================================

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email.trim() || !password) {
      alert("Please enter email and password.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "http://localhost:5000/api/login",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            email: email.trim().toLowerCase(),
            password: password,
          }),
        }
      );

      const data = await response.json();

      // =================================================
      // LOGIN FAILED
      // =================================================

      if (!response.ok) {
        alert(
          data.message || "Login failed."
        );

        return;
      }

      // =================================================
      // CHECK USER DATA
      // =================================================

      if (!data.user) {
        alert(
          "Login failed. User information was not received."
        );

        return;
      }

      // =================================================
      // SAVE LOGGED-IN USER
      // =================================================

      const loggedInUser = {
        id:
          data.user.id ||
          data.user._id ||
          Date.now(),

        name:
          data.user.name ||
          "CropMarket User",

        email:
          data.user.email ||
          email.trim().toLowerCase(),

        phone:
          data.user.phone ||
          "",

        role:
          data.user.role ||
          "buyer",

        // IMPORTANT:
        // Save verification status also
        verificationStatus:
          data.user.verificationStatus ||
          "approved",

        identityDocument:
          data.user.identityDocument ||
          "",

        profilePhoto:
          data.user.profilePhoto ||
          "",
      };

      // =================================================
      // SAVE USER IN LOCAL STORAGE
      // =================================================

      localStorage.setItem(
        "cropMarketLoggedInUser",
        JSON.stringify(loggedInUser)
      );

      localStorage.setItem(
        "cropMarketUser",
        JSON.stringify(loggedInUser)
      );

      localStorage.setItem(
        "cropMarketLoggedIn",
        "true"
      );

      // =================================================
      // REMEMBER ME
      // =================================================

      if (remember) {
        localStorage.setItem(
          "cropMarketRemember",
          "true"
        );
      } else {
        localStorage.removeItem(
          "cropMarketRemember"
        );
      }

      // =================================================
      // LOGIN SUCCESS
      // =================================================

      alert(
        `Login successful! 🌱\n\nWelcome ${loggedInUser.name}!`
      );

      // =================================================
      // GO TO DASHBOARD
      // =================================================

      navigate("/dashboard");

    } catch (error) {

      console.error(
        "Login Error:",
        error
      );

      alert(
        "Cannot connect to server.\n\nPlease make sure the backend is running on port 5000."
      );

    } finally {
      setLoading(false);
    }
  };


  // =====================================================
  // FORGOT PASSWORD
  // =====================================================

  const handleForgotPassword = async () => {

    const userEmail = window.prompt(
      "Enter your registered email address:"
    );

    if (
      !userEmail ||
      !userEmail.trim()
    ) {
      return;
    }

    const cleanEmail =
      userEmail
        .trim()
        .toLowerCase();

    if (!cleanEmail.includes("@")) {
      alert(
        "Please enter a valid email address."
      );

      return;
    }

    const newPassword = window.prompt(
      "Enter your new password (minimum 6 characters):"
    );

    if (!newPassword) {
      return;
    }

    if (newPassword.length < 6) {
      alert(
        "New password must be at least 6 characters."
      );

      return;
    }

    const confirmNewPassword =
      window.prompt(
        "Confirm your new password:"
      );

    if (
      newPassword !==
      confirmNewPassword
    ) {
      alert(
        "Passwords do not match."
      );

      return;
    }

    try {

      const response = await fetch(
        "http://localhost:5000/api/forgot-password",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            email: cleanEmail,
            newPassword: newPassword,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        alert(
          data.message ||
          "Unable to reset password."
        );

        return;
      }

      alert(
        "Password reset successfully! 🌱\n\nYou can now login with your new password."
      );

      setEmail(cleanEmail);
      setPassword("");

    } catch (error) {

      console.error(
        "Forgot Password Error:",
        error
      );

      alert(
        "Cannot connect to server.\n\nPlease make sure the backend is running on port 5000."
      );
    }
  };


  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="modern-login-page">

      {/* =================================================
          LEFT SIDE
      ================================================= */}

      <div className="login-left">

        <Link
          to="/"
          className="login-brand"
        >
          <span>🌱</span>

          <strong>
            CropMarket
          </strong>
        </Link>


        <div className="login-hero">

          <div className="login-badge">
            🌾 SMART AGRICULTURE
          </div>


          <h1>
            Grow Better.
            <br />

            <span>
              Sell Smarter.
            </span>
          </h1>


          <p>
            Connect with trusted farmers,
            discover fresh crops and make
            smarter agricultural decisions.
          </p>


          <div className="login-crop-icons">

            <div>🌾</div>
            <div>🌽</div>
            <div>🍅</div>
            <div>🥕</div>
            <div>🥔</div>

          </div>


          <div className="farmer-showcase">

            <div className="farmer-big">
              👨‍🌾
            </div>


            <div className="farmer-message">

              <strong>
                Fresh • Local • Trusted
              </strong>

              <span>
                Direct from local farmers
              </span>

            </div>

          </div>

        </div>

      </div>


      {/* =================================================
          RIGHT SIDE
      ================================================= */}

      <div className="login-right">

        <div className="login-box">


          {/* =================================================
              TOP ICON
          ================================================= */}

          <div className="login-top-icon">
            🔐
          </div>


          {/* =================================================
              HEADING
          ================================================= */}

          <div className="login-heading">

            <span>
              WELCOME BACK
            </span>


            <h2>
              Sign in to
              <br />

              <strong>
                CropMarket
              </strong>
            </h2>


            <p>
              Access your farmer & buyer account
            </p>

          </div>


          {/* =================================================
              LOGIN FORM
          ================================================= */}

          <form
            className="modern-login-form"
            onSubmit={handleLogin}
          >


            {/* =================================================
                EMAIL
            ================================================= */}

            <div className="modern-input">

              <label>
                Email Address
              </label>


              <div className="input-wrapper">

                <span>
                  📧
                </span>


                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) =>
                    setEmail(
                      e.target.value
                    )
                  }
                  autoComplete="email"
                />

              </div>

            </div>


            {/* =================================================
                PASSWORD
            ================================================= */}

            <div className="modern-input">

              <label>
                Password
              </label>


              <div className="input-wrapper">

                <span>
                  🔒
                </span>


                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) =>
                    setPassword(
                      e.target.value
                    )
                  }
                  autoComplete="current-password"
                />


                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowPassword(
                      !showPassword
                    )
                  }
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showPassword
                    ? "🙈"
                    : "👁️"}
                </button>

              </div>

            </div>


            {/* =================================================
                OPTIONS
            ================================================= */}

            <div className="login-options-modern">

              <label className="remember-modern">

                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) =>
                    setRemember(
                      e.target.checked
                    )
                  }
                />


                <span>
                  Remember me
                </span>

              </label>


              {/* FORGOT PASSWORD */}

              <button
                type="button"
                className="forgot-modern"
                onClick={
                  handleForgotPassword
                }
              >
                Forgot Password?
              </button>

            </div>


            {/* =================================================
                LOGIN BUTTON
            ================================================= */}

            <button
              type="submit"
              className="modern-login-btn"
              disabled={loading}
            >

              <span>
                🔐
              </span>


              {loading
                ? "Logging in..."
                : "Login to CropMarket"}


              <span>
                →
              </span>

            </button>

          </form>


          {/* =================================================
              DIVIDER
          ================================================= */}

          <div className="modern-divider">

            <span></span>

            <b>
              OR
            </b>

            <span></span>

          </div>


          {/* =================================================
              CREATE ACCOUNT
          ================================================= */}

          <div className="create-account-modern">

            <span>
              Don't have an account?
            </span>


            <Link
              to="/register"
              className="create-account-btn"
            >
              Create Account
            </Link>

          </div>


          {/* =================================================
              BACK HOME
          ================================================= */}

          <Link
            to="/"
            className="modern-back-home"
          >
            ← Back to Home
          </Link>

        </div>

      </div>

    </div>
  );
}

export default Login;