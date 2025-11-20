import React, { useEffect, useState } from "react";
import rehooz_square from "../rehooz-square.png";

export default function Home() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    setUser(storedUser);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  return (
    <div className="home-wrapper">
      <div className="home-card">
        <h2 className="home-welcome">
          {user ? `Welcome back, ${user.username}!` : "Welcome to ReHooz"}
        </h2>

        <img src={rehooz_square} alt="Rehooz" className="home-logo" />

        <p className="home-desc">
          Your platform for sustainable selling, buying, and reusing UVA gear.
          Keep items in circulation and discover great second-hand finds.
        </p>

        {user && (
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        )}
      </div>
    </div>
  );
}
