// src/App.js
import React, { useState, useEffect } from "react";
import { Routes, Route, Link, Navigate } from "react-router-dom";

import rehooz_rectangle from "./rehooz-rectangle.png";
import "./App.css";

import Home from "./pages/Home";
import Profile from "./pages/Profile";
import Listings from "./pages/Listings";
import Offers from "./pages/Offers";
import Browse from "./pages/Browse";
import Connect from "./pages/Connect";
import Listing from "./pages/Listing";
import Login from "./pages/login";
import UserProfile from "./pages/UserProfile";

function PrivateRoute({ children }) {
  const user = localStorage.getItem("user");
  return user ? children : <Navigate to="/" />;
}

function PublicRoute({ children }) {
  const user = localStorage.getItem("user");
  return user ? <Navigate to="/home" /> : children;
}

function App() {
  const [user, setUser] = useState(null);
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      setUser(JSON.parse(stored));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    window.location.href = "/";
  };

  const closeNav = () => setNavOpen(false);

  return (
    <div className="App-container">
      <div className="App">
        {/* Header shows only when logged in */}
        {user && (
          <header className="App-header">
            <div className="logo-box">
              <Link to="/home" onClick={closeNav}>
                <img
                  src={rehooz_rectangle}
                  className="App-logo-image"
                  alt="ReHooz logo"
                />
              </Link>
            </div>

            <nav
              className={`header-nav ${navOpen ? "nav-open" : ""}`}
              aria-label="Main navigation"
            >
              <Link to="/profile" onClick={closeNav}>
                <button className="Header-component">Profile</button>
              </Link>
              <Link to="/listings" onClick={closeNav}>
                <button className="Header-component">My Listings</button>
              </Link>
              <Link to="/offers" onClick={closeNav}>
                <button className="Header-component">My Offers</button>
              </Link>
              <Link to="/browse" onClick={closeNav}>
                <button className="Header-component">Browse</button>
              </Link>
              <Link to="/connect" onClick={closeNav}>
                <button className="Header-component">Connect</button>
              </Link>
              {/* Optional: logout in dropdown on very small screens */}
              <button
                className="Header-component mobile-logout"
                onClick={handleLogout}
              >
                Logout
              </button>
            </nav>

            <button
              className={`Hamburger ${navOpen ? "is-open" : ""}`}
              onClick={() => setNavOpen((prev) => !prev)}
              aria-label="Toggle navigation menu"
              aria-expanded={navOpen}
            >
              <span />
              <span />
              <span />
            </button>
          </header>
        )}

        <Routes>
          <Route
            path="/"
            element={
              <PublicRoute>
                <Login setUser={setUser} />
              </PublicRoute>
            }
          />
          <Route
            path="/home"
            element={
              <PrivateRoute>
                <Home />
              </PrivateRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            }
          />
          <Route
            path="/listings"
            element={
              <PrivateRoute>
                <Listings />
              </PrivateRoute>
            }
          />
          <Route
            path="/offers"
            element={
              <PrivateRoute>
                <Offers />
              </PrivateRoute>
            }
          />
          <Route
            path="/browse"
            element={
              <PrivateRoute>
                <Browse />
              </PrivateRoute>
            }
          />
          <Route
            path="/listing/:listingId"
            element={<Listing />}
          />
          <Route
            path="/connect"
            element={
              <PrivateRoute>
                <Connect />
              </PrivateRoute>
            }
          />
          <Route path="/user/:id" element={<UserProfile />} />
        </Routes>

        <footer className="App-footer">
          <h5>
            This site is created as part of CS 4750 at the University of
            Virginia
          </h5>
          <p>
            Created by Gavin Crigger, Caitlin Fram, Zara Masood, and Karina
            Yakubisin
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;
