import React, { useEffect, useState } from "react";

export default function Browse() {
  const [listings, setListings] = useState([]);
  const [followed, setFollowed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const user = JSON.parse(localStorage.getItem("user"));

  const fetchListings = () => {
    fetch("https://rehooz-app-491933218528.us-east4.run.app/backend/get_all_listings.php")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (data.status === "success" && Array.isArray(data.listings)) {
          setListings(data.listings);
        } else if (Array.isArray(data)) {
          setListings(data);
        } else {
          setError("Unexpected response format from server.");
        }
      })
      .catch((err) => {
        console.warn("Failed to fetch listings", err);
        setError("Failed to load listings.");
      });
  };

  const fetchFollowed = () => {
    if (!user) return;

    fetch(
      `https://rehooz-app-491933218528.us-east4.run.app/backend/get_followed_listings.php?user_id=${user.user_id}`
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "success" && Array.isArray(data.listings)) {
          setFollowed(data.listings.map((item) => item.listing_id));
        }
      })
      .catch((err) => console.error("Failed to fetch followed listings:", err));
  };

  useEffect(() => {
    fetchListings();
    fetchFollowed();
    setLoading(false);
  }, []);

  const handleFollow = async (id) => {
    if (!user) return alert("You must be logged in.");

    const res = await fetch(
      "https://rehooz-app-491933218528.us-east4.run.app/backend/follow_listing.php",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: user.user_id, listing_id: id }),
      }
    );

    const data = await res.json();
    console.log(data.message);

    fetchFollowed();
  };

  /* --------------------------- UNFOLLOW A LISTING --------------------------- */
  const handleUnfollow = async (id) => {
    if (!user) return alert("You must be logged in.");

    const res = await fetch(
      "https://rehooz-app-491933218528.us-east4.run.app/backend/unfollow_listing.php",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: user.user_id, listing_id: id }),
      }
    );

    const data = await res.json();
    console.log(data.message);

    fetchFollowed();
  };

  return (
    <main className="page-content">
      <h2>Browse</h2>

      {loading ? (
        <p>Loading listings…</p>
      ) : error ? (
        <p>{error}</p>
      ) : listings.length === 0 ? (
        <p>No listings available.</p>
      ) : (
        <div className="Listings-container">
          <div className="Listings-column" style={{ maxWidth: "820px" }}>
            <h3 className="column-title">All Listings</h3>

            <div className="scroll-box" aria-label="All listings">
              {listings.map((item) => {
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

                    <div className="Component-column">
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
              })}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
