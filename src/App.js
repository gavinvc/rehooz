import {Routes, Route, Link, Navigate } from 'react-router-dom';
import rehooz_rectangle from './rehooz-rectangle.png';
import './App.css';

import Home from './pages/Home';
import Profile from './pages/Profile';
import MyListings from './pages/MyListings';
import MyOffers from './pages/MyOffers';
import Browse from './pages/Browse';
import Login from './pages/login';   


function PrivateRoute({ children }) {
  const user = localStorage.getItem("user");
  return user ? children : <Navigate to="/" />;
}

function App() {
  const user = localStorage.getItem("user"); 

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
                <Link to="/profile"><button className="Header-component">Profile</button></Link>
                <Link to="/listings"><button className="Header-component">My Listings</button></Link>
                <Link to="/offers"><button className="Header-component">My Offers</button></Link>
                <Link to="/browse"><button className="Header-component">Browse</button></Link>
              </nav>
            </header>
          )}

          <Routes>
            {/* Login/Register is the default route */}
            <Route path="/" element={<Login />} />

            {/* Protect all other routes */}
            <Route path="/home" element={<PrivateRoute><Home /></PrivateRoute>} />
            <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
            <Route path="/listings" element={<PrivateRoute><MyListings /></PrivateRoute>} />
            <Route path="/offers" element={<PrivateRoute><MyOffers /></PrivateRoute>} />
            <Route path="/browse" element={<PrivateRoute><Browse /></PrivateRoute>} />
          </Routes>

          <footer className="App-footer">
            <h5>This site is created as part of CS 4750 at the University of Virginia</h5>
            <p>Created by Gavin Crigger, Caitlin Fram, Zara Masood, and Karina Yakubisin</p>
          </footer>
        </div>
      </div>
  );
}

export default App;
