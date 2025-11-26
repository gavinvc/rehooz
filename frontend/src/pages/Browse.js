import React, { useCallback, useEffect, useMemo, useState } from "react";
import rehooz_square from "../rehooz-square.png";

export default function Browse() {
  const [listings, setListings] = useState([]);
  const [followed, setFollowed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const [form, setForm] = useState({ name: "", price: "", description: "", location: "" });
  const [message, setMessage] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const user = useMemo(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  }, []);
  const userId = user?.user_id;

  const fetchListings = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(
        "https://rehooz-app-491933218528.us-east4.run.app/backend/get_all_listings.php"
      );
      if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
      const data = await res.json();

      if (data.status === "success" && Array.isArray(data.listings)) {
        setListings(data.listings);
      } else if (Array.isArray(data)) {
        setListings(data);
      } else {
        setError("Unexpected response format from server.");
      }
    } catch (err) {
      console.warn("Failed to fetch listings", err);
      setError("Failed to load listings.");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchFollowed = useCallback(async () => {
    if (!userId) return;

    try {
      const res = await fetch(
        `https://rehooz-app-491933218528.us-east4.run.app/backend/get_followed_listings.php?user_id=${userId}`
      );
      const data = await res.json();
      if (data.status === "success" && Array.isArray(data.listings)) {
        setFollowed(data.listings.map((item) => item.listing_id));
      }
    } catch (err) {
      console.error("Failed to fetch followed listings:", err);
    }
  }, [userId]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  useEffect(() => {
    fetchFollowed();
  }, [fetchFollowed]);

  const handleFollow = async (id) => {
    if (!userId) return alert("You must be logged in.");

    try {
      const res = await fetch(
        "https://rehooz-app-491933218528.us-east4.run.app/backend/follow_listing.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: userId, listing_id: id }),
        }
      );

      const data = await res.json();
      console.log(data.message);

      await fetchFollowed();
    } catch (err) {
      console.error("Failed to follow listing:", err);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (!query) {
      setSearchResults([]);
      return;
    }

    try {
      setSearchLoading(true);
      const normalized = query.toLowerCase();
      const results = listings.filter((item) =>
        item.location?.toLowerCase().includes(normalized)
      );
      setSearchResults(results);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userId) {
      setMessage("Please sign in again to add a listing.");
      return;
    }

    try {
      const res = await fetch(
        "https://rehooz-app-491933218528.us-east4.run.app/backend/add_listing.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...form, seller_id: userId }),
        }
      );

      const data = await res.json();
      setMessage(data.message ?? "");

      if (data.status === "success") {
        setForm({ name: "", price: "", description: "", location: "" });
        await Promise.all([fetchListings(), fetchFollowed()]);
      }
    } catch (err) {
      console.error("Failed to add listing:", err);
      setMessage("Unable to add listing. Please try again.");
    }
  };

  /* --------------------------- UNFOLLOW A LISTING --------------------------- */
  const handleUnfollow = async (id) => {
    if (!userId) return alert("You must be logged in.");

    try {
      const res = await fetch(
        "https://rehooz-app-491933218528.us-east4.run.app/backend/unfollow_listing.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: userId, listing_id: id }),
        }
      );

      const data = await res.json();
      console.log(data.message);

      await fetchFollowed();
    } catch (err) {
      console.error("Failed to unfollow listing:", err);
    }
  };

  const renderListingCard = (item) => {
    const id = item.listing_id;
    const isFollowed = followed.includes(id);

    return (
      <div key={id} className="Listing-component">
        <div className="listing-content">
          <h4>{item.name}</h4>
          <p>{item.description}</p>

          <p style={{ marginTop: "8px" }}>
            <strong>${parseFloat(item.price).toFixed(2)}</strong>
            {item.location ? ` • ${item.location}` : ""}
          </p>
        </div>

        <div className="Component-column listing-actions">
          {user ? (
            isFollowed ? (
              <button
                className="Delete-listing"
                onClick={() => handleUnfollow(id)}
              >
                Unfollow
              </button>
            ) : (
              <button
                className="Goto-listing"
                onClick={() => handleFollow(id)}
              >
                Follow
              </button>
            )
          ) : (
            <p style={{ fontSize: "0.9rem", marginTop: "10px" }}>
              Log in to follow
            </p>
          )}
        </div>
      </div>
    );
  };

  return (
    <main className="page-content browse-page">
      <div className="browse-inner">
        <div className="browse-header-row">
          <h2>Browse</h2>
          <button
            type="button"
            className="Goto-listing add-listing-btn"
            onClick={() => {
              setIsModalOpen(true);
              setMessage("");
            }}
          >
            Add Listing
          </button>
        </div>

        <section className="connect-search-section browse-search-section">
          <form className="connect-search-form" onSubmit={handleSearch}>
            <input
              type="text"
              className="connect-search-input"
              placeholder="Search by location"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="connect-search-btn">
              Search
            </button>
          </form>

          {searchLoading && <p className="connect-loading">Loading…</p>}

          {searchResults.length > 0 && (
            <div className="connect-search-results">
              <h3>Search Results</h3>
              <div className="scroll-box" aria-label="Search results">
                {searchResults.map(renderListingCard)}
              </div>
            </div>
          )}
        </section>

        {isModalOpen && (
          <div className="modal-overlay" role="dialog" aria-modal="true">
            <div className="home-card modal-card">
              <div className="modal-close-row">
                <h4 style={{ margin: 0 }}>Add a New Listing</h4>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="modal-close-btn"
                >
                  ×
                </button>
              </div>

              <img src={rehooz_square} alt="Rehooz" className="home-logo modal-logo" />

              <form onSubmit={handleSubmit}>
                <input
                  name="name"
                  placeholder="Item Name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
                <input
                  name="price"
                  placeholder="Price"
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  required
                />
                <input
                  name="location"
                  placeholder="Location"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  required
                />
                <textarea
                  name="description"
                  placeholder="Description"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  required
                />

                <button type="submit" className="modal-submit-btn">Add Listing</button>
              </form>

              {message && <p className="modal-message">{message}</p>}
            </div>
          </div>
        )}

        {loading ? (
          <p>Loading listings…</p>
        ) : error ? (
          <p>{error}</p>
        ) : listings.length === 0 ? (
          <p>No listings available.</p>
        ) : (
          <div className="Listings-column browse-listings-card">
            <h3 className="column-title">All Listings</h3>

            <div className="scroll-box" aria-label="All listings">
              {listings.map(renderListingCard)}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
