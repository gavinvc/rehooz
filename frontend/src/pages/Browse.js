import React, { useEffect, useState } from 'react';

export default function Browse() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const url =
      "https://rehooz-app-491933218528.us-east4.run.app/backend/get_all_listings.php";

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        console.log("Fetched listings:", data);

        // Expected format:
        // { status: "success", listings: [...] }
        if (data.status === "success" && Array.isArray(data.listings)) {
          setListings(data.listings);
        }
        // Fallback: backend returns raw array
        else if (Array.isArray(data)) {
          setListings(data);
        }
        // Failure case
        else {
          setError("Unexpected response format from server.");
        }
      })
      .catch((err) => {
        console.warn("Failed to fetch listings", err);
        setError("Failed to load listings.");
      })
      .finally(() => setLoading(false));
  }, []);

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
              {listings.map((item) => (
                <div key={item.listing_id || item.id} className="Listing-component">
                  <div className="listing-content">
                    <h4>{item.name || item.title}</h4>
                    <p>{item.description}</p>

                    <p style={{ marginTop: "8px" }}>
                      <strong>
                        $
                        {item.price
                          ? parseFloat(item.price).toFixed(2)
                          : "0.00"}
                      </strong>
                      {item.location ? ` • ${item.location}` : ""}
                    </p>
                  </div>

                  {/* Image support (optional)
                  <img
                    className="listing-image"
                    src={`https://www.cs.virginia.edu/~zha4ub/rehooz/photos/${item.photo || "default.jpg"}`}
                    alt={item.name || item.title || "listing"}
                  />
                  */}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
