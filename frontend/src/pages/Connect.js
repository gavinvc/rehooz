import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE_URL =
  "https://rehooz-app-491933218528.us-east4.run.app/backend";

export default function Connect({ user: propUser }) {
  const navigate = useNavigate();

  // logged-in user from props or localStorage
  const user =
    propUser || JSON.parse(localStorage.getItem("user") || "null");

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
        // reload from server so counts & lists are correct
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
    <div className="App-body">
      <h2>Connect</h2>

      <section style={{ marginBottom: "2rem" }}>
        <form onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search by username"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ padding: "6px", minWidth: "250px" }}
          />
          <button type="submit" style={{ marginLeft: "8px" }}>
            Search
          </button>
        </form>

        {loading && (
          <p style={{ marginTop: "8px" }}>Loading…</p>
        )}

        {searchResults.length > 0 && (
          <div style={{ marginTop: "1rem" }}>
            <h3>Search Results</h3>
            <ul style={{ listStyle: "none", padding: 0 }}>
              {searchResults.map((u) => {
                const isFollowing = followingIds.has(u.user_id);
                return (
                  <li
                    key={u.user_id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "6px 0",
                      borderBottom: "1px solid #ddd",
                    }}
                  >
                    <span>
                      <strong>{u.username}</strong>
                      {u.city ? ` · ${u.city}` : ""}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        isFollowing
                          ? unfollow(u.user_id)
                          : follow(u.user_id)
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

      <section style={{ display: "flex", gap: "3rem", flexWrap: "wrap" }}>
        <div>
          <h3>People You Follow ({following.length})</h3>
          {following.length === 0 ? (
            <p>You aren't following anyone yet.</p>
          ) : (
            <ul style={{ listStyle: "none", padding: 0 }}>
              {following.map((u) => (
                <li key={u.user_id} style={{ padding: "4px 0" }}>
                  <strong>{u.username}</strong>
                  {u.city ? ` · ${u.city}` : ""}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <h3>Your Followers ({followers.length})</h3>
          {followers.length === 0 ? (
            <p>No followers yet.</p>
          ) : (
            <ul style={{ listStyle: "none", padding: 0 }}>
              {followers.map((u) => (
                <li key={u.user_id} style={{ padding: "4px 0" }}>
                  <strong>{u.username}</strong>
                  {u.city ? ` · ${u.city}` : ""}
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
