import React, { useEffect, useState } from 'react';
import rehooz_square from '../rehooz-square.png';

export default function Home() {
  const [user, setUser] = useState(null);

  // Load user from localStorage when component mounts
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    setUser(storedUser);
  }, []);

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("user"); // clear saved login info
    window.location.href = "/"; // redirect back to login page
  };

  return (
    <div className="App-body">
      <h1>
        {user ? `Welcome back, ${user.username}!` : "Welcome to Rehooz"}
      </h1>

      <img
        src={rehooz_square}
        className="rehooz-square"
        alt="Rehooz logo"
        style={{ marginTop: "-20px" }}
      />

      <h3>Your platform for sustainable selling, purchase, and reuse.</h3>

      {/* Only show logout button if user is logged in */}
      {user && (
        <button
          onClick={handleLogout}
          style={{
            marginTop: "20px",
            padding: "8px 16px",
            border: "none",
            borderRadius: "6px",
            backgroundColor: "#f44336",
            color: "white",
            cursor: "pointer",
          }}
        >
          Logout
        </button>
      )}
    </div>
  );
}
