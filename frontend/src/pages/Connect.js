import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE_URL =
  "https://rehooz-app-491933218528.us-east4.run.app/backend";

export default function Connect({ user: propUser }) {
  const navigate = useNavigate();
  const goToProfile = (id) => {
    navigate(`/user/${id}`);
  };


  // logged-in user from props or localStorage
  const user = propUser || JSON.parse(localStorage.getItem("user") || "null");

  const [following, setFollowing] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const followingIds = useMemo(
    () => new Set(following.map((u) => u.user_id)),
    [following]
  );

  useEffect(() => {
    if (!user) {
      navigate("/");
    }
  }, [user, navigate]);

  const fetchConnections = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/get_connections.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: user.user_id }),
      });

      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.error("Bad JSON from get_connections.php:", text);
        return;
      }

      if (data.status === "success") {
        setFollowing(data.following || []);
        setFollowers(data.followers || []);
      } else {
        console.error("get_connections failed:", data);
      }
    } catch (err) {
      console.error("Error calling get_connections.php:", err);
    } finally {
      setLoading(false);
    }
  };

  // load connections when page opens or when user changes
  useEffect(() => {
    if (user) {
      fetchConnections();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user && user.user_id]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim() || !user) return;

    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/search_users.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: searchQuery.trim(),
          user_id: user.user_id,
        }),
      });

      const data = await res.json();
      if (data.status === "success") {
        setSearchResults(data.results || []);
      } else {
        console.error("search_users failed:", data);
      }
    } catch (err) {
      console.error("Error searching users:", err);
    } finally {
      setLoading(false);
    }
  };

  const follow = async (targetId) => {
    if (!user) return;
    try {
      const res = await fetch(`${API_BASE_URL}/follow_user.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.user_id,
          follow_id: targetId,
        }),
      });
      const data = await res.json();
      if (data.status === "success") {
        await fetchConnections();
      } else {
        alert(data.message || "Could not follow user");
      }
    } catch (err) {
      console.error("Error following user:", err);
    }
  };

  const unfollow = async (targetId) => {
    if (!user) return;
    try {
      const res = await fetch(`${API_BASE_URL}/unfollow_user.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.user_id,
          follow_id: targetId,
        }),
      });
      const data = await res.json();
      if (data.status === "success") {
        await fetchConnections();
      } else {
        alert(data.message || "Could not unfollow user");
      }
    } catch (err) {
      console.error("Error unfollowing user:", err);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="connect-wrapper">
      <div className="connect-card">
        <h2 className="connect-title">Connect</h2>

        {/* Search section */}
        <section className="connect-search-section">
          <form className="connect-search-form" onSubmit={handleSearch}>
            <input
              type="text"
              className="connect-search-input"
              placeholder="Search by username"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="connect-search-btn">
              Search
            </button>
          </form>

          {loading && <p className="connect-loading">Loading…</p>}

          {searchResults.length > 0 && (
            <div className="connect-search-results">
              <h3>Search Results</h3>
              <ul>
                {searchResults.map((u) => {
                  const isFollowing = followingIds.has(u.user_id);
                  return (
                    <li key={u.user_id} className="connect-result-item">
                      <div className="connect-result-text">
                        <button
                          type="button"
                          className="connect-username-button"
                          onClick={() => goToProfile(u.user_id)}
                        >
                          {u.username}
                        </button>
                        {u.city && <span className="connect-city">· {u.city}</span>}
                      
                        <span className="connect-username">{u.username}</span>
                        {u.city && (
                          <span className="connect-city">· {u.city}</span>
                        )}
                      </div>
                      <button
                        type="button"
                        className={
                          isFollowing
                            ? "follow-btn follow-btn--outline"
                            : "follow-btn"
                        }
                        onClick={() =>
                          isFollowing ? unfollow(u.user_id) : follow(u.user_id)
                        }
                      >
                        {isFollowing ? "Unfollow" : "Follow"}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </section>

        {/* Following / followers columns */}
        <section className="connect-columns">
          <div className="connect-column">
            <h3>People You Follow ({following.length})</h3>
            {following.length === 0 ? (
              <p className="connect-empty">You aren't following anyone yet.</p>
            ) : (
              <ul>
                {following.map((u) => (
                  <li key={u.user_id} className="connect-name-row">
                    <button
                      type="button"
                      className="connect-username-button"
                      onClick={() => goToProfile(u.user_id)}
                    >
                      {u.username}
                    </button>
                    {u.city && (
                      <span className="connect-city">· {u.city}</span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="connect-column">
            <h3>Your Followers ({followers.length})</h3>
            {followers.length === 0 ? (
              <p className="connect-empty">No followers yet.</p>
            ) : (
              <ul>
                {followers.map((u) => (
                  <li key={u.user_id} className="connect-name-row">
                    <span className="connect-username">{u.username}</span>
                    {u.city && (
                      <span className="connect-city">· {u.city}</span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
