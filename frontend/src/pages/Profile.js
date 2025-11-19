import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [desc, setDesc] = useState("");
  const [rating, setRating] = useState(0);
  const [passwords, setPasswords] = useState({ current: "", new: "", confirm: "" });
  const [message, setMessage] = useState("");
  const [editing, setEditing] = useState(false);
  const [checked, setChecked] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Robust login detection:
    const storedUserRaw = localStorage.getItem("user");
    let storedUser = null;
    try {
      storedUser = storedUserRaw ? JSON.parse(storedUserRaw) : null;
    } catch (err) {
      // malformed JSON — clear it out and treat as not-logged-in
      console.warn('Malformed user in localStorage, removing');
      localStorage.removeItem('user');
      storedUser = null;
    }

    const authToken = localStorage.getItem('authToken');

    // If there's no auth token and no stored user, user is not logged in -> redirect to home
    const isLoggedIn = Boolean(authToken || (storedUser && storedUser.user_id));
    if (!isLoggedIn) {
      navigate('/');
      return;
    }

    // We have a logged-in user — load profile info if possible
    if (storedUser) {
      setUser(storedUser);
      fetch(`https://rehooz-app-491933218528.us-east4.run.app/backend/get_user.php?id=${storedUser.user_id}`)
        .then(res => res.json())
        .then(data => {
          if (data.status === "success") {
            setDesc(data.user.profile_desc || "");
            setRating(parseFloat(data.user.overall_rating) || 0);
          }
        })
        .catch(() => {
          // ignore fetch errors for now
        });
    }

    setChecked(true);
  }, [navigate]);

  const handleDescSave = async () => {
    const res = await fetch("https://rehooz-app-491933218528.us-east4.run.app/backend/update_profile.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: user.user_id, profile_desc: desc }),
    });
    const data = await res.json();
    setMessage(data.message);
    setEditing(false);
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      setMessage("New passwords do not match.");
      return;
    }
    const res = await fetch("https://rehooz-app-491933218528.us-east4.run.app/backend/change_pwd.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: user.user_id,
        current: passwords.current,
        new: passwords.new,
      }),
    });
    const data = await res.json();
    setMessage(data.message);
    setPasswords({ current: "", new: "", confirm: "" });
  };

  if (!checked) return null; // avoid flash before redirect/check completes

  return (
    <main style={{ padding: "40px", maxWidth: "600px", margin: "0 auto" }}>
      <h2>Profile</h2>
      <hr />

      <section style={{ marginTop: "20px" }}>
        <h3>Account Info</h3>
        <p><strong>Username:</strong> {user?.username}</p>
        <p>
          <strong>Overall Rating:</strong>{' '}
          {((typeof rating === 'number' ? rating : Number(rating)) || 0).toFixed(1)}
        </p>
      </section>

      <section style={{ marginTop: "25px" }}>
        <h3>Profile Description</h3>
        {!editing ? (
          <>
            <p style={{ whiteSpace: "pre-wrap", background: "#f7f7f7", padding: "10px", borderRadius: "8px" }}>
              {desc || "No description yet."}
            </p>
            <button
              onClick={() => setEditing(true)}
              style={{
                marginTop: "10px",
                padding: "8px 14px",
                backgroundColor: "#2a9d8f",
                color: "white",
                border: "none",
                borderRadius: "20px",
                cursor: "pointer",
              }}
            >
              Edit Profile
            </button>
          </>
        ) : (
          <>
            <textarea
              rows="4"
              style={{ width: "100%", padding: "10px", borderRadius: "8px", fontSize: "15px" }}
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
            />
            <div style={{ marginTop: "10px" }}>
              <button
                onClick={handleDescSave}
                style={{
                  padding: "8px 14px",
                  backgroundColor: "#2a9d8f",
                  color: "white",
                  border: "none",
                  borderRadius: "20px",
                  cursor: "pointer",
                  marginRight: "8px",
                }}
              >
                Save
              </button>
              <button
                onClick={() => setEditing(false)}
                style={{
                  padding: "8px 14px",
                  backgroundColor: "#ccc",
                  color: "#333",
                  border: "none",
                  borderRadius: "20px",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
            </div>
          </>
        )}
      </section>

      {editing && (
        <section style={{ marginTop: "35px" }}>
          <h3>Change Password</h3>
          <form onSubmit={handlePasswordChange}>
            <input
              type="password"
              placeholder="Current Password"
              value={passwords.current}
              onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
              required
              style={{ width: "100%", padding: "8px", marginBottom: "8px", borderRadius: "6px" }}
            />
            <input
              type="password"
              placeholder="New Password"
              value={passwords.new}
              onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
              required
              style={{ width: "100%", padding: "8px", marginBottom: "8px", borderRadius: "6px" }}
            />
            <input
              type="password"
              placeholder="Confirm New Password"
              value={passwords.confirm}
              onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
              required
              style={{ width: "100%", padding: "8px", marginBottom: "8px", borderRadius: "6px" }}
            />
            <button
              type="submit"
              style={{
                padding: "8px 14px",
                backgroundColor: "#2a9d8f",
                color: "white",
                border: "none",
                borderRadius: "20px",
                cursor: "pointer",
              }}
            >
              Update Password
            </button>
          </form>
        </section>
      )}

      {message && (
        <p style={{ marginTop: "20px", color: "#333", fontWeight: "500" }}>{message}</p>
      )}
    </main>
  );
}
