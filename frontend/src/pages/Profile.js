// // src/pages/Profile.js
// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";

// const API_BASE =
//   "https://rehooz-app-491933218528.us-east4.run.app/backend";

// export default function Profile() {
//   const [user, setUser] = useState(null);
//   const [desc, setDesc] = useState("");
//   const [rating, setRating] = useState(0);
//   const [passwords, setPasswords] = useState({
//     current: "",
//     new: "",
//     confirm: "",
//   });
//   const [message, setMessage] = useState("");
//   const [editing, setEditing] = useState(false);
//   const [checked, setChecked] = useState(false);
//   const navigate = useNavigate();

//   useEffect(() => {
//     const storedUserRaw = localStorage.getItem("user");
//     let storedUser = null;

//     try {
//       storedUser = storedUserRaw ? JSON.parse(storedUserRaw) : null;
//     } catch (err) {
//       console.warn("Malformed user in localStorage, removing");
//       localStorage.removeItem("user");
//       storedUser = null;
//     }

//     const authToken = localStorage.getItem("authToken");
//     const isLoggedIn = Boolean(authToken || (storedUser && storedUser.user_id));

//     if (!isLoggedIn) {
//       navigate("/");
//       return;
//     }

//     if (storedUser) {
//       setUser(storedUser);

//       fetch(`${API_BASE}/get_user.php?id=${storedUser.user_id}`)
//         .then((res) => res.json())
//         .then((data) => {
//           if (data.status === "success") {
//             setDesc(data.user.profile_desc || "");
//             setRating(parseFloat(data.user.overall_rating) || 0);
//           }
//         })
//         .catch(() => {
//           // fail silently; page still works
//         });
//     }

//     setChecked(true);
//   }, [navigate]);

//   const handleDescSave = async () => {
//     if (!user) return;

//     const res = await fetch(`${API_BASE}/update_profile.php`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ user_id: user.user_id, profile_desc: desc }),
//     });

//     const data = await res.json();
//     setMessage(data.message || "Profile updated.");
//     setEditing(false);
//   };

//   const handlePasswordChange = async (e) => {
//     e.preventDefault();
//     if (!user) return;

//     if (passwords.new !== passwords.confirm) {
//       setMessage("New passwords do not match.");
//       return;
//     }

//     const res = await fetch(`${API_BASE}/change_pwd.php`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         user_id: user.user_id,
//         current: passwords.current,
//         new: passwords.new,
//       }),
//     });

//     const data = await res.json();
//     setMessage(data.message);
//     setPasswords({ current: "", new: "", confirm: "" });
//   };

//   if (!checked) return null;

//   return (
//     <main className="page-content profile-page">
//       <div className="profile-card">
//         <h2 className="profile-title">Profile</h2>

//         {/* Account Info */}
//         <section className="profile-section">
//           <h3 className="profile-section-title">Account Info</h3>

//           <div className="profile-row">
//             <span className="profile-label">Username</span>
//             <span className="profile-value">{user?.username}</span>
//           </div>

//           <div className="profile-row">
//             <span className="profile-label">Overall Rating</span>
//             <span className="profile-value">
//               {((typeof rating === "number" ? rating : Number(rating)) || 0).toFixed(1)}{" "}
//               / 5.0
//             </span>
//           </div>
//         </section>

//         {/* Description */}
//         <section className="profile-section">
//           <h3 className="profile-section-title">Profile Description</h3>

//           {!editing ? (
//             <>
//               <p className="profile-desc-box">
//                 {desc || "No description yet."}
//               </p>
//               <button
//                 className="profile-btn primary"
//                 onClick={() => setEditing(true)}
//                 style={{
//                   marginTop: "10px",
//                 }}
//               >
//                 Edit Profile
//               </button>
//             </>
//           ) : (
//             <>
//               <textarea
//                 rows="4"
//                 className="profile-textarea"
//                 value={desc}
//                 onChange={(e) => setDesc(e.target.value)}
//                 placeholder="Tell other ReHooz users a bit about you..."
//               />
//               <div className="profile-actions">
//                 <button
//                   className="profile-btn primary"
//                   onClick={handleDescSave}
//                 >
//                   Save
//                 </button>
//                 <button
//                   className="profile-btn secondary"
//                   onClick={() => setEditing(false)}
//                 >
//                   Cancel
//                 </button>
//               </div>
//             </>
//           )}
//         </section>

//         {/* Password change (only when editing) */}
//         {editing && (
//           <section className="profile-section">
//             <h3 className="profile-section-title">Change Password</h3>
//             <form className="profile-form" onSubmit={handlePasswordChange}>
//               <input
//                 type="password"
//                 placeholder="Current password"
//                 value={passwords.current}
//                 onChange={(e) =>
//                   setPasswords({ ...passwords, current: e.target.value })
//                 }
//                 required
//                 className="profile-input"
//               />
//               <input
//                 type="password"
//                 placeholder="New password"
//                 value={passwords.new}
//                 onChange={(e) =>
//                   setPasswords({ ...passwords, new: e.target.value })
//                 }
//                 required
//                 className="profile-input"
//               />
//               <input
//                 type="password"
//                 placeholder="Confirm new password"
//                 value={passwords.confirm}
//                 onChange={(e) =>
//                   setPasswords({ ...passwords, confirm: e.target.value })
//                 }
//                 required
//                 className="profile-input"
//               />
//               <button type="submit" className="profile-btn primary">
//                 Update Password
//               </button>
//             </form>
//           </section>
//         )}

//         {message && (
//           <p className="profile-message">
//             {message}
//           </p>
//         )}
//       </div>
//     </main>
//   );
// }
// src/pages/Profile.js

// src/pages/Profile.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = "https://rehooz-app-491933218528.us-east4.run.app/backend";

// Simple star display component
function StarRating({ value }) {
  const rounded = Math.round(Number(value) || 0);
  const full = Math.min(Math.max(rounded, 0), 5);
  return (
    <span className="star-rating">
      {"★".repeat(full) + "☆".repeat(5 - full)}
    </span>
  );
}

export default function Profile() {
  const [user, setUser] = useState(null);
  const [desc, setDesc] = useState("");
  const [avgRating, setAvgRating] = useState(0);

  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  const [message, setMessage] = useState("");
  const [editing, setEditing] = useState(false);
  const [checked, setChecked] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const raw = localStorage.getItem("user");
    let storedUser = null;

    try {
      storedUser = raw ? JSON.parse(raw) : null;
    } catch {
      localStorage.removeItem("user");
      storedUser = null;
    }

    if (!storedUser) {
      navigate("/");
      return;
    }

    setUser(storedUser);

    // Load basic profile info (including overall_rating)
    fetch(`${API_BASE}/get_user.php?id=${storedUser.user_id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "success") {
          setDesc(data.user.profile_desc || "");
          setAvgRating(parseFloat(data.user.overall_rating) || 0);
        }
      })
      .catch(() => {
        // ignore; page still works
      });

    setChecked(true);
  }, [navigate]);

  const handleDescSave = async () => {
    if (!user) return;

    const res = await fetch(`${API_BASE}/update_profile.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: user.user_id, profile_desc: desc }),
    });

    const data = await res.json();
    setMessage(data.message || "Profile updated.");
    setEditing(false);
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!user) return;

    if (passwords.new !== passwords.confirm) {
      setMessage("New passwords do not match.");
      return;
    }

    const res = await fetch(`${API_BASE}/change_pwd.php`, {
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

  const goToRatingsPage = () => {
    navigate("/profile/ratings");
  };

  if (!checked) return null;

  return (
    <main className="page-content profile-page">
      <div className="profile-card">
        <h2 className="profile-title">My Profile</h2>

        {/* Account Info */}
        <section className="profile-section">
          <h3 className="profile-section-title">Account Info</h3>

          <div className="profile-row">
            <span className="profile-label">Username</span>
            <span className="profile-value">{user?.username}</span>
          </div>

          <div className="profile-row">
            <span className="profile-label">Overall Rating</span>
            <button
              type="button"
              className="profile-value profile-rating-clickable"
              onClick={goToRatingsPage}
            >
              {avgRating.toFixed(1)} / 5.0{" "}
              <StarRating value={avgRating} />
            </button>
          </div>
          <p className="profile-hint">
            Click your overall rating to view detailed ratings.
          </p>
        </section>

        {/* Description */}
        <section className="profile-section">
          <h3 className="profile-section-title">Profile Description</h3>

          {!editing ? (
            <>
              <p className="profile-desc-box">
                {desc || "No description yet."}
              </p>
              <button
                className="profile-btn primary"
                style={{ marginTop: "10px" }}
                onClick={() => setEditing(true)}
              >
                Edit Profile
              </button>
            </>
          ) : (
            <>
              <textarea
                rows="4"
                className="profile-textarea"
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="Tell other ReHooz users a bit about you..."
              />
              <div className="profile-actions">
                <button
                  className="profile-btn primary"
                  onClick={handleDescSave}
                >
                  Save
                </button>
                <button
                  className="profile-btn secondary"
                  onClick={() => setEditing(false)}
                >
                  Cancel
                </button>
              </div>
            </>
          )}
        </section>

        {/* Change Password (when editing) */}
        {editing && (
          <section className="profile-section">
            <h3 className="profile-section-title">Change Password</h3>
            <form className="profile-form" onSubmit={handlePasswordChange}>
              <input
                type="password"
                placeholder="Current password"
                value={passwords.current}
                onChange={(e) =>
                  setPasswords({ ...passwords, current: e.target.value })
                }
                required
                className="profile-input"
              />
              <input
                type="password"
                placeholder="New password"
                value={passwords.new}
                onChange={(e) =>
                  setPasswords({ ...passwords, new: e.target.value })
                }
                required
                className="profile-input"
              />
              <input
                type="password"
                placeholder="Confirm new password"
                value={passwords.confirm}
                onChange={(e) =>
                  setPasswords({ ...passwords, confirm: e.target.value })
                }
                required
                className="profile-input"
              />
              <button type="submit" className="profile-btn primary">
                Update Password
              </button>
            </form>
          </section>
        )}

        {message && <p className="profile-message">{message}</p>}
      </div>
    </main>
  );
}
