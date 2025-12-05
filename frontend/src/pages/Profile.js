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
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE =
  "https://rehooz-app-491933218528.us-east4.run.app/backend";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [desc, setDesc] = useState("");
  const [rating, setRating] = useState(0); // overall rating about this user
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });
  const [message, setMessage] = useState("");
  const [editing, setEditing] = useState(false);
  const [checked, setChecked] = useState(false);
  const [reviews, setReviews] = useState([]);       // ⭐ NEW: all reviews about me
  const [reviewsError, setReviewsError] = useState(""); // optional error msg

  const navigate = useNavigate();

  useEffect(() => {
    const storedUserRaw = localStorage.getItem("user");
    let storedUser = null;

    try {
      storedUser = storedUserRaw ? JSON.parse(storedUserRaw) : null;
    } catch (err) {
      console.warn("Malformed user in localStorage, removing");
      localStorage.removeItem("user");
      storedUser = null;
    }

    const authToken = localStorage.getItem("authToken");
    const isLoggedIn = Boolean(authToken || (storedUser && storedUser.user_id));

    if (!isLoggedIn) {
      navigate("/");
      return;
    }

    if (storedUser) {
      setUser(storedUser);

      // 1) Basic profile info
      fetch(`${API_BASE}/get_user.php?id=${storedUser.user_id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.status === "success") {
            setDesc(data.user.profile_desc || "");
            setRating(parseFloat(data.user.overall_rating) || 0);
          }
        })
        .catch(() => {
          // fail silently; page still works
        });

      // 2) Reviews about this user
      fetch(`${API_BASE}/get_user_reviews.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target_id: storedUser.user_id }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.status === "success") {
            setReviews(data.reviews || []);
            if (typeof data.avg_rating === "number") {
              setRating(data.avg_rating); // keep the header rating in sync
            }
          } else {
            setReviewsError(data.message || "Could not load your reviews.");
          }
        })
        .catch(() => {
          setReviewsError("Could not load your reviews.");
        });
    }

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
            <span className="profile-value">
              {(
                (typeof rating === "number" ? rating : Number(rating)) || 0
              ).toFixed(1)}{" "}
              / 5.0
            </span>
          </div>
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
                onClick={() => setEditing(true)}
                style={{
                  marginTop: "10px",
                }}
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

        {/* Password change (only when editing) */}
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

        {/* ⭐ NEW: Ratings & comments about this user */}
        <section className="profile-section">
          <h3 className="profile-section-title">Ratings &amp; Comments About You</h3>
          {reviewsError && (
            <p className="profile-message profile-message--error">
              {reviewsError}
            </p>
          )}
          {(!reviews || reviews.length === 0) && !reviewsError ? (
            <p className="profile-empty">
              No one has left a review yet.
            </p>
          ) : (
            <ul className="reviews-list">
              {reviews.map((r) => (
                <li key={r.id} className="review-card">
                  <div className="review-header">
                    <span className="review-author">
                      @{r.reviewer_username}
                    </span>
                    <span className="review-rating">
                      {Number(r.rating).toFixed(1)} / 5
                    </span>
                  </div>
                  <p className="review-comment">{r.comment}</p>
                  {r.created_at && (
                    <span className="review-date">
                      {new Date(r.created_at).toLocaleDateString()}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>

        {message && <p className="profile-message">{message}</p>}
      </div>
    </main>
  );
}
