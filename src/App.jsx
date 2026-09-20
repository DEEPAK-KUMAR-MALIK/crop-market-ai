import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { useState } from "react";

import Crops from "./Crops";
import SellCrop from "./SellCrop";
import BuyCrop from "./BuyCrop";
import Login from "./Login";
import Register from "./Register";
import MyOrders from "./MyOrders";
import Dashboard from "./Dashboard";
import EditProfile from "./EditProfile";
import MyListings from "./MyListings";
import CropPhotoRequests from "./CropPhotoRequests";

import AdminVerification from "./AdminVerification";
import AdminLogin from "./AdminLogin";
import Predict from "./Predict";

import "./App.css";


function Home() {
    const [aiMessage, setAiMessage] = useState("");
  const [aiReply, setAiReply] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiImage, setAiImage] = useState(null);
const [aiImagePreview, setAiImagePreview] = useState("");

  const handleAIImage = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setAiImage(file);
    setAiImagePreview(URL.createObjectURL(file));
  };

 const askAI = async () => {
  if ((!aiMessage.trim() && !aiImage) || aiLoading) {
    return;
  }

  setAiLoading(true);
  setAiReply("");

  try {
    let imageBase64 = null;

    if (aiImage) {
      imageBase64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;

        reader.readAsDataURL(aiImage);
      });
    }

    const response = await fetch(
      "http://localhost:5000/api/ai",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: aiMessage.trim(),
          image: imageBase64,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "AI request failed."
      );
    }

    setAiReply(
      data.reply || "AI did not return a response."
    );

  } catch (error) {
    console.error("AI Error:", error);

    setAiReply(
      "AI se connect nahi ho pa raha. Please check backend aur Ollama."
    );

  } finally {
    setAiLoading(false);
  }
};

  const handleAIKeyDown = (event) => {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();
      askAI();
    }
  };

  const crops = [
    {
      icon: "🌾",
      name: "Wheat",
      price: "₹28/kg",
      farmer: "Ramesh Kumar",
      location: "Bhubaneswar",
    },
    {
      icon: "🌽",
      name: "Maize",
      price: "₹24/kg",
      farmer: "Suresh Pradhan",
      location: "Cuttack",
    },
    {
      icon: "🥔",
      name: "Potato",
      price: "₹22/kg",
      farmer: "Rajesh Das",
      location: "Puri",
    },
    {
      icon: "🍅",
      name: "Tomato",
      price: "₹30/kg",
      farmer: "Manoj Sahu",
      location: "Khordha",
    },
  ];


  return (
    <div className="app">
            {/* ================================
          CROP MARKET AI ASSISTANT
      ================================= */}

      <div
        style={{
          margin: "20px auto",
          maxWidth: "1100px",
          padding: "22px",
          borderRadius: "22px",
          background: "#ffffff",
          border: "1px solid #dceedd",
          boxShadow:
            "0 12px 30px rgba(20,83,45,0.10)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginBottom: "15px",
          }}
        >
          <span style={{ fontSize: "28px" }}>
            🤖
          </span>

          <div>
            <h3
              style={{
                margin: 0,
                color: "#14532d",
              }}
            >
              CropMarket AI Assistant
            </h3>

            <small
              style={{
                color: "#6b7280",
              }}
            >
              Powered by local Gemma 3:4B
            </small>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: "10px",
          }}
        >
          <input
            type="text"
            value={aiMessage}
            onChange={(event) =>
              setAiMessage(event.target.value)
            }
            onKeyDown={handleAIKeyDown}
            placeholder="Ask AI about farming..."
            disabled={aiLoading}
            style={{
              flex: 1,
              padding: "13px 15px",
              borderRadius: "12px",
              border: "1px solid #cde3cf",
              outline: "none",
              fontSize: "14px",
            }}
          />
<div style={{ marginTop: "10px" }}>
  <label>
    📷 Choose Crop Photo
    <input
      type="file"
      accept="image/*"
      onChange={handleAIImage}
      style={{ marginLeft: "10px" }}
    />
  </label>
</div>

{aiImagePreview && (
  <img
    src={aiImagePreview}
    alt="Selected crop"
    style={{
      width: "180px",
      marginTop: "10px",
      borderRadius: "10px",
    }}
  />
)}
          <button
            onClick={askAI}
            disabled={
  aiLoading ||
  (!aiMessage.trim() && !aiImage)
}
            style={{
              padding: "13px 20px",
              border: "none",
              borderRadius: "12px",
              background:
                "linear-gradient(135deg,#16a34a,#15803d)",
              color: "#ffffff",
              fontWeight: "700",
              cursor: "pointer",
            }}
          >
            {aiLoading
              ? "Thinking..."
              : "Ask AI 🚀"}
          </button>
        </div>

        {aiReply && (
          <div
            style={{
              marginTop: "15px",
              padding: "15px",
              borderRadius: "12px",
              background: "#f0fdf4",
              border: "1px solid #dcefd9",
              color: "#14532d",
              lineHeight: "1.6",
              whiteSpace: "pre-wrap",
            }}
          >
            <strong>AI:</strong>{" "}
            {aiReply}
          </div>
        )}
      </div>

      {/* =================================================
          PREMIUM ANIMATED NAVBAR
      ================================================= */}

      <style>{`

        .cm-modern-navbar {
          width: 100%;
          min-height: 82px;
          display: flex;
          align-items: center;
          padding: 0 4%;
          background: rgba(255,255,255,.97);
          border-bottom: 1px solid #e5eee5;
          box-shadow: 0 5px 22px rgba(20,83,45,.08);
          position: sticky;
          top: 0;
          z-index: 1000;
          box-sizing: border-box;
          gap: 25px;
          animation: cmNavbarIn .8s cubic-bezier(.22,1,.36,1);
        }


        @keyframes cmNavbarIn {
          from {
            opacity: 0;
            transform: translateY(-35px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }


        /* ================= LOGO ================= */

        .cm-modern-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
          min-width: 190px;
          color: #14532d;
          flex-shrink: 0;
        }


        .cm-modern-logo-icon {
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 15px;
          background: #eaf8e8;
          font-size: 28px;
          box-shadow: 0 5px 14px rgba(34,197,94,.12);
          animation: cmLeafBreathing 3s ease-in-out infinite;
          transition: .3s ease;
        }


        @keyframes cmLeafBreathing {
          0%,100% {
            transform: scale(1) rotate(0);
          }
          50% {
            transform: scale(1.08) rotate(-4deg);
          }
        }


        .cm-modern-logo:hover .cm-modern-logo-icon {
          transform: rotate(-12deg) scale(1.15);
        }


        .cm-modern-logo-text {
          font-size: 25px;
          font-weight: 800;
          letter-spacing: -.6px;
        }


        /* ================= NAVIGATION ================= */

        .cm-modern-nav-links {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
          min-width: 0;
        }


        .cm-modern-nav-item {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 11px 12px;
          border-radius: 12px;
          color: #174d2b;
          text-decoration: none;
          font-size: 14px;
          font-weight: 650;
          white-space: nowrap;
          transition:
            background .25s ease,
            color .25s ease,
            transform .25s ease;
          opacity: 0;
          animation: cmNavItemIn .55s ease forwards;
        }


        .cm-modern-nav-item:nth-child(1) {
          animation-delay: .15s;
        }

        .cm-modern-nav-item:nth-child(2) {
          animation-delay: .22s;
        }

        .cm-modern-nav-item:nth-child(3) {
          animation-delay: .29s;
        }

        .cm-modern-nav-item:nth-child(4) {
          animation-delay: .36s;
        }

        .cm-modern-nav-item:nth-child(5) {
          animation-delay: .43s;
        }

        .cm-modern-nav-item:nth-child(6) {
          animation-delay: .50s;
        }

        .cm-modern-nav-item:nth-child(7) {
          animation-delay: .57s;
        }

        .cm-modern-nav-item:nth-child(8) {
          animation-delay: .64s;
        }


        @keyframes cmNavItemIn {
          from {
            opacity: 0;
            transform: translateY(-14px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }


        .cm-modern-nav-icon {
          font-size: 17px;
          line-height: 1;
          transition: transform .25s ease;
        }


        .cm-modern-nav-item::after {
          content: "";
          position: absolute;
          left: 50%;
          bottom: 5px;
          width: 0;
          height: 2px;
          border-radius: 10px;
          background: #16a34a;
          transform: translateX(-50%);
          transition: width .25s ease;
        }


        .cm-modern-nav-item:hover {
          background: #eef9ec;
          color: #15803d;
          transform: translateY(-3px);
        }


        .cm-modern-nav-item:hover::after {
          width: 55%;
        }


        .cm-modern-nav-item:hover .cm-modern-nav-icon {
          transform: scale(1.2);
        }


        /* ================= LOGIN ================= */

        .cm-modern-login {
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          min-width: 105px;
          padding: 12px 18px;
          border-radius: 13px;
          background: linear-gradient(135deg,#16a34a,#15803d);
          color: white !important;
          text-decoration: none;
          font-size: 14px;
          font-weight: 750;
          box-shadow: 0 7px 18px rgba(22,163,74,.23);
          transition: .25s ease;
        }


        .cm-modern-login::before {
          content: "";
          position: absolute;
          top: 0;
          left: -120%;
          width: 70%;
          height: 100%;
          background: linear-gradient(
            100deg,
            transparent,
            rgba(255,255,255,.38),
            transparent
          );
          transform: skewX(-20deg);
          transition: left .6s ease;
        }


        .cm-modern-login:hover::before {
          left: 140%;
        }


        .cm-modern-login:hover {
          transform: translateY(-4px) scale(1.03);
          box-shadow: 0 12px 28px rgba(22,163,74,.35);
        }


        /* ================= HERO ================= */

        .hero-content {
          animation: cmHeroLeft .9s cubic-bezier(.22,1,.36,1);
        }


        @keyframes cmHeroLeft {
          from {
            opacity: 0;
            transform: translateX(-55px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }


        .hero-visual {
          animation: cmHeroRight 1s cubic-bezier(.22,1,.36,1);
        }


        @keyframes cmHeroRight {
          from {
            opacity: 0;
            transform: translateX(55px) scale(.9);
          }
          to {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
        }


        /* ================= FLOATING CROPS ================= */

        .floating1 {
          animation: cmFloat1 4s ease-in-out infinite;
        }

        .floating2 {
          animation: cmFloat2 4.7s ease-in-out infinite;
        }

        .floating3 {
          animation: cmFloat3 4.3s ease-in-out infinite;
        }

        .floating4 {
          animation: cmFloat4 5s ease-in-out infinite;
        }


        @keyframes cmFloat1 {
          0%,100% {
            transform: translateY(0) rotate(0);
          }
          50% {
            transform: translateY(-18px) rotate(7deg);
          }
        }


        @keyframes cmFloat2 {
          0%,100% {
            transform: translateY(0) rotate(0);
          }
          50% {
            transform: translateY(15px) rotate(-7deg);
          }
        }


        @keyframes cmFloat3 {
          0%,100% {
            transform: translateY(0) scale(1);
          }
          50% {
            transform: translateY(-13px) scale(1.1);
          }
        }


        @keyframes cmFloat4 {
          0%,100% {
            transform: translateY(0) rotate(0);
          }
          50% {
            transform: translateY(18px) rotate(-8deg);
          }
        }


        /* ================= FARMER / TRACTOR ================= */

        .farmer {
          animation: cmFarmer 3.2s ease-in-out infinite;
        }


        @keyframes cmFarmer {
          0%,100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-9px);
          }
        }


        .tractor {
          animation: cmTractor 3.8s ease-in-out infinite;
        }


        @keyframes cmTractor {
          0%,100% {
            transform: translateY(0) rotate(0);
          }
          50% {
            transform: translateY(-10px) rotate(2deg);
          }
        }


        /* ================= CROP CARDS ================= */

        .home-crop-card {
          animation: cmCardAppear .7s cubic-bezier(.22,1,.36,1) both;
          transition: transform .3s ease, box-shadow .3s ease;
        }


        .home-crop-card:nth-child(1) {
          animation-delay: .1s;
        }

        .home-crop-card:nth-child(2) {
          animation-delay: .2s;
        }

        .home-crop-card:nth-child(3) {
          animation-delay: .3s;
        }

        .home-crop-card:nth-child(4) {
          animation-delay: .4s;
        }


        @keyframes cmCardAppear {
          from {
            opacity: 0;
            transform: translateY(35px) scale(.96);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }


        .home-crop-card:hover {
          transform: translateY(-10px) scale(1.02);
          box-shadow: 0 15px 35px rgba(20,83,45,.14);
        }


        .home-crop-icon {
          transition: transform .35s ease;
        }


        .home-crop-card:hover .home-crop-icon {
          transform: scale(1.18) rotate(7deg);
        }


        /* ================= FEATURES ================= */

        .feature-card {
          transition:
            transform .35s ease,
            box-shadow .35s ease;
        }


        .feature-card:hover {
          transform: translateY(-10px) scale(1.015);
          box-shadow: 0 15px 35px rgba(20,83,45,.14);
        }


        .feature-icon {
          transition: transform .3s ease;
        }


        .feature-card:hover .feature-icon {
          transform: scale(1.15) rotate(-5deg);
        }


        /* ================= AI ================= */

        .ai-circle {
          animation: cmAiPulse 2.5s ease-in-out infinite;
        }


        @keyframes cmAiPulse {
          0%,100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.09);
          }
        }


        .ai-crop {
          animation: cmAiCrop 3s ease-in-out infinite;
        }


        @keyframes cmAiCrop {
          0%,100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-12px);
          }
        }


        .ai-chart {
          animation: cmChart 1.4s cubic-bezier(.22,1,.36,1);
        }


        @keyframes cmChart {
          from {
            opacity: 0;
            transform: scale(.5) rotate(-8deg);
          }
          to {
            opacity: 1;
            transform: scale(1) rotate(0);
          }
        }


        /* ================= BUTTONS ================= */

        .primary-btn,
        .secondary-btn,
        .view-btn {
          transition:
            transform .25s ease,
            box-shadow .25s ease;
        }


        .primary-btn:hover,
        .secondary-btn:hover,
        .view-btn:hover {
          transform: translateY(-4px) scale(1.02);
        }


        /* ================= ABOUT ================= */

        .about-icon {
          animation: cmAbout 3s ease-in-out infinite;
        }


        @keyframes cmAbout {
          0%,100% {
            transform: translateY(0) rotate(0);
          }
          50% {
            transform: translateY(-10px) rotate(5deg);
          }
        }


        /* ================= RESPONSIVE ================= */

        @media (max-width:1250px) {

          .cm-modern-navbar {
            padding: 0 2.5%;
            gap: 12px;
          }

          .cm-modern-logo {
            min-width: 165px;
          }

          .cm-modern-logo-text {
            font-size: 22px;
          }

          .cm-modern-nav-item {
            padding: 9px 8px;
            font-size: 12.5px;
          }

          .cm-modern-nav-icon {
            font-size: 15px;
          }

          .cm-modern-login {
            min-width: 90px;
            padding: 10px 13px;
          }
        }


        @media (max-width:1050px) {

          .cm-modern-navbar {
            flex-wrap: wrap;
            padding: 12px 20px;
          }

          .cm-modern-logo {
            min-width: auto;
          }

          .cm-modern-login {
            margin-left: auto;
          }

          .cm-modern-nav-links {
            order: 3;
            width: 100%;
            justify-content: flex-start;
            overflow-x: auto;
            padding: 4px 0 7px;
            scrollbar-width: thin;
          }

          .cm-modern-nav-item {
            flex-shrink: 0;
          }
        }


        @media (max-width:600px) {

          .cm-modern-navbar {
            min-height: 70px;
            padding: 10px 14px;
            gap: 10px;
          }

          .cm-modern-logo-icon {
            width: 40px;
            height: 40px;
            font-size: 23px;
          }

          .cm-modern-logo-text {
            font-size: 20px;
          }

          .cm-modern-login {
            min-width: auto;
            padding: 10px 13px;
          }

          .cm-modern-login-text {
            display: none;
          }

          .cm-modern-nav-item {
            padding: 8px 10px;
            font-size: 12px;
            animation: none;
            opacity: 1;
          }
        }


        @media (prefers-reduced-motion:reduce) {

          *,
          *::before,
          *::after {
            animation-duration: .01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: .01ms !important;
          }

        }
                  /* ================= PREMIUM STATS ================= */

        .cm-stats-section {
          max-width: 1100px;
          margin: 0 auto;
          padding: 25px 20px 55px;
        }

        .cm-stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 18px;
        }

        .cm-stat-card {
          background: #ffffff;
          border: 1px solid #e1eee2;
          border-radius: 18px;
          padding: 24px 15px;
          text-align: center;
          box-shadow: 0 8px 25px rgba(20,83,45,.07);
          transition: .3s ease;
        }

        .cm-stat-card:hover {
          transform: translateY(-7px);
          box-shadow: 0 15px 32px rgba(20,83,45,.13);
        }

        .cm-stat-icon {
          font-size: 30px;
          margin-bottom: 8px;
        }

        .cm-stat-number {
          display: block;
          font-size: 27px;
          font-weight: 800;
          color: #14532d;
        }

        .cm-stat-label {
          color: #64748b;
          font-size: 14px;
          margin-top: 5px;
        }


        /* ================= WHY CROPMARKET ================= */

        .cm-why-section {
          max-width: 1100px;
          margin: 0 auto;
          padding: 70px 20px;
          text-align: center;
        }

        .cm-why-heading h2 {
          margin: 10px 0;
          font-size: 34px;
          color: #14532d;
        }

        .cm-why-heading p {
          color: #64748b;
          margin-bottom: 35px;
        }

        .cm-why-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
        }

        .cm-why-card {
          background: #ffffff;
          border: 1px solid #e1eee2;
          border-radius: 20px;
          padding: 30px 20px;
          box-shadow: 0 8px 25px rgba(20,83,45,.06);
          transition: .3s ease;
        }

        .cm-why-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 16px 35px rgba(20,83,45,.13);
        }

        .cm-why-icon {
          width: 58px;
          height: 58px;
          margin: 0 auto 15px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 17px;
          background: #eef9ec;
          font-size: 29px;
        }

        .cm-why-card h3 {
          margin: 8px 0;
          color: #14532d;
        }

        .cm-why-card p {
          color: #64748b;
          font-size: 14px;
          line-height: 1.6;
        }


        /* ================= CTA ================= */

        .cm-cta-section {
          max-width: 1100px;
          margin: 20px auto 70px;
          padding: 45px 35px;
          border-radius: 25px;
          background: linear-gradient(135deg,#14532d,#16a34a);
          color: white;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 25px;
          box-shadow: 0 15px 40px rgba(20,83,45,.18);
        }

        .cm-cta-content h2 {
          margin: 0 0 10px;
          font-size: 31px;
        }

        .cm-cta-content p {
          margin: 0;
          opacity: .9;
          line-height: 1.6;
        }

        .cm-cta-buttons {
          display: flex;
          gap: 12px;
          flex-shrink: 0;
        }

        .cm-cta-btn {
          padding: 13px 20px;
          border-radius: 12px;
          text-decoration: none;
          font-weight: 750;
          transition: .25s ease;
        }

        .cm-cta-btn:hover {
          transform: translateY(-4px);
        }

        .cm-cta-primary {
          background: white;
          color: #14532d;
        }

        .cm-cta-secondary {
          border: 1px solid rgba(255,255,255,.6);
          color: white;
        }


        /* ================= NEW SECTIONS RESPONSIVE ================= */

        @media (max-width:800px) {

          .cm-stats-grid,
          .cm-why-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .cm-cta-section {
            flex-direction: column;
            text-align: center;
          }

          .cm-cta-buttons {
            justify-content: center;
            flex-wrap: wrap;
          }
        }

        @media (max-width:500px) {

          .cm-stats-grid,
          .cm-why-grid {
            grid-template-columns: 1fr;
          }

          .cm-why-heading h2 {
            font-size: 28px;
          }

          .cm-cta-section {
            margin-left: 15px;
            margin-right: 15px;
            padding: 35px 20px;
          }

          .cm-cta-content h2 {
            font-size: 25px;
          }
        }

      `}</style>


      {/* =================================================
          NAVBAR
      ================================================= */}

      <nav className="cm-modern-navbar">

        <Link
          to="/"
          className="cm-modern-logo"
        >
          <span className="cm-modern-logo-icon">
            🌱
          </span>

          <span className="cm-modern-logo-text">
            CropMarket
          </span>
        </Link>


        <div className="cm-modern-nav-links">

          <Link to="/" className="cm-modern-nav-item">
            <span className="cm-modern-nav-icon">🏠</span>
            <span>Home</span>
          </Link>

          <Link to="/crops" className="cm-modern-nav-item">
            <span className="cm-modern-nav-icon">🌾</span>
            <span>Crops</span>
          </Link>

          <Link to="/sell" className="cm-modern-nav-item">
            <span className="cm-modern-nav-icon">🚜</span>
            <span>Sell Crop</span>
          </Link>

          <Link to="/orders" className="cm-modern-nav-item">
            <span className="cm-modern-nav-icon">📦</span>
            <span>My Orders</span>
          </Link>

          <Link to="/dashboard" className="cm-modern-nav-item">
            <span className="cm-modern-nav-icon">👤</span>
            <span>Dashboard</span>
          </Link>

          <Link to="/listings" className="cm-modern-nav-item">
            <span className="cm-modern-nav-icon">🌱</span>
            <span>My Listings</span>
          </Link>

          <Link to="/predict" className="cm-modern-nav-item">
  <span className="cm-modern-nav-icon">🤖</span>
  <span>Predict</span>
</Link>

          <Link to="/photo-requests" className="cm-modern-nav-item">
            <span className="cm-modern-nav-icon">📷</span>
            <span>Photo Requests</span>
          </Link>

          <a href="#about" className="cm-modern-nav-item">
            <span className="cm-modern-nav-icon">ℹ️</span>
            <span>About</span>
          </a>

        </div>


        <Link
          to="/login"
          className="cm-modern-login"
        >
          <span>🔐</span>
          <span className="cm-modern-login-text">
            Login
          </span>
        </Link>

      </nav>


      {/* =================================================
          HERO
      ================================================= */}

      <section className="hero">

        <div className="hero-content">

          <div className="badge">
            🌾 SMART AGRICULTURE PLATFORM
          </div>

          <h1>
            Sell Your Crops
            <span>
              At the Right Price
            </span>
          </h1>

          <p>
            Connect farmers directly with buyers and get
            AI-based crop price predictions to make better
            selling decisions.
          </p>

          <div className="hero-buttons">

            <Link
              to="/crops"
              className="primary-btn"
            >
              🌱 Explore Crops
            </Link>

            <Link
              to="/sell"
              className="secondary-btn"
            >
              🚜 Sell Your Crop
            </Link>

          </div>

        </div>


        <div className="hero-visual">

          <div className="floating floating1">
            🌾
          </div>

          <div className="floating floating2">
            🌽
          </div>

          <div className="floating floating3">
            🍅
          </div>

          <div className="floating floating4">
            🥕
          </div>

          <div className="farmer-circle">

            <div className="farmer">
              👨‍🌾
            </div>

            <div className="trusted">
              Fresh • Local • Trusted
            </div>

          </div>

          <div className="tractor">
            🚜
          </div>

          <div className="leaf1">
            🌿
          </div>

        </div>

      </section>
            {/* =================================================
          MARKET STATISTICS
      ================================================= */}

      <section className="cm-stats-section">

        <div className="cm-stats-grid">

          <div className="cm-stat-card">
            <div className="cm-stat-icon">👨‍🌾</div>
            <span className="cm-stat-number">2,500+</span>
            <div className="cm-stat-label">Registered Farmers</div>
          </div>

          <div className="cm-stat-card">
            <div className="cm-stat-icon">🛒</div>
            <span className="cm-stat-number">1,800+</span>
            <div className="cm-stat-label">Active Buyers</div>
          </div>

          <div className="cm-stat-card">
            <div className="cm-stat-icon">📦</div>
            <span className="cm-stat-number">5,000+</span>
            <div className="cm-stat-label">Orders Completed</div>
          </div>

          <div className="cm-stat-card">
            <div className="cm-stat-icon">🌾</div>
            <span className="cm-stat-number">100+</span>
            <div className="cm-stat-label">Crop Varieties</div>
          </div>

        </div>

      </section>


      {/* =================================================
          POPULAR CROPS
      ================================================= */}

      <section className="popular-section">

        <div className="section-heading">

          <div className="section-label">
            🌾 FRESH FROM FARM
          </div>

          <h2>
            Popular Crops 🌱
          </h2>

          <p>
            Explore fresh crops available from local farmers.
          </p>

        </div>


        <div className="home-crop-grid">

          {crops.map((crop) => (

            <div
              className="home-crop-card"
              key={crop.name}
            >

              <div className="home-crop-icon">
                {crop.icon}
              </div>

              <h3>
                {crop.name}
              </h3>

              <strong>
                {crop.price}
              </strong>

              <p>
                👨‍🌾 {crop.farmer}
              </p>

              <p>
                📍 {crop.location}
              </p>

              <Link
                to="/crops"
                className="view-btn"
              >
                View Crop
              </Link>

            </div>

          ))}

        </div>


        <Link
          to="/crops"
          className="explore-more"
        >
          Explore All Crops →
        </Link>

      </section>


      {/* =================================================
          AI PREDICTION
      ================================================= */}

      <section className="prediction-section">

        <div className="prediction-content">

          <div className="section-label">
            🤖 SMART PRICING
          </div>

          <h2>
            AI Crop Price Prediction
          </h2>

          <p>
            Check expected market prices before selling
            your crops.
          </p>

          <div className="price-box">
            Expected Price

            <strong>
              ₹29/kg
            </strong>
          </div>

        </div>


        <div className="ai-visual">

          <div className="ai-circle">
            🤖
          </div>

          <div className="ai-crop">
            🌾
          </div>

          <div className="ai-chart">
            📈
          </div>

        </div>

      </section>


      {/* =================================================
          FEATURES
      ================================================= */}

      <section className="features-section">

        <div className="feature-card">

          <div className="feature-icon">
            👨‍🌾
          </div>

          <h3>
            For Farmers
          </h3>

          <p>
            Sell your crops directly to buyers without
            unnecessary middlemen.
          </p>

          <Link to="/sell">
            Sell Crop →
          </Link>

        </div>


        <div className="feature-card">

          <div className="feature-icon">
            🤖
          </div>

          <h3>
            AI Prediction
          </h3>

          <p>
            Get smart crop price predictions based on
            current market trends.
          </p>

          <button>
            View Prediction →
          </button>

        </div>


        <div className="feature-card">

          <div className="feature-icon">
            🛒
          </div>

          <h3>
            For Buyers
          </h3>

          <p>
            Find fresh crops directly from trusted
            local farmers.
          </p>
<Link to="/predict">
  View Prediction →
</Link>
          <Link to="/crops">
            Browse Crops →
          </Link>

        </div>

      </section>

      {/* =================================================
          WHY CROPMARKET
      ================================================= */}

      <section className="cm-why-section">

        <div className="cm-why-heading">

          <div className="section-label">
            🌱 WHY CROPMARKET
          </div>

          <h2>
            Why Choose CropMarket?
          </h2>

          <p>
            A simple and trusted platform connecting farmers
            directly with buyers.
          </p>

        </div>

        <div className="cm-why-grid">

          <div className="cm-why-card">

            <div className="cm-why-icon">
              🌾
            </div>

            <h3>
              Fresh Crops
            </h3>

            <p>
              Discover fresh agricultural products
              directly from local farmers.
            </p>

          </div>


          <div className="cm-why-card">

            <div className="cm-why-icon">
              🤝
            </div>

            <h3>
              Direct Connection
            </h3>

            <p>
              Connect farmers and buyers directly
              without unnecessary middlemen.
            </p>

          </div>


          <div className="cm-why-card">

            <div className="cm-why-icon">
              💰
            </div>

            <h3>
              Fair Pricing
            </h3>

            <p>
              Make better buying and selling decisions
              with transparent crop pricing.
            </p>

          </div>


          <div className="cm-why-card">

            <div className="cm-why-icon">
              🔐
            </div>

            <h3>
              Trusted Platform
            </h3>

            <p>
              Manage your crops, orders and marketplace
              activities from one platform.
            </p>

          </div>

        </div>

      </section>

            {/* =================================================
          PREMIUM CALL TO ACTION
      ================================================= */}

      <section className="cm-cta-section">

        <div className="cm-cta-content">

          <h2>
            Ready to Grow With CropMarket? 🌱
          </h2>

          <p>
            Buy fresh crops or start selling your
            agricultural products today.
          </p>

        </div>

        <div className="cm-cta-buttons">

          <Link
            to="/crops"
            className="cm-cta-btn cm-cta-primary"
          >
            🛒 Buy Crops
          </Link>

          <Link
            to="/sell"
            className="cm-cta-btn cm-cta-secondary"
          >
            🚜 Sell Crop
          </Link>

        </div>

      </section>
      {/* =================================================
          ABOUT
      ================================================= */}

      <section
        className="about-section"
        id="about"
      >

        <div className="about-icon">
          🌾
        </div>

        <h2>
          About CropMarket
        </h2>

        <p>
          CropMarket is a smart agriculture marketplace
          designed to connect farmers and buyers directly.
          The platform also uses AI-based price prediction
          to help farmers make better selling decisions.
        </p>

        <div className="about-crops">
          🌾 🌽 🥔 🍅 🧅 🥕 🚜 👨‍🌾
        </div>

      </section>


      {/* =================================================
          FOOTER
      ================================================= */}

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


// =====================================================
// APPLICATION ROUTER
// =====================================================

function App() {

  return (

    <BrowserRouter>

      <Routes>

        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/crops"
          element={<Crops />}
        />

        <Route
          path="/sell"
          element={<SellCrop />}
        />

        <Route
          path="/buy"
          element={<BuyCrop />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/orders"
          element={<MyOrders />}
        />

        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        <Route
          path="/edit-profile"
          element={<EditProfile />}
        />

        <Route
          path="/listings"
          element={<MyListings />}
        />

        <Route
          path="/photo-requests"
          element={<CropPhotoRequests />}
        />

        <Route
          path="/crop-photo-requests"
          element={<CropPhotoRequests />}
        />

        <Route
          path="/admin-login"
          element={<AdminLogin />}
        />

        <Route
          path="/admin-verification"
          element={<AdminVerification />}
        />
          <Route
  path="/predict"
  element={<Predict />}
/>

      </Routes>

    </BrowserRouter>
  );
}


export default App;