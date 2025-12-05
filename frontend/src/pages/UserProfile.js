// src/pages/UserProfile.js
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const API_BASE = "https://rehooz-app-491933218528.us-east4.run.app/backend";

export default function UserProfile() {
  const { id } = useParams();            // the user_id from /user/:id
  const navigate = useNavigate();

  const [viewer, setViewer] = useState(null);      // logged-in user
  const [targetUser, setTargetUser] = useState(null);
  const [avgRating, setAvgRating] = useState(0);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const goBackToMyProfile = () => {
    navigate("/profile");
};

  useEffect(() => {
    const storedUserRaw = localStorage.getItem("user");
    let storedUser = null;

    try {
      storedUser = storedUserRaw ? JSON.parse(storedUserRaw) : null;
    } catch (_) {
      localStorage.removeItem("user");
    }

    if (!storedUser) {
      navigate("/");
      return;
    }

    setViewer(storedUser);
  }, [navigate]);

  useEffect(() => {
    if (!id) return;
    const fetchAll = async () => {
      try {
        setLoading(true);
        setError("");

        // 1) basic user info
        const userRes = await fetch(`${API_BASE}/get_user.php?id=${id}`);
        const userData = await userRes.json();
        if (userData.status !== "success") {
          setError("Could not load user profile.");
          setLoading(false);
          return;
        }
        setTargetUser(userData.user);

        // 2) ratings + comments
        const reviewsRes = await fetch(`${API_BASE}/get_user_reviews.php`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ target_id: id }),
        });
        const reviewsData = await reviewsRes.json();
        if (reviewsData.status === "success") {
          setAvgRating(reviewsData.avg_rating || 0);
          setReviews(reviewsData.reviews || []);
        } else {
          setError(reviewsData.message || "Could not load reviews.");
        }
      } catch (err) {
        console.error(err);
        setError("Something went wrong loading this profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [id]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!viewer || !targetUser) return;

    if (String(viewer.user_id) === String(targetUser.user_id)) {
      setError("You can’t leave a review for yourself.");
      return;
    }

    if (!newComment.trim()) {
      setError("Please write a short comment.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const res = await fetch(`${API_BASE}/add_user_review.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reviewer_id: viewer.user_id,
          target_id: targetUser.user_id,
          rating: Number(newRating),
          comment: newComment.trim(),
        }),
      });

      const data = await res.json();
      if (data.status !== "success") {
        setError(data.message || "Could not submit review.");
        return;
      }

      setNewRating(5);
      setNewComment("");

      // reload reviews after successful submit
      const reviewsRes = await fetch(`${API_BASE}/get_user_reviews.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target_id: targetUser.user_id }),
      });
      const reviewsData = await reviewsRes.json();
      if (reviewsData.status === "success") {
        setAvgRating(reviewsData.avg_rating || 0);
        setReviews(reviewsData.reviews || []);
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong submitting your review.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="page-content profile-page">
        <div className="profile-card">
          <p>Loading profile…</p>
        </div>
      </main>
    );
  }

  if (!targetUser) {
    return (
      <main className="page-content profile-page">
        <div className="profile-card">
          <p>Profile not found.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="page-content profile-page">
      <div className="profile-card">
        <div
            style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "10px",
            }}
            ></div>
        <h2 className="profile-title">
          @{targetUser.username}
        </h2>

        <button
            type="button"
            className="profile-btn secondary"
            onClick={goBackToMyProfile}
        >
            Back to My Profile
        </button>
    

        {/* Basic info */}
        <section className="profile-section">
          <h3 className="profile-section-title">About This User</h3>
          <div className="profile-row">
            <span className="profile-label">Username</span>
            <span className="profile-value">{targetUser.username}</span>
          </div>
          {targetUser.city && (
            <div className="profile-row">
              <span className="profile-label">Location</span>
              <span className="profile-value">{targetUser.city}</span>
            </div>
          )}
          <div className="profile-row">
            <span className="profile-label">Average Rating</span>
            <span className="profile-value">
              {Number(avgRating || targetUser.overall_rating || 0).toFixed(1)} / 5.0
            </span>
          </div>
        </section>

        {/* Description */}
        <section className="profile-section">
          <h3 className="profile-section-title">Profile Description</h3>
          <p className="profile-desc-box">
            {targetUser.profile_desc || "No description yet."}
          </p>
        </section>

        {/* Reviews list */}
        <section className="profile-section">
          <h3 className="profile-section-title">Ratings &amp; Comments</h3>
          {reviews.length === 0 ? (
            <p className="profile-empty">No reviews yet. Be the first to leave one!</p>
          ) : (
            <ul className="reviews-list">
              {reviews.map((r) => (
                <li key={r.id} className="review-card">
                  <div className="review-header">
                    <span className="review-author">@{r.reviewer_username}</span>
                    <span className="review-rating">
                      {r.rating.toFixed(1)} / 5
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

        {/* Add review form */}
        {viewer && String(viewer.user_id) !== String(targetUser.user_id) && (
          <section className="profile-section">
            <h3 className="profile-section-title">Leave a Rating</h3>
            <form className="review-form" onSubmit={handleSubmitReview}>
              <label className="review-rating-row">
                Rating
                <select
                  value={newRating}
                  onChange={(e) => setNewRating(e.target.value)}
                >
                  <option value={5}>5 – Great experience</option>
                  <option value={4}>4 – Good</option>
                  <option value={3}>3 – Okay</option>
                  <option value={2}>2 – Not great</option>
                  <option value={1}>1 – Poor</option>
                </select>
              </label>

              <textarea
                className="profile-textarea"
                rows="3"
                placeholder="Share anything others should know about trading with this person…"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              />

              <button
                type="submit"
                className="profile-btn primary"
                disabled={submitting}
              >
                {submitting ? "Submitting…" : "Post Review"}
              </button>
            </form>
          </section>
        )}

        {error && <p className="profile-message profile-message--error">{error}</p>}
      </div>
    </main>
  );
}
