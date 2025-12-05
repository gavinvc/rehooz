// src/pages/MyRatingsPage.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = "https://rehooz-app-491933218528.us-east4.run.app/backend";

function StarRating({ value }) {
  const rounded = Math.round(Number(value) || 0);
  const full = Math.min(Math.max(rounded, 0), 5);
  return (
    <span className="star-rating">
      {"★".repeat(full) + "☆".repeat(5 - full)}
    </span>
  );
}

export default function MyRatingsPage() {
  const [user, setUser] = useState(null);
  const [avgRating, setAvgRating] = useState(0);
  const [ratings, setRatings] = useState([]);
  const [ratingsError, setRatingsError] = useState("");
  const [loading, setLoading] = useState(false);
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

    const fetchRatings = async () => {
      try {
        setLoading(true);
        setRatingsError("");

        const res = await fetch(`${API_BASE}/get_user_reviews.php`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ target_id: storedUser.user_id }),
        });

        const data = await res.json();
        if (data.status === "success") {
          setRatings(data.ratings || []);
          if (typeof data.avg_rating === "number") {
            setAvgRating(data.avg_rating);
          }
        } else {
          setRatingsError(data.message || "Could not load your ratings.");
        }
      } catch (err) {
        console.error("Error loading your ratings:", err);
        setRatingsError("Could not load your ratings.");
      } finally {
        setLoading(false);
      }
    };

    fetchRatings();
    setChecked(true);
  }, [navigate]);

  const goBack = () => {
    navigate("/profile");
  };

  if (!checked) return null;

  return (
    <main className="page-content profile-page">
      <div className="profile-card">
        {/* Header row with back button */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "10px",
          }}
        >
          <h2 className="profile-title">Your Ratings</h2>
          <button
            type="button"
            className="profile-btn secondary"
            onClick={goBack}
          >
            Back to My Profile
          </button>
        </div>

        {/* Summary */}
        <section className="profile-section">
          <h3 className="profile-section-title">Summary</h3>
          <div className="profile-row">
            <span className="profile-label">Username</span>
            <span className="profile-value">{user?.username}</span>
          </div>
          <div className="profile-row">
            <span className="profile-label">Average Rating</span>
            <span className="profile-value">
              {avgRating.toFixed(1)} / 5.0{" "}
              <StarRating value={avgRating} />
            </span>
          </div>
        </section>

        {/* Detailed Ratings */}
        <section className="profile-section">
          <h3 className="profile-section-title">Ratings About You</h3>

          {ratingsError && (
            <p className="profile-message profile-message--error">
              {ratingsError}
            </p>
          )}

          {loading && !ratingsError && (
            <p className="profile-message">Loading ratings…</p>
          )}

          {!loading && (!ratings || ratings.length === 0) && !ratingsError ? (
            <p className="profile-empty">
              You have not received any ratings yet.
            </p>
          ) : (
            !loading &&
            ratings.length > 0 && (
              <ul className="ratings-list">
                {ratings.map((r) => (
                  <li
                    key={`${r.rater_id}-${r.score}-${r.rater_username}`}
                    className="rating-card"
                  >
                    <div className="rating-header">
                      <span className="rating-author">
                        @{r.rater_username}
                      </span>
                      <span className="rating-score">
                        {Number(r.score).toFixed(1)} / 5{" "}
                        <StarRating value={r.score} />
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )
          )}
        </section>
      </div>
    </main>
  );
}
