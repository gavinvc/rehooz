import React, { useState } from "react";
import { Routes, Route, Link, Navigate } from "react-router-dom";
import rehooz_rectangle from "./rehooz-rectangle.png";
import "./App.css";

import Home from "./pages/Home";
import Profile from "./pages/Profile";
import Listings from "./pages/Listings";
import Offers from "./pages/Offers";
import Browse from "./pages/Browse";
import Connect from "./pages/Connect";
import Login from "./pages/login";

function PrivateRoute({ children, user }) {
  return user ? children : <Navigate to="/" />;
}

function PublicRoute({ children, user }) {
  return user ? <Navigate to="/home" /> : children;
}

function App() {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });

  // controls hamburger dropdown on small screens
  const [navOpen, setNavOpen] = useState(false);

  const closeNav = () => setNavOpen(false);

  return (
    <div className="App-container">
      <div className="App">
        {user && (
          <header className="App-header">
            <div className="logo-box">
              <Link to="/home" onClick={closeNav}>
                <img
                  src={rehooz_rectangle}
                  className="rehooz-rectangle"
                  alt="Rehooz logo"
                />
              </Link>
            </div>

            {/* Hamburger button (visible on small screens via CSS) */}
            <button
              className="Hamburger"
              aria-label="Toggle navigation"
              onClick={() => setNavOpen((open) => !open)}
            >
              <span />
              <span />
              <span />
            </button>

            {/* Nav links – become dropdown on small screens */}
            <nav className={`header-nav ${navOpen ? "nav-open" : ""}`}>
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
            </nav>
          </header>
        )}

        <Routes>
          <Route
            path="/"
            element={
              <PublicRoute user={user}>
                <Login setUser={setUser} />
              </PublicRoute>
            }
          />

          <Route
            path="/home"
            element={
              <PrivateRoute user={user}>
                <Home />
              </PrivateRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <PrivateRoute user={user}>
                <Profile />
              </PrivateRoute>
            }
          />
          <Route
            path="/listings"
            element={
              <PrivateRoute user={user}>
                <Listings />
              </PrivateRoute>
            }
          />
          <Route
            path="/offers"
            element={
              <PrivateRoute user={user}>
                <Offers />
              </PrivateRoute>
            }
          />
          <Route
            path="/browse"
            element={
              <PrivateRoute user={user}>
                <Browse />
              </PrivateRoute>
            }
          />
          <Route
            path="/connect"
            element={
              <PrivateRoute user={user}>
                <Connect user={user} />
              </PrivateRoute>
            }
          />
        </Routes>

        <footer className="App-footer">
          <h5>This site is created as part of CS 4750 at the University of Virginia</h5>
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
