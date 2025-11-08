import { Link, Routes, Route } from 'react-router-dom';
import rehooz_rectangle from './rehooz-rectangle.png';
import './App.css';
import Home from './pages/Home';
import Profile from './pages/Profile';
import MyListings from './pages/MyListings';
import MyOffers from './pages/MyOffers';
import Browse from './pages/Browse';

function App() {
  return (
    <div className="App-container">
      <div className="App">
        <header className="App-header">
          <div className="logo-box">
            <Link to="/">
              <img src={rehooz_rectangle} className="rehooz-rectangle" alt="Rehooz logo" />
            </Link>
          </div>

          <nav className="header-nav">
            <Link to="/profile"><button className="Header-component">Profile</button></Link>
            <Link to="/listings"><button className="Header-component">My Listings</button></Link>
            <Link to="/offers"><button className="Header-component">My Offers</button></Link>
            <Link to="/browse"><button className="Header-component">Browse</button></Link>
          </nav>
        </header>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/listings" element={<MyListings />} />
          <Route path="/offers" element={<MyOffers />} />
          <Route path="/browse" element={<Browse />} />
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
