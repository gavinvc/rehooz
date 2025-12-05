import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

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

export default function UserProfile() {
  const { id } = useParams(); // id of the user being viewed
  const navigate = useNavigate();

  const [viewer, setViewer] = useState(null); // logged-in user
  const [targetUser, setTargetUser] = useState(null); // user being viewed
  const [avgRating, setAvgRating] = useState(0);
  const [ratings, setRatings] = useState([]);
  const [newRating, setNewRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // 1) Load logged-in user from localStorage
  useEffect(() => {
    const storedUserRaw = localStorage.getItem("user");
    let storedUser = null;

    try {
      storedUser = storedUserRaw ? JSON.parse(storedUserRaw) : null;
    } catch (_) {
      localStorage.removeItem("user");
      storedUser = null;
    }

    if (!storedUser) {
      navigate("/");
      return;
    }

    setViewer(storedUser);
  }, [navigate]);

  // 2) Load target user + ratings whenever :id changes
  useEffect(() => {
    if (!id) return;

    const fetchAll = async () => {
      try {
        setLoading(true);
        setError("");
        setSuccessMsg("");

        // --- basic user info ---
        const userRes = await fetch(`${API_BASE}/get_user.php?id=${id}`);
        const userData = await userRes.json();

        if (userData.status !== "success") {
          setError(userData.message || "Could not load user profile.");
          setLoading(false);
          return;
        }

        setTargetUser(userData.user);
        setAvgRating(parseFloat(userData.user.overall_rating) || 0);

        // --- ratings from backend (using Rates table) ---
        const ratingsRes = await fetch(`${API_BASE}/get_user_reviews.php`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ target_id: Number(id) }),
        });

        const ratingsData = await ratingsRes.json();

        if (ratingsData.status === "success") {
          setAvgRating(ratingsData.avg_rating || 0);
          setRatings(ratingsData.ratings || []);
        } else {
          setError(ratingsData.message || "Could not load ratings.");
        }
      } catch (err) {
        console.error("Error loading user profile:", err);
        setError("Something went wrong loading this profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [id]);

  const isOwnProfile =
    viewer && String(viewer.user_id ?? viewer.id) === String(id);

  const handleSubmitRating = async (e) => {
    e.preventDefault();
    if (!viewer || !targetUser) {
      setError("Failed to load profile information. Please refresh and try again.");
      return;
    }

    const reviewerId = viewer.user_id ?? viewer.id;
    const targetId = Number(id);

    if (!reviewerId || !targetId) {
      console.error("Missing user IDs for rating:", { viewer, targetUser, id });
      setError("Could not determine user IDs. Please log out and back in.");
      return;
    }

    if (String(reviewerId) === String(targetId)) {
      setError("You can’t rate yourself.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      setSuccessMsg("");

      const res = await fetch(`${API_BASE}/add_user_review.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reviewer_id: reviewerId,
          target_id: targetId,
          rating: Number(newRating),
        }),
      });

      const data = await res.json();
      if (data.status !== "success") {
        setError(data.message || "Could not submit rating.");
        return;
      }

      setNewRating(5);
      setSuccessMsg("Rating submitted successfully.");

      // reload ratings after successful post
      const ratingsRes = await fetch(`${API_BASE}/get_user_reviews.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target_id: targetId }),
      });
      const ratingsData = await ratingsRes.json();
      if (ratingsData.status === "success") {
        setAvgRating(ratingsData.avg_rating || 0);
        setRatings(ratingsData.ratings || []);
      }
    } catch (err) {
      console.error("Error submitting rating:", err);
      setError("Something went wrong submitting your rating.");
    } finally {
      setSubmitting(false);
    }
  };

  const goBackToMyProfile = () => {
    navigate("/profile");
  };

  // Loading / fallback UI
  if (loading && !targetUser) {
    return (
      <main className="page-content profile-page">
        <div className="profile-card">
          <p>Loading user…</p>
        </div>
      </main>
    );
  }

  if (!targetUser) {
    return (
      <main className="page-content profile-page">
        <div className="profile-card">
          <p>Could not load user.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="page-content profile-page">
      <div className="profile-card">
        {/* Header row with Back button */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "10px",
          }}
        >
          <h2 className="profile-title">@{targetUser.username}</h2>
          <button
            type="button"
            className="profile-btn secondary"
            onClick={goBackToMyProfile}
          >
            Back to My Profile
          </button>
        </div>

        {error && (
          <p className="profile-message profile-message--error">{error}</p>
        )}
        {successMsg && !error && (
          <p className="profile-message">{successMsg}</p>
        )}

        {/* About This User */}
        <section className="profile-section">
          <h3 className="profile-section-title">About This User</h3>

          <div className="profile-row">
            <span className="profile-label">Username</span>
            <span className="profile-value">{targetUser.username}</span>
          </div>

          <div className="profile-row">
            <span className="profile-label">Average Rating</span>
            <span className="profile-value">
              {avgRating.toFixed(1)} / 5.0{" "}
              <StarRating value={avgRating} />
            </span>
          </div>

          <div className="profile-row">
            <span className="profile-label">Profile Description</span>
          </div>
          <p className="profile-desc-box">
            {targetUser.profile_desc || "No description yet."}
          </p>
        </section>

        

        {/* Leave a Rating (only if viewing someone else) */}
        {viewer && !isOwnProfile && (
          <section className="profile-section">
            <h3 className="profile-section-title">Leave a Rating</h3>

            <form className="rating-form" onSubmit={handleSubmitRating}>
              <label className="rating-row">
                Rating
                <select
                  value={newRating}
                  onChange={(e) => setNewRating(e.target.value)}
                  className="rating-select"
                >
                  <option value={5}>5 – Excellent</option>
                  <option value={4}>4 – Good</option>
                  <option value={3}>3 – Neutral</option>
                  <option value={2}>2 – Poor</option>
                  <option value={1}>1 – Very Poor</option>
                </select>
              </label>

              <button
                type="submit"
                className="profile-btn primary"
                disabled={submitting}
                style={{ marginTop: "10px" }}
              >
                {submitting ? "Submitting…" : "Post Rating"}
              </button>
            </form>
          </section>
        )}
      </div>
    </main>
  );
}
