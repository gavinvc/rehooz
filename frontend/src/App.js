import React, { useState } from "react";
import { Routes, Route, Link, Navigate } from "react-router-dom";
import rehooz_rectangle from "./rehooz-rectangle.png";
import "./App.css";

import Home from "./pages/Home";
import Profile from "./pages/Profile";
import Listings from "./pages/Listings";
import Offers from "./pages/Offers";
import Browse from "./pages/Browse";
import Login from "./pages/login";

// PrivateRoute now takes `user` as a prop instead of reading localStorage
function PrivateRoute({ children, user }) {
  return user ? children : <Navigate to="/" />;
}

// PublicRoute also takes `user` as a prop
function PublicRoute({ children, user }) {
  return user ? <Navigate to="/home" /> : children;
}

function App() {
  // Keep user in React state, initialized from localStorage
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });

  return (
    <div className="App-container">
      <div className="App">
        {/* Hide header/nav on Login screen */}
        {user && (
          <header className="App-header">
            <div className="logo-box">
              <Link to="/home">
                <img
                  src={rehooz_rectangle}
                  className="rehooz-rectangle"
                  alt="Rehooz logo"
                />
              </Link>
            </div>

            <nav className="header-nav">
              <Link to="/profile">
                <button className="Header-component">Profile</button>
              </Link>
              <Link to="/listings">
                <button className="Header-component">My Listings</button>
              </Link>
              <Link to="/offers">
                <button className="Header-component">My Offers</button>
              </Link>
              <Link to="/browse">
                <button className="Header-component">Browse</button>
              </Link>
            </nav>
          </header>
        )}

        <Routes>
          {/* Login/Register is the default route; only show when NOT logged in */}
          <Route
            path="/"
            element={
              <PublicRoute user={user}>
                {/* Pass setUser down so Login can update App state on successful login */}
                <Login setUser={setUser} />
              </PublicRoute>
            }
          />

          {/* Protect all other routes */}
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
